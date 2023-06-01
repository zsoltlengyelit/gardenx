import { useAxiosFetcher } from './axios';
import { useEffect, useState } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export type IoPoint = {
    name: string;
};

export type Site = string;

export type IoState = Record<Site, IoPoint[]> | null;

const ws = new ReconnectingWebSocket('ws://localhost:3000');

export function useIo() {
  const { fetch } = useAxiosFetcher();

  const [ioState, setIoState] = useState<| null>(null);

  useEffect(() => {

    const fetchData = async () => {
      const ioCOnfig = await fetch('/io/config');

      setIoState(ioCOnfig);
    };

    fetchData();

  }, []);

  useEffect(() => {
    ws.addEventListener('open', () => {
      console.log('connected');
    });
    ws.addEventListener('message', (event) => {
      const ioUpdate = JSON.parse(event.data);
      console.log(ioUpdate);

    });

  }, []);

  return {
    ioState
  };
}
