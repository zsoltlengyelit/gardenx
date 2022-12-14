import { Button, FormField, Heading, IconCalendarClockLine, Modal, TextInput } from '@instructure/ui';
import { SlotInfo } from 'react-big-calendar';
import { Controller, useForm } from 'react-hook-form';

import 'bootstrap/dist/css/bootstrap.css'; // this lib uses boostrap (v. 4.0.0-beta.2)
import 'react-rrule-generator/build/styles.css'; // react-rrule-generator's custom CSS
// @ts-ignore
import RRuleGenerator from 'react-rrule-generator';
import DateTimePicker from 'react-datetime-picker';

import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { CalendarEvent } from '../api/events';

export type Draft = {
    start: Date;
    end: Date;
    rrule: string;
    title: string;
};

type Props = {
    draft: SlotInfo | CalendarEvent;
    onClose: () => void;
    onSave: (draft: Draft) => void;
    onDelete: (event: CalendarEvent) => void;
};

export default function EventEditor({ draft, onClose, onSave, onDelete }: Props) {

  function isCalendarEvent(draft: SlotInfo | CalendarEvent): draft is CalendarEvent {
    return !!(draft as CalendarEvent).uid;
  }

  const isSaved = isCalendarEvent(draft);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: isSaved ? draft.title : '',
      start: draft.start,
      end: draft.end,
      rrule: isSaved ? draft.rrule?.toString() : ''
    }
  });

  function handleFormSubmit(data: any) {
    onSave(data as Draft);
  }

  return (
        <>

            <Modal
                label={'Schedule'}
                open={true}
                size="medium"
            >
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <Modal.Header><Heading level="h3">Schedule</Heading></Modal.Header>
                    <Modal.Body>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <TextInput
                                    autoFocus
                                    required
                                    defaultValue={value}
                                    onChange={onChange}
                                    renderLabel={'Title'}
                                />
                            )}
                        />

                        <FormField
                            label={'start'}
                            id={'start'}
                        >
                            <Controller
                                name="start"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <DateTimePicker
                                        value={value}
                                        calendarIcon={<IconCalendarClockLine/>}
                                        onChange={(newValue) => {
                                          onChange(newValue);
                                        }}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label={'end'}
                            id={'end'}
                        >
                            <Controller
                                name="end"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <DateTimePicker
                                        calendarIcon={<IconCalendarClockLine/>}
                                        value={value}
                                        onChange={(newValue) => {
                                          onChange(newValue);
                                        }}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label={'rrule'}
                            id={'rrule'}
                        >
                            <Controller
                                name="rrule"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <RRuleGenerator
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
                                )}
                            />
                        </FormField>
                    </Modal.Body>

                    <Modal.Footer>
                        {isSaved &&
                            <Button
                                color="danger"
                                onClick={() => onDelete(draft)}
                            >
                                Delete
                            </Button>
                        }

                        <Button
                            color="primary-inverse"
                            onClick={() => onClose()}
                        >
                            Cancel
                        </Button>

                        <Button
                            color="primary"
                            type="submit"
                        >
                            Save
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

        </>
  );
}
