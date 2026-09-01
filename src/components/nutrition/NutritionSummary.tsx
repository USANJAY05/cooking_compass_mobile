import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  ChevronRight,
  Flame,
} from 'lucide-react-native';

import {
  useTheme,
  colors,
} from '../../theme';

import {
  NutritionData,
  formatNutritionAmount,
  getSummaryNutritionItems,
  hasExtendedNutrition,
  hasNutritionContent,
  prepareNutritionBreakdown,
} from '../../utils/nutrition';

interface NutritionSummaryProps {
  nutrition: NutritionData;
  scale?: number;
  portionLabel?: string;
  onShowMore: () => void;
}

/*
 * ============================================================================
 * MACRO COLORS
 * ============================================================================
 */

const macroColorMap: Record<string, string> = {
  PROTEIN: colors.protein,

  CARBOHYDRATES:
    colors.carbs,

  CARBS:
    colors.carbs,

  FAT:
    colors.fats,

  TOTAL_FAT:
    colors.fats,
};

/*
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */

export const NutritionSummary: React.FC<
  NutritionSummaryProps
> = ({
  nutrition,
  scale = 1,
  portionLabel,
  onShowMore,
}) => {
  const { theme } = useTheme();

  /*
   * --------------------------------------------------------------------------
   * PREPARE DATA
   * --------------------------------------------------------------------------
   */

  const breakdown =
    prepareNutritionBreakdown(
      nutrition,
      scale,
    );

  if (
    !hasNutritionContent(
      breakdown,
    )
  ) {
    return null;
  }

  const summaryItems =
    getSummaryNutritionItems(
      breakdown,
    );

  /*
   * --------------------------------------------------------------------------
   * CALORIES
   * --------------------------------------------------------------------------
   */

  const caloriesItem =
    summaryItems.find(
      (item) =>
        [
          'CALORIES',
          'ENERGY',
        ].includes(
          item.code.toUpperCase(),
        ),
    );

  /*
   * --------------------------------------------------------------------------
   * MACROS
   * --------------------------------------------------------------------------
   */

  const macroItems =
    summaryItems.filter(
      (item) =>
        ![
          'CALORIES',
          'ENERGY',
        ].includes(
          item.code.toUpperCase(),
        ),
    );

  /*
   * --------------------------------------------------------------------------
   * EXTENDED NUTRITION
   * --------------------------------------------------------------------------
   */

  const showMore =
    hasExtendedNutrition(
      breakdown,
    );

  /*
   * --------------------------------------------------------------------------
   * RENDER
   * --------------------------------------------------------------------------
   */

  return (
    <View
      style={styles.wrapper}
    >
      {/* ================================================================== */}
      {/* SECTION HEADER                                                     */}
      {/* ================================================================== */}

      <View
        style={styles.header}
      >
        <View
          style={styles.titleRow}
        >
          <View
            style={[
              styles.titleIcon,
              {
                backgroundColor:
                  colors.calories +
                  '14',
              },
            ]}
          >
            <Flame
              size={16}
              color={
                colors.calories
              }
              strokeWidth={2.2}
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
          >
            Nutrition
          </Text>
        </View>

        {portionLabel ? (
          <Text
            style={[
              styles.subtitle,
              {
                color:
                  theme.colors
                    .textMuted,
              },
            ]}
            numberOfLines={1}
          >
            {portionLabel}
          </Text>
        ) : null}
      </View>

      {/* ================================================================== */}
      {/* MAIN CARD                                                          */}
      {/* ================================================================== */}

      <View
        style={[
          styles.card,
          {
            backgroundColor:
              theme.colors.surface,

            borderColor:
              theme.colors.border,
          },
        ]}
      >
        {/* ================================================================ */}
        {/* CALORIES                                                         */}
        {/* ================================================================ */}

        {caloriesItem ? (
          <View
            style={[
              styles.caloriesRow,
              {
                borderBottomColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.calorieIconWrap,
                {
                  backgroundColor:
                    colors.calories +
                    '14',
                },
              ]}
            >
              <Flame
                size={19}
                color={
                  colors.calories
                }
                strokeWidth={2.2}
              />
            </View>

            <View
              style={
                styles.calorieTextWrap
              }
            >
              <Text
                style={[
                  styles.caloriesValue,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
                numberOfLines={1}
              >
                {formatNutritionAmount(
                  caloriesItem.amount,
                  caloriesItem.unit,
                )}
              </Text>

              <Text
                style={[
                  styles.caloriesLabel,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                Total energy
              </Text>
            </View>

            <View
              style={[
                styles.energyBadge,
                {
                  backgroundColor:
                    colors.calories +
                    '10',

                  borderColor:
                    colors.calories +
                    '24',
                },
              ]}
            >
              <Text
                style={[
                  styles.energyBadgeText,
                  {
                    color:
                      colors.calories,
                  },
                ]}
              >
                kcal
              </Text>
            </View>
          </View>
        ) : null}

        {/* ================================================================ */}
        {/* MACROS                                                           */}
        {/* ================================================================ */}

        {macroItems.length > 0 ? (
          <View
            style={styles.macrosRow}
          >
            {macroItems.map(
              (item) => {
                const accent =
                  macroColorMap[
                    item.code.toUpperCase()
                  ] ??
                  theme.colors
                    .primary;

                return (
                  <View
                    key={item.code}
                    style={[
                      styles.macroItem,
                      {
                        backgroundColor:
                          accent +
                          '0D',

                        borderColor:
                          accent +
                          '24',
                      },
                    ]}
                  >
                    {/* Accent */}

                    <View
                      style={[
                        styles.macroAccent,
                        {
                          backgroundColor:
                            accent,
                        },
                      ]}
                    />

                    {/* Value */}

                    <Text
                      style={[
                        styles.macroValue,
                        {
                          color:
                            theme.colors
                              .text,
                        },
                      ]}
                      numberOfLines={
                        1
                      }
                      adjustsFontSizeToFit
                    >
                      {formatNutritionAmount(
                        item.amount,
                        item.unit,
                      )}
                    </Text>

                    {/* Label */}

                    <Text
                      style={[
                        styles.macroLabel,
                        {
                          color:
                            theme.colors
                              .textMuted,
                        },
                      ]}
                      numberOfLines={
                        1
                      }
                    >
                      {item.name}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        ) : null}

        {/* ================================================================ */}
        {/* SHOW MORE                                                        */}
        {/* ================================================================ */}

        {showMore ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={
              onShowMore
            }
            style={[
              styles.showMoreButton,
              {
                borderTopColor:
                  theme.colors
                    .border,
              },
            ]}
          >
            <Text
              style={[
                styles.showMoreText,
                {
                  color:
                    theme.colors
                      .primary,
                },
              ]}
            >
              View full nutrition
            </Text>

            <View
              style={[
                styles.chevronWrap,
                {
                  backgroundColor:
                    theme.colors
                      .primary +
                    '12',
                },
              ]}
            >
              <ChevronRight
                size={16}
                color={
                  theme.colors
                    .primary
                }
                strokeWidth={2.4}
              />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
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
   * WRAPPER
   * --------------------------------------------------------------------------
   */

  wrapper: {
    marginBottom: 24,
  },

  /*
   * --------------------------------------------------------------------------
   * HEADER
   * --------------------------------------------------------------------------
   */

  header: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent:
      'space-between',

    marginBottom: 12,

    gap: 12,
  },

  titleRow: {
    flexDirection: 'row',

    alignItems: 'center',

    minWidth: 0,

    gap: 9,
  },

  titleIcon: {
    width: 30,
    height: 30,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 17,
    lineHeight: 22,

    fontWeight: '800',
  },

  subtitle: {
    flexShrink: 1,

    fontSize: 12,
    lineHeight: 17,

    fontWeight: '600',

    textAlign: 'right',
  },

  /*
   * --------------------------------------------------------------------------
   * CARD
   * --------------------------------------------------------------------------
   */

  card: {
    borderRadius: 12,

    borderWidth: 1,

    overflow: 'hidden',
  },

  /*
   * --------------------------------------------------------------------------
   * CALORIES
   * --------------------------------------------------------------------------
   */

  caloriesRow: {
    minHeight: 76,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  calorieIconWrap: {
    width: 40,
    height: 40,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  calorieTextWrap: {
    flex: 1,

    minWidth: 0,
  },

  caloriesValue: {
    fontSize: 24,
    lineHeight: 29,

    fontWeight: '800',

    letterSpacing: -0.3,
  },

  caloriesLabel: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '500',

    marginTop: 1,
  },

  energyBadge: {
    minHeight: 28,

    paddingHorizontal: 9,

    borderRadius: 8,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 8,
  },

  energyBadgeText: {
    fontSize: 11,
    lineHeight: 14,

    fontWeight: '800',
  },

  /*
   * --------------------------------------------------------------------------
   * MACROS
   * --------------------------------------------------------------------------
   */

  macrosRow: {
    flexDirection: 'row',

    gap: 8,

    padding: 12,
  },

  macroItem: {
    flex: 1,

    minWidth: 0,

    minHeight: 78,

    borderRadius: 12,

    borderWidth: 1,

    paddingHorizontal: 8,
    paddingVertical: 11,

    alignItems: 'center',
    justifyContent: 'center',
  },

  macroAccent: {
    width: 20,
    height: 3,

    borderRadius: 2,

    marginBottom: 8,
  },

  macroValue: {
    fontSize: 16,
    lineHeight: 20,

    fontWeight: '800',

    textAlign: 'center',
  },

  macroLabel: {
    maxWidth: '100%',

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '600',

    marginTop: 4,

    textAlign: 'center',
  },

  /*
   * --------------------------------------------------------------------------
   * SHOW MORE
   * --------------------------------------------------------------------------
   */

  showMoreButton: {
    minHeight: 48,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,

    paddingHorizontal: 16,

    borderTopWidth:
      StyleSheet.hairlineWidth,
  },

  showMoreText: {
    fontSize: 13,
    lineHeight: 18,

    fontWeight: '700',
  },

  chevronWrap: {
    width: 26,
    height: 26,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },
});