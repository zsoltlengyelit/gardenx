import fp from 'fastify-plugin';
import {BehaviorSubject} from "rxjs";

/**
 * This plugins adds check for network connection.
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async (fastify) => {

    const online = new BehaviorSubject(false);
    const {gateway4async} = await import("default-gateway");

    setInterval(() => {

        gateway4async().then(() => {
            fastify.log.info('Online')
            online.next(true);
        }).catch((error: any) => {
            fastify.log.error(error);
            online.next(false);
        });

    }, 10_000); // every ten seconds

    fastify.decorate('onlineness', {
        online
    });
});
