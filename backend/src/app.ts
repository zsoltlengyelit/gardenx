import {join} from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import {FastifyPluginAsync} from 'fastify';
import * as fastifyEnv from "@fastify/env";

export type AppOptions = {
    // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;


// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

declare module 'fastify' {
    export interface FastifyInstance {
        config: {
            DB_PATH: string;
            DB_NAME: string;
            ICAL_PATH: string;
        };
    }
}

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
    // Place here your custom code!

    await fastify.register(fastifyEnv, {
            confKey: 'config',
            schema: {
                type: 'object',
                required: ['PORT'],
                properties: {
                    PORT: {
                        type: 'string',
                        default: 3000
                    },
                    DB_PATH: {
                        type: 'string'
                    },
                    DB_NAME: {
                        type: 'string'
                    },
                    ICAL_PATH: {
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
    void fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: opts
    })

    // This loads all plugins defined in routes
    // define your routes in one of these
    void fastify.register(AutoLoad, {
        dir: join(__dirname, 'routes'),
        options: opts
    })

};

export default app;
export {app, options}
