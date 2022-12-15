import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo, Views } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import hu from 'date-fns/locale/hu';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Text, View } from '@instructure/ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import * as ics from 'ics';
import EventEditor, { Draft } from './EventEditor';
import { randomString } from '../api/random';
import { axiosInstance } from '../api/axios';
import useSWR from 'swr';
import {
  CalendarEvent,
  currentRangeAtom,
  eventsAtom,
  eventsInCurrentRangeAtom,
  icalAtom,
  weekStartsOn
} from '../api/events';
import { useTabGpioNodeMap } from '../api/nodered';

const { convertTimestampToArray } = ics;
const locales = {
  hu,
};
// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
  format: (date: Date, formats: string) => {
    return format(date, formats === 'p' ? 'HH:mm' : formats);
  },
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn }),
  getDay,
  locales,
});
// @ts-ignore
const DnDCalendar = withDragAndDrop(Calendar);

export default function Schedule() {

  const setIcal = useSetAtom(icalAtom);
  const events = useAtomValue(eventsAtom);
  const eventsInCurrentRange = useAtomValue(eventsInCurrentRangeAtom);
  const [currentRange, setCurrentRange] = useAtom(currentRangeAtom);

  const [slotInfoDraft, setSlotInfoDraft] = useState<SlotInfo | null | CalendarEvent>(null);

  const { data: icalData, isLoading, error } = useSWR('/schedule-ical');

  const tabMap = useTabGpioNodeMap();

  useEffect(() => {

    if (!error && !isLoading) {
      setIcal(icalData);
    }
  }, [icalData]);

  function saveIcal(content: string) {
    setIcal(content);
    axiosInstance.post('/schedule-ical', {
      ical: content
    });
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlotInfoDraft(slotInfo);
  };

  function calendarEventToEventAttributes(event: CalendarEvent) {
    return {
      start: convertTimestampToArray(event.start!.valueOf(), 'local'),
      end: convertTimestampToArray(event.end!.valueOf(), 'local'),
      recurrenceRule: event.rrule?.toString(),
      uid: event.uid,
      title: event.summary,
      categories: event.categories
    } as ics.EventAttributes;
  }

  function getEventAttributes() {
    return events.map(event => calendarEventToEventAttributes(event));
  }

  function normalizeRrule(rrule: string) {
    const prefix = 'RRULE:';
    return rrule.startsWith(prefix) ? rrule.substring(prefix.length) : rrule;
  }

  function handleSave(draft: Draft) {
    const existingEvents = getEventAttributes();
    const parsedIcal = ics.createEvents([
      ...existingEvents,
      {
        uid: randomString(32),
        start: convertTimestampToArray(draft.start.valueOf(), 'local'),
        end: convertTimestampToArray(draft.end.valueOf(), 'local'),
        categories: [draft.flowId, draft.nodeId],
        recurrenceRule: normalizeRrule(draft.rrule)
      }
    ]);

    if (parsedIcal.error) {

      throw new Error((parsedIcal.error as any).errors.join('\n'));
    }

    saveIcal(parsedIcal.value as string);

    setSlotInfoDraft(null);
  }

  function handleNavigate(date: Date, view: string) {
    setCurrentRange({
      date,
      view
    });
  }

  function handleView(view: string) {
    setCurrentRange(prev => ({
      ...prev,
      view
    }));
  }

  function handleSelectEvent(e: object) {
    const event = e as CalendarEvent & { sourceEvent: CalendarEvent };
    const sourceEvent = event.sourceEvent ? event.sourceEvent : event;
    setSlotInfoDraft(sourceEvent);
  }

  function handleDelete(event: CalendarEvent) {
    const existingEvents = getEventAttributes();
    const parsedIcal = ics.createEvents([
      ...existingEvents.filter(ee => ee.uid !== event.uid)
    ]);

    if (parsedIcal.error) {

      throw new Error((parsedIcal.error as any).errors.join('\n'));
    }

    saveIcal(parsedIcal.value as string ?? '');

    setSlotInfoDraft(null);
  }

  function handleUpdate(event: CalendarEvent) {
    const existingEvents = getEventAttributes();

    const mappedEvents = existingEvents.map(ee => {
      if (ee.uid === event.uid) {
        return {
          uid: event.uid,
          start: convertTimestampToArray(event.start!.valueOf(), 'local'),
          end: convertTimestampToArray(event.end!.valueOf(), 'local'),
          categories: event.categories,
          recurrenceRule: event.rrule ? normalizeRrule(event.rrule.toString()) : undefined
        };
      }
      return ee;
    });
    const parsedIcal = ics.createEvents(mappedEvents);

    if (parsedIcal.error) {

      throw new Error((parsedIcal.error as any).errors.join('\n'));
    }

    saveIcal(parsedIcal.value as string ?? '');

    setSlotInfoDraft(null);
  }

  const onEventResize: withDragAndDropProps['onEventResize'] = (data) => {
    const { start, end, event } = data;

    const calendarEvent = event as CalendarEvent;
    const sourceEvent: any = calendarEvent.sourceEvent ?? calendarEvent;

    handleUpdate({
      ...sourceEvent,
      start: start as Date,
      end: end as Date,
    });
  };

  const onEventDrop: withDragAndDropProps['onEventDrop'] = data => onEventResize(data);

  return (
        <>
            <View
                as="div"
                margin="small 0"
            >
                <DnDCalendar
                    date={currentRange.date}
                    defaultView={Views.WEEK}
                    views={[Views.WEEK, Views.DAY]}
                    events={eventsInCurrentRange}
                    localizer={localizer}
                    onEventDrop={onEventDrop}
                    onEventResize={onEventResize}
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    resizable
                    style={{ height: '100%' }}
                    onNavigate={handleNavigate}
                    onView={handleView}
                    onSelectEvent={handleSelectEvent}
                    titleAccessor={event => {
                      if (tabMap.length === 0) {
                        return '';
                      }
                      const [flowId, nodeId] = (event as CalendarEvent).categories as string[] ?? [null, null];

                      const tab = tabMap.find(tab => tab.tab.id === flowId);

                      if (!tab) {
                        return `Tab is removed: ${flowId}`;
                      }
                      const node = tab.nodes.find(node => node.info === nodeId);

                      if (!node) {
                        return `${tab.tab.label} - Node is removed: ${nodeId}`;
                      }

                      return `${tab.tab.label} - ${node.name}`;

                    }}
                />
            </View>

            {slotInfoDraft &&
                <EventEditor
                    draft={slotInfoDraft}
                    onClose={() => setSlotInfoDraft(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                />
            }

        </>

  );

}
