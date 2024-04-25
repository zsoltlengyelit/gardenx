import EventEditor, { EventEditorFormFields } from './EventEditor';
import React, { useState } from 'react';
import { Schedule } from '../api/types';
import { addMinutes, startOfHour } from 'date-fns';
import { NewSchedule, useSchedules } from '../api/schedules';
import DistributorEditor from './DistributorEditor';
import { Button } from 'react-daisyui';

type Props = {
    onSave(event: EventEditorFormFields): Promise<void>;
    onDelete: (event: Schedule) => void;
    onUpdate: (event: Schedule) => Promise<void>;
};

export default function ScheduleTemplates({ onSave, onDelete, onUpdate }: Props) {

  const [draft, setDraft] = useState<null | Partial<Schedule>>(null);
  const [distributorOpen, setDistributorOpen] = useState(false);

  const { createSchedule } = useSchedules();

  function handleCreateNew() {
    const start = startOfHour(new Date());
    setDraft({
      start: start.toISOString(),
      end: addMinutes(start, 30).toISOString(),
      active: true,
    });
  }

  async function handleSaveDistributor(...schedules: NewSchedule[]) {
    await createSchedule(...schedules);
    setDistributorOpen(false);
  }

  return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="grow">
                <Button
                    className="block w-full"
                    onClick={handleCreateNew}
                >
                    Single Schedule
                </Button>
            </div>
            <div className="grow">
                <Button
                    className="block w-full"
                    onClick={() => setDistributorOpen(true)}
                >
                    Distributor Schedule
                </Button>
            </div>

            {draft &&
                <EventEditor
                    draft={draft as Schedule}
                    onClose={() => setDraft(null)}
                    onSave={(draft) => onSave(draft).then(() => setDraft(null))}
                    onDelete={onDelete}
                    onUpdate={schedule => onUpdate(schedule).then(() => setDraft(null))}
                    onDeleteGroup={() => {
                    }}
                />
            }

            {distributorOpen &&
                <DistributorEditor
                    onSave={handleSaveDistributor}
                    onClose={() => setDistributorOpen(false)}
                />
            }
        </div>
  );
}
