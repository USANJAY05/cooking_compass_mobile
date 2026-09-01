import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  useTheme,
  colors,
} from '../../theme';

import {
  NutritionItem,
  formatNutritionAmount,
  getNutritionItemColor,
} from '../../utils/nutrition';

interface NutritionSectionProps {
  title: string;
  items: NutritionItem[];
  variant?: 'hero' | 'cards' | 'grid';
}

/*
 * ============================================================================
 * NUTRITION COLORS
 * ============================================================================
 */

const colorMap: Record<
  string,
  string
> = {
  calories: colors.calories,
  protein: colors.protein,
  carbs: colors.carbs,
  fats: colors.fats,
};

/*
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */

export const NutritionSection: React.FC<
  NutritionSectionProps
> = ({
  title,
  items,
  variant = 'grid',
}) => {
  const { theme } = useTheme();

  if (!items?.length) {
    return null;
  }

  /*
   * ========================================================================
   * ACCENT HELPER
   * ========================================================================
   */

  const getAccent = (
    item: NutritionItem,
  ) => {
    const colorKey =
      getNutritionItemColor(
        item.code,
      );

    return colorKey
      ? colorMap[colorKey]
      : theme.colors.primary;
  };

  /*
   * ========================================================================
   * RENDER
   * ========================================================================
   */

  return (
    <View
      style={styles.section}
    >
      {/* ================================================================== */}
      {/* TITLE                                                              */}
      {/* ================================================================== */}

      {title ? (
        <Text
          style={[
            styles.title,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          {title}
        </Text>
      ) : null}

      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}

      {variant === 'hero' ? (
        <View
          style={styles.heroList}
        >
          {items.map((item) => {
            const accent =
              getAccent(item);

            return (
              <View
                key={`${item.code}-${item.name}`}
                style={[
                  styles.heroItem,
                  {
                    backgroundColor:
                      accent + '0D',
                    borderColor:
                      accent + '24',
                  },
                ]}
              >
                <View
                  style={[
                    styles.heroAccent,
                    {
                      backgroundColor:
                        accent,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.heroValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatNutritionAmount(
                    item.amount,
                    item.unit,
                  )}
                </Text>

                <Text
                  style={[
                    styles.heroLabel,
                    {
                      color:
                        theme.colors
                          .textMuted,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* ================================================================== */}
      {/* CARDS                                                              */}
      {/* ================================================================== */}

      {variant === 'cards' ? (
        <View
          style={styles.cardsRow}
        >
          {items.map((item) => {
            const accent =
              getAccent(item);

            return (
              <View
                key={`${item.code}-${item.name}`}
                style={[
                  styles.cardItem,
                  {
                    backgroundColor:
                      accent + '0D',
                    borderColor:
                      accent + '24',
                  },
                ]}
              >
                <View
                  style={[
                    styles.cardAccent,
                    {
                      backgroundColor:
                        accent,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.cardValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatNutritionAmount(
                    item.amount,
                    item.unit,
                  )}
                </Text>

                <Text
                  style={[
                    styles.cardLabel,
                    {
                      color:
                        theme.colors
                          .textMuted,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* ================================================================== */}
      {/* GRID                                                               */}
      {/* ================================================================== */}

      {variant === 'grid' ? (
        <View
          style={styles.grid}
        >
          {items.map((item) => {
            const accent =
              getAccent(item);

            return (
              <View
                key={`${item.code}-${item.name}`}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor:
                      theme.colors
                        .surface,

                    borderColor:
                      theme.colors
                        .border,
                  },
                ]}
              >
                <View
                  style={styles.gridHeader}
                >
                  <View
                    style={[
                      styles.gridDot,
                      {
                        backgroundColor:
                          accent,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.gridLabel,
                      {
                        color:
                          theme.colors
                            .textMuted,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.gridValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatNutritionAmount(
                    item.amount,
                    item.unit,
                  )}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
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
   * SECTION
   * --------------------------------------------------------------------------
   */

  section: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  /*
   * --------------------------------------------------------------------------
   * TITLE
   * --------------------------------------------------------------------------
   */

  title: {
    fontSize: 15,
    lineHeight: 20,

    fontWeight: '800',

    marginBottom: 12,
  },

  /*
   * --------------------------------------------------------------------------
   * HERO
   * --------------------------------------------------------------------------
   */

  heroList: {
    gap: 10,
  },

  heroItem: {
    minHeight: 96,

    borderRadius: 12,

    borderWidth: 1,

    paddingHorizontal: 16,
    paddingVertical: 14,

    justifyContent: 'center',
  },

  heroAccent: {
    width: 24,
    height: 3,

    borderRadius: 2,

    marginBottom: 9,
  },

  heroValue: {
    fontSize: 26,
    lineHeight: 31,

    fontWeight: '800',

    letterSpacing: -0.3,
  },

  heroLabel: {
    fontSize: 12,
    lineHeight: 17,

    fontWeight: '600',

    marginTop: 3,
  },

  /*
   * --------------------------------------------------------------------------
   * CARDS
   * --------------------------------------------------------------------------
   */

  cardsRow: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 8,
  },

  cardItem: {
    flexGrow: 1,
    flexBasis: '30%',

    minWidth: 96,
    minHeight: 82,

    borderRadius: 12,

    borderWidth: 1,

    paddingHorizontal: 10,
    paddingVertical: 11,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cardAccent: {
    width: 20,
    height: 3,

    borderRadius: 2,

    marginBottom: 8,
  },

  cardValue: {
    fontSize: 16,
    lineHeight: 20,

    fontWeight: '800',

    textAlign: 'center',
  },

  cardLabel: {
    maxWidth: '100%',

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '600',

    marginTop: 4,

    textAlign: 'center',
  },

  /*
   * --------------------------------------------------------------------------
   * GRID
   * --------------------------------------------------------------------------
   */

  grid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 8,
  },

  gridItem: {
    width: '48%',

    minHeight: 72,

    borderRadius: 12,

    borderWidth: 1,

    paddingHorizontal: 12,
    paddingVertical: 11,

    justifyContent: 'center',
  },

  gridHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    minWidth: 0,

    marginBottom: 5,
  },

  gridDot: {
    width: 7,
    height: 7,

    borderRadius: 4,

    marginRight: 7,

    flexShrink: 0,
  },

  gridLabel: {
    flex: 1,

    fontSize: 11,
    lineHeight: 15,

    fontWeight: '600',
  },

  gridValue: {
    fontSize: 15,
    lineHeight: 20,

    fontWeight: '800',
  },
});