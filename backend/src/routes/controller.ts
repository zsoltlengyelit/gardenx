import fp from "fastify-plugin";
import {Static, Type} from "@sinclair/typebox";
import {constants} from "http2";

export default fp(async (fastify) => {

    const IdParams = Type.Object({id: Type.String()});
    type IdParamsType = Static<typeof IdParams>;

    const BodyWithNameParams = Type.Object({
        name: Type.String(),
    });
    type BodyWithNameParamsType = Static<typeof BodyWithNameParams>;

    const CreateControllerBodyType = Type.Object({
        name: Type.String(),
        gpio: Type.Integer()
    })
    type CreateControllerBodyType = Static<typeof CreateControllerBodyType>;

    fastify.get('/controllers', async () => {

        const controllers = await fastify.db.Controller.findAll();

        return controllers;
    });

    fastify.post<{ Body: CreateControllerBodyType }>('/controllers', {
        schema: {
            body: Type.Object({
                name: Type.String(),
            })
        }
    }, async (req, reply) => {

        const controller = await fastify.db.Controller.create({
            name: req.body.name,
            state: 'auto',
            gpio: req.body.gpio
        });

        return reply.code(constants.HTTP_STATUS_CREATED).send(controller);
    });

    fastify.put<{ Body: BodyWithNameParamsType, Params: IdParamsType }>('/controllers/:id', {
        schema: {
            params: IdParams,
            body: BodyWithNameParams
        }
    }, async req => {
        const {id} = req.params;

        const body = req.body;
        await fastify.db.Controller.update({
            name: body.name
        }, {
            where: {id}
        });

        return await fastify.db.Controller.findByPk(id);
    });

    fastify.delete<{ Params: IdParamsType }>('/controllers/:id', {
        schema: {
            params: IdParams,
        }
    }, async req => {
        const {id} = req.params;

        const count = await fastify.db.Controller.destroy({
            where: {id}
        });

        return count === 1;
    });
}, {
    name: 'controller-routes'
});