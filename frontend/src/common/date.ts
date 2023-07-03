import parseISO from 'date-fns/parseISO';

export function makeDate(date: Date | string) {
  return typeof date === 'string' ? parseISO(date) : date;
}
