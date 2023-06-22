import { DateTimeInput } from '@instructure/ui';
import type { FormMessage } from '@instructure/ui-form-field';

type Props = {
    value: Date;
    onChange: (value: Date | null) => void;
    label: string;
    messages?: FormMessage[];
};

export default function GDateTimeInput({
  value, onChange, label, messages
}: Props) {

  return (
        <>
            <DateTimeInput
                value={value.toISOString()}
                description={label}
                layout="columns"
                invalidDateTimeMessage="invalid"
                prevMonthLabel="Prev month"
                nextMonthLabel="Next month"
                timeRenderLabel=""
                dateRenderLabel=""
                dateFormat="yyyy MMMM D, dddd"
                timeFormat="HH:mm"
                isRequired={true}
                timeStep={5}
                onChange={(event, value) => {
                  onChange(value ? new Date(value) : null);
                }
                }
                messages={messages}
            />
        </>
  );
}
