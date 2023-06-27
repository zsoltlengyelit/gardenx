import websocket from "@fastify/websocket";
import fp from "fastify-plugin";
import {distinctUntilChanged} from "rxjs";
import isEqual from 'lodash/isEqual';

export default fp(async (fastify) => {
    fastify.register(websocket);
    fastify.register(async function (fastify) {

        fastify.get('/live-state', {websocket: true}, (connection, req) => {

            const changesSubScription = fastify.gpio.changes
                .pipe(distinctUntilChanged(isEqual))
                .subscribe(change => {
                    connection.socket.send(JSON.stringify(change));
                });

            connection.socket.on("close", () => {
                req.log.info("Client disconnected");
                changesSubScription.unsubscribe();
            })

        });
    });

});