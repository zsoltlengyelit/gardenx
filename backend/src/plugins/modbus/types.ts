import { Controller, Schedule } from '../database';
import { SimpleIntervalSchedule } from 'toad-scheduler';

export type ControllerChange = {
    type: 'controller'
    controller: Controller;
    set: boolean;
    nextStart?: Date;
}

export type ScheduleChange = {
    schedule: Schedule;
    type: 'schedule'
}

export type OffIntervalChange = {
    type: 'off-interval',
    controllerId: string;
    interval: SimpleIntervalSchedule;
    start: Date;
}

export type SystemStatus = {
    status: 'ok' | 'error';
    message?: string;
}

export type Change = ScheduleChange | ControllerChange | OffIntervalChange;

export const switchOffJobSuffix = '-switch-off';
