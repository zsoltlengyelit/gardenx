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
    const { Controller } = fastify.db;

    fastify.get('/controllers', async () => {

      const controllers = await Controller.findAll();

      return controllers;
    });

    fastify.post<{ Body: CreateControllerBodyType }>('/controllers', {
      schema: {
        body: CreateControllerBody
      }
    }, async (req, reply) => {

      const controller = await Controller.create({
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

      await Controller.update(updates, {
        where: { id }
      });

      return await Controller.findByPk(id);
    });

    fastify.delete<{ Params: IdParamsType }>('/controllers/:id', {
      schema: {
        params: IdParams,
      }
    }, async req => {
      const { id } = req.params;

      fastify.log.info(`Delete controller ${id}`);

      const controller = await Controller.findByPk(id);

      let count = 0;
      if (controller !== null) {
        count = await controller.destroy({ force: true }) as any as number;
      }

      fastify.log.info(`Deleted controller count ${count}`);
      return count === 1;
    });
}, {
  name: 'controller-routes'
});
