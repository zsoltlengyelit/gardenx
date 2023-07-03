import React, { ComponentProps, useState } from 'react';
import Button from './Button';

type Props = ComponentProps<typeof Button>;

export default function ConfirmedButton({ onClick, ...buttonProps }: Props) {

  const [clicked, setClicked] = useState(false);

  function handleConfirm(e: React.MouseEvent<HTMLButtonElement>) {
    setClicked(false);
    onClick?.(e);
  }

  return (
        <>
            {!clicked &&
                <Button
                    {...buttonProps}
                    onClick={() => setClicked(true)}
                />
            }
            {clicked && (
                <div className="inline">
                    <Button
                        color="secondary"
                        onClick={() => setClicked(false)}
                    >Cancel
                    </Button>
                    <Button
                        className="ml-1"
                        color="danger"
                        onClick={handleConfirm}
                    >I&apos;m sure
                    </Button>
                </div>
            )}
        </>
  );
}
