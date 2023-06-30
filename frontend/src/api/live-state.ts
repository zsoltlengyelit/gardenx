import ReconnectingWebSocket from 'reconnecting-websocket';
import { useEffect, useState } from 'react';
import { Change, ControllerChange, ScheduleChange } from './types';
import { atom, useAtomValue, useSetAtom } from 'jotai';

const ws = new ReconnectingWebSocket(import.meta.env.VITE_BACKEND_WS);

function isScheduleChange(change: Change): change is ScheduleChange {
  return change.type === 'schedule';
}

function isControllerChange(change: Change): change is ControllerChange {
  return change.type === 'controller';
}

const globalChangesAtom = atom<Change[]>([]);

const scheduleChangesAtom = atom(get => {
  return get(globalChangesAtom).filter(isScheduleChange);
});

const controllerChangesAtom = atom(get => {
  return get(globalChangesAtom).filter(isControllerChange);
});

export function useLiveState() {

  const [isConnected, setIsConnected] = useState(false);
  const setGlobal = useSetAtom(globalChangesAtom);
  const schedules = useAtomValue(scheduleChangesAtom);
  const controllers = useAtomValue(controllerChangesAtom);

  useEffect(() => {

    ws.addEventListener('open', () => {
      setIsConnected(true);
    });

    ws.addEventListener('close', () => {
      console.log('dis');
      setIsConnected(false);
    });

    ws.addEventListener('message', (event) => {
      const changesFromWs = JSON.parse(event.data) as Change[];

      setGlobal(changesFromWs);
    });

  }, []);

  return {
    controllers, isConnected, schedules
  };

}
