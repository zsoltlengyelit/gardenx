import { Button, Flex, Heading, IconEmptyLine, IconEmptySolid, Text, View } from '@instructure/ui';
import { GpioNode, NodeControlMode, useGpioNodeStates } from '../api/nodered';

type Props = {
    node: GpioNode;
    flowId: string | null
};

export default function GpioCard({ node, flowId }: Props) {

  const { updateGpioNode } = useGpioNodeStates(flowId);

  function handleUpdateState(node: GpioNode) {
    updateGpioNode(node);
  }

  return (
        <View
            key={node.id}
            as="div"
            shadow="resting"
            margin="small"
            padding="small"
            background={node.state ? 'success' : undefined}
        >
            <Flex direction="row">
                <Flex.Item shouldGrow>
                    <Heading level="h3">{node.name}</Heading>
                </Flex.Item>
                <Flex.Item>
                    <Button
                        color={node.mode === NodeControlMode.MANUAL ? 'danger' : 'primary-inverse'}
                        disabled
                        title={node.mode === NodeControlMode.MANUAL ? 'Manual mode' : 'Auto mode'}
                    >
                        {node.mode === NodeControlMode.MANUAL ? 'M' : 'A'}
                    </Button>
                </Flex.Item>
            </Flex>

            <Flex
                margin="xx-small 0 0 0"
                alignItems="stretch"
                justifyItems="center"
            >
                <Flex.Item shouldGrow>

                    <Text weight="bold">{node.info}</Text>

                    <View as="div">
                        <Text>PIN: {node.pin}</Text>
                    </View>

                </Flex.Item>

                <Flex.Item
                    shouldGrow
                    textAlign="end"
                    align="end"
                >
                    <Button
                        color="primary-inverse"
                        onClick={() => handleUpdateState(node)}
                    >
                        {node.state ? <IconEmptySolid color="success"/> : <IconEmptyLine/>}
                    </Button>

                </Flex.Item>
            </Flex>

        </View>);
}
