import websocket from '@fastify/websocket';
import fp from 'fastify-plugin';
import { distinctUntilChanged, map } from 'rxjs';
import isEqual from 'lodash/isEqual';
import { Change, ScheduleChange } from '../plugins/gpio/types';
import { Controller, Schedule } from '../plugins/database';
import { addDays, isAfter } from 'date-fns';
import { rrulestr } from 'rrule';

function isActiveSchedule(schedule: Schedule): boolean {
  return isAfter(schedule.end, new Date()) || !!schedule.rrule;
}

function calculateNextStart(controller: Controller, changes: Change[]): Date | undefined {

  if (controller.state === 'off' || controller.state === 'on') {
    return undefined; // we cannot now when user changes controller to auto
  }

  const controllerSchedules = changes.filter(change => change.type === 'schedule' && change.schedule.controller.id === controller.id) as ScheduleChange[];

  const controllerStartDates = controllerSchedules.map(schChange => {

    const schedule = schChange.schedule;
    if (schedule.rrule) {
      const rangeStart = new Date();
      const rangeEnd = addDays(rangeStart, 30); // take next month

      const dates = rrulestr(schedule.rrule, {
        dtstart: schedule.start
      }).between(rangeStart, rangeEnd, true);

      return dates;

    } else {

      return [schedule.start];

    }
  })
    .flat()
    .filter(date => isAfter(date, new Date()));

  controllerStartDates.sort((d1, d2) => d2 < d1 ? 1 : -1);

  return controllerStartDates[0]; // take the first
}

export default fp(async (fastify) => {
  fastify.register(websocket);
  fastify.register(async function (fastify) {

    fastify.get('/live-state', { websocket: true }, (connection, req) => {

      const changesSubScription = fastify.gpio.changes
        .pipe(
          distinctUntilChanged(isEqual),

          // filter out non-active schedules
          map((changes: Change[]) => {
            return changes.filter(change => {
              const inactivesSchedule = change.type === 'schedule' && !isActiveSchedule(change.schedule);
              return !inactivesSchedule;
            });
          }),

          // add meta info to controllers about next scheduled start
          map(changes => {
            return changes.map(change => {
              if (change.type === 'controller') {
                change.nextStart = calculateNextStart(change.controller, changes);
              }

              return change;

            });
          })
        )
        .subscribe(change => {
          connection.socket.send(JSON.stringify(change));
        });

      connection.socket.on('close', () => {
        req.log.info('Client disconnected');
        changesSubScription.unsubscribe();
      });

    });
  });

});
