import { NodeControlMode, Tab, useGpioNodeStates } from '../api/nodered';
import { Heading, IconWarningSolid, Tabs, View } from '@instructure/ui';
import { useEffect } from 'react';
import { atomWithStorage, useUpdateAtom } from 'jotai/utils';
import { useAtomValue } from 'jotai';
import GpioCard from './GpioCard';

type Props = {
    tabs: Tab[];
};

const selectedTabAtom = atomWithStorage<Tab | null>('selectedTab', null);

export default function GpioNodeList({ tabs }: Props) {

  const selectedTab = useAtomValue<Tab | null>(selectedTabAtom);
  const setSelectedTab = useUpdateAtom(selectedTabAtom);
  const { gpioNodes } = useGpioNodeStates(selectedTab?.id ?? null);

  useEffect(() => {
    if (selectedTab === null && tabs.length > 0) {
      setSelectedTab(tabs[0]);
    }
  }, [tabs]);

  function handleTabChange(event: any, { index }: { index: number }) {
    // setCreatingNewGpioNode(false);
    setSelectedTab(tabs[index]);
  }

  function renderTabTitle(tab: Tab) {
    const hasManual = gpioNodes.some(node => node.mode === NodeControlMode.MANUAL);
    return (
            <Heading level="h4">
                {tab.label}
                {' '}
                {hasManual && <IconWarningSolid title={'Manual mode on'}/>}
            </Heading>
    );
  }

  return (
        <View
            as="div"
            margin="medium"
        >

            <Tabs
                onRequestTabChange={handleTabChange}
            >
                {tabs.map(tab => (
                    <Tabs.Panel
                        key={tab.id}
                        id={tab.id}
                        renderTitle={() => renderTabTitle(tab)}
                        isSelected={tab.id === selectedTab?.id}
                    >
                        {gpioNodes.map(node => (
                            <GpioCard
                                node={node}
                                key={node.id}
                                flowId={selectedTab?.id ?? null}
                            />
                        ))}
                    </Tabs.Panel>
                ))}

            </Tabs>

        </View>
  );
}
