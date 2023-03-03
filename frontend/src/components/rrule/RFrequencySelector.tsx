import * as React from 'react';
import { ComponentProps, useContext, useEffect } from 'react';
import { FrequencyType, RecurrenceContext } from 'react-recurrence';
import { Flex, SimpleSelect, View } from '@instructure/ui';
import { RWeekDaysSelector } from './RWeekDaysSelector';
import { RNumberInput } from './RNumberInput';

const FREQUENCY_OPTIONS = [
  {
    key: FrequencyType.None,
    title: 'Does not repeat'
  },
  // {
  //   key: FrequencyType.Hourly,
  //   title: 'Hourly'
  // },
  {
    key: FrequencyType.Daily,
    title: 'Daily'
  },
  {
    key: FrequencyType.Weekly,
    title: 'Weekly'
  },
  // {
  //   key: FrequencyType.Monthly,
  //   title: 'Monthly'
  // },
  // {
  //   key: FrequencyType.Annually,
  //   title: 'Annually'
  // }
];

export function RFrequencySelector() {
  // @ts-ignore
  const { recurrence, onFieldChange, onFieldsChange } = useContext(RecurrenceContext);

  const handleFrequencyChange: ComponentProps<typeof SimpleSelect>['onChange'] = (
    event: React.SyntheticEvent, { value }
  ) => {
    onFieldChange('frequency', value);
  };
  const handleNumberOfRepetitionChange: ComponentProps<typeof RNumberInput>['onChange'] = (numberOfRepetitions) => {
    onFieldChange('numberOfRepetitions', numberOfRepetitions);
  };
  const handleWeekDaysChange = (days: Array<number>) => {
    onFieldChange('weekDaysRepetition', days);
  };

  const getFrequencyLabel = () => {
    switch (recurrence.frequency) {
      case FrequencyType.Hourly:
        return 'hour';
      case FrequencyType.Daily:
        return 'day';
      case FrequencyType.Weekly:
        return 'week';
      case FrequencyType.Monthly:
        return 'month';
      case FrequencyType.Annually:
        return 'year';
      default:
        return '';
    }
  };

  const getRepetitionsLabelByFrequency = () => {
    const frequencyLabel = getFrequencyLabel();
    if (frequencyLabel === '') {
      return '';
    }
    return `${frequencyLabel}(s)`;
  };

  useEffect(() => {
    let toClear = {};
    if (recurrence.frequency !== FrequencyType.Weekly) {
      toClear = {
        weekDaysRepetition: []
      };
    }
    if (recurrence.frequency === FrequencyType.None) {
      toClear = {
        ...toClear,
        numberOfRepetitions: undefined
      };
      onFieldsChange(toClear);
    }
  }, [recurrence.frequency]);

  return (
        <View
            as="div"
            margin="0 small small small"
        >
            <Flex
                direction="row"
                width="100%"
            >
                <Flex.Item
                    shouldGrow
                    margin="0 small 0 0"
                >
                    <SimpleSelect
                        name='frequency'
                        value={recurrence.frequency}
                        onChange={handleFrequencyChange}
                        renderLabel='Frequency'
                    >
                        {FREQUENCY_OPTIONS.map(op => (
                            <SimpleSelect.Option
                                id={op.key}
                                value={op.key}
                                key={op.key}
                            >
                                {op.title}
                            </SimpleSelect.Option>
                        ))}
                    </SimpleSelect>
                </Flex.Item>
                <Flex.Item shouldGrow>
                    {recurrence.frequency !== FrequencyType.None && (
                        <Flex>
                            <RNumberInput
                                name='number-of-repetition'
                                value={recurrence.numberOfRepetitions}
                                onChange={handleNumberOfRepetitionChange}
                                renderLabel={getRepetitionsLabelByFrequency()}
                            />
                        </Flex>
                    )}
                </Flex.Item>
            </Flex>

            {recurrence.frequency === FrequencyType.Weekly && (
                <Flex>
                    <RWeekDaysSelector
                        weekDaysRepetition={recurrence.weekDaysRepetition}
                        onDayClicked={handleWeekDaysChange}
                    />
                </Flex>
            )}
        </View>
  );
}
