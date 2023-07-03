import { Theme } from '../theme';
import { memo, useMemo, useState } from 'react';
import format from 'date-fns/format';

type Props = {
    value: Date;
    onChange: (value: Date | null) => void;
};

function formatDateTime(date: Date | null) {
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
}

function GDateTimeInput({
  value, onChange,
}: Props) {

  const [myValue, setMyValue] = useState<Date | null>(value);

  const fo = useMemo(() => formatDateTime(myValue), [myValue]);

  return (
        <input
            type="datetime-local"
            value={fo}
            required
            className={Theme.components.input}
            onChange={(event) => {
              const val = event.target?.value ?? null;
              const date = val ? new Date(val) : null;
              setMyValue(date);
              onChange(date);
            }
            }
        />
  );
}

const GDateTimeInputM = memo(GDateTimeInput);
export default GDateTimeInputM;
