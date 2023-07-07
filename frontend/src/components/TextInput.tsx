import { Input } from 'react-daisyui';

type Props = {
    value?: string;
    onChange(value: string): void;
};

export default function TextInput({ value, onChange }: Props) {

  return (
        <Input
            type="text"
            onChange={e => onChange(e.target.value)}
        />
  );
}
