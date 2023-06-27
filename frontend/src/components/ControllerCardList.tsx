import ControllerCard from './ControllerCard';
import { GpioChange } from '../api/types';

type Props = {
    changes: GpioChange[];
};

export default function ControllerCardList({ changes }: Props) {

  return (

        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-2 px-4 py-4">
            {changes.map(change => (
                <ControllerCard
                    key={change.controller.id}
                    controller={change.controller}
                    set={change.set}
                />
            ))}
        </div>
  );
}
