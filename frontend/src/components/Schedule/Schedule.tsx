import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import hu from 'date-fns/locale/hu';

import './Schedule.scss';

import { useAtom, useAtomValue } from 'jotai';
import EventEditor, { EventEditorFormFields } from '../EventEditor';
import { currentRangeAtom, weekStartsOn } from '../../api/events';
import { rrulestr } from 'rrule';
import { addDays, addMinutes, differenceInMinutes, setHours, setMinutes, startOfDay } from 'date-fns';
import { Schedule as ScheduleType, ScheduledEvent } from '../../api/types';
import { useSchedules } from '../../api/schedules';
import { makeDate } from '../../common/date';
import ScheduleTemplates from '../ScheduleTemplates';
import { editorModeAtom } from '../../atoms';

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

export type Props = {
    schedules: ScheduleType[];
}

export default function Schedule({ schedules }: Props) {

  const [currentRange, setCurrentRange] = useAtom(currentRangeAtom);
  const editorMode = useAtomValue(editorModeAtom);

  const { deleteSchedule, createSchedule, updateSchedule, deleteScheduleGroup } = useSchedules();

  const eventsInCurrentRange = useMemo(() => {

    const rrulEvents = schedules.reduce((collection, schedule) => {
      const startDate = parseISO(schedule.start);
      const endDate = parseISO(schedule.end);

      if (schedule.rrule) {

        const isWeekView = currentRange.view === Views.WEEK;

        const rangeStart = isWeekView ? startOfWeek(currentRange.date, { weekStartsOn }) : startOfDay(currentRange.date);
        const rangeEnd = addDays(rangeStart, isWeekView ? 7 : 1);

        const dates = rrulestr(schedule.rrule, {
          dtstart: startDate
        }).between(rangeStart, rangeEnd, true);

        const durationInMins = differenceInMinutes(endDate, startDate);

        const newEvents = dates.map(date => {
          return {
            title: schedule.id,
            start: date,
            end: addMinutes(date, durationInMins),
            resource: schedule
          } as ScheduledEvent;
        });
        collection.push(...newEvents);

      } else {
        collection.push({
          title: schedule.id,
          start: startDate,
          end: endDate,
          resource: schedule
        });
      }

      return collection;
    }, [] as ScheduledEvent[]);

    return rrulEvents;

  }, [schedules, currentRange]);

  const [slotInfoDraft, setSlotInfoDraft] = useState<null | ScheduleType>(null);

  const handleSelectSlot = (slotInfo: any) => {
    setSlotInfoDraft(slotInfo);
  };

  async function handleSave(draft: EventEditorFormFields) {

    await createSchedule({
      start: draft.start.toISOString(),
      end: draft.end.toISOString(),
      active: true,
      rrule: draft.rrule,
      controllerId: draft.controllerId
    });

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
    const event = e as ScheduledEvent;
    const sourceEvent = event.resource ? event.resource : event;
    setSlotInfoDraft(sourceEvent);
  }

  async function handleDelete(event: ScheduleType) {
    await deleteSchedule(event);
    setSlotInfoDraft(null);
  }

  async function handleDeleteGroup(groupId: string) {
    await deleteScheduleGroup(groupId);
    setSlotInfoDraft(null);
  }

  async function handleUpdate(event: ScheduleType) {
    // FIXME: wrong tipe
    await updateSchedule({
      start: event.start,
      end: event.end,
      active: event.active,
      rrule: event.rrule,
      controller: event.controller,
      id: event.id
    });
    setSlotInfoDraft(null);
  }

  const onEventResize: withDragAndDropProps['onEventResize'] = async (data) => {
    const { start, end, event } = data as any as { start: Date, end: Date, event: ScheduledEvent };

    const schedule: any = event.resource;
    const isRecurring = !!schedule.rrule;

    const scheduleStart = makeDate(schedule.start);
    const scheduleEnd = makeDate(schedule.end);

    const newStart = isRecurring ? setMinutes(setHours(scheduleStart, start.getHours()), start.getMinutes()) : start;
    const newEnd = isRecurring ? setMinutes(setHours(scheduleEnd, end.getHours()), end.getMinutes()) : end;
    await handleUpdate({
      ...schedule,
      start: newStart,
      end: newEnd,
    });
  };

  const onEventDrop: withDragAndDropProps['onEventDrop'] = data => onEventResize(data);

  if (!editorMode) {
    return <></>;
  }

  return (
        <>
            <div
                className="my-3"
            >
                <div className="py-2 mb-3">
                    <ScheduleTemplates
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onSave={handleSave}
                    />
                </div>

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
                    titleAccessor={(event) => {
                      const resource = (event as ScheduledEvent).resource;
                      return `${resource.controller.name}`;
                    }}
                />
            </div>

            {slotInfoDraft &&
                <EventEditor
                    draft={slotInfoDraft}
                    onClose={() => setSlotInfoDraft(null)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onDeleteGroup={handleDeleteGroup}
                />
            }

        </>

  );

}
