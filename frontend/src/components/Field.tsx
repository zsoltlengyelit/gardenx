import React from 'react';
import { FieldError } from 'react-hook-form';

type Props = {
    children: React.ReactNode;
    label: string;
    error?: FieldError
};

export default function Field({ children, label, error }: Props) {

  return (
        <div className="form-control w-full">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            {children}
            {error && (
                <label className="label">
                    <span className="label-text text-error">{error.message}</span>
                </label>
            )}
        </div>
  );
}
