import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';
import { Flex, Heading, View } from '@instructure/ui';
import Schedule from './Schedule';

export default function Board() {

  const tabs = useGetTabs();

  return (
        <>
            <div className="flex flex-col md:m-4">
                <div
                    className="align-top shadow-xl rounded-lg rounded"
                >
                    <header className="bg-green-600 text-white py-4 px-2">
                        <span className='inline rounded-circle p-4 w-12 bg-white mr-6'>
                        <img
                            src={'./happyplant.png'}
                            className="h-12 w-12 inline"
                        />
                        </span>
                        <h1 className="text-2xl font-weight-bold inline">
                            HapPi Plant
                        </h1>
                    </header>

                    <div className="bg-green-100">
                        <GpioNodeList tabs={tabs}/>
                    </div>
                </div>

                <div className="flex-grow pt-3">
                    <Schedule/>
                </div>
            </div>
        </>
  );
}
