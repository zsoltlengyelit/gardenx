import ControllerCardList from './ControllerCardList';
import Schedule from './Schedule/Schedule';
import {useLiveState} from '../api/live-state';
import {useEffect, useMemo} from 'react';
import {useAtom} from 'jotai';
import {editorModeAtom} from '../atoms';
import {WifiIcon, WrenchScrewdriverIcon} from '@heroicons/react/24/solid';
import {Button, Modal, Navbar} from 'react-daisyui';

export default function Board() {

    const {controllers, schedules: scheduleChanges, isConnected, isConnectionLoading} = useLiveState();
    const [editorMode, setEditorMode] = useAtom(editorModeAtom);

    useEffect(() => {
        setEditorMode(import.meta.env.MODE !== 'production');
    }, [import.meta.env.MODE]);

    const schedules = useMemo(() => scheduleChanges.map(s => s.schedule), [scheduleChanges]);

    return (
        <>
            <div className="flex flex-col">
                <div
                    className="align-top rounded-lg rounded"
                >
                    <Navbar className="bg-green-600 dark:bg-emerald-950 shadow-xl">
                        <div className="flex flex-row grow">
                            <img
                                src="/plant.png"
                                className="inline w-10 mr-2 ml-2 p-1 rounded bg-white dark:bg-emerald-950"
                            />
                            <h1 className="text-2xl text-white font-weight-bold inline grow">
                                HapPi Plant
                            </h1>

                        </div>
                        <div>
                            <Button
                                color="ghost"
                                className="text-white"
                                onClick={() => setEditorMode(!editorMode)}
                            >
                                <WrenchScrewdriverIcon className="h-4 w-4"/>
                            </Button>
                        </div>
                    </Navbar>

                    <ControllerCardList controllers={controllers}/>
                </div>

                <div className="flex-grow pt-3 mx-4">
                    <Schedule schedules={schedules}/>
                </div>
            </div>

            {!isConnected && !isConnectionLoading &&
                <Modal open={true}>
                    <h3>
                        <WifiIcon className="h-10 w-10 text-green-800 inline"/>
                        {' '}Connecting to server...
                    </h3>
                </Modal>
            }
        </>

    );
}
