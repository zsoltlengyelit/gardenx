import React, { useEffect, useMemo, useState } from 'react';
import { useControllers } from '../api/controllers';
import { Controller, OnOffAuto } from '../api/types';
import { useAtomValue } from 'jotai';
import { editorModeAtom } from '../atoms';
import Button from './Button';
import ConfirmedButton from './ConfirmedButton';
import { useLiveState } from '../api/live-state';
import {
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addSeconds,
  formatDistanceToNowStrict,
  intervalToDuration
} from 'date-fns';
import parseISO from 'date-fns/parseISO';

type Props = {
    controller: Controller;
    set: boolean;
};

export default function ControllerCard({ controller, set }: Props) {

  const { updateController, deleteController } = useControllers();
  const editorMode = useAtomValue(editorModeAtom);
  const { offIntervals } = useLiveState();

  const controllerOffInterval = useMemo(() => {
    const intervals = offIntervals.filter(interval => interval.controllerId === controller.id);
    const interval = intervals.length ? intervals[0] : null;

    if (interval) {
      let end = parseISO(interval.start);

      const { days, hours, minutes, seconds, milliseconds } = interval.interval;

      if (days) {
        end = addDays(end, days);
      }
      if (hours) {
        end = addHours(end, hours);
      }
      if (minutes) {
        end = addMinutes(end, minutes);
      }
      if (seconds) {
        end = addSeconds(end, seconds);
      }
      if (milliseconds) {
        end = addMilliseconds(end, milliseconds);
      }

      return end;
    }
    return null;
  }, [controller, offIntervals]);

  const [autoOffIn, setAutoOffIn] = useState('');

  useEffect(() => {

    const timer = setInterval(() => {
      if (controllerOffInterval) {

        const duration = intervalToDuration({
          start: new Date(),
          end: controllerOffInterval
        });
        if (duration.hours === 0 && duration.minutes === 0) {

          setAutoOffIn(formatDistanceToNowStrict(controllerOffInterval, { unit: 'second' }));
        } else {
          setAutoOffIn(formatDistanceToNowStrict(controllerOffInterval, { unit: 'minute' }));
        }
      } else {
        setAutoOffIn('');
      }
    }, 1000);

    return () => clearInterval(timer);

  }, [controllerOffInterval]);

  function createStateHandler(state: OnOffAuto) {
    return () => {
      updateController(controller, {
        state
      });
    };
  }

  return (
        <div
            className={`flex flex-col justify-between border-0 shadow-xl pt-2 drop-shadow-xl rounded-md p-2 px-3 ${set ? 'bg-green-900 text-white' : ''}`}
        >
            <div className="flex flex-row">
                <div className="grow">
                    <h3 className="text-2xl">{controller.name}</h3>
                </div>
                {autoOffIn && <div className="self-center italic text-sm">auto in {autoOffIn}</div>}
                {editorMode && <div className="self-center">GPIO: {controller.gpio}</div>}
            </div>

            {editorMode &&
                <div className="my-2 border-y-2 py-1 border-gray-200">
                    <ConfirmedButton
                        color="danger"
                        onClick={() => deleteController(controller)}
                    >Delete
                    </ConfirmedButton>
                </div>
            }

            <div className="mt-3">
                <div className="grid grid-cols-3 gap-1">
                    <Button
                        color={controller.state === 'off' ? 'danger' : (set ? 'transparentOnDark' : 'transparent')}
                        onClick={createStateHandler('off')}
                    >OFF
                    </Button>
                    <Button
                        color={controller.state === 'auto' ? 'warning' : (set ? 'transparentOnDark' : 'transparent')}
                        onClick={createStateHandler('auto')}
                    >AUTO
                    </Button>
                    <Button
                        color={controller.state === 'on' ? 'success' : (set ? 'transparentOnDark' : 'transparent')}
                        onClick={createStateHandler('on')}
                    >ON
                    </Button>
                </div>
            </div>
        </div>
  );
}
