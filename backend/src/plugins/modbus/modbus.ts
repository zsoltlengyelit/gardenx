import fp from 'fastify-plugin';
import { isWithinInterval } from 'date-fns';
import { Observable, ReplaySubject } from 'rxjs';
import { Controller, OnOffAuto } from '../database';
import { calculateSchedules } from './schedules-rrule';
import { AsyncTask, CronJob, SimpleIntervalJob } from 'toad-scheduler';
import { Change, switchOffJobSuffix } from './types';
import { publishChanges } from './publishChanges';
import { ModbusChannelController } from './controller';
import { createModbusClient } from './modbus-client';

declare module 'fastify' {
    export interface FastifyInstance {
        modbus: {
            changes: Observable<Change[]>
        };
    }
}

const autoOffJobs = {} as Record<string, Date>;

// in-memory map of used Channels
const CHANNELS = {} as Record<string, ModbusChannelController>;

const getChannelCtrlOf = (controller: Controller): ModbusChannelController => {
  return CHANNELS[controller.modbusChannel];
};

export default fp(async (fastify) => {

  const { Controller, Schedule } = fastify.db;

  const log = fastify.log;
  const decoration = {
    changes: new ReplaySubject<Change[]>(1)
  };

  fastify.decorate('modbus', decoration);

  const modbusClient = createModbusClient(fastify);

  async function initModbusControllers() {
    const controllers = await Controller.findAll();
    for (const controller of controllers) {
      if (!CHANNELS[controller.modbusChannel]) {
        const modbusChannelController = new ModbusChannelController(modbusClient, controller, log);
        CHANNELS[controller.modbusChannel] = modbusChannelController;
        await modbusChannelController.turnOff(); // reset all channels on startup
      }
    }

    return controllers;
  }

  async function refreshState() {

    const controllers = await initModbusControllers();

    const scheduleEntities = await Schedule.findAll({
      include: {
        model: Controller, as: 'controller'
      }
    });

    const schedules = calculateSchedules(scheduleEntities);

    // for (const mbCtrl of Object.values(CHANNELS)) {
    //   // reset controllers
    //   mbCtrl.controller = null;
    // }

    fastify.log.info(`Refresh live state controllers count: ${controllers.length}`);

    // set states
    for (const controller of controllers) {
      const mbCtrl = getChannelCtrlOf(controller);

      // refresh controller binding
      mbCtrl.controller = controller;

      if (controller.state === 'on') {

        await mbCtrl.turnOn();

      } else if (controller.state === 'off') {

        await mbCtrl.turnOff();

      } else if (controller.state === 'auto') {

        const ownSchedules = schedules.filter(sch => sch.schedule.controller.id === controller.id && sch.schedule.active);

        const isOnBySchedule = ownSchedules.some(event => {
          try {
            if (isWithinInterval(new Date(), {
              start: event.start,
              end: event.end
            })) {
              log.info('Activate Modbus by Schedule');
              return true;
            }
            return false;
          } catch (e) {
            fastify.log.error(e);
            return false;
          }
        });

        const desiredValue = isOnBySchedule ? ModbusChannelController.ON : ModbusChannelController.OFF;
        const valueNow = mbCtrl.value;
        if (valueNow !== desiredValue) {
          await mbCtrl.write(desiredValue);
        }
      }
    }

    publishChanges(scheduleEntities, fastify.scheduler, Object.values(CHANNELS), decoration.changes, autoOffJobs);
  }

  function handleStateChange(controllerId: string, state: OnOffAuto) {
    log.info(`Handle controller ${controllerId} to ${state}`);

    const jobId = `${controllerId}${switchOffJobSuffix}`;
    const taskId = `${jobId}-task`;

    if (state === 'on') {
      // schedule off task
      const task = new AsyncTask(
        taskId,
        async () => {
          log.info(`Auto turn to auto ${controllerId} by ${jobId}`);
          fastify.scheduler.removeById(jobId);
          delete autoOffJobs[jobId];

          await Controller.update({
            state: 'auto'
          }, {
            where: {
              id: controllerId
            }
          });

        },
        (err) => {
          log.error(err);
        });

      const job = new SimpleIntervalJob({ hours: 1 }, task, { id: jobId });
      fastify.scheduler.addSimpleIntervalJob(job);
      autoOffJobs[jobId] = new Date();

    } else {

      if (fastify.scheduler.existsById(jobId)) {
        log.info(`Remove job with id: ${jobId}`);
        fastify.scheduler.removeById(jobId);
        delete autoOffJobs[jobId];
      } else {
        log.info(`No job with id: ${jobId}`);
      }

    }
  }

  ([Schedule, Controller]).forEach(model => {

    // @ts-ignore
    model.afterSave(async () => {
      return refreshState();
    });
    // @ts-ignore
    model.afterDestroy(async () => {
      return refreshState();
    });

    // @ts-ignore
    model.afterBulkDestroy(async () => {
      return refreshState();
    });
    // @ts-ignore
    model.afterBulkDestroy(async () => {
      return refreshState();
    });
    // @ts-ignore
    model.afterBulkUpdate(async (options) => {
      log.info(`${JSON.stringify(options)}: afterBulkUpdate`);

      try {
        if (model === Controller && options.fields?.includes('state')) {
          handleStateChange(options.where.id, options.attributes?.state);
        }
      } catch (e) {
        log.error('Error while handling state change', e);
      }

      return refreshState();
    });
  });

  const task = new AsyncTask(
    'refresh Modbus state task',
    async () => {
      log.info('Execute CRON job to sync Modbus state');
      await refreshState();
    },
    (err) => {
      log.error(err);
    }
  );

  const job = new CronJob({ cronExpression: '*/10 * * * * *' }, task);

  // `fastify.scheduler` becomes available after initialization.
  // Therefore, you need to call `ready` method.
  fastify.ready().then(async () => {

    await Controller.update({
      state: 'auto'
    }, { where: {} }); // reset all controllers on startup

    await refreshState();
    fastify.scheduler.addCronJob(job);
  });
});
