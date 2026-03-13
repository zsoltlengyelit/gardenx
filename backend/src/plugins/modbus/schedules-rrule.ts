import { addDays, addMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { Schedule } from '../database';
import { rrulestr } from 'rrule';

export type ScheduledEvent = {
    start: Date;
    end: Date;
    schedule: Schedule;
}

export function calculateSchedules(schedules: Schedule[]) {
  return schedules.filter(sch => {
    return sch.end > new Date() || !!sch.rrule;
  }).reduce((collection, schedule) => {
    const startDate = schedule.start;
    const endDate = schedule.end;

    if (schedule.rrule) {

      const rangeStart = startOfDay(new Date());
      const rangeEnd = addDays(rangeStart, 1);

      const dates = rrulestr(schedule.rrule, {
        dtstart: startDate
      }).between(rangeStart, rangeEnd, true);

      const durationInMins = differenceInMinutes(endDate, startDate);

      const newEvents = dates.map(date => {
        return {
          start: date,
          end: addMinutes(date, durationInMins),
          schedule
        } as ScheduledEvent;
      });
      collection.push(...newEvents);

    } else {
      collection.push({
        start: startDate,
        end: endDate,
        schedule
      });
    }

    return collection;
  }, [] as ScheduledEvent[]);

}
