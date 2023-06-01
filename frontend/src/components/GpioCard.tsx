import { Button, Flex, Heading, IconEmptyLine, IconEmptySolid, Pill, Text, View } from '@instructure/ui';
import React from 'react';
import { IoPoint } from '../api/useIo';

enum NodeControlMode {
    MANUAL
}
type Props = {
    ioPoint: IoPoint;
    site: string | null
};

export default function GpioCard({ ioPoint, site }: Props) {

  // const { updateGpioNode } = useGpioNodeStates(flowId);
  const updateGpioNode = (a: any) => {};

  function handleUpdateState(node: IoPoint) {
    updateGpioNode(node);
  }

  return (
        <View
            as="div"
            shadow="resting"
            margin="small"
            padding="small"
            background={ioPoint.state ? 'success' : undefined}
        >
            <Flex direction="row">
                <Flex.Item shouldGrow>
                    <Heading level="h3">{ioPoint.name}</Heading>
                </Flex.Item>
                <Flex.Item>
                    <Pill
                        color={ioPoint.mode === NodeControlMode.MANUAL ? 'warning' : 'success'}
                        title={ioPoint.mode === NodeControlMode.MANUAL ? 'Manual mode' : 'Auto mode'}
                    >
                        {ioPoint.mode === NodeControlMode.MANUAL ? 'manual' : 'auto'}
                    </Pill>
                </Flex.Item>
            </Flex>

            <Flex
                margin="xx-small 0 0 0"
                alignItems="stretch"
                justifyItems="center"
            >
                <Flex.Item shouldGrow>

                    <Text weight="bold">{ioPoint.info}</Text>

                    <View as="div">
                        <Text>PIN: {ioPoint.pin}</Text>
                    </View>

                </Flex.Item>

                <Flex.Item
                    shouldGrow
                    textAlign="end"
                    align="end"
                >
                    <Button
                        color="primary-inverse"
                        onClick={() => handleUpdateState(ioPoint)}
                    >
                        {ioPoint.state ? <IconEmptySolid color="success"/> : <IconEmptyLine/>}
                    </Button>

                </Flex.Item>
            </Flex>

        </View>);
}
