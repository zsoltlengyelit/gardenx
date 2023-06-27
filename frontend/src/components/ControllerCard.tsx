import { Flex, Heading, RadioInput, RadioInputGroup, Text, View } from '@instructure/ui';
import React from 'react';
import { useControllers } from '../api/controllers';
import { Controller, OnOffAuto } from '../api/types';

type Props = {
    controller: Controller;
    set: boolean
};

export default function ControllerCard({ controller, set }: Props) {

  const { updateController } = useControllers();

  function handleUpdateStateSwitch(controller: Controller, value: OnOffAuto) {
    updateController(controller, {
      state: value
    });
  }

  return (
        <div
            className={`shadow-sm border-2 rounded-md p-2 px-3 ${set ? 'bg-green-600 text-white' : ''}`}
        >
            <Flex direction="row">
                <Flex.Item shouldGrow>
                    <Heading level="h3">{controller.name}</Heading>
                </Flex.Item>
                <Flex.Item>
                    <View as="div">
                        <Text>PIN: {controller.gpio}</Text>
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
                            name={`context-${controller.id}`}
                            value={controller.state}
                            description=""
                            size="large"
                            variant="toggle"
                            layout="stacked"
                            onChange={(event, value) => handleUpdateStateSwitch(controller, value as any)}
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
