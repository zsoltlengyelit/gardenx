import React from 'react';
import { useControllers } from '../api/controllers';
import { Controller, OnOffAuto } from '../api/types';
import { useAtomValue } from 'jotai';
import { editorModeAtom } from '../atoms';
import Button from './Button';
import ConfirmedButton from './ConfirmedButton';

type Props = {
    controller: Controller;
    set: boolean;
};

export default function ControllerCard({ controller, set }: Props) {

  const { updateController, deleteController } = useControllers();
  const editorMode = useAtomValue(editorModeAtom);

  function createStateHandler(state: OnOffAuto) {
    return () => {
      updateController(controller, {
        state
      });
    };
  }

  return (
        <div
            className={`flex flex-col justify-between shadow-sm border-2 rounded-md p-2 px-3 ${set ? 'bg-green-900 text-white' : ''}`}
        >
            <div className="flex flex-row">
                <div className="grow">
                    <h3 className="text-2xl">{controller.name}</h3>
                </div>
            </div>

            {editorMode &&
                <div className="my-4 border-y-2 py-2 border-gray-200">
                    <div className="my-2">
                        GPIO: {controller.gpio}
                    </div>
                    <ConfirmedButton
                        color="danger"
                        onClick={() => deleteController(controller)}
                    >Delete
                    </ConfirmedButton>
                </div>
            }

            <div className="mt-3">
                <div className="grid grid-cols-3 gap-1">
                    <Button
                        color={controller.state === 'off' ? 'danger' : (set ? 'transparentOnDark' : 'transparent')}
                        onClick={createStateHandler('off')}
                    >OFF
                    </Button>
                    <Button
                        color={controller.state === 'auto' ? 'warning' : (set ? 'transparentOnDark' : 'transparent')}
                        onClick={createStateHandler('auto')}
                    >AUTO
                    </Button>
                    <Button
                        color={controller.state === 'on' ? 'success' : (set ? 'transparentOnDark' : 'transparent')}
                        onClick={createStateHandler('on')}
                    >ON
                    </Button>
                </div>
            </div>
        </div>
  );
}
