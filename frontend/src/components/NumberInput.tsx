import { Theme } from '../theme';

type Props = {
    value?: number;
    onChange(value: number): void;
};

export default function NumberInput({
  value, onChange
}: Props) {

  return (
        <>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.valueAsNumber)}
                className={Theme.components.input}
            />
        </>
  );
}
