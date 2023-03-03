import * as React from 'react';
// @ts-ignore
import { RecurrenceProvider, RecurrenceType } from 'react-recurrence';

export interface RecurrenceProps {
    recurrence: RecurrenceType
    onChange: (recurrence: RecurrenceType) => void
    children: React.ReactNode
}

export function RRecurrence({ recurrence, onChange, children }: RecurrenceProps) {

  const handleFieldChange = (key: string, value: any) => {
    const newRecurrence = {
      ...recurrence,
      [key]: value
    };
    onChange(newRecurrence);
  };

  const handleFieldsChange = (object: any) => {
    const newRecurrence = {
      ...recurrence,
      ...object
    };
    onChange(newRecurrence);
  };

  return (
        <RecurrenceProvider
            recurrence={recurrence}
            onFieldChange={handleFieldChange}
            onFieldsChange={handleFieldsChange}
        >
            {children}
        </RecurrenceProvider>
  );
}
