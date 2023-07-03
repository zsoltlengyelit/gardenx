import { Button } from '@instructure/ui';
import type { ButtonProps } from '@instructure/ui-buttons';
import { useState } from 'react';

type Props = ButtonProps & {};

export default function ConfirmedButton({ onClick, ...buttonProps }: Props) {

  const [clicked, setClicked] = useState(false);

  function handleConfirm(e: Parameters<Exclude<typeof onClick, undefined>>[0]) {
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
                <div className="inline border-2 border-gray-200 rounded p-4 mx-3">
                    <Button onClick={() => setClicked(false)}>Cancel</Button>
                    <Button
                        margin="0 0 0 small"
                        color="danger"
                        onClick={handleConfirm}
                    >I&apos;m sure
                    </Button>
                </div>
            )}
        </>
  );
}
