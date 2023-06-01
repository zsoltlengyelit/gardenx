import GpioNodeList from './GpioNodeList';
// import { useGetTabs } from '../api/nodered';
import {Button, Flex, Heading, View} from '@instructure/ui';
import Schedule from './Schedule';
import {useAuth} from "../api/useAuth";
import {useIo} from "../api/useIo";

export default function Board() {

    const {ioState} = useIo();

    const {logout, jwt} = useAuth()

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

                            <View as="div" borderWidth="small 0" margin="medium 0" padding="medium 0">
                                <Flex direction="row" alignItems="center" justifyItems="space-between">
                                    <Flex.Item>
                                        Welcome <strong>{jwt?.['username']}</strong>
                                    </Flex.Item>
                                    <Flex.Item>
                                        <Button onClick={logout}>Logout</Button>
                                    </Flex.Item>
                                </Flex>
                            </View>
                        </View>

                        <GpioNodeList ioState={ioState}/>
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
