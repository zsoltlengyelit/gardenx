import {Controller} from '../database';
import {FastifyBaseLogger} from 'fastify';
import {ModbusTCPClient} from 'jsmodbus';

export class ModbusChannelController {

    static ON = true;
    static OFF = false;

    private _value: boolean = ModbusChannelController.OFF;

    constructor(private modbusClient: ModbusTCPClient, private _controller: Controller | null, private log: FastifyBaseLogger) {
        this.log.info('Initiate channel _controller for channel %d', _controller?.modbusChannel);

        if (this.isOnline && _controller?.modbusChannel != null) {

            modbusClient.readCoils(_controller.modbusChannel, 1).then(resp => {
                const val = resp.response.body.createPayload().readInt8();

                log.info('Initial state of channel %d is %d', _controller?.modbusChannel, val);
                this._value = !!val;

            });
        }
    }

    get isOnline() {
        return this.modbusClient.connectionState === 'online';
    }

    async turnOn() {
        return this.write(ModbusChannelController.ON);
    }

    async turnOff() {
        return this.write(ModbusChannelController.OFF);
    }

    async write(val: boolean) {
        if (val === this.value) {
            this.log.info('Channel %d already in desired state %d', this._controller?.modbusChannel, val);
        }

        this._value = val; // hope best

        if (!this.isOnline) {
            this.log.info('Modbus is not online, cannot write to channel. Try once more.');
            setTimeout(() => this.write(val), 1000);
            return;
        }

        this.log.info('Write value %d to channel %d', val, this._controller?.modbusChannel);
        if (this._controller?.modbusChannel !== undefined) {
            const res = await this.modbusClient.writeSingleCoil(this._controller?.modbusChannel, val);
            this.log.info('Metrics: %o', res.metrics);
        }
    }

    get value(): boolean {
        return this._value;
    }

    // eslint-disable-next-line accessor-pairs
    set controller(val: Controller | null) {
        this._controller = val;
    }

    get controller() {
        return this._controller;
    }
}
