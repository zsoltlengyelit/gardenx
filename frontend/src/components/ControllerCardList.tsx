import ControllerCard from './ControllerCard';
import { ControllerChange } from '../api/types';
import NewControllerCard from './NewControllerCard';
import { useAtomValue } from 'jotai';
import { editorModeAtom } from '../atoms';

type Props = {
    controllers: ControllerChange[];
};

export default function ControllerCardList({ controllers }: Props) {
  const editorMode = useAtomValue(editorModeAtom);

  return (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 px-4 py-4">
            {controllers.map(controller => (
                <ControllerCard
                    key={controller.controller.id}
                    controller={controller.controller}
                    set={controller.set}
                />
            ))}

            {editorMode && <NewControllerCard/> }
        </div>
  );
}
