import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { View } from '@instructure/ui';
import { atom, useAtom, useAtomValue } from 'jotai';
import ical from 'ical';
import * as ics from 'ics';
import EventEditor, { Draft } from './EventEditor';
import { randomString } from '../api/random';
import { axiosInstance } from '../api/axios';

const { convertTimestampToArray } = ics;
const locales = {
  'en-US': enUS,
};
// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
// @ts-ignore
const DnDCalendar = withDragAndDrop(Calendar);

const icalAtom = atom('');

const eventsAtom = atom(get => {
  const icalContent = get(icalAtom);

  const icalEvents = ical.parseICS(icalContent);
  return Object.values(icalEvents);

});

export default function Schedule() {
  const [icalContent, setIcal] = useAtom(icalAtom);
  const events = useAtomValue(eventsAtom);
  const [slotInfoDraft, setSlotInfoDraft] = useState<SlotInfo | null>(null);

  const [icalInited, setIcalInited] = useState(false);

  useEffect(() => {

    axiosInstance.get('/schedule-ical').then(res => {
      setIcal(res.data);
      setIcalInited(true);
    });
  }, []);

  useEffect(() => {

    if (icalInited) {
      axiosInstance.post('/schedule-ical', {
        ical: icalContent
      });
    }

  }, [icalContent]);

  const onEventResize: withDragAndDropProps['onEventResize'] = () => {
    // const { start, end } = data;

  };
  const onEventDrop: withDragAndDropProps['onEventDrop'] = data => {
    console.log(data);

  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlotInfoDraft(slotInfo);
  };

  function toEventAttributes(events: ical.CalendarComponent[]) {
    return events.map(event => ({
      start: convertTimestampToArray(event.start!.valueOf(), 'local'),
      end: convertTimestampToArray(event.end!.valueOf(), 'local'),
      recurrenceRule: event.rrule?.toString(),
      uid: event.uid,
      title: event.summary
    } as ics.EventAttributes));
  }

  function normalizeRrule(rrule: string) {
    const prefix = 'RRULE:';
    return rrule.startsWith(prefix) ? rrule.substring(prefix.length) : rrule;
  }

  function handleSave(draft: Draft) {
    const existingRules = toEventAttributes(events);
    const parsedIcal = ics.createEvents([
      ...existingRules,
      {
        uid: randomString(32),
        start: convertTimestampToArray(draft.start.valueOf(), 'local'),
        end: convertTimestampToArray(draft.end.valueOf(), 'local'),
        title: draft.title,
        recurrenceRule: normalizeRrule(draft.rrule)
      }
    ]);

    if (parsedIcal.error) {

      throw new Error((parsedIcal.error as any).errors.join('\n'));
    }

    setIcal(parsedIcal.value as string);

    setSlotInfoDraft(null);
  }

  return (
        <>
            <View
                as="div"
                margin="small 0"
            >
                <DnDCalendar
                    defaultView='week'
                    events={events}
                    localizer={localizer}
                    onEventDrop={onEventDrop}
                    onEventResize={onEventResize}
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    resizable
                    style={{ height: '100%' }}
                />
            </View>

            {slotInfoDraft &&
                <EventEditor
                    draft={slotInfoDraft}
                    onClose={() => setSlotInfoDraft(null)}
                    onSave={handleSave}
                />
            }

        </>

  );

}
