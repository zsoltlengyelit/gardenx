import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';
import * as joi from 'joi';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi/dist/joi';
import { addMinutes, startOfMinute } from 'date-fns';
import {
  Button,
  Flex, FormField,
  FormFieldGroup,
  FormFieldMessages,
  Heading,
  Modal,
  NumberInput,
  SimpleSelect
} from '@instructure/ui';
import { toFormMessage } from '../common/form';
import GDateTimeInput from './GDateTimeInput';
import parseISO from 'date-fns/parseISO';
import { NewSchedule } from '../api/schedules';
import RruleEditor from './RruleEditor';

type DistributorEditorFormFields = {
    controllerId: string | undefined;
    lineCount: number;
    start: Date;
    duration: number;
    gap: number;
    rrule: string;
}

function generateUUID() { // Public Domain/MIT
  let d = new Date().getTime();// Timestamp
  let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;// Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;// random number between 0 and 16
    if (d > 0) { // Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else { // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

type Props = {
    onSave: (...schedules: NewSchedule[]) => Promise<void>;
    onClose: () => void;
};

export default function DistributorEditor({ onSave, onClose }: Props) {
  const { controllers: controllerChanges } = useLiveState();

  const controllers = useMemo(() => controllerChanges.map(c => c.controller), [controllerChanges]);

  const formSchema = joi.object<DistributorEditorFormFields>({
    controllerId: joi.string().required(),
    lineCount: joi.number().required(),
    start: joi.date().required(),
    duration: joi.number().required(),
    gap: joi.number().required(),
    rrule: joi.string().optional()
  });

  const { control, handleSubmit } = useForm<DistributorEditorFormFields>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      controllerId: controllers.length > 0 ? controllers[0].id : undefined,
      start: startOfMinute(new Date()),
      gap: 1,
      duration: 20,
      lineCount: 6,
      rrule: ''
    }
  });

  async function handleFormSubmit(data: DistributorEditorFormFields) {
    let startDate = data.start;
    // eslint-disable-next-line camelcase
    const group_id = generateUUID();

    const schedules = Array.from({ length: data.lineCount }).map((v, index) => {
      const endDate = addMinutes(startDate, data.duration);

      const schedule: NewSchedule = {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        active: true,
        rrule: data.rrule ? data.rrule : undefined,
        controllerId: data.controllerId!,
        // eslint-disable-next-line camelcase
        group_id
      };

      startDate = addMinutes(endDate, data.gap);
      return schedule;
    });
    await onSave(...schedules);
  }

  const handleFormError: SubmitErrorHandler<DistributorEditorFormFields> = (errors) => {
    console.warn(errors);
  };

  const submit = handleSubmit(handleFormSubmit, handleFormError);

  return (
        <Modal
            label={'Distributor start'}
            open={true}
            size="medium"
        >
            <Modal.Header>
                <Heading level="h3">Schedule</Heading>
            </Modal.Header>

            <Modal.Body>
                <FormFieldGroup
                    description={''}
                    rowSpacing="small"
                >

                    <Controller
                        name="controllerId"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => {
                          if (controllers.length === 0) {
                            return <>No controllers</>;
                          }

                          return (
                                <SimpleSelect
                                    renderLabel={'Controller'}
                                    value={value}
                                    onChange={(e, data) => onChange(data.value)}
                                    messages={toFormMessage(error)}
                                >
                                    {controllers.map(controller => (
                                        <SimpleSelect.Option
                                            key={controller.id}
                                            id={controller.id as string}
                                            value={controller.id}
                                        >
                                            {controller.name}
                                        </SimpleSelect.Option>
                                    ))}
                                </SimpleSelect>
                          );
                        }}
                    />

                    <Controller
                        name="start"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <GDateTimeInput
                                value={typeof value === 'string' ? parseISO(value) : value}
                                onChange={onChange}
                                label="Start"
                                messages={toFormMessage(error)}
                            />
                        )}
                    />

                    <Controller
                        name="lineCount"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <NumberInput
                                value={value}
                                onChange={onChange}
                                renderLabel="Line Count"
                                messages={toFormMessage(error)}
                            />
                        )}
                    />

                    <Controller
                        name="duration"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <NumberInput
                                value={value}
                                onChange={onChange}
                                renderLabel="Duration"
                                messages={toFormMessage(error)}
                            />
                        )}
                    />

                    <Controller
                        name="gap"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <NumberInput
                                value={value}
                                onChange={onChange}
                                renderLabel="Gap"
                                messages={toFormMessage(error)}
                            />
                        )}
                    />

                    <Controller
                        name="rrule"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <>
                                <RruleEditor
                                    rrule={value}
                                    onChange={onChange}
                                />
                                <FormFieldMessages messages={toFormMessage(error)}/>
                            </>
                        )}
                    />
                </FormFieldGroup>
            </Modal.Body>

            <Modal.Footer>
                <Flex
                    width="100%"
                    justifyItems="end"
                >
                    <Flex.Item align="center">
                        <Button
                            color="primary-inverse"
                            onClick={() => onClose()}
                            margin="0 small 0 0"
                        >
                            Cancel
                        </Button>

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
            </Modal.Footer>
        </Modal>
  );
}
