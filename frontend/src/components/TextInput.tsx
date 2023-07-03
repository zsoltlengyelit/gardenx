import { Theme } from '../theme';

type Props = {
    value?: string;
    onChange(value: string): void;
};

export default function TextInput({ value, onChange }: Props) {

  return (
        <input
            type="text"
            onChange={e => onChange(e.target.value)}
            className={Theme.components.input}
        />
  );
}
