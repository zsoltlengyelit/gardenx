import { Theme } from '../theme';
import React, { MouseEventHandler } from 'react';

type Props = {
    onClick: MouseEventHandler<HTMLButtonElement>;
    color?: keyof (typeof Theme.colors);
    children: React.ReactNode;
    className?: string;
    type?: 'button' |'submit' | 'reset';
};

export default function Button({ onClick, color = 'primary', children, type = 'button', className }: Props) {

  return (
        <button
            className={`${Theme.colors[color]} ${Theme.textColor[color]} text-center font-normal uppercase text-sm px-3 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 ${className ?? ''}`}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
  );
}
