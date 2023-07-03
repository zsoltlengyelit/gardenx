import fp from 'fastify-plugin';
import { BinaryValue, Gpio, ValueCallback } from 'onoff';
import { isWithinInterval } from 'date-fns';
import { Observable, ReplaySubject } from 'rxjs';
import { Controller, Schedule } from './database';
import { FastifyBaseLogger } from 'fastify';
import { calculateSchedules } from './gpio/schedules-rrule';
import fastifySchedule from '@fastify/schedule';
import { AsyncTask, CRON_EVERY_MINUTE, CronJob } from 'toad-scheduler';

function createMockGpio(controller: Controller, log: FastifyBaseLogger) {
  return {
    _callbacks: [],
    unwatch() {
      this._callbacks = [];
    },
    unexport() {
    },
    write(value: BinaryValue) {
      log.info(`Mock GPIO#${controller.gpio} write: ${value}`);

      // @ts-ignore
      this._callbacks.forEach(cb => {
        (cb as any)(null, value);
      });
      return Promise.resolve();
    },
    watch(callback: ValueCallback) {
      this._callbacks.push(callback);
    }
  } as any as Gpio;
}

class MemoizedGpio {
  // eslint-disable-next-line no-useless-constructor
  constructor(private gpio: Gpio, public readonly controller: Controller, private _value: BinaryValue = Gpio.LOW) {
  }

  async write(value: BinaryValue) {
    await this.gpio.write(value);
    this._value = value;
  }

  get value() {
    return this._value;
  }

  close() {
    this.gpio.unexport();
  }
}

type ControllerChange = {
    type: 'controller'
    controller: Controller;
    set: boolean;
}

type ScheduleChange = {
    schedule: Schedule;
    type: 'schedule'
}

type Change = ScheduleChange | ControllerChange;

declare module 'fastify' {
    export interface FastifyInstance {
        gpio: {
            changes: Observable<Change[]>
        };
    }
}
export default fp(async (fastify) => {

  const { Controller, Schedule } = fastify.db;

  const log = fastify.log;
  const decoration = {
    gpios: {} as Record<string, MemoizedGpio>,
    changes: new ReplaySubject<Change[]>(1)
  };

  fastify.decorate('gpio', decoration);

  async function refreshState() {

    log.info('Refresh state');

    Object.values(decoration.gpios).forEach(gpio => {
      gpio.close();
    });

    const controllers = await Controller.findAll();

    if (!Gpio.accessible) {
      fastify.log.info('GPIO is not available. Using mocks');
    }

    // create gpios
    decoration.gpios = controllers.reduce((acc, controller) => {
      const gpio = Gpio.accessible ? new Gpio(controller.gpio, 'out') : createMockGpio(controller, log);
      acc[controller.id] = new MemoizedGpio(gpio, controller);
      return acc;
    }, {} as Record<string, MemoizedGpio>);

    const scheduleEntities = await Schedule.findAll({
      include: {
        model: Controller, as: 'controller'
      }
    });

    const schedules = calculateSchedules(scheduleEntities);

    // set states
    for (const controller of controllers) {
      if (controller.state === 'on') {

        await decoration.gpios[controller.id].write(Gpio.HIGH);

      } else if (controller.state === 'off') {

        await decoration.gpios[controller.id].write(Gpio.LOW);

      } else if (controller.state === 'auto') {

        const ownSchedules = schedules.filter(sch => sch.schedule.controller.id === controller.id && sch.schedule.active);

        const isOnBySchedule = ownSchedules.some(event => {
          if (isWithinInterval(new Date(), {
            start: event.start,
            end: event.end
          })) {
            log.info(`Activate GPIO by Schedule ${JSON.stringify(event.schedule, null, 4)}`);
            return true;
          }
          return false;
        });

        await decoration.gpios[controller.id].write(isOnBySchedule ? Gpio.HIGH : Gpio.LOW);
      }
    }

    // publish controllers state
    const changes = Object.values(decoration.gpios).reduce((acc, gpio) => {
      acc.push({
        type: 'controller',
        controller: gpio.controller,
        set: !!gpio.value
      });
      return acc;
    }, [] as Change[]);

    changes.push(...scheduleEntities.map(schedule => ({
      type: 'schedule',
      schedule
    } as ScheduleChange)));

    decoration.changes.next(changes);

  }

  await refreshState();

  ([Schedule, Controller]).forEach(model => {

    // @ts-ignore
    model.afterSave(async () => refreshState());
    // @ts-ignore
    model.afterDestroy(async () => refreshState());

    // @ts-ignore
    model.afterBulkDestroy(async () => refreshState());
    // @ts-ignore
    model.afterBulkDestroy(async () => refreshState());
    // @ts-ignore
    model.afterBulkUpdate(async () => refreshState());
  });

  await fastify.register(fastifySchedule, {});

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
  const job = new CronJob({ cronExpression: CRON_EVERY_MINUTE }, task);

  // `fastify.scheduler` becomes available after initialization.
  // Therefore, you need to call `ready` method.
  fastify.ready().then(() => {
    fastify.scheduler.addCronJob(job);
  });
});
