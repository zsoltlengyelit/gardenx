import {
  Button,
  Flex,
  FormField,
  FormFieldGroup,
  FormFieldMessages,
  Heading,
  Modal,
  SimpleSelect
} from '@instructure/ui';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';

import 'bootstrap/dist/css/bootstrap.css'; // this lib uses boostrap (v. 4.0.0-beta.2)
import 'react-rrule-generator/build/styles.css'; // react-rrule-generator's custom CSS
// @ts-ignore
import RRuleGenerator from 'react-rrule-generator';

import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { rrulestr } from 'rrule';
import GDateTimeInput from './GDateTimeInput';
import { joiResolver } from '@hookform/resolvers/joi';
import * as joi from 'joi';
import { toFormMessage } from '../common/form';
import ConfirmedButton from './ConfirmedButton';
import { ComponentProps, useMemo } from 'react';
import { FieldPath } from 'react-hook-form/dist/types/path';
import { useLiveState } from '../api/live-state';
import { Schedule } from '../api/types';
import parseISO from 'date-fns/parseISO';
import { getDayOfYear, setDayOfYear } from 'date-fns';
import { makeDate } from '../common/date';

export type EventEditorFormFields = {
    id?: string;
    controllerId: string;
    start: Date;
    end: Date;
    rrule?: string;
}

type Props = {
    draft: Schedule;
    onClose: () => void;
    onSave: (draft: EventEditorFormFields) => void;
    onDelete: (event: Schedule) => void;
    onUpdate: (event: Schedule) => void;
};

export default function EventEditor({ draft, onClose, onSave, onDelete, onUpdate }: Props) {

  const { controllers: controllerChanges } = useLiveState();

  const controllers = useMemo(() => controllerChanges.map(c => c.controller), [controllerChanges]);

  function isScheduleEvent() {
    return !!(draft as Schedule).id;
  }

  const isSaved = isScheduleEvent();

  const formSchema = joi.object<EventEditorFormFields>({
    id: joi.string().optional(),
    controllerId: joi.string().required(),
    start: joi.date().required(),
    end: joi.date().required(),
    rrule: joi.string().allow('')
  });

  const { control, handleSubmit, setValue, getValues } = useForm<EventEditorFormFields>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      // FIXME
      id: isSaved ? draft.id : undefined,
      controllerId: isSaved ? (draft as Schedule).controller.id : (controllers.length > 0 ? controllers[0].id : null),
      start: makeDate(draft.start),
      end: makeDate(draft.end),
      rrule: isSaved ? draft.rrule?.toString() : ''
    } as EventEditorFormFields
  });

  function handleFormSubmit(data: EventEditorFormFields) {
    if (isSaved) {
      // @ts-ignore
      onUpdate({
        id: data.id!,
        start: data.start.toISOString(),
        end: data.end.toISOString(),
        active: true,
        controller: controllers.find(c => c.id === data.controllerId)!,
        rrule: data.rrule ? rrulestr(data.rrule).toString() : undefined
      });
    } else {
      onSave(data);
    }
  }

  const handleFormError: SubmitErrorHandler<EventEditorFormFields> = (errors) => {
    console.warn(errors);
  };

  const submit = handleSubmit(handleFormSubmit, handleFormError);

  function handleDateChange(
    onChange: ComponentProps<typeof GDateTimeInput>['onChange'],
    ownPath: FieldPath<EventEditorFormFields>,
    correctedPath: FieldPath<EventEditorFormFields>
  ) {

    return (date: Date | null) => {

      const endTime = getValues(correctedPath as 'end');
      const dayOfYear = getDayOfYear(date!);
      const correctedDate = setDayOfYear(endTime, dayOfYear);

      // if (
      //   (correctedPath === 'end' && makeDate(correctedDate).isSameOrBefore(date)) ||
      //           (correctedPath === 'start' && makeDate(correctedDate).isSameOrAfter(date))) {
      //   setError(ownPath, { message: 'Start cannot be after end' });
      //   return;
      // }

      setValue(correctedPath, correctedDate);
      onChange(date);
    };
  }

  return (
        <>

            <Modal
                label={'Schedule'}
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
                            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                                <GDateTimeInput
                                    value={typeof value === 'string' ? parseISO(value) : value}
                                    onChange={handleDateChange(onChange, name, 'end')}
                                    label="Start"
                                    messages={toFormMessage(error)}
                                />
                            )}
                        />

                        <Controller
                            name="end"
                            control={control}
                            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                                <GDateTimeInput
                                    value={typeof value === 'string' ? parseISO(value) : value}
                                    onChange={handleDateChange(onChange, name, 'start')}
                                    label="End"
                                    messages={toFormMessage(error)}
                                />
                            )}
                        />

                        <FormField
                            label={''}
                            id={'rrule'}
                        >
                            <Controller
                                name="rrule"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <><RRuleGenerator
                                        value={value}
                                        onChange={(rrule: string) => onChange(rrule)}
                                        config={{
                                          repeat: ['Weekly', 'Monthly', 'Daily'],
                                          yearly: 'on the',
                                          monthly: 'on',
                                          end: ['Never', 'On date'],
                                          weekStartsOnSunday: false,
                                          hideError: true,
                                        }}
                                      />
                                        <FormFieldMessages messages={toFormMessage(error)}/>
                                    </>
                                )}
                            />
                        </FormField>
                    </FormFieldGroup>
                </Modal.Body>

                <Modal.Footer>
                    <Flex width="100%">
                        <Flex.Item shouldGrow>
                            {isSaved &&
                                <ConfirmedButton
                                    color="danger"
                                    onClick={() => onDelete(draft)}
                                >
                                    Delete
                                </ConfirmedButton>
                            }
                        </Flex.Item>

                        <Flex.Item>
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

        </>
  );
}
