import fp from 'fastify-plugin';
import { Static, Type } from '@sinclair/typebox';
import { constants } from 'http2';

export default fp(async (fastify) => {

  const IdParams = Type.Object({ id: Type.String() });
    type IdParamsType = Static<typeof IdParams>;

    const CreateControllerBody = Type.Object({
      name: Type.String(),
      gpio: Type.Integer()
    });
    type CreateControllerBodyType = Static<typeof CreateControllerBody>;

    fastify.get('/controllers', async () => {

      const controllers = await fastify.db.Controller.findAll();

      return controllers;
    });

    fastify.post<{ Body: CreateControllerBodyType }>('/controllers', {
      schema: {
        body: CreateControllerBody
      }
    }, async (req, reply) => {

      const controller = await fastify.db.Controller.create({
        name: req.body.name,
        state: 'auto',
        gpio: req.body.gpio
      });

      return reply.code(constants.HTTP_STATUS_CREATED).send(controller);
    });

    const UpdateControllerBody = Type.Object({
      name: Type.Optional(Type.String()),
      gpio: Type.Optional(Type.Integer()),
      state: Type.Optional(Type.String())
    });
    type UpdateControllerBodyType = Static<typeof UpdateControllerBody>;
    fastify.put<{ Body: UpdateControllerBodyType, Params: IdParamsType }>('/controllers/:id', {
      schema: {
        params: IdParams,
        body: UpdateControllerBody
      }
    }, async req => {
      const { id } = req.params;

      const body = req.body;

      const updates = {} as Record<any, any>;

      if (body.name) {
        updates.name = body.name;
      }
      if (body.state) {
        updates.state = body.state as 'on' | 'off' | 'auto';
      }
      if (typeof body.gpio !== 'undefined') {
        updates.gpio = body.gpio;
      }

      await fastify.db.Controller.update(updates, {
        where: { id }
      });

      return await fastify.db.Controller.findByPk(id);
    });

    fastify.delete<{ Params: IdParamsType }>('/controllers/:id', {
      schema: {
        params: IdParams,
      }
    }, async req => {
      const { id } = req.params;

      const count = await fastify.db.Controller.destroy({
        where: { id }
      });

      return count === 1;
    });
}, {
  name: 'controller-routes'
});
