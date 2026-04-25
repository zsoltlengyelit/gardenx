import { Input } from 'react-daisyui';

type Props = {
    value?: string;
    onChange(value: string): void;
    autoFocus?: boolean;
};

export default function TextInput({ value, onChange, autoFocus }: Props) {

  return (
        <Input
            type="text"
            autoFocus={autoFocus}
            onChange={e => onChange(e.target.value)}
        />
  );
}
