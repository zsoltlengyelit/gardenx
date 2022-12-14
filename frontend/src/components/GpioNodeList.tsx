import { Tab, useGpioNodeStates } from '../api/nodered';
import { Button, Heading, IconEmptyLine, IconEmptySolid, Tabs, Text, View } from '@instructure/ui';
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

  function handleUpdateState(info: string, state: boolean) {
    updateGpioNode(info, state);
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
                                margin="medium 0"
                                padding="medium"

                            >
                                <Heading>{node.name}</Heading>

                                <Text weight="bold">{node.info}</Text>

                                <View as="div">
                                    <Text>{node.pin}</Text>
                                </View>

                                <View as="div">
                                    <Button onClick={() => handleUpdateState(node.info, !node.state)}>
                                        {node.state ? <IconEmptySolid color="success"/> : <IconEmptyLine/>}
                                    </Button>
                                </View>
                            </View>
                        ))}
                    </Tabs.Panel>
                ))}

            </Tabs>

        </View>
  );
}
