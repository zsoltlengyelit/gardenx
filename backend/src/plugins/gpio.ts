import fp from 'fastify-plugin';
import { Gpio } from 'onoff';
import { isWithinInterval } from 'date-fns';
import { Observable, ReplaySubject } from 'rxjs';
import { OnOffAuto } from './database';
import { calculateSchedules } from './gpio/schedules-rrule';
import { AsyncTask, CronJob, SimpleIntervalJob } from 'toad-scheduler';
import { Change, MemoizedGpio, switchOffJobSuffix } from './gpio/types';
import { publishChanges } from './gpio/publishChanges';
import { createMockGpio } from './gpio/mockGpio';

declare module 'fastify' {
    export interface FastifyInstance {
        gpio: {
            changes: Observable<Change[]>
        };
    }
}

const autoOffJobs = {} as Record<string, Date>;

// in-memory map of used GPIOS
const GPIOS = {} as Record<string, MemoizedGpio>;

export default fp(async (fastify) => {

  const { Controller, Schedule } = fastify.db;

  const log = fastify.log;
  const decoration = {
    changes: new ReplaySubject<Change[]>(1)
  };

  fastify.decorate('gpio', decoration);

  async function buildUpGPIOS() {
    // create gpios
    const controllers = await Controller.findAll();
    controllers.forEach((controller) => {

      if (!GPIOS[controller.gpio]) {
        const gpio = Gpio.accessible ? new Gpio(controller.gpio, 'out') : createMockGpio(controller, log);
        GPIOS[controller.gpio] = new MemoizedGpio(gpio, controller);
      }
    });

    return controllers;
  }

  async function refreshState() {

    log.info('Refresh state');

    const controllers = await buildUpGPIOS();

    if (!Gpio.accessible) {
      fastify.log.info('GPIO is not available. Using mocks');
    }

    const scheduleEntities = await Schedule.findAll({
      include: {
        model: Controller, as: 'controller'
      }
    });

    const schedules = calculateSchedules(scheduleEntities);

    // set states
    for (const controller of controllers) {
      if (controller.state === 'on') {

        await GPIOS[controller.gpio].write(Gpio.HIGH);

      } else if (controller.state === 'off') {

        await GPIOS[controller.gpio].write(Gpio.LOW);

      } else if (controller.state === 'auto') {

        const ownSchedules = schedules.filter(sch => sch.schedule.controller.id === controller.id && sch.schedule.active);

        const isOnBySchedule = ownSchedules.some(event => {
          if (isWithinInterval(new Date(), {
            start: event.start,
            end: event.end
          })) {
            log.info('Activate GPIO by Schedule');
            return true;
          }
          return false;
        });

        const desiredValue = isOnBySchedule ? Gpio.HIGH : Gpio.LOW;
        const valueNow = GPIOS[controller.gpio].value;
        if (valueNow !== desiredValue) {
          log.info(`Change GPIO by auto ${valueNow} !== ${desiredValue}`);
          await GPIOS[controller.gpio].write(desiredValue);
        } else {
          log.info(`GPIO is already set to state ${desiredValue}`);
        }
      }
    }

    publishChanges(scheduleEntities, fastify.scheduler, Object.values(GPIOS), decoration.changes, autoOffJobs);
  }

  function handleStateChange(controllerId: string, state: OnOffAuto) {
    fastify.log.info(`Handle controller ${controllerId} to ${state}`);

    const jobId = `${controllerId}${switchOffJobSuffix}`;
    const taskId = `${jobId}-task`;

    if (state === 'on') {
      // schedule off task
      const task = new AsyncTask(
        taskId,
        async () => {
          fastify.log.info(`Auto turn to auto ${controllerId} by ${jobId}`);
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
          fastify.log.error(err);
        });

      const job = new SimpleIntervalJob({ hours: 1 }, task, { id: jobId });
      fastify.scheduler.addSimpleIntervalJob(job);
      autoOffJobs[jobId] = new Date();

    } else {

      if (fastify.scheduler.existsById(jobId)) {
        fastify.log.info(`Remove job with id: ${jobId}`);
        fastify.scheduler.removeById(jobId);
        delete autoOffJobs[jobId];
      } else {
        fastify.log.info(`No job with id: ${jobId}`);
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
      fastify.log.info(`${JSON.stringify(options)}: afterBulkUpdate`);

      try {
        if (model === Controller && options.fields?.includes('state')) {
          await handleStateChange(options.where.id, options.attributes?.state);
        }
      } catch (e) {
        fastify.log.error('Error while handling state change', e);
      }

      return refreshState();
    });
  });

  const task = new AsyncTask(
    'refresh GPIO state task',
    async () => {
      fastify.log.info('Execute CRON job to sync GPIO state');
      await refreshState();
    },
    (err) => {
      fastify.log.error(err);
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
