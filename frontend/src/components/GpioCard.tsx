import { Flex, Heading, RadioInput, RadioInputGroup, Text, View } from '@instructure/ui';
import { GpioNode, NodeControlMode, NodeState, useGpioNodeStates } from '../api/nodered';
import React from 'react';

type Props = {
    node: GpioNode;
    flowId: string | null
};

export default function GpioCard({ node, flowId }: Props) {

  const { updateGpioNode } = useGpioNodeStates(flowId);

  function handleUpdateStateSwitch(node: GpioNode, value: 'auto' | 'off' | 'on') {
    const state: NodeState = value === 'on' ? NodeState.ON : NodeState.OFF;
    const mode: NodeControlMode = value === 'auto' ? NodeControlMode.AUTO : NodeControlMode.MANUAL;
    updateGpioNode(node, state, mode);
  }

  return (
        <div
            key={node.id}
            className={`shadow-sm border-2 rounded-md p-2 px-3 ${node.state ? 'bg-green-700 text-white' : ''}`}
        >
            <Flex direction="row">
                <Flex.Item shouldGrow>
                    <Heading level="h3">{node.name}</Heading>
                </Flex.Item>
                <Flex.Item>
                    <Text weight="bold">{node.info}</Text>

                    <View as="div">
                        <Text>PIN: {node.pin}</Text>
                    </View>
                </Flex.Item>
            </Flex>

            <div className="mt-3">
                <Flex
                    margin="xx-small 0 0 0"
                    alignItems="center"
                    justifyItems="center"
                >
                    <Flex.Item
                        shouldGrow
                        textAlign="center"
                        align="center"
                    >
                        <RadioInputGroup
                            name={`context-${node.id}`}
                            defaultValue="auto"
                            description=""
                            size="large"
                            variant="toggle"
                            layout="stacked"
                            onChange={(event, value) => handleUpdateStateSwitch(node, value as any)}
                        >
                            <RadioInput
                                label="Off"
                                value="off"
                                context="danger"
                            />
                            <RadioInput
                                label="Auto"
                                value="auto"
                                context="warning"
                            />
                            <RadioInput
                                label="On"
                                value="on"
                                context="success"
                            />
                        </RadioInputGroup>

                    </Flex.Item>
                </Flex>
            </div>
        </div>
  );
}
