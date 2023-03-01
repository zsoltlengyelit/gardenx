import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { axiosInstance, swrFetcher } from './axios';
import ReconnectingWebSocket from 'reconnecting-websocket';

export enum NodeControlMode {
    // eslint-disable-next-line no-unused-vars
    AUTO = 'auto',
    // eslint-disable-next-line no-unused-vars
    MANUAL = 'manual'
}

export enum NodeState {
    // eslint-disable-next-line no-unused-vars
    OFF = 0,
    // eslint-disable-next-line no-unused-vars
    ON = 1
}

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
    'mode': NodeControlMode;
};

type IoUpdate = {
    io: string;
    state: number;
    mode: NodeControlMode;
};

export type Tab = {
    id: string;
    label: string;
    type: 'tab';
    disabled: boolean;
    info: string;
    env: any[];
}

export type Flow = {
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

const ws = new ReconnectingWebSocket('ws://localhost:1880/ws/io');
const wildCardGpioName = 'gpio/*';

export function useGetGpioNodes(flowId: string | null) {
  const { data, error, isLoading } = useGetFlow(flowId);
  const [filtered, setFiltered] = useState<GpioNode[]>([]);
  const [isConnected, setIsConnected] = useState(ws.readyState === 1);

  useEffect(() => {
    if (isLoading || error || !data) return;
    setFiltered(data.nodes.filter(node => node.type === 'rpi-gpio out'));
  }, [data]);

  useEffect(() => {
    if (isConnected) {
      // this will make Node-red send a state update via WebSocket
      swrFetcher('/send-io-state');
    }
  }, [isConnected]);

  useEffect(() => {

    ws.addEventListener('open', () => {
      setIsConnected(true);
    });

    ws.addEventListener('message', (event) => {
      const ioUpdate = JSON.parse(event.data) as IoUpdate;
      const controlAll = ioUpdate.io === wildCardGpioName;

      if (controlAll) {
        throw new Error('Deprecated gpio/* is used');
      }

      setFiltered(prev => {
        return [...prev.map(node => {
          const nodeGpioId = node.info;
          if (nodeGpioId === ioUpdate.io) {

            const newState = !!ioUpdate.state;
            const newMode = ioUpdate.mode ?? NodeControlMode.AUTO;

            return {
              ...node,
              state: newState,
              mode: newMode
            };
          }

          return node;
        })];
      });

    });

  }, []);

  return { flow: data, gpioNodes: filtered, isConnected };
}

export async function updateGpioNode(node: GpioNode) {

  let state = NodeState.OFF;
  let mode = NodeControlMode.AUTO;

  if (node.mode === NodeControlMode.AUTO || node.mode === undefined) {
    mode = NodeControlMode.MANUAL;
    state = NodeState.ON;
  } else if (node.mode === NodeControlMode.MANUAL && node.state) {
    mode = NodeControlMode.MANUAL;
    state = NodeState.OFF;
  } else if (node.mode === NodeControlMode.MANUAL && !node.state) {
    mode = NodeControlMode.AUTO;
    state = NodeState.OFF;
  }

  await axiosInstance.put('/io', [{
    io: node.info,
    mode,
    state
  }]);
}

type TabWithNodes = {
    tab: Tab,
    nodes: GpioNode[]
};

export function useTabGpioNodeMap(): TabWithNodes[] {
  const tabs = useGetTabs();

  const [map, setMap] = useState<TabWithNodes[]>([]);

  useEffect(() => {
    Promise.all(tabs.map(tab => {
      const flowP = swrFetcher(`/flow/${tab.id}`) as Promise<Flow>;

      return flowP.then(flow => {
        return flow.nodes.filter(node => node.type === 'rpi-gpio out');
      });
    })).then(flowNodes => {

      const tabMap = tabs.map((tab, index) => {
        const nodes = flowNodes[index];

        return {
          tab,
          nodes
        };
      });

      setMap(tabMap);
    });

  }, [tabs]);

  return map;
}

export function useGpioNodeStates(flowId: string | null) {

  const [gpioNodes, setGpioNodes] = useState<GpioNode[]>([]);

  const { gpioNodes: serverGpioNodes, flow, isConnected } = useGetGpioNodes(flowId);

  useEffect(() => {
    setGpioNodes(serverGpioNodes);
  }, [serverGpioNodes]);

  return {
    isConnected,
    gpioNodes,
    flow,
    updateGpioNode,
  };
}
