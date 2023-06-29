import fp from "fastify-plugin";
import {Static, Type} from "@sinclair/typebox";
import {isValid, parseJSON} from 'date-fns';

export default fp(async (fastify) => {

    fastify.get('/schedules', {
        schema: {}
    }, async () => {

        const {Schedule, Controller} = fastify.db;

        const schedules = await Schedule.findAll({
            include: {model: Controller, as: 'controller'},
        });

        return schedules;
    });

    const CreateScheduleBody = Type.Object({
        events: Type.Array(Type.Object({
            controllerId: Type.String(),
            start: Type.String(),
            end: Type.String(),
            rrule: Type.Optional(Type.String()),
            active: Type.Boolean()
        }))
    });
    const parseDate = (str: string) => parseJSON(str);

    type CreateScheduleBodyType = Static<typeof CreateScheduleBody>;
    fastify.post<{ Body: CreateScheduleBodyType }>('/schedules', {
        schema: {
            body: CreateScheduleBody
        }
    }, async (req, reply) => {


        for (const event of req.body.events) {

            const {start, end, controllerId, active, rrule} = event;

            const start1 = parseDate(start);
            const end1 = parseDate(end);

            if (!isValid(start1) || !isValid(end1)) {
                throw new Error("Invalid dates");
            }

            // if (isBefore(end1, start1)) {
            //     throw new Error('End is before start')
            // }

            await fastify.db.Schedule.create({
                start: start1,
                end: end1,
                rrule,
                active,
                controller_id: controllerId
            } as any)

        }

        reply.code(201);
    });

    const IdParams = Type.Object({id: Type.String()});
    type IdParamsType = Static<typeof IdParams>;
    const UpdateScheduleBody = Type.Object({
        controllerId: Type.String(),
        start: Type.String({format: 'date-time'}),
        end: Type.String({format: 'date-time'}),
        rrule: Type.Optional(Type.String()),
        active: Type.Boolean()
    });
    type UpdateScheduleBodyType = Static<typeof UpdateScheduleBody>;
    fastify.put<{ Body: UpdateScheduleBodyType, Params: IdParamsType }>('/schedules/:id', {
        schema: {
            body: UpdateScheduleBody,
            params: IdParams
        },
    }, async (req, reply) => {
        const {id} = req.params;

        const {start, end, controllerId, active, rrule} = req.body;

        const start1 = parseDate(start);
        const end1 = parseDate(end);

        if (!isValid(start1) || !isValid(end1)) {
            throw new Error("Invalid dates");
        }

        fastify.db.Schedule.update({
            controller_id: controllerId,
            start: start1,
            end: end1,
            active,
            rrule
        } as any, {
            where: {id}
        })
    });

    fastify.delete<{ Params: IdParamsType }>('/schedules/:id', {
        schema: {
            params: IdParams
        }
    }, async (req, reply) => {
        const {id} = req.params;

        const count = await fastify.db.Schedule.destroy({
            where: {id}
        });

        if (count !== 1) {
            return reply.code(404).send();
        }

        reply.code(204);
    })
});