import { Controller, OnOffAuto } from './types';
import { axiosInstance } from './axios';

export function useControllers() {

  return {
    async createController(controller: Omit<Controller, 'id' | 'state'>) {
      await axiosInstance.post('/controllers', {
        name: controller.name,
        gpio: controller.gpio
      });
    },
    async updateController(controller: Controller, change: { name?: string, gpio?: number, state?: OnOffAuto }) {
      await axiosInstance.put(`/controllers/${controller.id}`, {
        ...controller,
        ...change
      });
    },
    async deleteController(controller: Controller) {
      await axiosInstance.delete(`/controllers/${controller.id}`);
    }
  };
}
