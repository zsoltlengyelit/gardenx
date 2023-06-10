import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';
import { Flex, Heading, View } from '@instructure/ui';
import Schedule from './Schedule';

export default function Board() {

  const tabs = useGetTabs();

  return (
        <>
            <div className="flex flex-col md:flex-row">
                <div
                    className="align-top"
                >
                    <header className="m-3">
                        <h1 className="text-2xl font-weight-bold">
                            <img
                                src={'./happyplant.webp'}
                                className="h-12 inline"
                            />
                            {' '}
                            HapPi Plant
                        </h1>
                    </header>

                    <GpioNodeList tabs={tabs}/>
                </div>

                <div className="flex-grow pt-3">
                    <Schedule/>
                </div>
            </div>
        </>
  );
}
