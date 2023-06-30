import { Button } from '@instructure/ui';
import EventEditor, { EventEditorFormFields } from './EventEditor';
import React, { useState } from 'react';
import { Schedule } from '../api/types';
import { addMinutes, startOfHour } from 'date-fns';

type Props = {
    onSave(event: EventEditorFormFields): void;
    onDelete: (event: Schedule) => void;
    onUpdate: (event: Schedule) => void;
};

export default function ScheduleTemplates({ onSave, onDelete, onUpdate }: Props) {

  const [draft, setDraft] = useState<null | Partial<Schedule>>(null);

  // function handleCreateDistributor() {
  //
  // }

  function handleCreateNew() {
    const start = startOfHour(new Date());
    setDraft({
      start: start.toISOString(),
      end: addMinutes(start, 30).toISOString(),
      active: true,
    });
  }

  return (
        <div className="flex flex-col md:flex-row">
            <div className="grow">
                <Button onClick={handleCreateNew}>New Schedule</Button>
            </div>
            <div>
                {/* <Button onClick={handleCreateDistributor}>Distributor</Button> */}
            </div>

            {draft &&
                <EventEditor
                    draft={draft as Schedule}
                    onClose={() => setDraft(null)}
                    onSave={onSave}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                />
            }
        </div>
  );
}
