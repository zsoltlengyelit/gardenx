import {
  AccessibleContent,
  Calendar,
  DateInput,
  IconArrowOpenEndSolid,
  IconArrowOpenStartSolid,
  IconButton
} from '@instructure/ui';
import moment from 'moment';
import React, { ComponentProps, useEffect, useReducer } from 'react';
import { FormMessage } from '@instructure/ui-form-field';

const locale = 'en-us';
const timezone = moment.tz.guess();

const parseDate = (dateStr: string) => {
  return moment.tz(dateStr, [moment.ISO_8601, 'llll', 'LLLL', 'lll', 'LLL', 'll', 'LL', 'l', 'L'], locale, timezone);
};

type CP = ComponentProps<typeof DateInput>;

type Props = {
    renderLabel: CP['renderLabel'];
    disabled: boolean;
    value: CP['value'];
    onChange(date: Date | null): void;
}
type States = {
    value: string;
    isShowingCalendar: boolean;
    todayDate: string;
    selectedDate: string | null;
    renderedDate: string;
    messages: FormMessage[];
}

export function MyDateInput({ renderLabel, disabled, value: initialValue, onChange }: Props) {

  const initState = {
    value: initialValue,
    isShowingCalendar: false,
    todayDate: new Date().toISOString(),
    selectedDate: null,
    renderedDate: '',
    messages: []
  } as States;

  const [state, setState] = useReducer((prev: States, next: Partial<States>) => ({
    ...prev,
    ...next,
  }), initState);

  const { renderedDate, selectedDate, todayDate, value, messages, isShowingCalendar } = state;

  useEffect(() => {
    onChange(selectedDate ? parseDate(selectedDate).toDate() : null);
  }, [selectedDate]);

  function formatMoment(date: moment.Moment) {
    return `${date.format('MMMM')} ${date.format('D')}, ${date.format('YYYY')}`;
  }

  useEffect(() => {
    setState({
      value: initialValue,
      isShowingCalendar: false,
      todayDate: new Date().toISOString(),
      selectedDate: initialValue ? moment(initialValue).toISOString() : null,
      renderedDate: initialValue ? formatMoment(moment(initialValue)) : ''
    } as States);
  }, [initialValue]);

  const generateMonth = (renderedDate = state.renderedDate): moment.Moment[] => {
    const date = (renderedDate ? parseDate(renderedDate) : moment())
      .startOf('month')
      .startOf('week');

    return Array.apply(null, Array(Calendar.DAY_COUNT)).map(() => {
      const currentDate = date.clone();
      date.add(1, 'days');
      return currentDate;
    });
  };

  const formatDate = (dateInput: string) => {
    const date = parseDate(dateInput);
    return formatMoment(date);
  };

  const handleChange: ComponentProps<typeof DateInput>['onChange'] = (event, { value }) => {
    const newDateStr = parseDate(value).toISOString();

    setState({
      value,
      selectedDate: newDateStr,
      renderedDate: newDateStr || renderedDate,
      messages: []
    });
  };

  const handleShowCalendar: ComponentProps<typeof DateInput>['onRequestShowCalendar'] = () => {
    setState({ isShowingCalendar: true });
  };

  const handleHideCalendar: ComponentProps<typeof DateInput>['onRequestHideCalendar'] = () => {
    setState({
      isShowingCalendar: false,
      value: selectedDate ? formatDate(selectedDate) : value
    });
  };

  const isDisabledDate = (date: moment.Moment) => {
    return false;
  };

  const handleValidateDate = () => {
    // @ts-ignore
    setState(({ selectedDate, value }) => {
      // We don't have a selectedDate but we have a value. That means that the value
      // could not be parsed and so the date is invalid
      if (!selectedDate && value) {
        return {
          messages: [{ type: 'error', text: 'This date is invalid' }],
        };
      }
      // Display a message if the user has typed in a value that corresponds to a
      // disabledDate
      if (selectedDate && isDisabledDate(parseDate(selectedDate))) {
        return {
          messages: [{ type: 'error', text: 'This date is disabled' }],
        };
      }
    });
  };

  const handleDayClick: ComponentProps<typeof DateInput.Day>['onClick'] = (event, { date }) => {
    setState({
      selectedDate: date,
      renderedDate: date,
      messages: []
    });
  };

  const modifyDate = (dateStr: string, type: moment.unitOfTime.DurationConstructor, step: number) => {
    const date = parseDate(dateStr);
    date.add(step, type);
    return formatMoment(date);
  };

  const modifyRenderedDate = (type: moment.unitOfTime.DurationConstructor, step: number) => {
    setState({
      renderedDate: modifyDate(renderedDate, type, step)
    });
  };

  const modifySelectedDate = (type: moment.unitOfTime.DurationConstructor, step: number) => {
    // We are either going to increase or decrease our selectedDate by 1 day.
    // If we do not have a selectedDate yet, we'll just select the first day of
    // the currently rendered month instead.
    const newDate = selectedDate
      ? modifyDate(selectedDate, type, step)
      : parseDate(renderedDate).startOf('month').toISOString();
    setState({
      selectedDate: newDate,
      renderedDate: newDate,
      value: formatDate(newDate),
      messages: []
    });
  };

  const handleSelectNextDay = () => {
    modifySelectedDate('day', 1);
  };

  const handleSelectPrevDay = () => {
    modifySelectedDate('day', -1);
  };

  const handleRenderNextMonth = () => {
    modifyRenderedDate('month', 1);
  };

  const handleRenderPrevMonth = () => {
    modifyRenderedDate('month', -1);
  };

  const renderWeekdayLabels = () => {
    const date = parseDate(state.renderedDate).startOf('week');

    return Array.apply(null, Array(7)).map((e, i) => {
      const currentDate = date.clone();
      date.add(1, 'day');

      return (
                <AccessibleContent
                    key={i}
                    alt={currentDate.format('dddd')}
                >
                    {currentDate.format('dd')}
                </AccessibleContent>
      );
    });
  };

  function renderDays() {

    return generateMonth().map((date) => {
      const dateStr = date.toISOString();

      return (
                <DateInput.Day
                    key={dateStr}
                    date={dateStr}
                    interaction={isDisabledDate(date) ? 'disabled' : 'enabled'}
                    isSelected={date.isSame(selectedDate, 'day')}
                    isToday={date.isSame(todayDate, 'day')}
                    isOutsideMonth={!date.isSame(renderedDate, 'month')}
                    label={`${date.format('D')} ${date.format('MMMM')} ${date.format('YYYY')}`}
                    onClick={handleDayClick}
                >
                    {date.format('D')}
                </DateInput.Day>
      );
    });
  }

  const date = parseDate(state.renderedDate);

  const buttonProps = (type = 'prev') => ({
    size: 'small' as 'small',
    withBackground: false,
    withBorder: false,
    renderIcon: type === 'prev'
      ? <IconArrowOpenStartSolid color="primary"/>
      : <IconArrowOpenEndSolid color="primary"/>,
    screenReaderLabel: type === 'prev' ? 'Previous month' : 'Next month'
  });

  return (
        <DateInput
            renderLabel={renderLabel}
            assistiveText="Type a date or use arrow keys to navigate date picker."
            value={value}
            onChange={handleChange}
            width="20rem"
            isInline
            disabled={disabled}
            messages={messages}
            isShowingCalendar={isShowingCalendar}
            onRequestValidateDate={handleValidateDate}
            onRequestShowCalendar={handleShowCalendar}
            onRequestHideCalendar={handleHideCalendar}
            onRequestSelectNextDay={handleSelectNextDay}
            onRequestSelectPrevDay={handleSelectPrevDay}
            onRequestRenderNextMonth={handleRenderNextMonth}
            onRequestRenderPrevMonth={handleRenderPrevMonth}
            renderNavigationLabel={
                <span>
            <div>{date.format('MMMM')}</div>
            <div>{date.format('YYYY')}</div>
                </span>
            }
            renderPrevMonthButton={<IconButton {...buttonProps('prev')} />}
            renderNextMonthButton={<IconButton {...buttonProps('next')} />}
            renderWeekdayLabels={renderWeekdayLabels()}
        >
            {renderDays()}
        </DateInput>
  );
}
