import React from 'react';

type Props = {
    children: React.ReactNode;
    label: string;
};

export default function Field({ children, label }: Props) {

  return (
        <label className="block my-2">
            <span className="font-bold text-md font-sans">{label}</span>

            <div className="py-2">
                {children}
            </div>
        </label>
  );
}
