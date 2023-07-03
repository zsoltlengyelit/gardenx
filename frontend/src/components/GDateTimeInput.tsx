import { Theme } from '../theme';
import { memo } from 'react';
import format from 'date-fns/format';

type Props = {
    value: Date;
    onChange: (value: Date | null) => void;
};

function formatDateTime(date: Date | undefined) {
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
}

function GDateTimeInput({
  value, onChange,
}: Props) {

  const fo = formatDateTime(value);
  return (
        <input
            type="datetime-local"
            value={fo}
            required
            className={Theme.components.input}
            onChange={(event) => {
              onChange(event.target?.valueAsDate ?? null);
            }
            }
        />
  );
}

const GDateTimeInputM = memo(GDateTimeInput);
export default GDateTimeInputM;
