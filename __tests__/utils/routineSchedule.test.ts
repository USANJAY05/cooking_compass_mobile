import {
  isSpecificDateRecurrence,
  routineOccursOnDate,
  toSpecificDateRecurrence,
} from '../../src/utils/routineSchedule';

describe('routine scheduling', () => {
  it('detects a one-day recurrence', () => {
    expect(isSpecificDateRecurrence({
      frequency: 'DAILY',
      start_date: '2026-08-29',
      end_date: '2026-08-29',
    })).toBe(true);
  });

  it('does not treat a multi-day recurrence as specific', () => {
    expect(isSpecificDateRecurrence({
      frequency: 'DAILY',
      start_date: '2026-08-29',
      end_date: '2026-08-30',
    })).toBe(false);
  });

  it('handles daily schedules and intervals', () => {
    const recurrence = {
      frequency: 'DAILY' as const,
      interval: 2,
      start_date: '2026-08-29',
    };

    expect(routineOccursOnDate(recurrence, '2026-08-29')).toBe(true);
    expect(routineOccursOnDate(recurrence, '2026-08-30')).toBe(false);
    expect(routineOccursOnDate(recurrence, '2026-08-31')).toBe(true);
  });

  it('handles weekly schedules with selected weekdays', () => {
    const recurrence = {
      frequency: 'WEEKLY' as const,
      interval: 1,
      start_date: '2026-08-23',
      days_of_week: [0, 3],
    };

    expect(routineOccursOnDate(recurrence, '2026-08-23')).toBe(true);
    expect(routineOccursOnDate(recurrence, '2026-08-26')).toBe(true);
    expect(routineOccursOnDate(recurrence, '2026-08-27')).toBe(false);
  });

  it('handles monthly schedules on the start day of month', () => {
    const recurrence = {
      frequency: 'MONTHLY' as const,
      interval: 1,
      start_date: '2026-08-15',
    };

    expect(routineOccursOnDate(recurrence, '2026-09-15')).toBe(true);
    expect(routineOccursOnDate(recurrence, '2026-09-16')).toBe(false);
  });

  it('rejects dates before the start date and after the end date', () => {
    const recurrence = {
      frequency: 'DAILY' as const,
      interval: 1,
      start_date: '2026-08-29',
      end_date: '2026-09-02',
    };

    expect(routineOccursOnDate(recurrence, '2026-08-28')).toBe(false);
    expect(routineOccursOnDate(recurrence, '2026-09-03')).toBe(false);
  });

  it('returns false for missing recurrence data', () => {
    expect(routineOccursOnDate(undefined, '2026-08-29')).toBe(false);
  });

  it('creates a specific-date recurrence', () => {
    expect(toSpecificDateRecurrence('2026-08-29')).toEqual({
      frequency: 'DAILY',
      interval: 1,
      start_date: '2026-08-29',
      end_date: '2026-08-29',
    });
  });
});
