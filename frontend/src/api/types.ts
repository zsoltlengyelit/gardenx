export type OnOffAuto = 'on' | 'off' | 'auto';

export type Controller = {
    id: string;
    name: string;
    gpio: number;
    state: OnOffAuto;
};

export type GpioChange = {
    controller: Controller;
    set: boolean;
}
