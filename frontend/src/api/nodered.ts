import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { axiosInstance, swrFetcher } from './axios';
import ReconnectingWebSocket from 'reconnecting-websocket';

export type GpioNode = {
    'id'?: string;
    'type': 'rpi-gpio out';
    x: number;
    y: number;
    'z': string;
    'name': string;
    'pin': string;
    'set': boolean;
    'level': string;
    'freq': string;
    'out': string;
    'bcm': boolean;
    'wires': string[][];
    'info': string;
    'state'?: boolean;
};

type IoUpdate = {
    io: string;
    state: number;
};

export type Tab = {
    id: string;
    label: string;
    type: 'tab';
    disabled: boolean;
    info: string;
    env: any[];
}

type Flow = {
    nodes: GpioNode[];
} & Tab;

export function useGetFlows<T>() {
  return useSWR<T>('/flows', swrFetcher);
}

export function useGetFlow(flowId: string | null) {
  return useSWR<Flow>(flowId ? `/flow/${flowId}` : null, swrFetcher);
}

export function useGetTabs() {
  const { data, error, isLoading } = useGetFlows<Tab[]>();
  const [filtered, setFiltered] = useState<Tab[]>([]);

  useEffect(() => {
    if (isLoading || error) return;
    setFiltered(data!.filter(node => node.type === 'tab' && node.info !== 'router'));
  }, [data]);

  return filtered;
}

export function useGetGpioNodes(flowId: string | null) {
  const { data, error, isLoading } = useGetFlow(flowId);
  const [filtered, setFiltered] = useState<GpioNode[]>([]);

  useEffect(() => {
    if (isLoading || error || !data) return;
    setFiltered(data.nodes.filter(node => node.type === 'rpi-gpio out'));
  }, [data]);

  return { flow: data, gpioNodes: filtered };
}

export async function updateGpioNode(ioName: string, state: boolean) {

  await axiosInstance.put('/io', [{
    io: ioName,
    state: state ? 1 : 0
  }]);
}

const ws = new ReconnectingWebSocket('ws://localhost:1880/ws/io');

export function useGpioNodeStates(flowId: string | null) {

  const [isConnected, setIsConnected] = useState(ws.readyState === 1);
  const [gpioNodes, setGpioNodes] = useState<GpioNode[]>([]);

  const { gpioNodes: serverGpioNodes, flow } = useGetGpioNodes(flowId);

  useEffect(() => {
    setGpioNodes(serverGpioNodes);
  }, [serverGpioNodes]);

  useEffect(() => {

    ws.addEventListener('open', () => {
      setIsConnected(true);
    });

    ws.addEventListener('message', (event) => {
      const ioUpdate = JSON.parse(event.data) as IoUpdate;

      setGpioNodes(prev => {
        return [...prev.map(node => {
          if (node.info === ioUpdate.io) {
            return {
              ...node,
              state: !!ioUpdate.state
            };
          }

          return node;
        })];
        // console.log(JSON.stringify(newGpioNodes, null, 4));
      });

    });

  }, []);

  return {
    isConnected,
    gpioNodes,
    flow,
    updateGpioNode,
  };
}

export function useGpioManager(flow: Flow | null) {

  async function createGpioNode(newNode: GpioNode) {
    if (!flow) return;

    const resp = await axiosInstance.put(`/flow/${flow.id}`, {
      ...flow,
      nodes: [
        ...flow.nodes,
        newNode
      ]
    });

    return resp;
  }

  return {
    createGpioNode
  };
}
