import { Button, Flex, FormField, Heading, IconCalendarClockLine, Modal, SimpleSelect } from '@instructure/ui';
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
import { RRule, rrulestr } from 'rrule';
import { useGetGpioNodes, useTabGpioNodeMap } from '../api/nodered';

export type Draft = {
    start: Date;
    end: Date;
    rrule: string;
    flowId: string;
    nodeId: string;
};

type Props = {
    draft: SlotInfo | CalendarEvent;
    onClose: () => void;
    onSave: (draft: Draft) => void;
    onDelete: (event: CalendarEvent) => void;
    onUpdate: (event: CalendarEvent) => void;
};

export default function EventEditor({ draft, onClose, onSave, onDelete, onUpdate }: Props) {

  function isCalendarEvent(draft: SlotInfo | CalendarEvent): draft is CalendarEvent {
    return !!(draft as CalendarEvent).uid;
  }

  const tabMap = useTabGpioNodeMap();

  const isSaved = isCalendarEvent(draft);

  const [flowId, nodeId] = isSaved ? draft.categories as string[] : [null, null];

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      flowId: isSaved ? flowId : undefined,
      nodeId: isSaved ? nodeId : undefined,
      start: draft.start,
      end: draft.end,
      rrule: isSaved ? draft.rrule?.toString() : ''
    } as Draft
  });

  const gpioNodes = useGetGpioNodes(watch('flowId'));

  function handleFormSubmit(data: Draft) {
    if (isSaved) {
      // @ts-ignore
      onUpdate({
        ...(draft as CalendarEvent),
        ...data,
        rrule: data.rrule ? rrulestr(data.rrule) as RRule : null
      } as CalendarEvent);
    } else {
      onSave(data);
    }
  }

  const submit = handleSubmit(handleFormSubmit);

  return (
        <>

            <Modal
                label={'Schedule'}
                open={true}
                size="medium"
            >
                <Modal.Header><Heading level="h3">Schedule</Heading></Modal.Header>
                <Modal.Body>

                    <Controller
                        name="flowId"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => {
                          return (
                                <SimpleSelect
                                    renderLabel={'Flow'}
                                    value={value ?? ''}
                                    onChange={(e, data) => {
                                      onChange(data.value);
                                    }}
                                >
                                    {tabMap.map(tab => (
                                        <SimpleSelect.Option
                                            key={tab.tab.id}
                                            id={tab.tab.id}
                                            value={tab.tab.id}
                                        >
                                            {tab.tab.label}
                                        </SimpleSelect.Option>
                                    ))}
                                </SimpleSelect>
                          );
                        }}
                    />

                    <Controller
                        name="nodeId"
                        control={control}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <SimpleSelect
                                renderLabel={'Node'}
                                defaultValue={value}
                                onChange={(e, data) => onChange(data.value)}
                            >
                                {gpioNodes.gpioNodes.map(node => (
                                    <SimpleSelect.Option
                                        key={node.id as string}
                                        id={node.id as string}
                                        value={node.info as string}
                                    >
                                        {node.name}
                                    </SimpleSelect.Option>
                                ))}
                            </SimpleSelect>
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
                    <Flex width="100%">
                        <Flex.Item shouldGrow>
                            {isSaved &&
                                <Button
                                    color="danger"
                                    onClick={() => onDelete(draft)}
                                >
                                    Delete
                                </Button>
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
                                onClick={() => submit()}
                            >
                                Save
                            </Button>
                        </Flex.Item>
                    </Flex>
                </Modal.Footer>
            </Modal>

        </>
  )
  ;
}
