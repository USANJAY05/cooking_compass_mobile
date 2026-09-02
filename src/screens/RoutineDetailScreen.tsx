import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import {
  CalendarDays,
  Repeat,
  Utensils,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Pencil,
} from 'lucide-react-native';

import { useRoutineDetail } from '../api/routines';
import { RoutineItemComponent } from '../api/types';
import { useTheme, colors } from '../theme';
import { formatDisplayDate } from '../utils/dates';
import { isSpecificDateRecurrence } from '../utils/routineSchedule';
import { formatQuantityWithUnit } from '../utils/quantity';

const DAY_LABELS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

export const RoutineDetailScreen = ({
  route,
  navigation,
}: any) => {
  const { routineId } =
    route.params || {};

  const { theme } = useTheme();

  const {
    data: routine,
    isLoading,
    error,
    refetch,
  } = useRoutineDetail(routineId);

  const [
    descriptionExpanded,
    setDescriptionExpanded,
  ] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      ...(routine?.name ? { title: routine.name } : {}),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EditRoutine', { routineId })}
          activeOpacity={0.75}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit routine"
        >
          <Pencil size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [routine?.name, navigation, routineId, theme.colors.primary]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="small"
          color={
            theme.colors.primary
          }
        />
      </View>
    );
  }

  if (!routine) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor:
              theme.colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.errorIcon,
            {
              backgroundColor:
                colors.error + '0D',
            },
          ]}
        >
          <AlertTriangle
            size={22}
            color={colors.error}
            strokeWidth={2}
          />
        </View>

        <Text
          style={[
            styles.errorTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Couldn&apos;t load routine
        </Text>

        <Text
          style={[
            styles.errorMessage,
            {
              color:
                theme.colors
                  .textMuted,
            },
          ]}
        >
          Please try again.
        </Text>

        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
          onPress={() =>
            refetch()
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.retryText
            }
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const frequency =
    routine.recurrence
      ?.frequency || 'WEEKLY';

  const isSpecificDate =
    isSpecificDateRecurrence(
      routine.recurrence,
    );

  const daysOfWeek =
    routine.recurrence
      ?.days_of_week;

  const recipes =
    routine.recipes || [];

  const description =
    routine.description?.trim() || '';

  const canExpand =
    description.length > 100;

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}
      contentContainerStyle={
        styles.content
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color:
                theme.colors.text,
            },
          ]}
          numberOfLines={3}
        >
          {routine.name}
        </Text>

        {description ? (
          <View
            style={
              styles.descriptionArea
            }
          >
            <Text
              style={[
                styles.description,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
              numberOfLines={
                canExpand &&
                !descriptionExpanded
                  ? 2
                  : undefined
              }
            >
              {description}
            </Text>

            {canExpand ? (
              <TouchableOpacity
                style={
                  styles.viewMoreButton
                }
                onPress={() =>
                  setDescriptionExpanded(
                    value => !value,
                  )
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.viewMoreText,
                    {
                      color:
                        theme.colors
                          .primary,
                    },
                  ]}
                >
                  {descriptionExpanded
                    ? 'Show less'
                    : 'View more'}
                </Text>

                <ChevronDown
                  size={12}
                  color={
                    theme.colors
                      .primary
                  }
                  strokeWidth={2.5}
                  style={
                    descriptionExpanded
                      ? styles.chevronUp
                      : undefined
                  }
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.metaItem,
            {
              backgroundColor:
                'transparent',
            },
          ]}
        >
          {isSpecificDate ? (
            <CalendarDays
              size={14}
              color={
                theme.colors.primary
              }
              strokeWidth={2}
            />
          ) : (
            <Repeat
              size={14}
              color={
                theme.colors.primary
              }
              strokeWidth={2}
            />
          )}

          <Text
            style={[
              styles.metaText,
              {
                color:
                  theme.colors.primary,
              },
            ]}
          >
            {isSpecificDate
              ? 'Specific date'
              : frequency}
          </Text>
        </View>

        {routine.status ? (
          <View
            style={[
              styles.statusItem,
              {
                borderColor:
                  theme.colors
                    .border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    theme.colors.text,
                },
              ]}
            >
              {routine.status}
            </Text>
          </View>
        ) : null}
      </View>

      {routine.recurrence
        ?.start_date ? (
        <View
          style={styles.dateRow}
        >
          <CalendarDays
            size={13}
            color={
              theme.colors
                .textMuted
            }
            strokeWidth={2}
          />

          <Text
            style={[
              styles.dateText,
              {
                color:
                  theme.colors
                    .textMuted,
              },
            ]}
          >
            {isSpecificDate
              ? formatDisplayDate(
                  routine
                    .recurrence
                    .start_date,
                )
              : `Starts ${routine.recurrence.start_date}`}
          </Text>
        </View>
      ) : null}

      {frequency ===
        'WEEKLY' &&
        !isSpecificDate &&
        daysOfWeek &&
        daysOfWeek.length >
          0 && (
          <View
            style={[
              styles.schedule,
              {
                backgroundColor:
                  theme.colors.surface,
              },
            ]}
          >
            <View
              style={
                styles.scheduleTop
              }
            >
              <Text
                style={[
                  styles.scheduleTitle,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                Schedule
              </Text>

              <Text
                style={[
                  styles.scheduleCount,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                {daysOfWeek.length}{' '}
                {daysOfWeek.length ===
                1
                  ? 'day'
                  : 'days'}
              </Text>
            </View>

            <View
              style={styles.days}
            >
              {DAY_LABELS.map(
                (
                  label,
                  index,
                ) => {
                  const active =
                    daysOfWeek.includes(
                      index,
                    );

                  return (
                    <View
                      key={label}
                      style={[
                        styles.day,
                        active
                          ? {
                              backgroundColor:
                                theme
                                  .colors
                                  .primary,
                              borderColor:
                                theme
                                  .colors
                                  .primary,
                            }
                          : {
                              backgroundColor:
                                'transparent',
                              borderColor:
                                theme
                                  .colors
                                  .border,
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color:
                              active
                                ? '#FFFFFF'
                                : theme
                                    .colors
                                    .textMuted,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </View>
        )}

      <View
        style={
          styles.recipesHeader
        }
      >
        <View>
          <Text
            style={[
              styles.recipesTitle,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Recipes
          </Text>

          <Text
            style={[
              styles.recipeSubtitle,
              {
                color:
                  theme.colors
                    .textMuted,
              },
            ]}
          >
            {recipes.length}{' '}
            {recipes.length ===
            1
              ? 'recipe'
              : 'recipes'}{' '}
            scheduled
          </Text>
        </View>

        <Text
          style={[
            styles.recipeCount,
            {
              color:
                theme.colors
                  .textMuted,
            },
          ]}
        >
          {recipes.length}
        </Text>
      </View>

      {recipes.length > 0 ? (
        <View style={styles.recipeList}>
          {recipes.map(
            (
              item: RoutineItemComponent,
              index: number,
            ) => (
              <TouchableOpacity
                key={`${item.recipe_id}-${index}`}
                style={[
                  styles.recipeRow,
                  {
                    backgroundColor:
                      theme.colors.surface,
                  },
                  index === 0 && styles.recipeRowFirst,
                  index === recipes.length - 1 &&
                    styles.recipeRowLast,
                ]}
                onPress={() => {
                  const quantityUnit = String(
                    item.quantity_unit ?? '',
                  ).trim();

                  const normalizedUnit =
                    quantityUnit.toLowerCase();

                  const isServingUnit =
                    normalizedUnit === 'serving' ||
                    normalizedUnit === 'servings' ||
                    normalizedUnit === 'portion' ||
                    normalizedUnit === 'portions';

                  const quantityValue = Number(item.quantity);
                  const hasValidQuantity =
                    Number.isFinite(quantityValue) &&
                    quantityValue > 0;

                  if (!quantityUnit || !hasValidQuantity) {
                    return;
                  }

                  navigation.navigate(
                    'RecipeDetail',
                    {
                      recipeId: item.recipe_id,
                      initialPortionMode: isServingUnit
                        ? 'servings'
                        : 'quantity',
                      initialPortionValue: String(
                        quantityValue,
                      ),
                      initialPortionUnit: quantityUnit,
                    },
                  );
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.recipeIcon,
                    {
                      backgroundColor:
                        theme.colors.primary + '12',
                    },
                  ]}
                >
                  <Utensils
                    size={15}
                    color={
                      theme.colors
                        .primary
                    }
                    strokeWidth={2}
                  />
                </View>

                <View
                  style={
                    styles.recipeInfo
                  }
                >
                  <Text
                    style={[
                      styles.recipeName,
                      {
                        color:
                          theme.colors
                            .text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.recipe_name ||
                      `Recipe #${item.recipe_id}`}
                  </Text>

                  <Text
                    style={[
                      styles.quantity,
                      {
                        color:
                          theme.colors
                            .textMuted,
                      },
                    ]}
                  >
                    {formatQuantityWithUnit(
                      item.quantity,
                      item.quantity_unit,
                    )}
                  </Text>
                </View>

                <ChevronRight
                  size={16}
                  color={
                    theme.colors
                      .textMuted
                  }
                  strokeWidth={2}
                />
              </TouchableOpacity>
            ),
          )}
        </View>
      ) : (
        <View
          style={[
            styles.empty,
            {
              backgroundColor:
                theme.colors.surface,
            },
          ]}
        >
          <Utensils
            size={18}
            color={
              theme.colors
                .textMuted
            }
            strokeWidth={1.8}
          />

          <Text
            style={[
              styles.emptyText,
              {
                color:
                  theme.colors
                    .textMuted,
              },
            ]}
          >
            No recipes scheduled
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  errorIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginBottom: 7,
  },
  descriptionArea: {
    paddingRight: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 3,
    gap: 1,
  },
  viewMoreText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '700',
  },
  chevronUp: {
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 8,
  },
  metaItem: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1,
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  statusItem: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
  },
  schedule: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
    borderRadius: 12,
  },
  scheduleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 9,
  },
  scheduleTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  scheduleCount: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '600',
  },
  days: {
    flexDirection: 'row',
    gap: 5,
  },
  day: {
    flex: 1,
    height: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '700',
  },
  recipesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 7,
    paddingHorizontal: 1,
  },
  recipesTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  recipeSubtitle: {
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 1,
  },
  recipeCount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  recipeList: {
    paddingHorizontal: 0,
    gap: 8,
  },
  recipeRowFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeRowLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  recipeRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  recipeIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recipeInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  recipeName: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 1,
    fontWeight: '500',
  },
  empty: {
    minHeight: 96,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});