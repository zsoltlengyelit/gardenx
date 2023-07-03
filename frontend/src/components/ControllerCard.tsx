import {
  Flex,
  Heading,
  IconButton,
  IconInfoLine,
  RadioInput,
  RadioInputGroup,
  Text,
  Tooltip,
  View
} from '@instructure/ui';
import React from 'react';
import { useControllers } from '../api/controllers';
import { Controller, OnOffAuto } from '../api/types';
import ConfirmedButton from './ConfirmedButton';
import { useAtomValue } from 'jotai';
import { editorModeAtom } from '../atoms';

type Props = {
    controller: Controller;
    set: boolean;
};

export default function ControllerCard({ controller, set }: Props) {

  const { updateController, deleteController } = useControllers();
  const editorMode = useAtomValue(editorModeAtom);

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

                    <Tooltip
                        renderTip={(
                            <div>
                                <Text>PIN: {controller.gpio}</Text>
                                {editorMode &&
                                    <div className="p-3">
                                        <ConfirmedButton
                                            onClick={() => deleteController(controller)}
                                        >Delete
                                        </ConfirmedButton>
                                    </div>
                                }
                            </div>
                        )}
                        placement="bottom"
                        on={['click', 'hover', 'focus']}
                    >
                        <IconButton
                            renderIcon={IconInfoLine}
                            withBackground={false}
                            withBorder={false}
                            screenReaderLabel="Toggle Tooltip"
                        />
                    </Tooltip>
                </Flex.Item>
            </Flex>

            <div className="mt-3">
                <Flex
                    margin="xx-small 0 0 0"
                    alignItems="center"
                    justifyItems="center"
                >
                    <Flex.Item
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
