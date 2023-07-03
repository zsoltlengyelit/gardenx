import React, { useEffect, useState } from 'react';
import Button from './Button';

type RButtonProps = {
    active?: boolean;
    onClick(): void;
    children: React.ReactNode;
    className?: string;
}

function RButton({ active, onClick, children, className }: RButtonProps) {
  return (
        <Button
            onClick={onClick}
            color={active ? 'success' : 'secondary'}
            className={`${className ?? ''}`}
        >
            {children}
        </Button>
  );
}

type Props = {
    rrule?: string;
    onChange(rrule: string): void;
};

const DAYS = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export default function RruleEditor({ rrule: defaultRrule, onChange }: Props) {

  const defaultSelection = () => {
    if (defaultRrule) {
      const byDayString = 'BYDAY=';
      const byDayPart = defaultRrule.split(';').find(part => part.startsWith(byDayString));
      const days = byDayPart?.split(byDayString)[1]!;
      const presetDays = days.split(',');
      return presetDays;
    } else {
      return [];
    }
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(defaultSelection());

  function handleDayClick(day: string, index: number) {
    const daySet = new Set(selectedDays);
    if (selectedDays.includes(day)) {
      daySet.delete(day);
    } else {
      daySet.add(day);
    }
    setSelectedDays([...daySet.values()]);
  }

  useEffect(() => {
    let newRrule = '';
    if (selectedDays.length > 0) {
      newRrule = `RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${selectedDays.join(',')}`;
    }
    onChange(newRrule);
  }, [selectedDays]);

  function handleNoRepeat() {
    setSelectedDays([]);
  }

  function handleAllDays() {
    setSelectedDays(DAYS);
  }

  function handleWeekDays() {
    setSelectedDays(DAYS.slice(0, 5));
  }

  function handleWeekend() {
    setSelectedDays(DAYS.slice(5, 7));
  }

  return (
        <>
            <div className="grid grid-cols-7 w-full">
                {DAYS.map((day, index) => {

                  return (
                        <RButton
                            key={day}
                            onClick={() => handleDayClick(day, index)}
                            active={selectedDays.includes(day)}
                            className={`${index === 0 && 'rounded-l-lg'} ${index === (DAYS.length - 1) && 'rounded-r-lg'}`}
                        >
                            {day}
                        </RButton>
                  );
                })}
            </div>
            <div className="mt-4 grid grid-cols-4 w-full">
                <RButton
                    onClick={() => handleNoRepeat()}
                >
                    No Repeat
                </RButton>

                <RButton
                    onClick={() => handleAllDays()}
                >
                    All Days
                </RButton>

                <RButton
                    onClick={() => handleWeekDays()}
                >
                    Week Days
                </RButton>

                <RButton
                    onClick={() => handleWeekend()}
                >
                    Weekend
                </RButton>
            </div>
        </>
  );
}
