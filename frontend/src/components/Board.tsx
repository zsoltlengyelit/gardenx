import ControllerCardList from './ControllerCardList';
import Schedule from './Schedule';
import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';
import { Flex, Heading, IconAdminSolid, IconButton, IconTroubleSolid, Modal } from '@instructure/ui';
import { useAtom } from 'jotai';
import { editorModeAtom } from '../atoms';

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
                                <IconButton
                                    screenReaderLabel={'Editor mode'}
                                    withBackground={editorMode}
                                    withBorder={editorMode}
                                    color={editorMode ? 'secondary' : 'primary-inverse'}
                                    renderIcon={<IconAdminSolid/>}
                                    onClick={() => setEditorMode(!editorMode)}
                                />
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
                <Modal
                    label={'Connection lost...'}
                    open={true}
                    shouldCloseOnDocumentClick={false}
                    shouldReturnFocus={true}
                    size="small"
                >
                    <Modal.Header>
                        <Heading level="h3">Connection lost...</Heading>
                    </Modal.Header>

                    <Modal.Body>
                        <div className="flex flex-row align-middle justify-content-center">
                            <div className="justify-content-center mr-5">
                                <IconTroubleSolid
                                    size="medium"
                                    color="error"
                                />

                            </div>
                            <div className="grow align-middle justify-content-center">
                                <Heading>Oooops</Heading>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            }
        </>
  );
}
