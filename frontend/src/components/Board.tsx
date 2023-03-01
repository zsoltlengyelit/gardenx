import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';
import { Flex, Heading, IconCalendarClockLine, View } from '@instructure/ui';
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
                                <IconCalendarClockLine
                                    size="medium"
                                    color="primary"
                                />
                                GardenX
                            </Heading>
                        </View>

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
