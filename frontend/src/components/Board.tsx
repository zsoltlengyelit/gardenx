import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';
import { Flex, View } from '@instructure/ui';
import Schedule from './Schedule';

export default function Board() {

  const tabs = useGetTabs();

  return (
        <>
            <Flex>
                <Flex.Item
                    align="start"
                >
                    <View
                        as="div"
                        width={300}
                    >
                        <GpioNodeList tabs={tabs}/>
                    </View>
                </Flex.Item>

                <Flex.Item shouldGrow>
                    <Schedule/>
                </Flex.Item>
            </Flex>
        </>
  );
}
