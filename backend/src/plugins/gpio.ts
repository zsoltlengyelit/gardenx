import fp from "fastify-plugin";
import {BinaryValue, Gpio, ValueCallback} from "onoff";
import {isWithinInterval} from "date-fns";
import {Observable, ReplaySubject} from "rxjs";
import {Controller} from "./database";
import {FastifyBaseLogger} from "fastify";

function createMockGpio(controller: Controller, log: FastifyBaseLogger) {
    return {
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
}

class MemoizedGpio {
    constructor(private gpio: Gpio, public readonly controller: Controller, private _value: BinaryValue = Gpio.LOW) {
    }

    async write(value: BinaryValue) {
        await this.gpio.write(value);
        this._value = value;
    }

    get value() {
        return this._value;
    }

    close() {
        this.gpio.unexport();
    }
}

type GpioChange = {
    controller: Controller;
    set: boolean;
}

declare module 'fastify' {
    export interface FastifyInstance {
        gpio: {
            gpios: Record<string, MemoizedGpio>;
            changes: Observable<GpioChange[]>
        };
    }
}
export default fp(async (fastify) => {

    const {Controller, Schedule} = fastify.db;

    const log = fastify.log;
    const decoration = {
        gpios: {} as Record<string, MemoizedGpio>,
        changes: new ReplaySubject<GpioChange[]>(1)
    };

    fastify.decorate('gpio', decoration);

    async function refreshState() {

        log.info('Refresh state');

        Object.values(decoration.gpios).forEach(gpio => {
            gpio.close();
        })

        const controllers = await Controller.findAll();

        if (!Gpio.accessible) {
            fastify.log.info("GPIO is not available. Using mocks");
        }

        // create gpios
        decoration.gpios = controllers.reduce((acc, controller) => {
            const gpio = Gpio.accessible ? new Gpio(controller.gpio, "out") : createMockGpio(controller, log);
            acc[controller.id] = new MemoizedGpio(gpio, controller);
            return acc;
        }, {} as Record<string, MemoizedGpio>);


        const schedules = await Schedule.findAll({
            include: {
                model: Controller, as: 'controller'
            },
            where: {
                active: true,
            }
        });

        // set states
        for (const controller of controllers) {
            if (controller.state === 'on') {

                await decoration.gpios[controller.id].write(Gpio.HIGH);

            } else if (controller.state === 'off') {

                await decoration.gpios[controller.id].write(Gpio.LOW);

            } else if (controller.state === 'auto') {

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

        // publish controllers state
        const changes = Object.values(decoration.gpios).reduce((acc, gpio) => {
            acc.push({
                controller: gpio.controller,
                set: !!gpio.value
            })
            return acc;
        }, [] as GpioChange[]);

        decoration.changes.next(changes);

    }

    await refreshState();

    ([Schedule, Controller]).forEach(model => {

        // @ts-ignore
        model.afterSave(async () => refreshState());
        // @ts-ignore
        model.afterDestroy(async () => refreshState());

        // @ts-ignore
        model.afterBulkDestroy(async () => refreshState());
        // @ts-ignore
        model.afterBulkDestroy(async () => refreshState());
        // @ts-ignore
        model.afterBulkUpdate(async () => refreshState());
    });


    // FIXME
    // await fastify.register(trapsPluginAsync, {
    //     onClose() {
    //         gpios.forEach(gpio => gpio.unexport());
    //         return {};
    //     }
    // })

});