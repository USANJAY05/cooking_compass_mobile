import React, { useMemo } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react-native';

import {
  useTheme,
  colors,
} from '../theme';

import {
  buildDayWindow,
  buildMonthGrid,
  formatDateString,
  formatMonthYear,
  getTodayDateString,
  parseDateString,
  startOfMonth,
  startOfWeek,
} from '../utils/dates';

interface RoutineCalendarProps {
  selectedDate: string;
  windowStartDate: string;
  expanded: boolean;

  onSelectDate: (dateString: string) => void;
  onWindowStartChange: (dateString: string) => void;
  onShiftWindow: (days: number) => void;
  onToggleExpanded: () => void;
  onGoToToday: () => void;
}

const WEEKDAY_HEADERS = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
];

export const RoutineCalendar: React.FC<
  RoutineCalendarProps
> = ({
  selectedDate,
  windowStartDate,
  expanded,
  onSelectDate,
  onWindowStartChange,
  onShiftWindow,
  onToggleExpanded,
  onGoToToday,
}) => {
  const { theme } = useTheme();

  const today =
    getTodayDateString();

  const isTodaySelected =
    selectedDate === today;

  const windowStart =
    parseDateString(
      windowStartDate,
    );

  /*
   * ============================================================
   * COLLAPSED WEEK
   * ============================================================
   */

  const weekDays = useMemo(
    () =>
      buildDayWindow(
        windowStart,
        today,
      ),
    [windowStart, today],
  );

  /*
   * ============================================================
   * EXPANDED MONTH
   * ============================================================
   */

  const visibleMonth = useMemo(
    () =>
      startOfMonth(
        parseDateString(
          selectedDate,
        ),
      ),
    [selectedDate],
  );

  const monthDays = useMemo(
    () =>
      buildMonthGrid(
        visibleMonth,
        today,
      ),
    [visibleMonth, today],
  );

  /*
   * ============================================================
   * SELECT DATE
   * ============================================================
   */

  const handleSelectDate = (
    dateString: string,
  ) => {
    onSelectDate(dateString);

    onWindowStartChange(
      formatDateString(
        startOfWeek(
          parseDateString(
            dateString,
          ),
        ),
      ),
    );
  };

  /*
   * ============================================================
   * MONTH NAVIGATION
   * ============================================================
   */

  const shiftMonth = (
    months: number,
  ) => {
    const nextMonth =
      new Date(visibleMonth);

    nextMonth.setMonth(
      visibleMonth.getMonth() +
        months,
    );

    handleSelectDate(
      formatDateString(
        nextMonth,
      ),
    );
  };

  /*
   * ============================================================
   * ARROW BUTTON
   * ============================================================
   */

  const renderArrowButton = (
    direction:
      | 'left'
      | 'right',
    onPress: () => void,
    accessibilityLabel: string,
  ) => {
    return (
      <TouchableOpacity
        style={[
          styles.arrowButton,
          {
            backgroundColor:
              theme.colors.background,

            borderColor:
              theme.colors.primary +
              '2E',
          },
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel
        }
        activeOpacity={0.65}
      >
        {direction === 'left' ? (
          <ChevronLeft
            size={17}
            color={
              theme.colors.text
            }
            strokeWidth={2}
          />
        ) : (
          <ChevronRight
            size={17}
            color={
              theme.colors.text
            }
            strokeWidth={2}
          />
        )}
      </TouchableOpacity>
    );
  };

  /*
   * ============================================================
   * TODAY BUTTON
   *
   * Today is positioned immediately before Next.
   *
   * Header:
   *
   * Previous      DATE       Today  Next
   *
   * The center date is independently centered.
   * ============================================================
   */

  const renderTodayButton = () => {
    return (
      <View
        style={
          styles.todaySlot
        }
      >
        {!isTodaySelected ? (
          <TouchableOpacity
            style={[
              styles.todayButton,
              {
                backgroundColor:
                  colors.info + '14',

                borderColor:
                  colors.info + '30',
              },
            ]}
            onPress={
              onGoToToday
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go to today"
          >
            <Text
              style={[
                styles.todayText,
                {
                  color:
                    colors.info,
                },
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  /*
   * ============================================================
   * COLLAPSED WEEK DAY
   * ============================================================
   */

  const renderWeekDay = (
    day: (typeof weekDays)[number],
  ) => {
    const isSelected =
      day.dateString ===
      selectedDate;

    return (
      <TouchableOpacity
        key={day.dateString}
        style={
          styles.weekDayWrapper
        }
        onPress={() =>
          handleSelectDate(
            day.dateString,
          )
        }
        accessibilityRole="button"
        accessibilityLabel={`${day.dayName} ${day.dayNumber}`}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.weekDayName,
            {
              color: isSelected
                ? theme.colors.primary
                : theme.colors
                    .textMuted,
            },
          ]}
        >
          {day.dayName.charAt(
            0,
          )}
        </Text>

        <View
          style={[
            styles.weekDayCircle,
            isSelected && {
              backgroundColor:
                theme.colors.primary,

              borderColor:
                theme.colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.weekDayNumber,
              {
                color: isSelected
                  ? '#FFFFFF'
                  : theme.colors.text,
              },
            ]}
          >
            {day.dayNumber}
          </Text>
        </View>

        {day.isToday &&
        !isSelected ? (
          <View
            style={[
              styles.todayDot,
              {
                backgroundColor:
                  theme.colors.primary,
              },
            ]}
          />
        ) : (
          <View
            style={
              styles.dotPlaceholder
            }
          />
        )}
      </TouchableOpacity>
    );
  };

  /*
   * ============================================================
   * EXPANDED MONTH DAY
   * ============================================================
   */

  const renderMonthDay = (
    day: (typeof monthDays)[number],
  ) => {
    const isSelected =
      day.dateString ===
      selectedDate;

    const isToday =
      day.isToday;

    return (
      <TouchableOpacity
        key={day.dateString}
        style={
          styles.monthDayWrapper
        }
        onPress={() =>
          handleSelectDate(
            day.dateString,
          )
        }
        accessibilityRole="button"
        accessibilityLabel={`${day.dayNumber}`}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.monthDayCircle,

            isSelected && {
              backgroundColor:
                theme.colors.primary,
            },

            isToday &&
              !isSelected && {
                borderWidth: 1.5,
                borderColor:
                  colors.info,

                backgroundColor:
                  colors.info + '0D',
              },
          ]}
        >
          <Text
            style={[
              styles.monthDayText,
              {
                color: isSelected
                  ? '#FFFFFF'
                  : day.isCurrentMonth
                    ? theme.colors.text
                    : theme.colors
                        .textMuted,
              },
            ]}
          >
            {day.dayNumber}
          </Text>
        </View>

        {isToday &&
        !isSelected ? (
          <View
            style={[
              styles.monthTodayDot,
              {
                backgroundColor:
                  theme.colors.primary,
              },
            ]}
          />
        ) : null}
      </TouchableOpacity>
    );
  };

  /*
   * ============================================================
   * COLLAPSED CALENDAR
   * ============================================================
   */

  if (!expanded) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors.surface,

            borderColor:
              theme.colors.primary +
              '24',
          },
        ]}
      >
        <View
          style={[
            styles.calendarAccent,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        />

        {/* -------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------- */}

        <View
          style={
            styles.compactHeader
          }
        >
          {/* LEFT — PREVIOUS */}

          <View
            style={
              styles.headerLeft
            }
          >
            {renderArrowButton(
              'left',
              () =>
                onShiftWindow(
                  -7,
                ),
              'Previous week',
            )}
          </View>

          {/* CENTER — DATE */}

          <TouchableOpacity
            style={
              styles.centerDateButton
            }
            onPress={
              onToggleExpanded
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Expand calendar"
          >
            <Text
              style={[
                styles.weekTitle,
                {
                  color:
                    theme.colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {formatMonthYear(
                parseDateString(selectedDate),
              )}
            </Text>

            <ChevronDown
              size={15}
              color={
                theme.colors
                  .textMuted
              }
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* RIGHT — TODAY + NEXT */}

          <View
            style={
              styles.headerRight
            }
          >
            {renderTodayButton()}

            {renderArrowButton(
              'right',
              () =>
                onShiftWindow(
                  7,
                ),
              'Next week',
            )}
          </View>
        </View>

        {/* -------------------------------------------------- */}
        {/* WEEK */}
        {/* -------------------------------------------------- */}

        <View
          style={styles.weekRow}
        >
          {weekDays.map(
            renderWeekDay,
          )}
        </View>
      </View>
    );
  }

  /*
   * ============================================================
   * EXPANDED CALENDAR
   * ============================================================
   */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.surface,

          borderColor:
            theme.colors.primary +
            '24',
        },
      ]}
    >
      <View
        style={[
          styles.calendarAccent,
          {
            backgroundColor:
              theme.colors.primary,
          },
        ]}
      />

      {/* -------------------------------------------------- */}
      {/* MONTH HEADER */}
      {/* -------------------------------------------------- */}

      <View
        style={
          styles.monthHeader
        }
      >
        {/* LEFT — PREVIOUS */}

        <View
          style={
            styles.headerLeft
          }
        >
          {renderArrowButton(
            'left',
            () =>
              shiftMonth(-1),
            'Previous month',
          )}
        </View>

        {/* CENTER — MONTH */}

        <TouchableOpacity
          style={
            styles.centerDateButton
          }
          onPress={
            onToggleExpanded
          }
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Collapse calendar"
        >
          <Text
            style={[
              styles.monthTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            {formatMonthYear(
              visibleMonth,
            )}
          </Text>

          <ChevronUp
            size={15}
            color={
              theme.colors
                .textMuted
            }
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* RIGHT — TODAY + NEXT */}

        <View
          style={
            styles.headerRight
          }
        >
          {renderTodayButton()}

          {renderArrowButton(
            'right',
            () =>
              shiftMonth(1),
            'Next month',
          )}
        </View>
      </View>

      {/* -------------------------------------------------- */}
      {/* WEEKDAY HEADER */}
      {/* -------------------------------------------------- */}

      <View
        style={
          styles.weekdayHeaderRow
        }
      >
        {WEEKDAY_HEADERS.map(
          (
            label,
            index,
          ) => (
            <View
              key={`${label}-${index}`}
              style={
                styles.weekdayHeaderCell
              }
            >
              <Text
                style={[
                  styles.weekdayHeader,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          ),
        )}
      </View>

      {/* -------------------------------------------------- */}
      {/* MONTH GRID */}
      {/* -------------------------------------------------- */}

      <View
        style={
          styles.monthGrid
        }
      >
        {monthDays.map(
          renderMonthDay,
        )}
      </View>

      {/* -------------------------------------------------- */}
      {/* COLLAPSE */}
      {/* -------------------------------------------------- */}

      <TouchableOpacity
        style={
          styles.bottomCollapseButton
        }
        onPress={
          onToggleExpanded
        }
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Collapse calendar"
      >
        <ChevronUp
          size={14}
          color={
            theme.colors
              .textMuted
          }
        />

        <Text
          style={[
            styles.bottomCollapseText,
            {
              color:
                theme.colors
                  .textMuted,
            },
          ]}
        >
          Collapse
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/*
 * ==============================================================
 * STYLES
 * ==============================================================
 */

const styles = StyleSheet.create({
  /*
   * ------------------------------------------------------------
   * CONTAINER
   * ------------------------------------------------------------
   */

  container: {
    width: '100%',

    position: 'relative',

    borderWidth: 1,
    borderRadius: 8,

    overflow: 'hidden',

    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },

  calendarAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  /*
   * ------------------------------------------------------------
   * HEADER
   *
   * The date is absolutely centered across the entire width.
   * This means Today/Next cannot push it left.
   * ------------------------------------------------------------
   */

  compactHeader: {
    width: '100%',
    height: 40,

    position: 'relative',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 12,
  },

  monthHeader: {
    width: '100%',
    height: 40,

    position: 'relative',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 12,
  },

  /*
   * ------------------------------------------------------------
   * LEFT SIDE
   * ------------------------------------------------------------
   */

  headerLeft: {
    width: 40,
    height: 40,

    alignItems: 'flex-start',
    justifyContent: 'center',

    zIndex: 2,
  },

  /*
   * ------------------------------------------------------------
   * RIGHT SIDE
   * ------------------------------------------------------------
   */

  headerRight: {
    height: 40,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',

    zIndex: 2,
  },

  /*
   * ------------------------------------------------------------
   * CENTER DATE
   *
   * Absolute positioning is intentional here.
   *
   * left: 0
   * right: 0
   *
   * guarantees true screen/container center.
   * ------------------------------------------------------------
   */

  centerDateButton: {
    position: 'absolute',

    left: 0,
    right: 0,

    height: 40,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    paddingHorizontal: 70,

    zIndex: 1,
  },

  weekTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',

    textAlign: 'center',
  },

  monthTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',

    textAlign: 'center',
  },

  /*
   * ------------------------------------------------------------
   * ARROW
   * ------------------------------------------------------------
   */

  arrowButton: {
    width: 36,
    height: 36,

    borderRadius: 8,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
   * ------------------------------------------------------------
   * TODAY
   * ------------------------------------------------------------
   */

  todaySlot: {
    width: 58,
    height: 40,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 2,
  },

  todayButton: {
    minWidth: 54,
    height: 32,

    paddingHorizontal: 9,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  todayText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },

  /*
   * ------------------------------------------------------------
   * COLLAPSED WEEK
   * ------------------------------------------------------------
   */

  weekRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  weekDayWrapper: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'flex-start',

    minWidth: 0,
  },

  weekDayName: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',

    marginBottom: 4,
  },

  weekDayCircle: {
    width: 34,
    height: 34,

    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'transparent',

    alignItems: 'center',
    justifyContent: 'center',
  },

  weekDayNumber: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },

  todayDot: {
    width: 4,
    height: 4,

    borderRadius: 2,

    marginTop: 3,
  },

  dotPlaceholder: {
    width: 4,
    height: 4,

    marginTop: 3,
  },

  /*
   * ------------------------------------------------------------
   * EXPANDED WEEKDAY HEADER
   * ------------------------------------------------------------
   */

  weekdayHeaderRow: {
    width: '100%',

    flexDirection: 'row',

    marginBottom: 4,
  },

  weekdayHeaderCell: {
    width: '14.2857%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  weekdayHeader: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },

  /*
   * ------------------------------------------------------------
   * MONTH GRID
   * ------------------------------------------------------------
   */

  monthGrid: {
    width: '100%',

    flexDirection: 'row',
    flexWrap: 'wrap',

    rowGap: 2,
  },

  monthDayWrapper: {
    width: '14.2857%',
    height: 42,

    alignItems: 'center',
    justifyContent: 'center',
  },

  monthDayCircle: {
    width: 34,
    height: 34,

    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'transparent',

    alignItems: 'center',
    justifyContent: 'center',
  },

  monthDayText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },

  monthTodayDot: {
    position: 'absolute',

    bottom: 1,

    width: 4,
    height: 4,

    borderRadius: 2,
  },

  /*
   * ------------------------------------------------------------
   * COLLAPSE BUTTON
   * ------------------------------------------------------------
   */

  bottomCollapseButton: {
    alignSelf: 'center',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,

    marginTop: 6,

    paddingHorizontal: 10,
    paddingVertical: 5,

    borderRadius: 8,
  },

  bottomCollapseText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
