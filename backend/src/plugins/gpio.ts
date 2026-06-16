import fp from 'fastify-plugin';
import {Gpio} from 'onoff';
import {isWithinInterval} from 'date-fns';
import {Observable, ReplaySubject} from 'rxjs';
import {OnOffAuto} from './database';
import {calculateSchedules} from './gpio/schedules-rrule';
import {AsyncTask, CronJob, SimpleIntervalJob} from 'toad-scheduler';
import {Change, MemoizedGpio, switchOffJobSuffix} from './gpio/types';
import {publishChanges} from './gpio/publishChanges';
import {createMockGpio} from './gpio/mockGpio';
import fs from 'node:fs';

declare module 'fastify' {
    export interface FastifyInstance {
        gpio: {
            changes: Observable<Change[]>
        };
    }
}

const autoOffJobs = {} as Record<string, Date>;

// in-memory map of used GPIOS
const GPIOS = {} as Record<string, MemoizedGpio>;

export default fp(async (fastify) => {

    const {Controller, Schedule} = fastify.db;

    const log = fastify.log;
    const decoration = {
        changes: new ReplaySubject<Change[]>(1)
    };

    fastify.decorate('gpio', decoration);

    if (!Gpio.accessible) {
        log.info('GPIO is not available. Using mocks');
    }

    /**
     * Reads the Raspberry Pi GPIO debug file and maps logical GPIOs to system GPIOs.
     * @param filePath - Path to the GPIO debug file (defaults to '/sys/kernel/debug/gpio')
     * @returns A promise that resolves to an object mapping { logicalGpio: systemGpio }
     */
    function getGpioMapping(filePath: string = '/sys/kernel/debug/gpio'): Record<number, number> {
        const gpioMap: Record<number, number> = {};

        try {
            // Read the file contents
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const lines = fileContent.split('\n');

            // Regex to match lines like: " gpio-532 (GPIO20"
            // Group 1: System GPIO (e.g., 532)
            // Group 2: Logical GPIO (e.g., 20)
            const regex = /gpio-(\d+)\s+\(GPIO(\d+)/;

            for (const line of lines) {
                const match = line.match(regex);
                if (match) {
                    const systemGpio = parseInt(match[1], 10);
                    const logicalGpio = parseInt(match[2], 10);

                    // Map the logical pin (e.g., 20) to the system pin (e.g., 532)
                    gpioMap[logicalGpio] = systemGpio;
                }
            }

            return gpioMap;
        } catch (error) {
            console.error(`Failed to read or parse GPIO file at ${filePath}:`, error);
            throw error;
        }
    }

    const SYS_GPIO_MAPPING = getGpioMapping();
    log.info(`GPIO mapping: ${JSON.stringify(SYS_GPIO_MAPPING)}`);

    async function buildUpGPIOS() {
        // create gpios
        const controllers = await Controller.findAll();
        controllers.forEach((controller) => {

            if (!GPIOS[controller.gpio]) {
                try {
                    const sysGpio = SYS_GPIO_MAPPING[controller.gpio];
                    log.info('Using system GPIO ' + sysGpio + ' for logical GPIO ' + controller.gpio);
                    const gpio = Gpio.accessible ? new Gpio(sysGpio, 'out') : createMockGpio(controller, log);
                    GPIOS[controller.gpio] = new MemoizedGpio(gpio, controller);
                } catch (e) {
                    log.error(`Error while creating GPIO ${controller.gpio}: ${e}`);
                    const gpio = createMockGpio(controller, log);
                    controller.state = 'error';
                    GPIOS[controller.gpio] = new MemoizedGpio(gpio, controller);
                }


            }
        });

        return controllers;
    }

    async function refreshState() {

        const controllers = await buildUpGPIOS();

        const scheduleEntities = await Schedule.findAll({
            include: {
                model: Controller, as: 'controller'
            }
        });

        const schedules = calculateSchedules(scheduleEntities);

        for (const gpio of Object.values(GPIOS)) {
            // reset controllers
            gpio.controller = null;
        }

        // set states
        for (const controller of controllers) {
            const currentGpio = GPIOS[controller.gpio];

            // refresh controller binding
            currentGpio.controller = controller;

            if (controller.state === 'on') {

                await currentGpio.write(Gpio.HIGH);

            } else if (controller.state === 'off') {

                await currentGpio.write(Gpio.LOW);

            } else if (controller.state === 'auto') {

                const ownSchedules = schedules.filter(sch => sch.schedule.controller.id === controller.id && sch.schedule.active);

                const isOnBySchedule = ownSchedules.some(event => {
                    try {
                        if (isWithinInterval(new Date(), {
                            start: event.start,
                            end: event.end
                        })) {
                            log.info('Activate GPIO by Schedule');
                            return true;
                        }
                        return false;
                    } catch (e) {
                        fastify.log.error(e);
                        return false;
                    }
                });

                const desiredValue = isOnBySchedule ? Gpio.HIGH : Gpio.LOW;
                const valueNow = currentGpio.value;
                if (valueNow !== desiredValue) {
                    await currentGpio.write(desiredValue);
                }
            }
        }

        publishChanges(scheduleEntities, fastify.scheduler, Object.values(GPIOS), decoration.changes, autoOffJobs);
    }

    function handleStateChange(controllerId: string, state: OnOffAuto) {
        log.info(`Handle controller ${controllerId} to ${state}`);

        const jobId = `${controllerId}${switchOffJobSuffix}`;
        const taskId = `${jobId}-task`;

        if (state === 'on') {
            // schedule off task
            const task = new AsyncTask(
                taskId,
                async () => {
                    log.info(`Auto turn to auto ${controllerId} by ${jobId}`);
                    fastify.scheduler.removeById(jobId);
                    delete autoOffJobs[jobId];

                    await Controller.update({
                        state: 'auto'
                    }, {
                        where: {
                            id: controllerId
                        }
                    });

                },
                (err) => {
                    log.error(err);
                });

            const job = new SimpleIntervalJob({hours: 1}, task, {id: jobId});
            fastify.scheduler.addSimpleIntervalJob(job);
            autoOffJobs[jobId] = new Date();

        } else {

            if (fastify.scheduler.existsById(jobId)) {
                log.info(`Remove job with id: ${jobId}`);
                fastify.scheduler.removeById(jobId);
                delete autoOffJobs[jobId];
            } else {
                log.info(`No job with id: ${jobId}`);
            }

        }
    }

    ([Schedule, Controller]).forEach(model => {

        // @ts-ignore
        model.afterSave(async () => {
            return refreshState();
        });
        // @ts-ignore
        model.afterDestroy(async () => {
            return refreshState();
        });

        // @ts-ignore
        model.afterBulkDestroy(async () => {
            return refreshState();
        });
        // @ts-ignore
        model.afterBulkDestroy(async () => {
            return refreshState();
        });
        // @ts-ignore
        model.afterBulkUpdate(async (options) => {
            log.info(`${JSON.stringify(options)}: afterBulkUpdate`);

            try {
                if (model === Controller && options.fields?.includes('state')) {
                    await handleStateChange(options.where.id, options.attributes?.state);
                }
            } catch (e) {
                log.error('Error while handling state change', e);
            }

            return refreshState();
        });
    });

    const task = new AsyncTask(
        'refresh GPIO state task',
        async () => {
            log.info('Execute CRON job to sync GPIO state');
            await refreshState();
        },
        (err) => {
            log.error(err);
        }
    );

    const job = new CronJob({cronExpression: '*/10 * * * * *'}, task);

    // `fastify.scheduler` becomes available after initialization.
    // Therefore, you need to call `ready` method.
    fastify.ready().then(async () => {

        await Controller.update({
            state: 'auto'
        }, {where: {}}); // reset all controllers on startup

        await refreshState();
        fastify.scheduler.addCronJob(job);
    });
});
