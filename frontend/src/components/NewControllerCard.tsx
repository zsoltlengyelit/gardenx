import {
  Button,
  Flex,
  FormFieldGroup,
  Heading,
  IconButton,
  IconPlusLine, NumberInput,
  RadioInput,
  RadioInputGroup,
  TextInput
} from '@instructure/ui';
import React, { useState } from 'react';
import { useControllers } from '../api/controllers';
import * as joi from 'joi';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi/dist/joi';

type Props = {};

type NewControllerFields = {
    name: string;
    gpio: number;
}

export default function NewControllerCard({}: Props) {

  const { createController } = useControllers();

  const [activated, setActivated] = useState(false);

  const formSchema = joi.object<NewControllerFields>({
    name: joi.string().required(),
    gpio: joi.number().required()
  });

  const { control, handleSubmit } = useForm<NewControllerFields>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      name: '',
      gpio: 1
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
        <div
            className={'shadow-sm border-2 rounded-md p-2 px-3'}
        >
            {activated
              ? (
                    <>
                        <FormFieldGroup
                            description={''}
                            rowSpacing="small"
                        >
                            <Controller
                                name="name"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => {
                                  return <TextInput
                                      renderLabel="Name"
                                      value={value}
                                      onChange={onChange}
                                         />;
                                }}
                            />

                            <Controller
                                name="gpio"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => {
                                  return <NumberInput
                                      renderLabel='GPIO'
                                      value={value}
                                      onChange={onChange}
                                         />;
                                }}
                            />

                            <div className="mt-3">
                                <Flex
                                    margin="xx-small 0 0 0"
                                    alignItems="center"
                                    justifyItems="center"
                                >
                                    <Flex.Item
                                        shouldGrow
                                        textAlign="center"
                                        align="center"
                                    >
                                        <Button
                                            color="primary"
                                            type="submit"
                                            autoFocus
                                            onClick={() => submit()}
                                        >
                                            Save
                                        </Button>

                                    </Flex.Item>
                                </Flex>
                            </div>
                        </FormFieldGroup>
                    </>
                )
              : (
                    <Flex
                        width="100%"
                        height="100%"
                        alignItems="center"
                        justifyItems="center"
                    >
                        <Flex.Item>
                            <IconButton
                                screenReaderLabel="Create"
                                renderIcon={<IconPlusLine/>}
                                withBorder={false}
                                size={'large'}
                                withBackground={false}
                                onClick={() => setActivated(true)}
                            />
                        </Flex.Item>
                    </Flex>
                )}
        </div>
  );
}
