import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';
import { Flex, Heading, View } from '@instructure/ui';
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
                        width={400}
                    >
                        <View
                            as="header"
                            margin="medium"
                        >
                            <Heading level="h1">
                                <img
                                    src={'./happyplant.webp'}
                                    height={80}
                                />
                                {' '}
                                HapPi Plant
                            </Heading>
                        </View>

                        <GpioNodeList tabs={tabs}/>
                    </View>
                </Flex.Item>

                <Flex.Item
                    shouldGrow
                    padding="0 small 0 0"
                >
                    <Schedule/>
                </Flex.Item>
            </Flex>
        </>
  );
}
