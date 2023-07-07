import React, { ComponentProps, useState } from 'react';
import { Button } from 'react-daisyui';

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
                <div className="flex w-full">
                    <Button
                        className="grow"
                        color="ghost"
                        onClick={() => setClicked(false)}
                    >Cancel
                    </Button>
                    <Button
                        className="ml-1"
                        color="error"
                        onClick={handleConfirm}
                    >I&apos;m sure
                    </Button>
                </div>
            )}
        </>
  );
}
