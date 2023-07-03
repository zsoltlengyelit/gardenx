import React from 'react';
import { FieldError } from 'react-hook-form';

type Props = {
    children: React.ReactNode;
    label: string;
    error?: FieldError
};

export default function Field({ children, label, error }: Props) {

  return (
        <label className="block my-2">
            <span className="font-bold text-md font-sans">{label}</span>

            <div className="py-2">
                {children}
            </div>

            {error && (
                <div className={'text-red-800'}>
                    {error.message}
                </div>
            )}
        </label>
  );
}
