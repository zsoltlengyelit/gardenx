import { NodeControlMode, Tab, useGpioNodeStates } from '../api/nodered';
import { Heading, IconWarningSolid } from '@instructure/ui';

type Props = {
    tab: Tab
};

export default function FlowTabTitle({ tab }: Props) {
  const { gpioNodes } = useGpioNodeStates(tab.id ?? null);
  const hasManual = gpioNodes.some(node => node.mode === NodeControlMode.MANUAL);
  return (
        <Heading level="h4">
            {tab.label}
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
