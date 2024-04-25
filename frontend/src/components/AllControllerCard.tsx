import React from 'react';
import { Button, Card } from 'react-daisyui';
import { ControllerChange, OnOffAuto } from '../api/types';
import { useControllers } from '../api/controllers';

type Props = {
    controllerChanges: ControllerChange[];
};

export function AllControllerCard({ controllerChanges }: Props) {

  const { updateController } = useControllers();

  async function handleAllSet(state: Omit<OnOffAuto, 'on'>) {
    for (const controller of controllerChanges) {
      await updateController(controller.controller, { state: state as OnOffAuto });
    }
  }

  return (<>

        <Card
            compact={true}
            bordered={false}
        >
            <Card.Body>
                <div className="w-full flex gap-3">
                    <Button
                        className="grow"
                        onClick={() => handleAllSet('off')}
                    >ALL OFF
                    </Button>
                    <Button
                        className="grow"
                        onClick={() => handleAllSet('auto')}
                    >ALL AUTO
                    </Button>
                </div>
            </Card.Body>
        </Card>
          </>);
}
