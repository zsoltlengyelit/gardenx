import { RecurrenceContext } from 'react-recurrence';
import { ComponentProps, useContext } from 'react';
import { AccessibleContent, DateInput } from '@instructure/ui';
import moment from 'moment';

export default function RStartDateSelector() {

  // @ts-ignore
  const { recurrence, onFieldChange } = useContext(RecurrenceContext);

  const handleStartDateChange: ComponentProps<typeof DateInput>['onChange'] = (event, { value }) => {
    onFieldChange('startDate', value);
  };

  const renderWeekdayLabels: any = () => {
    const date = moment(recurrence.startDate).startOf('week');

    return Array.apply(null, Array(7)).map((day, index) => {
      const currentDate = date.clone();
      date.add(1, 'day');

      return (
                <AccessibleContent
                    key={index}
                    alt={currentDate.format('dddd')}
                >
                    {currentDate.format('dd')}
                </AccessibleContent>
      );
    });
  };

  const date = moment(recurrence.startDate).toISOString();

  return (
        <DateInput
            renderLabel={'Start'}
            renderWeekdayLabels={renderWeekdayLabels}
            value={date}
            onChange={handleStartDateChange}
        />
  );
}
