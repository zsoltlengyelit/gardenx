import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';
import * as joi from 'joi';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi/dist/joi';
import { addMinutes, startOfMinute } from 'date-fns';
import GDateTimeInput from './GDateTimeInput';
import parseISO from 'date-fns/parseISO';
import { NewSchedule } from '../api/schedules';
import RruleEditor from './RruleEditor';
import Modal from './Modal';
import Button from './Button';
import SimpleSelect from './SimpleSelect';
import NumberInput from './NumberInput';
import Field from './Field';

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
    rrule: joi.string().allow('')
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
            header={<h3>Schedule</h3>} footer={(
            <div
                className="flex justify-end w-full"
            >
                <div className="align-middle">
                    <Button
                        color="primary-inverse"
                        onClick={() => onClose()}
                        className="mr-4"
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
        )}
        >

            <Controller
                name="controllerId"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  if (controllers.length === 0) {
                    return <>No controllers</>;
                  }

                  return (
                        <Field
                            label={'Controller'}
                            error={error}
                        >
                            <SimpleSelect
                                value={value}
                                onChange={(data) => onChange(data)}
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
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Field
                        label={'Start'}
                        error={error}
                    >
                        <GDateTimeInput
                            value={typeof value === 'string' ? parseISO(value) : value}
                            onChange={onChange}
                        />
                    </Field>
                )}
            />

            <Controller
                name="lineCount"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Field
                        label={'Line Count'}
                        error={error}
                    >
                        <NumberInput
                            value={value}
                            onChange={onChange}
                        />
                    </Field>
                )}
            />

            <Controller
                name="duration"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Field
                        label='Duration'
                        error={error}
                    >
                        <NumberInput
                            value={value}
                            onChange={onChange}
                        />
                    </Field>
                )}
            />

            <Controller
                name="gap"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Field
                        label='Gap'
                        error={error}
                    >
                        <NumberInput
                            value={value}
                            onChange={onChange}
                        />
                    </Field>
                )}
            />

            <Controller
                name="rrule"
                control={control}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <Field
                        label="Repeat"
                        error={error}
                    >
                        <RruleEditor
                            rrule={value}
                            onChange={onChange}
                        />
                    </Field>
                )}
            />
        </Modal>
  );
}
