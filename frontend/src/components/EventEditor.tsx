import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';

import { rrulestr } from 'rrule';
import GDateTimeInput from './GDateTimeInput';
import { joiResolver } from '@hookform/resolvers/joi';
import * as joi from 'joi';
import ConfirmedButton from './ConfirmedButton';
import { ComponentProps, useMemo } from 'react';
import { FieldPath } from 'react-hook-form/dist/types/path';
import { useLiveState } from '../api/live-state';
import { Schedule } from '../api/types';
import parseISO from 'date-fns/parseISO';
import { getDayOfYear, setDayOfYear } from 'date-fns';
import { makeDate } from '../common/date';
import RruleEditor from './RruleEditor';
import Button from './Button';
import Modal from './Modal';
import SimpleSelect from './SimpleSelect';
import Field from './Field';

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
    onDeleteGroup: (groupId: string) => void;
};

export default function EventEditor({ draft, onClose, onSave, onDelete, onUpdate, onDeleteGroup }: Props) {

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

      setValue(correctedPath, correctedDate);
      onChange(date);
    };
  }

  return (
        <>

            <Modal
                header={<h3>Schedule</h3>}
                footer={
                    <div className='flex items-center'>
                        <div className="grow justify-start items-start">
                            {isSaved &&
                                <ConfirmedButton
                                    color="danger"
                                    onClick={() => onDelete(draft)}
                                >
                                    Delete
                                </ConfirmedButton>
                            }

                            {isSaved && draft.group_id &&
                                <div>
                                    <ConfirmedButton
                                        color="danger"
                                        onClick={() => onDeleteGroup(draft.group_id!)}
                                    >
                                        Delete Group
                                    </ConfirmedButton>
                                </div>
                            }
                        </div>

                        <div>
                            <Button
                                color="primary-inverse"
                                onClick={() => onClose()}
                                className="mr-2"
                            >
                                Cancel
                            </Button>

                            <Button
                                color="primary"
                                type="submit"
                                onClick={() => submit()}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                }
            >
                <Controller
                    name="controllerId"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => {
                      if (controllers.length === 0) {
                        return <>No controllers</>;
                      }

                      return (
                            <Field label='Controller'>
                                <SimpleSelect
                                    value={value}
                                    onChange={(value) => onChange(value)}
                                    options={controllers.map(c => ({
                                      value: c.id,
                                      label: c.name
                                    }))}
                                />
                            </Field>
                      );
                    }}
                />

                <Controller
                    name="start"
                    control={control}
                    render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                        <Field label="Start">
                            <GDateTimeInput
                                value={typeof value === 'string' ? parseISO(value) : value}
                                onChange={handleDateChange(onChange, name, 'end')}
                            />
                        </Field>
                    )}
                />

                <Controller
                    name="end"
                    control={control}
                    render={({ field: { onChange, value, name }, fieldState: { error } }) => (
                        <Field label="End">
                            <GDateTimeInput
                                value={typeof value === 'string' ? parseISO(value) : value}
                                onChange={handleDateChange(onChange, name, 'start')}
                            />
                        </Field>
                    )}
                />

                <Controller
                    name="rrule"
                    control={control}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Field label="Repeat">
                            <RruleEditor
                                rrule={value}
                                onChange={onChange}
                            />
                        </Field>
                    )}
                />
            </Modal>

        </>
  );
}
