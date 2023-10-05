import { Subject } from 'rxjs';
import { JobStatus, ToadScheduler } from 'toad-scheduler';
import { Schedule } from '../database';
import { Change, MemoizedGpio, OffIntervalChange, ScheduleChange, switchOffJobSuffix } from './types';

export function publishChanges(scheduleEntities: Schedule[], scheduler: ToadScheduler, gpios: MemoizedGpio[], changeSubject: Subject<Change[]>, autoOffJobs: Record<string, Date>) {
  // publish controllers state
  const changes = gpios.reduce((acc, gpio) => {
    if (gpio.controller) {
      acc.push({
        type: 'controller',
        controller: gpio.controller,
        set: !!gpio.value
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
