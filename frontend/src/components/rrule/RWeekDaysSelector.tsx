import { IconButton, Tooltip, View } from '@instructure/ui';
import * as React from 'react';
// @ts-ignore
import type { RecurrenceDay } from 'react-recurrence';

export interface WeekDaysSelectorProps {
    weekDaysRepetition: Array<number>
    onDayClicked: (days: Array<number>) => void
}

const DEFAULT_WEEK_DAYS: RecurrenceDay[] = [

  {
    key: 1,
    title: 'Monday',
    symbol: 'M'
  },
  {
    key: 2,
    title: 'Tuesday',
    symbol: 'T'
  },
  {
    key: 3,
    title: 'Wednesday',
    symbol: 'W'
  },
  {
    key: 4,
    title: 'Thursday',
    symbol: 'T'
  },
  {
    key: 5,
    title: 'Friday',
    symbol: 'F'
  },
  {
    key: 6,
    title: 'Saturday',
    symbol: 'Sa'
  },
  {
    key: 0,
    title: 'Sunday',
    symbol: 'Su'
  },
];

export function RWeekDaysSelector({
  weekDaysRepetition = [],
  onDayClicked
}: WeekDaysSelectorProps) {
  const handleDayClicked = (day: RecurrenceDay) => {
    let newDaysList: Array<number> = weekDaysRepetition;
    if (newDaysList.includes(day.key)) {
      newDaysList = newDaysList.filter((d) => d !== day.key);
    } else {
      newDaysList.push(day.key);
    }
    onDayClicked(newDaysList);
  };
  return (
        <View
            as="div"
            margin="small 0"
        >
            {DEFAULT_WEEK_DAYS.map((day) => (
                <Tooltip
                    key={`${day.title}-${day.key}-tooltip`}
                    renderTip={day.title}
                    placement="top center"
                >
                    <IconButton
                        screenReaderLabel={day.title}
                        margin="0 x-small 0 0"
                        shape="circle"
                        color={weekDaysRepetition.includes(day.key) ? 'primary' : 'primary-inverse'}
                        key={`${day.key}-btn`}
                        onClick={() => handleDayClicked(day)}
                    >
                        {day.symbol}
                    </IconButton>
                </Tooltip>
            ))}
        </View>
  );
}
