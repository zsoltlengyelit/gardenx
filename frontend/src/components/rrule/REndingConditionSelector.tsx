import * as React from 'react';
import { ComponentProps, FunctionComponent, useContext, useEffect } from 'react';
import { EndingConditionType, RecurrenceContext } from 'react-recurrence';
import { Flex, RadioInput, RadioInputGroup, View } from '@instructure/ui';
import moment from 'moment';
import { MyDateInput } from '../MyDateInput';
import { RNumberInput } from './RNumberInput';

const REndingConditionSelector: FunctionComponent = () => {
  // @ts-ignore
  const { recurrence, onFieldChange, onFieldsChange } = useContext(RecurrenceContext);

  const handleEndingConditionChange: ComponentProps<typeof RadioInputGroup>['onChange'] = (
    event, value
  ) => {
    onFieldChange('endingCondition', value);
  };
  const handleEndingOccurrencesNumberChange: ComponentProps<typeof RNumberInput>['onChange'] = (value) => {
    onFieldChange('endingOccurrencesNumber', value);
  };
  const handleEndDateChange: ComponentProps<typeof MyDateInput>['onChange'] = (date) => {
    onFieldChange('endDate', date);
  };
  useEffect(() => {
    switch (recurrence.endingCondition) {
      case EndingConditionType.None:
        onFieldsChange({
          endDate: null,
          endingOccurrencesNumber: undefined
        });
        break;
      case EndingConditionType.EndDate:
        onFieldChange('endingOccurrencesNumber', undefined);
        break;
      case EndingConditionType.OccurrencesNumber:
        onFieldChange('endDate', null);
        break;
    }
  }, [recurrence.endingCondition]);

  return (
        <View
            as="div"
            margin="small small"
        >
            <RadioInputGroup
                name="ends"
                description='Ends'
                value={recurrence.endingCondition}
                onChange={handleEndingConditionChange}
            >
                <RadioInput
                    label={'Never'}
                    value={EndingConditionType.None}
                />
                <RadioInput
                    label={
                        <>
                            {'on'}
                            {' '}
                            <MyDateInput
                                renderLabel={''}
                                disabled={
                                    recurrence.endingCondition !== EndingConditionType.EndDate
                                }
                                value={moment(recurrence.endDate).toISOString()}
                                onChange={handleEndDateChange}
                            />
                        </>
                    }
                    value={EndingConditionType.EndDate}
                />
                <RadioInput
                    label={
                        <Flex alignItems="center">
                            <Flex.Item>
                                {'after'}
                                {' '}
                            </Flex.Item>
                            <Flex.Item>
                                <RNumberInput
                                    name='ending-occurrences-number'
                                    value={recurrence.endingOccurrencesNumber}
                                    onChange={handleEndingOccurrencesNumberChange}
                                    renderLabel=''
                                    disabled={recurrence.endingCondition !== EndingConditionType.OccurrencesNumber}
                                />
                            </Flex.Item>
                        </Flex>
                    }
                    value={EndingConditionType.OccurrencesNumber}
                />
            </RadioInputGroup>
        </View>
  );
};
export default REndingConditionSelector;
