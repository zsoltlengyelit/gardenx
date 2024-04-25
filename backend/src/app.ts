import { FastifyPluginAsync } from 'fastify';
import * as fastifyEnv from '@fastify/env';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import corsPlugin from './plugins/cors';
import sensiblePlugin from './plugins/sensible';
import databasePlugin from './plugins/database';
import gpioPlugin from './plugins/gpio';

import controllerRoutes from './routes/controller';
import scheduleRoutes from './routes/schedules';
import liveStateRoutes from './routes/live-state';
import toadScheduler from './plugins/toad-scheduler';

export type AppOptions = {
    // Place your custom options for app below here.
};

// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

declare module 'fastify' {
    export interface FastifyInstance {
        config: {
            DB_PATH: string;
            DB_NAME: string;
        };
    }
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  fastify.withTypeProvider<TypeBoxTypeProvider>();

  await fastify.register(fastifyEnv, {
    confKey: 'config',
    schema: {
      type: 'object',
      properties: {
        DB_PATH: {
          type: 'string'
        },
        DB_NAME: {
          type: 'string'
        }
      }
    } as any,
    data: process.env
  }
  );

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(toadScheduler, {});
  fastify.register(corsPlugin, {});
  fastify.register(sensiblePlugin, {});
  fastify.register(databasePlugin, {});
  fastify.register(gpioPlugin, {});

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(controllerRoutes, {});
  fastify.register(scheduleRoutes, {});
  fastify.register(liveStateRoutes, {});

};

export default app;
export { app, options };
