import { Button, Input } from 'react-daisyui';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

type Props = {
    value?: number;
    onChange(value: number): void;
};

export default function NumberInput({
  value, onChange
}: Props) {

  const createHandler = (plus: number) => {
    return () => {
      onChange((value ?? 0) + plus);
    };
  };

  return (
        <>
            <div className="relative mt-2">
                <Input
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={value}
                    className={'arrow-hide w-full rounded-md'}
                    onChange={e => {
                      const val = e.target.valueAsNumber;
                      onChange(val);
                    }}
                />
                <div className="absolute inset-y-0 right-0 flex flex-col items-center">
                    <Button
                        className="bg-transparent rounded-none"
                        color="ghost"
                        size="xs"
                        onClick={createHandler(1)}
                    >
                        <ChevronUpIcon className="h-6"/>
                    </Button>
                    <Button
                        className="bg-transparent rounded-none"
                        color="ghost"
                        size="xs"
                        onClick={createHandler(-1)}
                    >
                        <ChevronDownIcon className="h-6"/>
                    </Button>
                </div>
            </div>
        </>
  );
}
