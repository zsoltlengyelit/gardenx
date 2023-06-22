import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';
import { Button } from '@instructure/ui';
import Schedule from './Schedule';

export default function Board() {

  const tabs = useGetTabs();

  return (
        <>
            <div className="flex flex-col">
                <div
                    className="align-top shadow-xl rounded-lg rounded"
                >
                    <header className="bg-green-600 text-white py-3 px-3 pr-4">
                        <h1 className="text-2xl font-weight-bold inline">
                            HapPi Plant
                        </h1>

                        <div className="float-right">
                            <Button
                                target="_blank"
                                href={import.meta.env.VITE_NODE_RED_URL}
                            >Admin
                            </Button>
                        </div>
                    </header>

                    <div className="bg-green-100">
                        <GpioNodeList tabs={tabs}/>
                    </div>
                </div>

                <div className="flex-grow pt-3 mx-4">
                    <Schedule/>
                </div>
            </div>
        </>
  );
}
