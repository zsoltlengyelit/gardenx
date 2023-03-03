import React, { ComponentProps, useEffect, useReducer } from 'react';
import { FormMessage } from '@instructure/ui-form-field';
import { NumberInput } from '@instructure/ui';

type Props = {
    onChange(val: number | null):void;
    value: number | undefined;
    name?: string;
    renderLabel: ComponentProps<typeof NumberInput>['renderLabel']
    disabled?: ComponentProps<typeof NumberInput>['disabled']
}

type States = {
    inline: boolean;
    messages: FormMessage[] | undefined;
    number: number | null;
    readOnly: boolean;
    value: string;
}

export function RNumberInput({ onChange, value, name, renderLabel, disabled }: Props) {
  const MIN = 1;
  const MAX = 999;

  const initState = {
    inline: false,
    messages: [],
    number: value,
    readOnly: false,
    value: value ? Number(value).toString(10) : ''
  } as States;

  const [state, setState] = useReducer((prev: States, next: Partial<States>) => ({
    ...prev,
    ...next,
  }), initState);

  useEffect(() => {
    setState({
      number: value,
      value: value ? Number(value).toString(10) : ''
    });
  }, [value]);

  useEffect(() => {
    onChange(state.number);
  }, [state.number]);

  function bound(n: number) {
    if (n < MIN) return MIN;
    if (n > MAX) return MAX;
    return n;
  }

  function setNumber(n: number) {
    const number = bound(n);
    setState({
      messages: [],
      number,
      value: number.toString(10)
    });
  }

  const handleChange: ComponentProps<typeof NumberInput> ['onChange'] = (event, value) => {
    const number = value ? Number(value) : null;
    setState({
      messages: [],
      number,
      value
    });
  };

  const handleDecrement: ComponentProps<typeof NumberInput> ['onDecrement'] = (event) => {
    const number = state.number ?? NaN;
    if (isNaN(number)) return;
    if (number === null) return setNumber(MIN);
    if (Number.isInteger(number)) return setNumber(number - 1);
    setNumber(Math.floor(number));
  };

  const handleIncrement: ComponentProps<typeof NumberInput> ['onIncrement'] = (event) => {
    const number = state.number ?? NaN;
    if (isNaN(number)) return;
    if (number === null) return setNumber(MIN + 1);
    if (Number.isInteger(number)) return setNumber(number + 1);
    return setNumber(Math.ceil(number));
  };

  function invalidNumber(value: string) {
    setState({
      messages: [{ text: `'${value}' is not a valid number.`, type: 'error' }]
    });
  }

  function required() {
    setState({
      messages: [{ text: 'This is required.', type: 'error' }]
    });
  }

  const handleBlur: ComponentProps<typeof NumberInput> ['onBlur'] = (event) => {
    const { number, value } = state;
    if (isNaN(number ?? NaN)) return invalidNumber(value);
    if (number === null) return required();
    setNumber(Math.round(number));
  };

  return (
        <NumberInput
            name={name}
            renderLabel={renderLabel}
            display={state.inline ? 'inline-block' : 'block'}
            messages={state.messages}
            onBlur={handleBlur}
            onChange={handleChange}
            onDecrement={handleDecrement}
            onIncrement={handleIncrement}
            placeholder=""
            interaction={disabled
              ? 'disabled'
              : state.readOnly ? 'readonly' : 'enabled'
            }
            isRequired
            showArrows
            value={state.value}
        />
  );
}
