import { axiosInstance } from './axios';
import { Schedule } from './types';

export function useSchedules() {

  return {
    async deleteSchedule(schedule: Schedule) {
      await axiosInstance.delete(`/schedules/${schedule.id}`);
    },
    async createSchedule(schedule: Omit<Schedule, 'id' | 'controller'> & { controllerId: string }) {

      await axiosInstance.post('/schedules', {
        events: [{
          start: schedule.start,
          end: schedule.end,
          active: true,
          rrule: schedule.rrule,
          controllerId: schedule.controllerId
        }]
      });

    },
    async updateSchedule(schedule: Schedule) {
      await axiosInstance.put(`/schedules/${schedule.id}`, {
        active: schedule.active,
        controllerId: schedule.controller.id,
        rrule: schedule.rrule,
        start: schedule.start,
        end: schedule.end
      });
    }
  };
}
