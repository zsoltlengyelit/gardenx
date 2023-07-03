import { axiosInstance } from './axios';
import { Schedule } from './types';

export type NewSchedule = Omit<Schedule, 'id' | 'controller'> & { controllerId: string };

export function useSchedules() {

  return {
    async deleteSchedule(schedule: Schedule) {
      await axiosInstance.delete(`/schedules/${schedule.id}`);
    },
    async deleteScheduleGroup(groupId: string) {
      await axiosInstance.delete(`/schedules/group/${groupId}`);
    },
    async createSchedule(...schedules: NewSchedule[]) {

      await axiosInstance.post('/schedules', {
        events: schedules
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
