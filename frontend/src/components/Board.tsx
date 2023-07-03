import ControllerCardList from './ControllerCardList';
import Schedule from './Schedule';
import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { editorModeAtom } from '../atoms';
import { WifiIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid';
import Button from './Button';
import Modal from './Modal';

export default function Board() {

  const { controllers, schedules: scheduleChanges, isConnected } = useLiveState();
  const [editorMode, setEditorMode] = useAtom(editorModeAtom);

  const schedules = useMemo(() => scheduleChanges.map(s => s.schedule), [scheduleChanges]);

  return (
        <>
            <div className="flex flex-col">
                <div
                    className="align-top shadow-xl rounded-lg rounded"
                >
                    <header className="bg-green-600 text-white py-3 px-3 pr-4">
                        <div className="flex flex-row">
                            <h1 className="text-2xl font-weight-bold inline grow">
                                <img
                                    src="/plant.png"
                                    className="inline w-10 mr-2 bg-white p-1 rounded"
                                />
                                HapPi Plant
                            </h1>

                            <div>
                                <Button
                                    color={editorMode ? 'secondary' : 'transparent'}
                                    onClick={() => setEditorMode(!editorMode)}
                                >
                                    <WrenchScrewdriverIcon className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </header>

                    <ControllerCardList controllers={controllers}/>
                </div>

                <div className="flex-grow pt-3 mx-4">
                    <Schedule schedules={schedules}/>
                </div>
            </div>

            {!isConnected &&
                <Modal header={<h3>Connection lost...</h3>}>
                    <div className="flex flex-row align-middle justify-content-center">
                        <div className="justify-content-center mr-5">
                            <WifiIcon className="h-10 w-10 text-red-800" />

                        </div>
                        <div className="grow align-middle justify-content-center">
                            <h1>Oooops</h1>
                        </div>
                    </div>
                </Modal>
            }
        </>
  );
}
