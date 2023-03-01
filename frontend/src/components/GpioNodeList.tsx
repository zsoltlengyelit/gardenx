import { Tab, useGpioNodeStates } from '../api/nodered';
import { Tabs, View } from '@instructure/ui';
import { useEffect } from 'react';
import { useUpdateAtom } from 'jotai/utils';
import { useAtomValue } from 'jotai';
import GpioCard from './GpioCard';
import FlowTabTitle from './FlowTabTitle';
import { selectedTabAtom } from '../atoms';

type Props = {
    tabs: Tab[];
};

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
    setSelectedTab(tabs[index]);
  }

  return (
        <View
            as="div"
        >

            <Tabs
                onRequestTabChange={handleTabChange}

            >
                {tabs.map(tab => (
                    <Tabs.Panel
                        key={tab.id}
                        id={tab.id}
                        renderTitle={() => <FlowTabTitle tab={tab}/>}
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
