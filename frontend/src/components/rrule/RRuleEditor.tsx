import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { EndingConditionType, FrequencyType, RecurrenceType } from 'react-recurrence';
import React, { useEffect, useState } from 'react';
import { Flex, View } from '@instructure/ui';
import moment from 'moment';
import { ByWeekday, Frequency, RRule, Weekday } from 'rrule';
import REndingConditionSelector from './REndingConditionSelector';
import { RRecurrence } from './RRecurrence';
import { RFrequencySelector } from './RFrequencySelector';

type Props = {
    value?: string;
    onChange(rrule: string): void;
};

export default function RRuleEditor({ value, onChange }: Props) {

  const [rrule, setRrule] = useState(value);

  const [parsedRrule, setParsedRrule] = useState<RRule | null>(null);

  useEffect(() => {
    if (value) {
      const rRule = RRule.fromString(value);
      setParsedRrule(rRule);
      setRrule(rRule.toString());
    }
  }, [value]);

  function mapBackFrequency(freq: Frequency): FrequencyType {
    switch (freq) {
      case Frequency.DAILY:
        return FrequencyType.Daily;
      case Frequency.WEEKLY:
        return FrequencyType.Weekly;
      default:
        return FrequencyType.None;

    }
  }

  function mapBackWeekdays(byweekday: number[]) {
    return byweekday;
  }

  function mapEndingCondition(parsedRrule: RRule | null) {
    if (parsedRrule === null) {
      return EndingConditionType.None;
    }

    if (parsedRrule.options.count) {
      return EndingConditionType.OccurrencesNumber;
    }

    if (parsedRrule.options.until) {
      return EndingConditionType.EndDate;
    }

    return EndingConditionType.None;
  }

  const defaultRecurrence = {
    startDate: parsedRrule ? moment(parsedRrule.options.dtstart).toDate() : undefined,
    endDate: parsedRrule?.options.until ? moment(parsedRrule.options.until).toDate() : undefined,
    frequency: parsedRrule ? mapBackFrequency(parsedRrule?.options.freq) : FrequencyType.None,
    numberOfRepetitions: parsedRrule?.options.interval,
    weekDaysRepetition: parsedRrule ? mapBackWeekdays(parsedRrule.options.byweekday) : [],
    endingCondition: mapEndingCondition(parsedRrule),
    endingOccurrencesNumber: parsedRrule?.options.count ?? 1,
    isAllDay: false,
    startTime: undefined,
    endTime: undefined,
  } as RecurrenceType;

  const [recurrence, setRecurrence] = useState<RecurrenceType>(defaultRecurrence);

  useEffect(() => {
    if (parsedRrule) {
      const mapped = {
        startDate: parsedRrule ? moment(parsedRrule.options.dtstart).toDate() : undefined,
        endDate: parsedRrule?.options.until ? moment(parsedRrule.options.until).toDate() : undefined,
        frequency: parsedRrule ? mapBackFrequency(parsedRrule?.options.freq) : FrequencyType.Weekly,
        numberOfRepetitions: parsedRrule?.options.interval,
        weekDaysRepetition: parsedRrule ? mapBackWeekdays(parsedRrule.options.byweekday) : [],
        endingCondition: mapEndingCondition(parsedRrule),
        endingOccurrencesNumber: parsedRrule?.options.count ?? 1,
        isAllDay: false,
        startTime: undefined,
        endTime: undefined,
      };
      setRecurrence(mapped as RecurrenceType);
    }
  }, [parsedRrule]);

  function mapFrequency(freq: FrequencyType): Frequency | undefined {
    switch (freq) {
      case FrequencyType.Annually:
        return Frequency.YEARLY;
      case FrequencyType.Monthly:
        return Frequency.MONTHLY;
      case FrequencyType.Weekly:
        return Frequency.WEEKLY;
      case FrequencyType.Daily:
        return Frequency.DAILY;
      case FrequencyType.Hourly:
        return Frequency.HOURLY;
      case FrequencyType.None:
        return undefined;
      default:
        throw new Error('Unhandled freq');
    }
  }

  function mapWeekdays(weekDaysRepetition: number[]): ByWeekday[] {
    return weekDaysRepetition.map(w => {
      const n = w === 0 ? 6 : w - 1;
      return new Weekday(n);
    });
  }

  const handleRecurrenceChange = (updatedRecurrence: RecurrenceType) => {
    setRecurrence(updatedRecurrence);
    const mappedFrequency = mapFrequency(updatedRecurrence.frequency) as Frequency;

    if (mappedFrequency) {
      const rRuleObj = new RRule({
        dtstart: updatedRecurrence.startDate,
        count: updatedRecurrence.endingCondition === EndingConditionType.OccurrencesNumber ? updatedRecurrence.endingOccurrencesNumber : undefined,
        until: updatedRecurrence.endingCondition === EndingConditionType.EndDate ? updatedRecurrence.endDate : undefined,
        freq: mappedFrequency,
        byweekday: updatedRecurrence.frequency === FrequencyType.Weekly ? mapWeekdays(updatedRecurrence.weekDaysRepetition) : null,
        interval: updatedRecurrence.numberOfRepetitions
      });
      const rrule = rRuleObj.toString();
      onChange(rrule);
      setRrule(rrule);

    } else {
      onChange('');
      setRrule('');
    }
  };

  const DateUtils = class {

    date() {
      return moment().toDate();
    }

    isValid(date: any) {
      return moment(date).isValid();
    }

    format(date: Date, format: string) {
      return date.toISOString();
    }
  };

  // @ts-ignore
  return (
        <>
            <MuiPickersUtilsProvider utils={DateUtils}>
                <View
                    as="section"
                    borderWidth="small"
                    borderRadius="medium"
                    padding="small small 0"
                >
                    <RRecurrence
                        recurrence={recurrence}
                        onChange={handleRecurrenceChange}
                    >
                        <Flex direction="column">
                            <Flex.Item>
                                <RFrequencySelector/>
                            </Flex.Item>
                            <Flex.Item>
                                <REndingConditionSelector/>
                            </Flex.Item>
                        </Flex>
                    </RRecurrence>
                    {rrule &&
                        <View
                            as="pre"
                            background="secondary"
                            padding="small"
                            borderWidth="small"
                            borderRadius="medium"
                        >
                            {rrule}
                        </View>
                    }
                </View>
            </MuiPickersUtilsProvider>
        </>
  )
  ;
}
