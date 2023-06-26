import * as ics from "ics";
import {convertTimestampToArray, EventAttributes} from "ics";
import fp from "fastify-plugin";
import {Static, Type} from "@sinclair/typebox";
import {parseJSON} from 'date-fns';

export default fp(async (fastify) => {

    fastify.get('/schedules/ical', {
        schema: {}
    }, async () => {

        const {Schedule, Controller} = fastify.db;

        const schedules = await Schedule.findAll({
            include: {model: Controller, as: 'controller'},
        });

        const events = schedules.map(schedule => {
            return {
                start: convertTimestampToArray(schedule.start.valueOf(), 'utc'),
                end: convertTimestampToArray(schedule.end.valueOf(), 'utc'),
                recurrenceRule: schedule.rrule,
                uid: schedule.id,
                categories: [schedule.controller.id, schedule.controller.name],
                classification: schedule.active ? "ACTIVE" : 'INACTIVE',
                title: schedule.controller.name,
                startInputType: "utc",
                endInputType: "utc",
            } as EventAttributes;
        });

        const calendarContent = ics.createEvents(events);

        return calendarContent.value
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

    type CreateScheduleBodyType = Static<typeof CreateScheduleBody>;
    fastify.post<{ Body: CreateScheduleBodyType }>('/schedules', {
        schema: {
            body: CreateScheduleBody
        }
    }, async (req, reply) => {

        const parseDate = (str: string) => parseJSON(str);

        for (const event of req.body.events) {

            const {start, end, controllerId, active, rrule} = event;

            const start1 = parseDate(start);
            const end1 = parseDate(end);

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
});