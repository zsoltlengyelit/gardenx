import websocket from "@fastify/websocket";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
    fastify.register(websocket);
    fastify.register(async function (fastify) {
        fastify.get('/io-state', {websocket: true}, (connection /* SocketStream */, req /* FastifyRequest */) => {

            fastify.gpio.changes.subscribe(change => {
                connection.socket.send(JSON.stringify(change));
            })
        });
    });

});