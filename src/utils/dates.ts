const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateString = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getTodayDateString = (): string => formatDateString(new Date());

export const isSameDate = (left: string, right: string): boolean => left === right;

export const isDateInWindow = (
  dateString: string,
  windowStartString: string,
  windowSize = 7
): boolean => {
  const date = parseDateString(dateString);
  const windowStart = parseDateString(windowStartString);
  const windowEnd = addDays(windowStart, windowSize - 1);
  return date >= windowStart && date <= windowEnd;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};

export const startOfWeek = (date: Date): Date => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return start;
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const getDayName = (date: Date): string => DAY_NAMES[date.getDay()];

export const formatDisplayDate = (value: string, options?: { weekday?: boolean }): string => {
  const date = parseDateString(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    weekday: options?.weekday ? 'short' : undefined,
  });
};

export const formatMonthYear = (date: Date): string => `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

export const formatWeekRange = (windowStart: Date): string => {
  const windowEnd = addDays(windowStart, 6);
  const sameMonth = windowStart.getMonth() === windowEnd.getMonth();
  const sameYear = windowStart.getFullYear() === windowEnd.getFullYear();

  if (sameMonth && sameYear) {
    return `${MONTH_NAMES[windowStart.getMonth()].slice(0, 3)} ${windowStart.getDate()} – ${windowEnd.getDate()}, ${windowStart.getFullYear()}`;
  }

  if (sameYear) {
    return `${MONTH_NAMES[windowStart.getMonth()].slice(0, 3)} ${windowStart.getDate()} – ${MONTH_NAMES[windowEnd.getMonth()].slice(0, 3)} ${windowEnd.getDate()}, ${windowStart.getFullYear()}`;
  }

  return `${formatDisplayDate(formatDateString(windowStart))} – ${formatDisplayDate(formatDateString(windowEnd))}`;
};

export interface CalendarDay {
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export const buildDayWindow = (windowStart: Date, today = getTodayDateString()): CalendarDay[] => {
  const days: CalendarDay[] = [];

  for (let index = 0; index < 7; index += 1) {
    const date = addDays(windowStart, index);
    const dateString = formatDateString(date);
    days.push({
      dateString,
      dayName: getDayName(date),
      dayNumber: date.getDate(),
      isToday: isSameDate(dateString, today),
      isCurrentMonth: true,
    });
  }

  return days;
};

export const buildMonthGrid = (visibleMonth: Date, today = getTodayDateString()): CalendarDay[] => {
  const monthStart = startOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart);
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    const dateString = formatDateString(date);
    days.push({
      dateString,
      dayName: getDayName(date),
      dayNumber: date.getDate(),
      isToday: isSameDate(dateString, today),
      isCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
    });
  }

  return days;
};
