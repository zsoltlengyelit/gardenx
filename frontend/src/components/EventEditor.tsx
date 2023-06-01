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
import { SlotInfo } from 'react-big-calendar';
import { Controller, SubmitErrorHandler, useForm } from 'react-hook-form';

import 'bootstrap/dist/css/bootstrap.css'; // this lib uses boostrap (v. 4.0.0-beta.2)
import 'react-rrule-generator/build/styles.css'; // react-rrule-generator's custom CSS
// @ts-ignore
import RRuleGenerator from 'react-rrule-generator';

import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import { CalendarEvent } from '../api/events';
import { RRule, rrulestr } from 'rrule';
// import { useGetGpioNodes, useTabGpioNodeMap } from '../api/nodered';
import { useAtomValue } from 'jotai';
import { selectedSiteAtom } from '../atoms';
import GDateTimeInput from './GDateTimeInput';
import { joiResolver } from '@hookform/resolvers/joi';
import * as joi from 'joi';
import { toFormMessage } from '../common/form';
import ConfirmedButton from './ConfirmedButton';
import { ComponentProps, useEffect } from 'react';
import moment from 'moment';
import { FieldPath } from 'react-hook-form/dist/types/path';

export type EventEditorFormFields = {
    flowId: string;
    nodeId: string;
    start: Date;
    end: Date;
    rrule?: string;
}

type Props = {
    draft: SlotInfo | CalendarEvent;
    onClose: () => void;
    onSave: (draft: EventEditorFormFields) => void;
    onDelete: (event: CalendarEvent) => void;
    onUpdate: (event: CalendarEvent) => void;
};

export default function EventEditor({ draft, onClose, onSave, onDelete, onUpdate }: Props) {

  function isCalendarEvent(draft: SlotInfo | CalendarEvent): draft is CalendarEvent {
    return !!(draft as CalendarEvent).uid;
  }

  const tabMaps = useTabGpioNodeMap();
  const selectedTab = useAtomValue(selectedSiteAtom);

  const isSaved = isCalendarEvent(draft);

  const [flowId, nodeId] = isSaved ? draft.categories as string[] : [null, null];

  const formSchema = joi.object<EventEditorFormFields>({
    flowId: joi.string().required(),
    nodeId: joi.string().required(),
    start: joi.date().required(),
    end: joi.date().required(),
    rrule: joi.string().allow('')
  });

  const { control, handleSubmit, watch, setValue, getValues, setError } = useForm<EventEditorFormFields>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      flowId: isSaved ? flowId : (selectedTab?.id ?? undefined),
      nodeId: isSaved ? nodeId : undefined,
      start: draft.start,
      end: draft.end,
      rrule: isSaved ? draft.rrule?.toString() : ''
    } as EventEditorFormFields
  });

  const { gpioNodes } = useGetGpioNodes(watch('flowId'));

  function handleFormSubmit(data: EventEditorFormFields) {
    if (isSaved) {
      // @ts-ignore
      onUpdate({
        ...(draft as CalendarEvent),
        ...data,
        categories: [data.flowId, data.nodeId],
        rrule: data.rrule ? rrulestr(data.rrule) as RRule : null
      } as CalendarEvent);
    } else {
      onSave(data);
    }
  }

  const handleFormError: SubmitErrorHandler<EventEditorFormFields> = (errors) => {
    console.warn(errors);
  };

  const submit = handleSubmit(handleFormSubmit, handleFormError);

  const selectedNodeId = watch('nodeId');

  useEffect(() => {
    if (gpioNodes.length > 0 && !selectedNodeId) {
      setValue('nodeId', gpioNodes[0].info);
    }
  }, [gpioNodes]);

  function handleDateChange(
    onChange: ComponentProps<typeof GDateTimeInput>['onChange'],
    ownPath: FieldPath<EventEditorFormFields>,
    correctedPath: FieldPath<EventEditorFormFields>
  ) {

    return (date: Date | null) => {

      const endTime = getValues(correctedPath);
      const dayOfYear = moment(date).get('dayOfYear');
      const correctedDate = moment(endTime).set('dayOfYear', dayOfYear).toDate();

      if (
        (correctedPath === 'end' && moment(correctedDate).isSameOrBefore(date)) ||
                (correctedPath === 'start' && moment(correctedDate).isSameOrAfter(date))) {
        setError(ownPath, { message: 'Start cannot be after end' });
        return;
      }

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

                {tabMaps.length === 0 && (
                    <Modal.Body>
                        No areas are defined. Please use Node-red admin
                    </Modal.Body>
                )}

                {tabMaps.length > 0 && (
                    <Modal.Body>
                        <FormFieldGroup
                            description={''}
                            rowSpacing="small"
                        >
                            <Controller
                                name="flowId"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <SimpleSelect
                                        renderLabel={'Flow'}
                                        value={value}
                                        onChange={(e, { value: eventValue }) => {
                                          onChange(eventValue);
                                        }}
                                        messages={toFormMessage(error)}
                                    >
                                        {tabMaps.map(tabMap =>
                                            <SimpleSelect.Option
                                                key={tabMap.tab.id}
                                                id={tabMap.tab.id}
                                                value={tabMap.tab.id}
                                            >
                                                {tabMap.tab.label}
                                            </SimpleSelect.Option>)}
                                    </SimpleSelect>
                                )}
                            />

                            <Controller
                                name="nodeId"
                                control={control}
                                render={({ field: { onChange, value }, fieldState: { error } }) => {
                                  if (gpioNodes.length === 0) {
                                    return <>No nodes</>;
                                  }

                                  return (
                                        <SimpleSelect
                                            renderLabel={'Node'}
                                            value={value}
                                            onChange={(e, data) => onChange(data.value)}
                                            messages={toFormMessage(error)}
                                        >
                                            {gpioNodes.map(node => (
                                                <SimpleSelect.Option
                                                    key={node.id as string}
                                                    id={node.id as string}
                                                    value={node.info as string}
                                                >
                                                    {node.name}
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
                                        value={value}
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
                                        value={value}
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
                )}

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
  )
  ;
}
