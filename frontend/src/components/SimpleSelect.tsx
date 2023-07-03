import React from 'react';
import { Theme } from '../theme';

export type SimpleSelectOption = {
    value: string;
    label: React.ReactNode;
}

type Props = {
    id?: string;
    value?: string;
    options: SimpleSelectOption[];
    onChange(value: string): void;
};

export default function SimpleSelect({ id, options, value, onChange }: Props) {

  return (
        <>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={Theme.components.input}
            >
                {options.map(op => (
                    <option
                        key={op.value}
                        value={op.value}
                    >
                        {op.label}
                    </option>
                ))}
            </select>
        </>
  );
}
