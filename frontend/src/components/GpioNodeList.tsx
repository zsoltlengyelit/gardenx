import { GpioNode, NodeControlMode, Tab, useGpioNodeStates } from '../api/nodered';
import { Button, Flex, Heading, IconEmptyLine, IconEmptySolid, Tabs, Text, View } from '@instructure/ui';
import { useEffect } from 'react';
import { atomWithStorage, useUpdateAtom } from 'jotai/utils';
import { useAtomValue } from 'jotai';

type Props = {
    tabs: Tab[];
};

const selectedTabAtom = atomWithStorage<Tab | null>('selectedTab', null);

export default function GpioNodeList({ tabs }: Props) {

  const selectedTab = useAtomValue<Tab | null>(selectedTabAtom);
  const setSelectedTab = useUpdateAtom(selectedTabAtom);
  const { gpioNodes, updateGpioNode } = useGpioNodeStates(selectedTab?.id ?? null);

  useEffect(() => {
    if (selectedTab === null && tabs.length > 0) {
      setSelectedTab(tabs[0]);
    }
  }, [tabs]);

  // async function handleSaveGpioNode(data: any) {
  //   const { name, gpioid, pin } = data;
  //
  //   await createGpioNode({
  //     id: randomString(16),
  //     name,
  //     info: 'gpio/' + gpioid,
  //     pin,
  //     out: 'out',
  //     type: 'rpi-gpio out',
  //     bcm: true,
  //     set: true,
  //     wires: [],
  //     freq: '',
  //     level: '0',
  //     z: '',
  //     x: 100,
  //     y: 100
  //   });
  //
  //   setCreatingNewGpioNode(false);
  //   reset();
  // }

  function handleUpdateState(node: GpioNode) {
    updateGpioNode(node);
  }

  function handleTabChange(event: any, { index }: { index: number }) {
    // setCreatingNewGpioNode(false);
    setSelectedTab(tabs[index]);
  }

  return (
        <View
            as="div"
            margin="medium"
        >

            <Tabs
                onRequestTabChange={handleTabChange}
            >
                {tabs.map((tab, index) => (
                    <Tabs.Panel
                        key={tab.id}
                        id={tab.id}
                        renderTitle={tab.label}
                        isSelected={tab.id === selectedTab?.id}
                    >
                        {gpioNodes.map(node => (
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
                                >
                                    {node.mode === NodeControlMode.MANUAL ? 'M' : 'A'}
                                </Button>
                                    </Flex.Item>
                                </Flex>

                                <Flex
                                    margin="small 0 0 0"
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

                            </View>
                        ))}
                    </Tabs.Panel>
                ))}

            </Tabs>

        </View>
  );
}
