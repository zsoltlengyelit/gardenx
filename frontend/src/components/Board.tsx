import ControllerCardList from './ControllerCardList';
import Schedule from './Schedule';
import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';

export default function Board() {

  const { controllers, schedules: scheduleChanges } = useLiveState();

  const schedules = useMemo(() => scheduleChanges.map(s => s.schedule), [scheduleChanges]);

  return (
        <>
            <div className="flex flex-col">
                <div
                    className="align-top shadow-xl rounded-lg rounded"
                >
                    <header className="bg-green-600 text-white py-3 px-3 pr-4">
                        <h1 className="text-2xl font-weight-bold inline">
                            HapPi Plant
                        </h1>
                    </header>

                    <ControllerCardList controllers={controllers}/>
                </div>

                <div className="flex-grow pt-3 mx-4">
                    <Schedule schedules={schedules}/>
                </div>
            </div>
        </>
  );
}
