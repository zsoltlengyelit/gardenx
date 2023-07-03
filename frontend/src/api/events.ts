import { atom } from 'jotai';
import { Views } from 'react-big-calendar';

export const weekStartsOn = 1;

export const currentRangeAtom = atom<{ date: Date, view: string }>({
  date: new Date(),
  view: Views.WEEK
});
