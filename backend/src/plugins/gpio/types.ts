import { Controller, Schedule } from '../database';
import { BinaryValue, Gpio } from 'onoff';
import { SimpleIntervalSchedule } from 'toad-scheduler';

export class MemoizedGpio {
  // eslint-disable-next-line no-useless-constructor
  constructor(private gpio: Gpio, public controller: Controller | null, private _value: BinaryValue = Gpio.LOW) {
  }

  async write(value: BinaryValue) {
    console.log(`Change from ${this._value} to ${value}`);
    this._value = value;
    await this.gpio.write(value);
  }

  get value() {
    return this._value;
  }

  close() {
    this.gpio.unexport();
  }
}

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

export type Change = ScheduleChange | ControllerChange | OffIntervalChange;

export const switchOffJobSuffix = '-switch-off';
