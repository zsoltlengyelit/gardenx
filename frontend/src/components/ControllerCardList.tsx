import ControllerCard from './ControllerCard';
import { ControllerChange, OnOffAuto } from '../api/types';
import NewControllerCard from './NewControllerCard';
import { useAtomValue } from 'jotai';
import { editorModeAtom } from '../atoms';
import { useControllerColor } from '../common/useControllerColor';
import { Button, Card } from 'react-daisyui';
import React from 'react';
import { AllControllerCard } from './AllControllerCard';

type Props = {
    controllers: ControllerChange[];
};

export default function ControllerCardList({ controllers }: Props) {
  const editorMode = useAtomValue(editorModeAtom);

  const getColor = useControllerColor();

  return (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 px-4 py-4">

            <AllControllerCard controllerChanges={controllers}/>

            {controllers.map(({ controller, set }, index) => (
                <ControllerCard
                    key={controller.id}
                    controller={controller}
                    set={set}
                    color={getColor(controller)}
                />
            ))}

            {editorMode && <NewControllerCard/>}
        </div>
  );
}
