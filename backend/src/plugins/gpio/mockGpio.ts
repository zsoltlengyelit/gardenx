import { Controller } from '../database';
import { BinaryValue, Gpio, ValueCallback } from 'onoff';
import { FastifyBaseLogger } from 'fastify';

export function createMockGpio(controller: Controller, log: FastifyBaseLogger) {
  return {
    _callbacks: [],
    unwatch() {
      this._callbacks = [];
    },
    unexport() {
    },
    write(value: BinaryValue) {
      log.info(`Mock GPIO#${controller.gpio} write: ${value}`);

      // @ts-ignore
      this._callbacks.forEach(cb => {
        (cb as any)(null, value);
      });
      return Promise.resolve();
    },
    watch(callback: ValueCallback) {
      this._callbacks.push(callback);
    }
  } as any as Gpio;
}
