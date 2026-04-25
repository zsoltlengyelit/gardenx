import React, { useState } from 'react';
import { useControllers } from '../api/controllers';
import * as joi from 'joi';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi/dist/joi';
import TextInput from './TextInput';
import NumberInput from './NumberInput';
import { PlusIcon } from '@heroicons/react/20/solid';
import Field from './Field';
import { Button, Card } from 'react-daisyui';
import { useLiveState } from '../api/live-state';

type NewControllerFields = {
    name: string;
    modbusChannel: number;
}

export default function NewControllerCard() {

  const { createController } = useControllers();
  const { controllers } = useLiveState();

  const [activated, setActivated] = useState(false);

  const formSchema = joi.object<NewControllerFields>({
    name: joi.string().required(),
    modbusChannel: joi.number().required().custom((value, helpers) => {
      if (controllers.map(c => c.controller.modbusChannel).includes(value)) {
        return helpers.error('custom.modbusChannel');
      }
      return value;
    }, 'Modbus Channel is reserved').messages({
      'custom.modbusChannel': 'Modbus Channel index is already used by other controller.'
    })
  });

  const { control, handleSubmit } = useForm<NewControllerFields>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      name: '',
      modbusChannel: 0
    }
  });

  async function handleFormSubmit(data: NewControllerFields) {
    await createController(data);
    setActivated(false);
  }

  const handleFormError: SubmitErrorHandler<NewControllerFields> = (errors) => {
    console.warn(errors);
  };

  const submit = handleSubmit(handleFormSubmit, handleFormError);

  return (
        <Card>
            {activated
              ? (
                    <Card.Body>
                        <Card.Actions
                            className="justify-end cursor-pointer"
                            onClick={() => setActivated(false)}
                        >
                            <div className={'badge accent badge-lg'}>Ⓧ</div>
                        </Card.Actions>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) =>
                                <Field
                                    label="Name"
                                    error={error}
                                >
                                    <TextInput
                                        value={value}
                                        onChange={onChange}
                                        autoFocus
                                    />
                                </Field>}
                        />

                        <Controller
                            name="modbusChannel"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) =>
                                <Field
                                    label="Channel"
                                    error={error}
                                >
                                    <NumberInput
                                        value={value}
                                        onChange={onChange}
                                    />
                                </Field>
                            }
                        />

                        <div className="mt-3 clex align-middle justify-items-center">
                            <div className="grow text-center align-middle">
                                <Button
                                    color="success"
                                    className="w-full"
                                    type="submit"
                                    onClick={() => submit()}
                                >
                                    Save
                                </Button>

                            </div>
                        </div>
                    </Card.Body>
                )
              : (
                    <div
                        className="w-full h-full align-middle items-center justify-items-center flex text-center"
                    >
                            <Button
                                onClick={() => setActivated(true)}
                                className="grow align-middle justify-center"
                                color="ghost"
                            >
                                <PlusIcon className="w-10 h-10"/>
                            </Button>
                    </div>
                )}
        </Card>
  )
  ;
}
