import { RoutineRecurrenceComponent } from '../api/types';
import { RecurrenceComponent } from '../api/routines';
import { parseDateString } from './dates';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysBetween = (start: Date, target: Date): number =>
  Math.floor((target.getTime() - start.getTime()) / MS_PER_DAY);

const monthsBetween = (start: Date, target: Date): number =>
  (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());

export const isSpecificDateRecurrence = (recurrence?: RoutineRecurrenceComponent | null): boolean =>
  !!recurrence?.start_date &&
  !!recurrence?.end_date &&
  recurrence.start_date === recurrence.end_date;

export const routineOccursOnDate = (
  recurrence: RoutineRecurrenceComponent | null | undefined,
  dateString: string
): boolean => {
  if (!recurrence?.start_date) {
    return false;
  }

  const date = parseDateString(dateString);
  const start = parseDateString(recurrence.start_date);

  if (date < start) {
    return false;
  }

  if (recurrence.end_date) {
    const end = parseDateString(recurrence.end_date);
    if (date > end) {
      return false;
    }

    if (isSpecificDateRecurrence(recurrence)) {
      return dateString === recurrence.start_date;
    }
  }

  const interval = recurrence.interval ?? 1;

  switch (recurrence.frequency) {
    case 'DAILY':
      return daysBetween(start, date) % interval === 0;
    case 'WEEKLY': {
      const allowedDays = recurrence.days_of_week ?? [];
      if (allowedDays.length > 0 && !allowedDays.includes(date.getDay())) {
        return false;
      }

      const weekOffset = Math.floor(daysBetween(start, date) / 7);
      return weekOffset % interval === 0;
    }
    case 'MONTHLY': {
      if (date.getDate() !== start.getDate()) {
        return false;
      }

      return monthsBetween(start, date) % interval === 0;
    }
    default:
      return false;
  }
};

export const toSpecificDateRecurrence = (dateString: string): RecurrenceComponent => ({
  frequency: 'DAILY',
  interval: 1,
  start_date: dateString,
  end_date: dateString,
});
