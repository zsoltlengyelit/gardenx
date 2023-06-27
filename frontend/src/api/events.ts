import { atom } from 'jotai';
import ical from 'ical';
import { addDays, addMinutes, differenceInMinutes, startOfDay, startOfWeek } from 'date-fns';
import { rrulestr } from 'rrule';
import { Views } from 'react-big-calendar';

export const weekStartsOn = 1;

export type CalendarEvent = ical.CalendarComponent & { flowId: string; nodeId: string; };

export const icalAtom = atom('');

export const eventsAtom = atom<CalendarEvent[]>(get => {
  const icalContent = get(icalAtom);

  const icalEvents = ical.parseICS(icalContent);

  return Object.values(icalEvents).map(event => ({
    ...event,
  } as CalendarEvent));
});

export const currentRangeAtom = atom<{ date: Date, view: string }>({
  date: new Date(),
  view: Views.WEEK
});

export const eventsInCurrentRangeAtom = atom((get) => {
  const events = get(eventsAtom);
  const currentRange = get(currentRangeAtom);

  const rrulEvents = events.reduce((collection, event) => {

    if (event.rrule) {

      const isWeekView = currentRange.view === Views.WEEK;

      const rangeStart = isWeekView ? startOfWeek(currentRange.date, { weekStartsOn }) : startOfDay(currentRange.date);
      const rangeEnd = addDays(rangeStart, isWeekView ? 7 : 1);

      const dates = rrulestr(event.rrule.toString()).between(rangeStart, rangeEnd, true);

      const durationInMins = differenceInMinutes(event.end!, event.start!);

      const newEvents = dates.map(date => {
        return {
          ...event,
          uid: `${event.uid}`, // TODO
          start: date,
          dtstamp: date,
          end: addMinutes(date, durationInMins),
          sourceEvent: event
        } as CalendarEvent & { sourceEvent: CalendarEvent };
      });
      collection.push(...newEvents);

    } else {
      collection.push(event);
    }

    return collection;
  }, [] as ical.CalendarComponent[]);

  return rrulEvents;
});
