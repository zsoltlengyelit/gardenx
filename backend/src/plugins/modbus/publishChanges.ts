import { Subject } from 'rxjs';
import { JobStatus, ToadScheduler } from 'toad-scheduler';
import { Schedule } from '../database';
import { Change, OffIntervalChange, ScheduleChange, switchOffJobSuffix } from './types';
import { ModbusChannelController } from './controller';

export function publishChanges(scheduleEntities: Schedule[], scheduler: ToadScheduler, mbCtrls: ModbusChannelController[], changeSubject: Subject<Change[]>, autoOffJobs: Record<string, Date>) {
  // publish controllers state
  const changes = mbCtrls.reduce((acc, mbCtrl) => {
    if (mbCtrl.controller) {
      acc.push({
        type: 'controller',
        controller: mbCtrl.controller,
        set: mbCtrl.value === ModbusChannelController.ON
      }); 
    }
    return acc;
  }, [] as Change[]);

  changes.push(...scheduleEntities.map(schedule => ({
    type: 'schedule',
    schedule
  } as ScheduleChange)));

  const offIntervalChanges = scheduler.getAllJobs().filter(job => {
    return !!(job.getStatus() === JobStatus.RUNNING && job.id?.endsWith(switchOffJobSuffix));
  }).map(job => {
    const controllerId = (job.id!).split('-switch-off')[0];

    return {
      type: 'off-interval',
      controllerId,
      interval: (job as any).schedule,
      start: autoOffJobs[job.id!]
    } as OffIntervalChange;
  });

  changes.push(...offIntervalChanges);

  changeSubject.next(changes);
}
