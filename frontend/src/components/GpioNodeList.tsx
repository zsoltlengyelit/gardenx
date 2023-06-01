// import { Tab, useGpioNodeStates } from '../api/nodered';
import {Tabs, View} from '@instructure/ui';
import {useEffect} from 'react';
import {useUpdateAtom} from 'jotai/utils';
import {useAtomValue} from 'jotai';
import GpioCard from './GpioCard';
import FlowTabTitle from './FlowTabTitle';
import {selectedSiteAtom} from '../atoms';
import {IoState, Site} from "../api/useIo";

type Props = {
    ioState: IoState;
};

export default function GpioNodeList({ioState}: Props) {

    const selectedSite = useAtomValue<Site | null>(selectedSiteAtom);
    const setSelectedTab = useUpdateAtom(selectedSiteAtom);

    const sites = ioState ? Object.keys(ioState) : [];
    useEffect(() => {
        if (selectedSite === null && ioState !== null && sites.length > 0) {
            setSelectedTab(sites[0]);
        }
    }, [ioState]);

    function handleTabChange(event: any, {index}: { index: number }) {
        setSelectedTab(sites[index]);
    }

    return (
        <View
            as="div"
        >

            <Tabs
                onRequestTabChange={handleTabChange}
            >
                {ioState && Object.entries(ioState).map(([site, ioPoints], index) => (
                    <Tabs.Panel
                        key={site}
                        id={site}
                        renderTitle={() => <FlowTabTitle site={site} ioConfigs={ioPoints}/>}
                        isSelected={site === selectedSite}
                    >
                        {ioPoints.map(ioPoint => (
                            <GpioCard
                                ioPoint={ioPoint}
                                key={ioPoint.name}
                                site={selectedSite ?? null}
                            />
                        ))}
                    </Tabs.Panel>
                ))}

            </Tabs>

        </View>
    );
}
