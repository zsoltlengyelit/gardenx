import ReconnectingWebSocket from 'reconnecting-websocket';
import { useEffect, useState } from 'react';
import { GpioChange } from './types';

const ws = new ReconnectingWebSocket(import.meta.env.VITE_BACKEND_WS);

export function useLiveState() {

  const [isConnected, setIsConnected] = useState(false);
  const [changes, setChanges] = useState<GpioChange[]>([]);

  useEffect(() => {

    ws.addEventListener('open', () => {
      setIsConnected(true);
    });

    ws.addEventListener('message', (event) => {
      const changesFromWs = JSON.parse(event.data) as GpioChange[];
      setChanges(changesFromWs);
    });

  }, []);

  return {
    changes, isConnected
  };

}
