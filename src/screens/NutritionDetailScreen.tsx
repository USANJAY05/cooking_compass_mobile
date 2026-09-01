import React, { useMemo, useState } from 'react';

import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import {
  Flame,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from 'lucide-react-native';

import { useTheme, colors } from '../theme';

import {
  NutritionData,
  formatNutritionAmount,
  getSummaryNutritionItems,
  hasNutritionContent,
  prepareNutritionBreakdown,
  normalizeNutritionItemName,
} from '../utils/nutrition';

const MICRO_PREVIEW_COUNT = 6;
const OTHER_PREVIEW_COUNT = 6;

const KCAL_PER_GRAM: Record<string, number> = {
  PROTEIN: 4,
  CARBS: 4,
  FAT: 9,
};

export const NutritionDetailScreen = ({
  route,
  navigation,
}: any) => {
  const {
    recipeName,
    nutrition,
    scale = 1,
    portionLabel,
  } = route.params || {};

  const { theme } = useTheme();

  const [nutritionQuery, setNutritionQuery] = useState('');
  const [microsExpanded, setMicrosExpanded] = useState(false);
  const [otherExpanded, setOtherExpanded] = useState(false);

  const breakdown = prepareNutritionBreakdown(
    nutrition as NutritionData,
    scale,
  );

  // Must run on every render, before any conditional return.
  const normalizedQuery = nutritionQuery.trim().toLowerCase();

  const matchesNutritionQuery = (item: any) => {
    if (!normalizedQuery) return true;

    const name = String(item.name ?? '').toLowerCase();
    const code = String(item.code ?? '').toLowerCase();

    return (
      name.includes(normalizedQuery) ||
      code.includes(normalizedQuery)
    );
  };

  const filteredMacros = useMemo(
    () => breakdown.macros.filter(matchesNutritionQuery),
    [breakdown.macros, normalizedQuery],
  );

  const filteredMicros = useMemo(
    () => breakdown.micros.filter(matchesNutritionQuery),
    [breakdown.micros, normalizedQuery],
  );

  const filteredOther = useMemo(
    () => breakdown.other.filter(matchesNutritionQuery),
    [breakdown.other, normalizedQuery],
  );

  if (!hasNutritionContent(breakdown)) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.textMuted,
          }}
        >
          No nutrition data available.
        </Text>
      </View>
    );
  }

  const summaryItems = getSummaryNutritionItems(breakdown);

  const findItem = (
    codes: string[],
    names: string[],
  ) =>
    summaryItems.find(item => {
      const code = String(item.code).toUpperCase();
      const name = String(item.name).toUpperCase();

      return (
        codes.includes(code) ||
        names.includes(name)
      );
    });

  const caloriesItem = findItem(
    ['CALORIES', 'CALORIE', 'ENERGY', 'KCAL'],
    ['CALORIES', 'CALORIE', 'ENERGY'],
  );

  const proteinItem = findItem(
    ['PROTEIN', 'PROTEIN_G'],
    ['PROTEIN'],
  );

  const carbsItem = findItem(
    ['CARBS', 'CARBOHYDRATES', 'CARBOHYDRATE'],
    ['CARBS', 'CARBOHYDRATES', 'CARBOHYDRATE'],
  );

  const fatItem = findItem(
    ['FAT', 'TOTAL_FAT', 'TOTAL FAT'],
    ['FAT', 'TOTAL FAT'],
  );

  const macroItems = [
    proteinItem,
    carbsItem,
    fatItem,
  ].filter(Boolean);

  const macroGramTotal = macroItems.reduce(
    (sum, item) => sum + (item?.amount || 0),
    0,
  );

  const allGrams =
    macroItems.length > 0 &&
    macroItems.every(
      item =>
        String(item?.unit).toLowerCase() === 'g',
    );

  const macroKcal = [
    proteinItem,
    carbsItem,
    fatItem,
  ].map(item => {
    const code = String(item?.code || '').toUpperCase();

    const key =
      code.includes('PROTEIN')
        ? 'PROTEIN'
        : code.includes('CARB')
          ? 'CARBS'
          : 'FAT';

    return (
      (item?.amount || 0) *
      (KCAL_PER_GRAM[key] ?? 0)
    );
  });

  const macroKcalTotal = macroKcal.reduce(
    (a, b) => a + b,
    0,
  );

  const visibleMicros =
    microsExpanded || normalizedQuery
      ? filteredMicros
      : filteredMicros.slice(0, MICRO_PREVIEW_COUNT);

  const visibleOther =
    otherExpanded || normalizedQuery
      ? filteredOther
      : filteredOther.slice(0, OTHER_PREVIEW_COUNT);

  const renderNutritionRow = (
    item: any,
    index: number,
    total: number,
  ) => (
    <View
      key={`${item.code}-${index}`}
      style={[
        styles.nutritionRow,
        index < total - 1 && {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text
        style={[
          styles.nutritionName,
          {
            color: theme.colors.text,
          },
        ]}
        numberOfLines={1}
      >
        {normalizeNutritionItemName(item)}
      </Text>

      <Text
        style={[
          styles.nutritionValue,
          {
            color: theme.colors.textMuted,
          },
        ]}
      >
        {formatNutritionAmount(
          item.amount,
          item.unit,
        )}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <View style={styles.topHeader}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft
            size={20}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text
            style={[
              styles.pageTitle,
              {
                color: theme.colors.text,
              },
            ]}
          >
            {recipeName || 'Full Nutrition'}
          </Text>
        </View>
      </View>

      {portionLabel ? (
        <Text
          style={[
            styles.portionText,
            {
              color: theme.colors.primary,
            },
          ]}
        >
          {portionLabel}
        </Text>
      ) : null}

      <View
        style={[
          styles.searchBox,
          {
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Search
          size={17}
          color={theme.colors.textMuted}
        />

        <TextInput
          value={nutritionQuery}
          onChangeText={setNutritionQuery}
          placeholder="Search nutrition"
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.searchInput,
            { color: theme.colors.text },
          ]}
        />

        {nutritionQuery.length > 0 ? (
          <TouchableOpacity
            onPress={() => setNutritionQuery('')}
            activeOpacity={0.7}
          >
            <X size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* CALORIES */}

      {caloriesItem ? (
        <View
          style={[
            styles.caloriesSection,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.calorieTopRow}>
            <View
              style={[
                styles.calorieIcon,
                {
                  backgroundColor:
                    colors.calories + '18',
                },
              ]}
            >
              <Flame
                size={21}
                color={colors.calories}
              />
            </View>

            <View style={styles.calorieContent}>
              <Text
                style={[
                  styles.calorieValue,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                {formatNutritionAmount(
                  caloriesItem.amount,
                  caloriesItem.unit,
                )}
              </Text>

              <Text
                style={[
                  styles.calorieLabel,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                Total Energy
              </Text>
            </View>
          </View>

          {macroGramTotal > 0 ? (
            <>
              <View style={styles.distributionBar}>
                {[
                  proteinItem,
                  carbsItem,
                  fatItem,
                ].map((item, index) => {
                  const palette = [
                    colors.protein,
                    colors.carbs,
                    colors.fats,
                  ];

                  return (
                    <View
                      key={index}
                      style={{
                        flex:
                          (item?.amount || 0) /
                            macroGramTotal ||
                          0.0001,
                        backgroundColor:
                          palette[index],
                      }}
                    />
                  );
                })}
              </View>

              <View style={styles.distributionLegend}>
                {[
                  {
                    item: proteinItem,
                    label: 'Protein',
                    color: colors.protein,
                    kcal: macroKcal[0],
                  },
                  {
                    item: carbsItem,
                    label: 'Carbs',
                    color: colors.carbs,
                    kcal: macroKcal[1],
                  },
                  {
                    item: fatItem,
                    label: 'Fat',
                    color: colors.fats,
                    kcal: macroKcal[2],
                  },
                ]
                  .filter(entry => entry.item)
                  .map(entry => {
                    const pct =
                      allGrams && macroKcalTotal > 0
                        ? Math.round(
                            (entry.kcal /
                              macroKcalTotal) *
                              100,
                          )
                        : null;

                    return (
                      <View
                        key={entry.label}
                        style={
                          styles.distributionLegendItem
                        }
                      >
                        <View
                          style={[
                            styles.legendDot,
                            {
                              backgroundColor:
                                entry.color,
                            },
                          ]}
                        />

                        <Text
                          style={[
                            styles.legendText,
                            {
                              color:
                                theme.colors.textMuted,
                            },
                          ]}
                        >
                          {entry.label}
                          {pct !== null
                            ? ` · ${pct}%`
                            : ''}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      {/* ONE CONTINUOUS NUTRITION VIEW */}

      <View style={styles.nutritionView}>
        {/* MACROS */}

        {breakdown.macros.length > 0 ? (
          <View style={styles.group}>
            <View style={styles.groupHeader}>
              <Text
                style={[
                  styles.groupTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                Macros
              </Text>

              <Text
                style={[
                  styles.groupCount,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {breakdown.macros.length}
              </Text>
            </View>

            <View
              style={[
                styles.list,
                {
                  borderTopColor:
                    theme.colors.border,
                  borderBottomColor:
                    theme.colors.border,
                },
              ]}
            >
              {filteredMacros.map((item, index) =>
                renderNutritionRow(
                  item,
                  index,
                  filteredMacros.length,
                ),
              )}
            </View>
          </View>
        ) : null}

        {/* MICRONUTRIENTS */}

        {breakdown.micros.length > 0 ? (
          <View style={styles.group}>
            <View style={styles.groupHeader}>
              <Text
                style={[
                  styles.groupTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                Micros
              </Text>

              <Text
                style={[
                  styles.groupCount,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {filteredMicros.length}
              </Text>
            </View>

            {visibleMicros.length > 0 ? (
              <View
                style={[
                  styles.list,
                  {
                    borderTopColor:
                      theme.colors.border,
                    borderBottomColor:
                      theme.colors.border,
                  },
                ]}
              >
                {visibleMicros.map(
                  (item, index) =>
                    renderNutritionRow(
                      item,
                      index,
                      visibleMicros.length,
                    ),
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.noResultsText,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                No nutrition items match &quot;
                {nutritionQuery}&quot;.
              </Text>
            )}

            {!normalizedQuery &&
            filteredMicros.length >
              MICRO_PREVIEW_COUNT ? (
              <TouchableOpacity
                style={styles.showMoreRow}
                onPress={() =>
                  setMicrosExpanded(value => !value)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.showMoreText,
                    {
                      color: theme.colors.primary,
                    },
                  ]}
                >
                  {microsExpanded
                    ? 'Show less'
                    : `Show all ${filteredMicros.length}`}
                </Text>

                {microsExpanded ? (
                  <ChevronUp
                    size={15}
                    color={theme.colors.primary}
                  />
                ) : (
                  <ChevronDown
                    size={15}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* OTHER */}

        {breakdown.other.length > 0 ? (
          <View style={styles.group}>
            <View style={styles.groupHeader}>
              <Text
                style={[
                  styles.groupTitle,
                  {
                    color: theme.colors.text,
                  },
                ]}
              >
                Others
              </Text>

              <Text
                style={[
                  styles.groupCount,
                  {
                    color: theme.colors.textMuted,
                  },
                ]}
              >
                {filteredOther.length}
              </Text>
            </View>

            <View
              style={[
                styles.list,
                {
                  borderTopColor:
                    theme.colors.border,
                  borderBottomColor:
                    theme.colors.border,
                },
              ]}
            >
              {visibleOther.map(
                (item, index) =>
                  renderNutritionRow(
                    item,
                    index,
                    visibleOther.length,
                  ),
              )}
            </View>

            {!normalizedQuery && filteredOther.length >
            OTHER_PREVIEW_COUNT ? (
              <TouchableOpacity
                style={styles.showMoreRow}
                onPress={() =>
                  setOtherExpanded(value => !value)
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.showMoreText,
                    {
                      color: theme.colors.primary,
                    },
                  ]}
                >
                  {otherExpanded
                    ? 'Show less'
                    : `Show all ${breakdown.other.length}`}
                </Text>

                {otherExpanded ? (
                  <ChevronUp
                    size={15}
                    color={theme.colors.primary}
                  />
                ) : (
                  <ChevronDown
                    size={15}
                    color={theme.colors.primary}
                  />
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  /* HEADER */

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  pageTitle: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '800',
  },

  recipeName: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 1,
  },

  portionText: {
    alignSelf: 'flex-start',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginBottom: 16,
  },

  /* CALORIES */

  caloriesSection: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },

  calorieTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  calorieIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  calorieContent: {
    flex: 1,
  },

  calorieValue: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
  },

  calorieLabel: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },

  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },

  distributionLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  distributionLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  legendText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  /* SINGLE VIEW */

  nutritionView: {
    width: '100%',
  },

  group: {
    marginBottom: 22,
  },

  groupHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
  },

  groupTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  groupCount: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  nutritionRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 1,
  },

  nutritionName: {
    flex: 1,
    paddingRight: 16,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  nutritionValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  /* SEARCH */

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },

  noResultsText: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    paddingVertical: 12,
  },

  showMoreRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  showMoreText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
});