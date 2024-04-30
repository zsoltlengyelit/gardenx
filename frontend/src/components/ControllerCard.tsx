import React, { useEffect, useMemo, useState } from 'react';
import { useControllers } from '../api/controllers';
import { Controller, OnOffAuto } from '../api/types';
import { useAtomValue } from 'jotai';
import { editorModeAtom } from '../atoms';
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
import { Badge, Button, Card, Input } from 'react-daisyui';
import ConfirmedButton from './ConfirmedButton';
import { PencilIcon } from '@heroicons/react/24/solid';
import format from 'date-fns/format';

type Props = {
    controller: Controller,
    set: boolean,
    color: string,
    nextStart?: Date;
};

export default function ControllerCard({ controller, set, color, nextStart }: Props) {

  const { updateController, deleteController } = useControllers();
  const editorMode = useAtomValue(editorModeAtom);
  const { offIntervals } = useLiveState();
  const [isNameEdit, setIsNameEdit] = useState(false);
  const [newName, setNewName] = useState(controller.name);

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
  const [leftMinutes, setLeftMinutes] = useState(0);

  useEffect(() => {
    if (!set) {
      setLeftMinutes(0);
      setAutoOffIn('');
    } else if (set && controller.state === 'auto') {
      setLeftMinutes(60);
    }
  }, [set]);

  useEffect(() => {
    const updateAutoOffIn = () => {
      if (controllerOffInterval) {

        const duration = intervalToDuration({
          start: new Date(),
          end: controllerOffInterval
        });

        setLeftMinutes(duration.minutes ?? 0);

        if (duration.hours === 0 && duration.minutes === 0) {
          setAutoOffIn(formatDistanceToNowStrict(controllerOffInterval, { unit: 'second' }));
        } else {
          setAutoOffIn(formatDistanceToNowStrict(controllerOffInterval, { unit: 'minute' }));
        }
      } else {
        setAutoOffIn('');
      }
    };

    updateAutoOffIn();
    const timer = setInterval(updateAutoOffIn, 1000);

    return () => clearInterval(timer);

  }, [controllerOffInterval]);

  function createStateHandler(state: OnOffAuto) {
    return () => {
      updateController(controller, {
        state
      });
    };
  }

  async function handleSaveNameChange() {
    await updateController(controller, { name: newName });
    setIsNameEdit(false);
  }

  function handleNewName(event: React.ChangeEvent<HTMLInputElement>) {
    setNewName(event.target.value);
  }

  return (
        <Card
            compact={true}
            className="dark:bg-gray-950 border-accent bordered"
            bordered
        >
            <div
                className={'card transform-gpu opacity-90 bg-green-600 absolute h-full z-0'} style={{
                  width: `${100 * leftMinutes / 60}%`
                }}
            >
            </div>
            <Card.Body className={`z-0 ${set ? 'text-white' : ''}`}>
                {editorMode && <Card.Actions className="justify-end">
                    <div className={`${set ? 'loading loading-infinity loading-lg' : 'badge'} ${color} badge-lg`}></div>
                               </Card.Actions>
                }
                <Card.Title className="flex">
                    <div className="grow">
                        {/* Name edit */}
                        {isNameEdit && <>
                            <Input
                                className="w-full"
                                defaultValue={controller.name}
                                onChange={handleNewName}
                            />
                            <div className="w-full flex gap-2 mt-2">
                                <Button onClick={handleSaveNameChange}>Rename</Button>
                                <Button
                                    color="warning"
                                    onClick={() => {
                                      setNewName(controller.name);
                                      setIsNameEdit(false);
                                    }}
                                >Cancel
                                </Button>
                            </div>
                                       </>}

                        {/* Name display */}
                        {!isNameEdit && <>
                            {controller.name}

                            {editorMode && <>
                                {' '}
                                <PencilIcon
                                    className="h-6 w-6 inline"
                                    onClick={() => setIsNameEdit(true)}
                                />
                                           </>}

                            <div className="float-end text-xs pt-1">
                                {nextStart && <>next: {format(nextStart, 'MMMM dd, HH:mm')} </>}
                            </div>
                                        </>
                        }
                    </div>

                    {autoOffIn && <div className="indicator-item indicator-center">
                        <Badge
                            color="info"
                            className="italic text-sm"
                        >auto in {autoOffIn}
                        </Badge>
                                  </div>
                    }
                </Card.Title>

                <Card.Actions className="content-center mt-4">
                    {editorMode &&
                        <div className="self-center mb-2">GPIO: {controller.gpio}</div>
                    }

                    <div className="w-full flex gap-3">
                        <Button
                            className="grow"
                            color={controller.state === 'off' ? 'success' : undefined}
                            onClick={createStateHandler('off')}
                        >OFF
                        </Button>
                        <Button
                            className="grow"
                            color={controller.state === 'auto' ? 'success' : undefined}
                            onClick={createStateHandler('auto')}
                        >AUTO
                        </Button>
                        <Button
                            className="grow"
                            color={controller.state === 'on' ? 'success' : undefined}
                            onClick={createStateHandler('on')}
                        >ON
                        </Button>
                    </div>

                    {editorMode &&
                        <ConfirmedButton
                            className="w-full"
                            color="error"
                            onClick={() => deleteController(controller)}
                        >Delete
                        </ConfirmedButton>
                    }
                </Card.Actions>
            </Card.Body>

        </Card>
  );
}
