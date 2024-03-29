import ReconnectingWebSocket from 'reconnecting-websocket';
import { useEffect, useState } from 'react';
import { Change, ControllerChange, OffIntervalChange, ScheduleChange } from './types';
import { atom, useAtomValue, useSetAtom } from 'jotai';

const ws = new ReconnectingWebSocket(import.meta.env.VITE_BACKEND_WS.replace('HOSTNAME', location.hostname), undefined, {
  maxReconnectionDelay: 1000
});

function isScheduleChange(change: Change): change is ScheduleChange {
  return change.type === 'schedule';
}

function isControllerChange(change: Change): change is ControllerChange {
  return change.type === 'controller';
}

function isOffIntervalChange(change: Change): change is OffIntervalChange {
  return change.type === 'off-interval';
}

const globalChangesAtom = atom<Change[]>([]);

const scheduleChangesAtom = atom(get => {
  return get(globalChangesAtom).filter(isScheduleChange);
});

const controllerChangesAtom = atom(get => {
  const controllers = get(globalChangesAtom).filter(isControllerChange);
  controllers.sort((c1, c2) => c1.controller.name.localeCompare(c2.controller.name));
  return controllers;
});

const offIntervalChangesAtom = atom(get => {
  return get(globalChangesAtom).filter(isOffIntervalChange);
});

export function useLiveState() {

  const [isConnected, setIsConnected] = useState(false);
  const [isConnectionLoading, setIsConnectionLoading] = useState(true);
  const setGlobal = useSetAtom(globalChangesAtom);
  const schedules = useAtomValue(scheduleChangesAtom);
  const controllers = useAtomValue(controllerChangesAtom);
  const offIntervals = useAtomValue(offIntervalChangesAtom);

  useEffect(() => {

    ws.addEventListener('open', () => {
      setIsConnected(true);
      setIsConnectionLoading(false);
    });

    ws.addEventListener('close', () => {
      setIsConnected(false);
      setIsConnectionLoading(false);
    });

    ws.addEventListener('message', (event) => {
      const changesFromWs = JSON.parse(event.data) as Change[];

      setGlobal(changesFromWs);
    });

  }, []);

  return {
    controllers, isConnected, schedules, offIntervals, isConnectionLoading
  };

}
