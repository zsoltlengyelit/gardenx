import { FastifyInstance } from 'fastify';
import * as net from 'node:net';
import { SocketConnectOpts } from 'node:net';
import * as Modbus from 'jsmodbus';

function debounce(func: () => void, timeout = 3000) {
  let timer: any = null;
  return (...args: any[]) => {
    clearTimeout(timer!);
    timer = setTimeout(() => {
      // @ts-ignore
      func.apply(this, args);
    }, timeout);
  };
}

export function createModbusClient(fastify: FastifyInstance) {
  const log = fastify.log;
  const socket = new net.Socket();
  const options: SocketConnectOpts = {
    host: fastify.config.MODBUS_SERVER_HOST,
    port: fastify.config.MODBUS_SERVER_PORT,
  };
  const client = new Modbus.client.TCP(socket, 0);

  let reconnectCount = 0;
  let closedOnPurpose = false;
  let firstTime = true;

  const shutdown = () => {
    closedOnPurpose = true;
    socket.end();
  };

  const reconnect = debounce(() => {
    if (!closedOnPurpose) {
      log.info('Modbus client: Attempting to connect to Modbus server..., %o', options);
      socket.connect(options);
    }
  });

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  socket.on('connect', function () {
    log.info('Modbus client: client connected. For the first time: %d, reconnect count: %d', firstTime, reconnectCount);

    if (firstTime) {
      firstTime = false;
    } else {
      reconnectCount += 1;
    }
  });

  socket.on('close', function () {
    log.info('Modbus client: Socket closed, stopping interval.');
    reconnect();
  });

  socket.on('error', function (err) {
    log.info('Modbus client: Socket Error, %o', (err as any).code ? (err as any).code : 'unknown error');
  });

  reconnect();

  return client;
}
