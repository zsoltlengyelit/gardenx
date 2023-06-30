import type { Event } from 'react-big-calendar';

export type OnOffAuto = 'on' | 'off' | 'auto';

export type Controller = {
    id: string;
    name: string;
    gpio: number;
    state: OnOffAuto;
};

export type ChangeBase = {
    type: 'schedule' | 'controller';
}

export type ControllerChange = ChangeBase & {
    controller: Controller;
    set: boolean;
}

export type Schedule = {
    id: string;
    start: string;
    end: string;
    rrule?: string;
    active: boolean;
    controller: Controller;
    group_id?: string;
}

export type ScheduleChange = ChangeBase & {
    schedule: Schedule;
}

export type Change = ControllerChange | ScheduleChange;

export type ScheduledEvent = Event & { resource: Schedule };
