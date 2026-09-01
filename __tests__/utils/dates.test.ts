import {
  formatDateString,
  parseDateString,
  isSameDate,
  isDateInWindow,
  addDays,
  startOfWeek,
  startOfMonth,
  getDayName,
  formatMonthYear,
  formatWeekRange,
  buildDayWindow,
  buildMonthGrid,
} from '../../src/utils/dates';

describe('date utilities', () => {
  const date = new Date(2026, 7, 29);

  it('formats a Date as YYYY-MM-DD', () => {
    expect(formatDateString(date)).toBe('2026-08-29');
  });

  it('parses YYYY-MM-DD using local calendar fields', () => {
    const parsed = parseDateString('2026-08-29');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(29);
  });

  it('compares date strings', () => {
    expect(isSameDate('2026-08-29', '2026-08-29')).toBe(true);
    expect(isSameDate('2026-08-29', '2026-08-30')).toBe(false);
  });

  it('checks whether a date is inside a seven-day window', () => {
    expect(isDateInWindow('2026-08-29', '2026-08-29')).toBe(true);
    expect(isDateInWindow('2026-09-04', '2026-08-29')).toBe(true);
    expect(isDateInWindow('2026-09-05', '2026-08-29')).toBe(false);
  });

  it('adds days without mutating the original date', () => {
    const result = addDays(date, 3);
    expect(formatDateString(result)).toBe('2026-09-01');
    expect(formatDateString(date)).toBe('2026-08-29');
  });

  it('finds Sunday as the start of the week', () => {
    const result = startOfWeek(date);
    expect(result.getDay()).toBe(0);
  });

  it('finds the first day of the month', () => {
    expect(formatDateString(startOfMonth(date))).toBe('2026-08-01');
  });

  it('returns the day name', () => {
    expect(getDayName(date)).toBe('Sat');
  });

  it('formats month and year', () => {
    expect(formatMonthYear(date)).toBe('August 2026');
  });

  it('builds a seven-day window', () => {
    const days = buildDayWindow(new Date(2026, 7, 29), '2026-08-30');
    expect(days).toHaveLength(7);
    expect(days[0].dateString).toBe('2026-08-29');
    expect(days[1].isToday).toBe(true);
  });

  it('builds a 42-cell month grid', () => {
    const grid = buildMonthGrid(new Date(2026, 7, 1), '2026-08-29');
    expect(grid).toHaveLength(42);
    expect(grid.some((day) => day.isToday)).toBe(true);
    expect(grid.filter((day) => day.isCurrentMonth).length).toBe(31);
  });

  it('formats a week range in the same month', () => {
    expect(formatWeekRange(new Date(2026, 7, 1)))
      .toBe('Aug 1 – 7, 2026');
  });
});
