import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import {
  Calendar,
  Plus,
  AlertTriangle,
} from 'lucide-react-native';

import { useRoutines } from '../api/routines';

import { RoutineCard } from '../components/RoutineCard';

import { RoutineCalendar } from '../components/RoutineCalendar';

import { RoutineMenuModal } from '../components/RoutineMenuModal';

import { RoutineSummaryComponent } from '../api/types';

import {
  useTheme,
  colors,
} from '../theme';

import {
  addDays,
  formatDateString,
  formatDisplayDate,
  getTodayDateString,
  isDateInWindow,
  parseDateString,
  startOfWeek,
} from '../utils/dates';

import {
  routineOccursOnDate,
} from '../utils/routineSchedule';

type RoutineListItem = {
  id: number;
  name: string;
  description?: string | null;
};

export const RoutineScreen = () => {
  const { theme } = useTheme();

  const navigation = useNavigation<any>();

  /*
   * ========================================================================
   * MENU
   * ========================================================================
   */

  const [
    selectedRoutineForMenu,
    setSelectedRoutineForMenu,
  ] = useState<RoutineSummaryComponent | null>(null);

  const [
    isMenuVisible,
    setIsMenuVisible,
  ] = useState(false);

  /*
   * ========================================================================
   * CALENDAR
   * ========================================================================
   */

  const [
    calendarExpanded,
    setCalendarExpanded,
  ] = useState(false);

  const today = getTodayDateString();

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(today);

  const [
    windowStartDate,
    setWindowStartDate,
  ] = useState(
    formatDateString(
      startOfWeek(new Date()),
    ),
  );

  /*
   * ========================================================================
   * DATA
   * ========================================================================
   */

  const {
    data: routinesData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRoutines({
    scope: 'mine',
    limit: 100,
  });

  const routines = routinesData?.items ?? [];

  /*
   * ========================================================================
   * NAVIGATION PARAM
   * ========================================================================
   */

  useEffect(() => {
    navigation.setParams({
      selectedDate,
    });
  }, [
    navigation,
    selectedDate,
  ]);

  /*
   * ========================================================================
   * KEEP SELECTED DATE INSIDE WINDOW
   * ========================================================================
   */

  useEffect(() => {
    if (
      !calendarExpanded &&
      !isDateInWindow(
        selectedDate,
        windowStartDate,
      )
    ) {
      setWindowStartDate(
        formatDateString(
          startOfWeek(
            parseDateString(selectedDate),
          ),
        ),
      );
    }
  }, [
    calendarExpanded,
    selectedDate,
    windowStartDate,
  ]);

  /*
   * ========================================================================
   * FILTER ROUTINES
   * ========================================================================
   */

  const filteredRoutines =
    useMemo<RoutineListItem[]>(
      () =>
        routines
          .filter((routine) => {
            // The list endpoint is the source used by this screen. Older
            // backend deployments (and previously persisted cache entries)
            // may not include recurrence on the summary object yet.
            // Do not turn a valid routine list into an empty screen in that
            // case. The routine detail screen remains the authoritative
            // source for the full schedule until the list contract is
            // deployed everywhere.
            if (!routine.recurrence) {
              return true;
            }

            return routineOccursOnDate(
              routine.recurrence,
              selectedDate,
            );
          })
          .map(
            (routine) => ({
              id: routine.id,
              name: routine.name,
              description:
                routine.description,
            }),
          ),
      [
        routines,
        selectedDate,
      ],
    );

  const hasAnyRoutines = routines.length > 0;

  const routineCount = filteredRoutines.length;

  const formattedSelectedDate =
    formatDisplayDate(selectedDate);

  /*
   * ========================================================================
   * GO TO TODAY
   * ========================================================================
   */

  const handleGoToToday = () => {
    setSelectedDate(today);

    setWindowStartDate(
      formatDateString(
        startOfWeek(new Date()),
      ),
    );
  };

  /*
   * ========================================================================
   * SHIFT CALENDAR WINDOW
   * ========================================================================
   */

  const handleShiftWindow = (
    days: number,
  ) => {
    const nextWindowStart =
      addDays(
        parseDateString(windowStartDate),
        days,
      );

    const nextSelectedDate =
      addDays(
        parseDateString(selectedDate),
        days,
      );

    setWindowStartDate(
      formatDateString(nextWindowStart),
    );

    setSelectedDate(
      formatDateString(nextSelectedDate),
    );
  };

  /*
   * ========================================================================
   * TOGGLE CALENDAR
   * ========================================================================
   */

  const handleToggleExpanded = () => {
    if (
      calendarExpanded &&
      !isDateInWindow(
        selectedDate,
        windowStartDate,
      )
    ) {
      setWindowStartDate(
        formatDateString(
          startOfWeek(
            parseDateString(selectedDate),
          ),
        ),
      );
    }

    setCalendarExpanded(
      (value) => !value,
    );
  };

  /*
   * ========================================================================
   * SELECT DATE
   * ========================================================================
   */

  const handleSelectDate = (
    date: string,
  ) => {
    setSelectedDate(date);
  };

  /*
   * ========================================================================
   * CREATE ROUTINE
   * ========================================================================
   */

  const handleCreateRoutine = () => {
    navigation.navigate(
      'CreateRoutine',
      {
        initialDate: selectedDate,
      },
    );
  };

  /*
   * ========================================================================
   * LONG PRESS ROUTINE
   * ========================================================================
   */

  const handleLongPressRoutine = (
    routine: RoutineListItem,
  ) => {
    const fullRoutine =
      routines.find(
        (item) =>
          item.id === routine.id,
      );

    if (!fullRoutine) {
      return;
    }

    setSelectedRoutineForMenu(
      fullRoutine,
    );

    setIsMenuVisible(true);
  };

  /*
   * ========================================================================
   * CLOSE MENU
   * ========================================================================
   */

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
    setSelectedRoutineForMenu(null);
  };

  /*
   * ========================================================================
   * CALENDAR
   * ========================================================================
   */

  const renderCalendar = () => {
    return (
      <View style={styles.calendarContainer}>
        <RoutineCalendar
          selectedDate={selectedDate}
          windowStartDate={windowStartDate}
          expanded={calendarExpanded}
          onSelectDate={handleSelectDate}
          onWindowStartChange={setWindowStartDate}
          onShiftWindow={handleShiftWindow}
          onToggleExpanded={handleToggleExpanded}
          onGoToToday={handleGoToToday}
        />
      </View>
    );
  };

  /*
   * ========================================================================
   * SECTION HEADER
   * ========================================================================
   */

  const renderSectionHeader = () => {
    if (
      !hasAnyRoutines ||
      routineCount === 0
    ) {
      return null;
    }

    return (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor:
              theme.colors.surface,
            borderColor:
              theme.colors.border,
          },
        ]}
      >
        <View
          style={styles.sectionHeaderContent}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Scheduled
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  theme.colors.textMuted,
              },
            ]}
            numberOfLines={1}
          >
            {formattedSelectedDate}
          </Text>
        </View>

        <View style={styles.sectionActions}>
          <View
            style={[
              styles.routineCountBadge,
              {
                backgroundColor:
                  theme.colors.primary + '12',
                borderColor:
                  theme.colors.primary + '30',
              },
            ]}
          >
            <Text
              style={[
                styles.routineCountText,
                {
                  color:
                    theme.colors.primary,
                },
              ]}
            >
              {routineCount}
            </Text>
          </View>

        </View>
      </View>
    );
  };

  /*
   * ========================================================================
   * LOADING
   * ========================================================================
   */

  const renderLoadingState = () => {
    /*
     * IMPORTANT:
     * Do not replace the entire screen with a loading state.
     *
     * The calendar is outside the FlatList and therefore remains
     * visible. Only the routine-list area renders these skeletons.
     */
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonSectionHeader}>
          <View
            style={[
              styles.skeletonSectionIcon,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />

          <View style={styles.skeletonSectionText}>
            <View
              style={[
                styles.skeletonLine,
                styles.skeletonTitleLine,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <View
              style={[
                styles.skeletonLine,
                styles.skeletonSubtitleLine,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.skeletonBadge,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />
        </View>

        {[1, 2, 3, 4, 5].map((item) => (
          <View
            key={item}
            style={[
              styles.skeletonRoutineCard,
              {
                backgroundColor:
                  theme.colors.surface,
                borderColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.skeletonRoutineIcon,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />

            <View
              style={styles.skeletonRoutineContent}
            >
              <View
                style={[
                  styles.skeletonLine,
                  {
                    width:
                      item % 2 === 0
                        ? '58%'
                        : '72%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonSmallLine,
                  {
                    width:
                      item % 3 === 0
                        ? '42%'
                        : '58%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />

              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonDescriptionLine,
                  {
                    width:
                      item % 2 === 0
                        ? '78%'
                        : '68%',
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.skeletonChevron,
                {
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  /*
   * ========================================================================
   * ERROR
   * ========================================================================
   */

  const renderErrorState = () => {
    return (
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.stateIcon,
            {
              backgroundColor:
                colors.error + '12',
            },
          ]}
        >
          <AlertTriangle
            size={27}
            color={colors.error}
            strokeWidth={1.8}
          />
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Couldn&apos;t load routines
        </Text>

        <Text
          style={[
            styles.emptyText,
            {
              color:
                theme.colors.textMuted,
            },
          ]}
        >
          Something went wrong while
          loading your routines.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => refetch()}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <Text
            style={styles.primaryButtonText}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * ========================================================================
   * NO ROUTINES
   * ========================================================================
   */

  const renderNoRoutinesState = () => {
    return (
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.stateIcon,
            {
              backgroundColor:
                theme.colors.primary + '12',
            },
          ]}
        >
          <Calendar
            size={27}
            color={theme.colors.primary}
            strokeWidth={1.8}
          />
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          No routines yet
        </Text>

        <Text
          style={[
            styles.emptyText,
            {
              color:
                theme.colors.textMuted,
            },
          ]}
        >
          Create your first meal routine
          to get started.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreateRoutine}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <Plus
            size={17}
            color="#FFFFFF"
            strokeWidth={2.5}
          />

          <Text
            style={styles.primaryButtonText}
          >
            Create Routine
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * ========================================================================
   * NO ROUTINES FOR DATE
   * ========================================================================
   */

  const renderNoRoutinesForDate = () => {
    return (
      <View style={styles.centerContainer}>
        <View
          style={[
            styles.stateIcon,
            {
              backgroundColor:
                colors.info + '12',
            },
          ]}
        >
          <Calendar
            size={27}
            color={colors.info}
            strokeWidth={1.8}
          />
        </View>

        <Text
          style={[
            styles.emptyTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Nothing scheduled
        </Text>

        <Text
          style={[
            styles.selectedDateText,
            {
              color:
                theme.colors.primary,
            },
          ]}
        >
          {formattedSelectedDate}
        </Text>

        <Text
          style={[
            styles.emptyText,
            {
              color:
                theme.colors.textMuted,
            },
          ]}
        >
          You don&apos;t have any routines
          planned for this day.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCreateRoutine}
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        >
          <Plus
            size={17}
            color="#FFFFFF"
            strokeWidth={2.5}
          />

          <Text
            style={styles.primaryButtonText}
          >
            Create Routine
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /*
   * ========================================================================
   * ROUTINE ITEM
   * ========================================================================
   */

  const renderRoutineItem = ({
    item,
  }: {
    item: RoutineListItem;
  }) => {
    return (
      <View style={styles.cardWrapper}>
        <RoutineCard
          routine={item}
          onPress={() =>
            navigation.navigate(
              'RoutineDetail',
              {
                routineId: item.id,
              },
            )
          }
          onLongPress={() =>
            handleLongPressRoutine(item)
          }
        />
      </View>
    );
  };

  /*
   * ========================================================================
   * LIST EMPTY
   * ========================================================================
   */

  const renderListEmpty = () => {
    if (
      isLoading &&
      !isRefetching
    ) {
      return renderLoadingState();
    }

    if (error && !routinesData) {
      return renderErrorState();
    }

    if (!hasAnyRoutines) {
      return renderNoRoutinesState();
    }

    return renderNoRoutinesForDate();
  };

  /*
   * ========================================================================
   * SCREEN
   * ========================================================================
   */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
    >
      {/* ================================================================ */}
      {/* CALENDAR                                                          */}
      {/* ================================================================ */}

      <View
        style={[
          styles.fixedCalendar,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        {renderCalendar()}
      </View>

      {/* ================================================================ */}
      {/* ROUTINE LIST                                                      */}
      {/* ================================================================ */}

      <FlatList
        data={
          (error && !routinesData) ||
          (isLoading && !isRefetching)
            ? []
            : filteredRoutines
        }
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderRoutineItem}
        ListHeaderComponent={
          <View>
            {renderSectionHeader()}
          </View>
        }
        ListEmptyComponent={
          renderListEmpty
        }
        contentContainerStyle={[
          styles.listContent,
          filteredRoutines.length === 0
            ? styles.emptyListContent
            : null,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[
              theme.colors.primary,
            ]}
            tintColor={
              theme.colors.primary
            }
            progressBackgroundColor={
              theme.colors.surface
            }
          />
        }
      />

      {/* ================================================================ */}
      {/* MENU                                                              */}
      {/* ================================================================ */}

      <RoutineMenuModal
        visible={isMenuVisible}
        routine={
          selectedRoutineForMenu
        }
        onClose={handleCloseMenu}
        onOpenRoutine={(routineId) =>
          navigation.navigate(
            'RoutineDetail',
            {
              routineId,
            },
          )
        }
        onEditRoutine={(routineId) =>
          navigation.navigate(
            'EditRoutine',
            {
              routineId,
            },
          )
        }
      />
    </View>
  );
};

/*
 * ============================================================================
 * STYLES
 * ============================================================================
 */

const styles = StyleSheet.create({
  /*
   * --------------------------------------------------------------------------
   * SCREEN
   * --------------------------------------------------------------------------
   */

  container: {
    flex: 1,
  },

  /*
   * --------------------------------------------------------------------------
   * CALENDAR
   * --------------------------------------------------------------------------
   */

  fixedCalendar: {
    width: '100%',
    zIndex: 10,

    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },

  calendarContainer: {
    width: '100%',
  },

  /*
   * --------------------------------------------------------------------------
   * PARTIAL ERROR
   * --------------------------------------------------------------------------
   */

  partialErrorBanner: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,

    minHeight: 54,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderWidth: 1,
    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
  },

  partialErrorIcon: {
    width: 32,
    height: 32,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },

  partialErrorContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  partialErrorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  partialErrorText: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
    fontWeight: '500',
  },

  /*
   * --------------------------------------------------------------------------
   * SECTION HEADER
   * --------------------------------------------------------------------------
   */

  sectionHeader: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,

    minHeight: 62,

    paddingHorizontal: 14,
    paddingVertical: 11,

    borderWidth: 1,
    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    letterSpacing: -0.15,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 16,

    marginTop: 2,

    fontWeight: '500',
  },

  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',

    marginLeft: 10,
  },

  routineCountBadge: {
    minWidth: 30,
    height: 30,

    paddingHorizontal: 8,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  routineCountText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },

  /*
   * --------------------------------------------------------------------------
   * LIST
   * --------------------------------------------------------------------------
   */

  listContent: {
    paddingTop: 0,
    paddingBottom: 32,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /*
   * --------------------------------------------------------------------------
   * ROUTINE CARD
   * --------------------------------------------------------------------------
   */

  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
  },

  /*
   * --------------------------------------------------------------------------
   * CENTER STATES
   * --------------------------------------------------------------------------
   */

  centerContainer: {
    flex: 1,
    minHeight: 340,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 28,
    paddingVertical: 36,
  },

  stateIcon: {
    width: 64,
    height: 64,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 14,
  },

  /*
   * --------------------------------------------------------------------------
   * ROUTINE SKELETON
   *
   * Only the FlatList content uses these placeholders.
   * The calendar remains mounted and visible above the list.
   * --------------------------------------------------------------------------
   */

  skeletonContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },

  skeletonSectionHeader: {
    width: '100%',
    minHeight: 62,

    paddingHorizontal: 14,
    paddingVertical: 11,

    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,
  },

  skeletonSectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
  },

  skeletonSectionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  skeletonLine: {
    height: 11,
    borderRadius: 6,
  },

  skeletonTitleLine: {
    width: '52%',
    height: 13,
  },

  skeletonSubtitleLine: {
    width: '68%',
    height: 8,
    marginTop: 8,
  },

  skeletonBadge: {
    width: 32,
    height: 30,
    borderRadius: 8,
    marginLeft: 10,
  },

  skeletonRoutineCard: {
    width: '100%',
    minHeight: 104,

    borderWidth: 1,
    borderRadius: 14,

    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,

    flexDirection: 'row',
    alignItems: 'center',
  },

  skeletonRoutineIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    flexShrink: 0,
  },

  skeletonRoutineContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 12,
  },

  skeletonSmallLine: {
    height: 8,
    marginTop: 8,
  },

  skeletonDescriptionLine: {
    height: 7,
    marginTop: 10,
  },

  skeletonChevron: {
    width: 24,
    height: 24,
    borderRadius: 8,
    flexShrink: 0,
  },

  /*
   * --------------------------------------------------------------------------
   * EMPTY / ERROR
   * --------------------------------------------------------------------------
   */

  emptyTitle: {
    fontSize: 20,
    lineHeight: 26,

    fontWeight: '800',

    letterSpacing: -0.2,

    textAlign: 'center',

    marginBottom: 5,
  },

  selectedDateText: {
    fontSize: 13,
    lineHeight: 18,

    fontWeight: '700',

    textAlign: 'center',

    marginBottom: 7,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 18,

    fontWeight: '500',

    textAlign: 'center',

    maxWidth: 290,

    marginBottom: 20,
  },

  /*
   * --------------------------------------------------------------------------
   * PRIMARY BUTTON
   * --------------------------------------------------------------------------
   */

  primaryButton: {
    minHeight: 46,

    paddingHorizontal: 17,

    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  primaryButtonText: {
    color: '#FFFFFF',

    fontSize: 14,
    lineHeight: 18,

    fontWeight: '700',
  },
});