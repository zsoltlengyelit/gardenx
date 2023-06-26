import fp from "fastify-plugin";
import {BinaryValue, Gpio, ValueCallback} from "onoff";
import {isWithinInterval} from "date-fns";
import {Observable, Subject} from "rxjs";
import {Controller} from "./database";

type GpioChange = {
    controller: Controller;
    set: boolean;
}

declare module 'fastify' {
    export interface FastifyInstance {
        gpio: {
            gpios: Record<string, Gpio>;
            changes: Observable<GpioChange>
        };
    }
}

export default fp(async (fastify) => {

    const {Controller, Schedule} = fastify.db;
    const log = fastify.log;

    const decoration = {
        gpios: {} as Record<string, Gpio>,
        changes: new Subject<GpioChange>()
    };
    fastify.decorate('gpio', decoration);

    async function refreshState() {

        Object.values(decoration.gpios).forEach(gpio => {
            gpio.unwatch();
            gpio.unexport();
        })

        const controllers = await Controller.findAll();

        if (!Gpio.accessible) {
            fastify.log.info("GPIO is not available. Using mocks");
        }

        decoration.gpios = controllers.reduce((acc, controller) => {
            const gpio = Gpio.accessible ? new Gpio(controller.gpio, "out") : {
                _callbacks: [],
                unwatch() {
                    this._callbacks = [];
                },
                unexport() {
                },
                write(value: BinaryValue) {
                    log.info(`Mock GPIO#${controller.gpio} write: ${value}`);

                    // @ts-ignore
                    this._callbacks.forEach(cb => {
                        (cb as any)(null, value);
                    });
                    return Promise.resolve();
                },
                watch(callback: ValueCallback) {
                    this._callbacks.push(callback);
                }
            } as any as Gpio;

            gpio.watch((err, value) => {
                decoration.changes.next({
                    controller, set: !!value
                });
            });

            acc[controller.id] = gpio;
            return acc;
        }, {} as Record<string, Gpio>);


        const schedules = await Schedule.findAll({
            include: {
                model: Controller, as: 'controller'
            },
            where: {
                active: true,
                // TOOD start, end
            }
        });

        log.info('Refresh state');

        for (const controller of controllers) {
            if (controller.state === 'on') {
                await decoration.gpios[controller.id].write(Gpio.HIGH);
            }
            if (controller.state === 'off') {
                await decoration.gpios[controller.id].write(Gpio.LOW);
            }

            if (controller.state === 'auto') {

                const ownSchedules = schedules.filter(sch => sch.controller.id === controller.id);

                const isOnBySchedule = ownSchedules.some(sch => {
                    // find one that activates
                    if (sch.rrule) {
                        // TODO handle
                    } else if (isWithinInterval(new Date(), {
                        start: sch.start,
                        end: sch.end
                    })) {
                        log.info(`Activate GPIO by Schedule ${sch.id}`);
                        return true;
                    }
                });

                await decoration.gpios[controller.id].write(isOnBySchedule ? Gpio.HIGH : Gpio.LOW);
            }
        }
    }

    await refreshState();

    Schedule.afterSave(() => refreshState());
    Schedule.afterDestroy(() => refreshState());
    Schedule.afterBulkDestroy(() => refreshState());
    Schedule.afterSync(() => refreshState());


    // FIXME
    // await fastify.register(trapsPluginAsync, {
    //     onClose() {
    //         gpios.forEach(gpio => gpio.unexport());
    //         return {};
    //     }
    // })

});