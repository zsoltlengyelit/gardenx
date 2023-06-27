import { Controller, OnOffAuto } from './types';
import { axiosInstance } from './axios';

export function useControllers() {

  return {
    async updateController(controller: Controller, change: { name?: string, gpio?: number, state?: OnOffAuto }) {
      await axiosInstance.put(`/controllers/${controller.id}`, {
        ...controller,
        ...change
      });
    }
  };
}
