import type { Event } from 'react-big-calendar';

export type OnOffAuto = 'on' | 'off' | 'auto';

export type Controller = {
    id: string;
    name: string;
    gpio: number;
    state: OnOffAuto;
};

export type ChangeBase = {
    type: 'schedule' | 'controller' | 'off-interval';
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

export type SimpleIntervalSchedule = {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
    runImmediately?: boolean;
};

export type OffIntervalChange = ChangeBase & {
    controllerId: string;
    interval: SimpleIntervalSchedule;
    start: string;
};

export type Change = ControllerChange | ScheduleChange | OffIntervalChange;

export type ScheduledEvent = Event & { resource: Schedule };
