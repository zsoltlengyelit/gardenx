import websocket from "@fastify/websocket";
import fp from "fastify-plugin";

export default fp(async (fastify) => {


    fastify.register(websocket)
    fastify.register(async subFastify => {
        subFastify.get('/io-state', {websocket: true}, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on('message', () => {
                // message.toString() === 'hi from client'
                connection.socket.send('hi from server')
            });
        })
    });

});