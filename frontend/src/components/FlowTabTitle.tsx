import {Heading, IconWarningSolid} from '@instructure/ui';
import {IoPoint, Site} from "../api/useIo";

type Props = {
    site: Site;
    ioConfigs: IoPoint[];
};

export default function FlowTabTitle({site}: Props) {
    // const hasManual = gpioNodes.some(node => node.mode === NodeControlMode.MANUAL);
    const hasManual = true;
    return (
        <Heading level="h4">
            {site}
            {' '}
            {hasManual && (
                <IconWarningSolid
                    color="error"
                    title={'Manual mode on'}
                />
            )}
        </Heading>
    );

}
