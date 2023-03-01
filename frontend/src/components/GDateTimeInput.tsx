import { DateTimeInput } from '@instructure/ui';

type Props = {
    value: Date;
    onChange: (value: Date | null) => void;
    label: string;
};

export default function GDateTimeInput({
  value, onChange, label
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
                dateFormat="yyyy MMMM D"
                timeFormat="HH:mm"
                isRequired={true}
                timeStep={10}
                onChange={(event, value) => {
                  onChange(value ? new Date(value) : null);
                }
                }
            />
        </>
  );
}
