import React, { useMemo, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {
  ShoppingCart,
  CalendarDays,
  RotateCcw,
  AlertTriangle,
  Check,
  Sparkles,
} from 'lucide-react-native';

import { useCart } from '../api/cart';
import { CartItemRow } from '../components/CartItemRow';
import { CartItemComponent } from '../api/types';
import { useTheme, colors, Theme } from '../theme';


// ============================================================
// DAY OPTIONS
// ============================================================

const DAY_OPTIONS = [1, 2, 3, 5, 7];


// ============================================================
// CATEGORY ACCENTS
// ============================================================

const CATEGORY_ACCENTS = [
  colors.protein,
  colors.carbs,
  colors.fats,
  colors.calories,
  colors.secondary,
];

const getCategoryAccent = (
  categoryName: string,
  theme: Theme,
) => {
  if (categoryName === 'General Pantry') {
    return theme.colors.primary;
  }

  const colorIndex =
    categoryName
      .split('')
      .reduce(
        (sum, char) =>
          sum + char.charCodeAt(0),
        0,
      ) % CATEGORY_ACCENTS.length;

  return CATEGORY_ACCENTS[colorIndex];
};



// ============================================================
// CART ITEM SKELETON
//
// IMPORTANT:
// This skeleton is rendered only inside the scrollable item area.
// The fixed header, shopping period selector, progress and controls
// remain visible while the first cart request is loading.
// ============================================================

const CartItemsSkeleton = ({
  theme,
}: {
  theme: Theme;
}) => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCategoryHeader}>
        <View
          style={[
            styles.skeletonDot,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

        <View
          style={[
            styles.skeletonCategoryTitle,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

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
            styles.skeletonItem,
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
              styles.skeletonCheckbox,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />

          <View style={styles.skeletonItemContent}>
            <View
              style={[
                styles.skeletonLine,
                {
                  width:
                    item % 2 === 0
                      ? '65%'
                      : '78%',
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
                      ? '30%'
                      : '42%',
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.skeletonQuantity,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />
        </View>
      ))}

      <View
        style={[
          styles.skeletonCategoryHeader,
          styles.skeletonSecondHeader,
        ]}
      >
        <View
          style={[
            styles.skeletonDot,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

        <View
          style={[
            styles.skeletonCategoryTitle,
            styles.skeletonCategoryTitleShort,
            {
              backgroundColor:
                theme.colors.border,
            },
          ]}
        />

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

      {[6, 7, 8].map((item) => (
        <View
          key={item}
          style={[
            styles.skeletonItem,
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
              styles.skeletonCheckbox,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          />

          <View style={styles.skeletonItemContent}>
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
                  width: '36%',
                  backgroundColor:
                    theme.colors.border,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.skeletonQuantity,
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

// ============================================================
// CART SCREEN
// ============================================================

export const CartScreen = () => {
  const { theme } = useTheme();

  const [days, setDays] = useState(7);

  const [checkedIds, setCheckedIds] =
    useState<number[]>([]);

  const {
    data: cartData,
    isLoading,
    isFetching,
    error,
    refetch,
    isRefetching,
  } = useCart(days);

  const items = useMemo(
    () => cartData?.items || [],
    [cartData?.items],
  );

  const isSwitchingDays =
    isFetching &&
    !isLoading &&
    !isRefetching;


  // ==========================================================
  // CHECK ITEM
  // ==========================================================

  const toggleCheck = (
    ingredientId: number,
  ) => {
    setCheckedIds((previous) => {
      if (previous.includes(ingredientId)) {
        return previous.filter(
          (id) => id !== ingredientId,
        );
      }

      return [
        ...previous,
        ingredientId,
      ];
    });
  };


  // ==========================================================
  // RESET
  // ==========================================================

  const resetChecked = () => {
    setCheckedIds([]);
  };


  // ==========================================================
  // GROUP ITEMS
  // ==========================================================

  const groupedItems = useMemo(() => {
    const groups: Record<
      string,
      CartItemComponent[]
    > = {};

    items.forEach((item) => {
      const category =
        item.category_name ||
        'General Pantry';

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
    });

    return groups;
  }, [items]);


  const generalPantryItems =
    groupedItems['General Pantry'] || [];


  const otherCategories =
    Object.entries(groupedItems).filter(
      ([categoryName]) =>
        categoryName !== 'General Pantry',
    );


  // ==========================================================
  // PROGRESS
  // ==========================================================

  const totalCount = items.length;

  const checkedCount = items.filter(
    (item) =>
      checkedIds.includes(
        item.ingredient_id,
      ),
  ).length;

  const progressPercentage =
    totalCount > 0
      ? Math.round(
          (checkedCount /
            totalCount) *
            100,
        )
      : 0;

  const isComplete =
    totalCount > 0 &&
    checkedCount === totalCount;
  // ==========================================================
  // ERROR
  // ==========================================================

  // ==========================================================

  if (error && !cartData) {
    return (
      <View style={[styles.errorState, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.errorCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.errorIcon, { backgroundColor: colors.error + '12' }]}>
            <AlertTriangle size={26} color={colors.error} strokeWidth={2.1} />
          </View>
          <View style={styles.errorCopy}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Couldn&apos;t load your list
          </Text>
            <Text style={[styles.errorDescription, { color: theme.colors.textMuted }]}>
              We couldn&apos;t connect to the server to load your shopping list. Check your connection and try again.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          >
            <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  // ==========================================================
  // CATEGORY HEADER
  // ==========================================================

  const renderCategoryHeader = (
    categoryName: string,
    categoryItems: CartItemComponent[],
  ) => {
    const categoryChecked =
      categoryItems.filter((item) =>
        checkedIds.includes(
          item.ingredient_id,
        ),
      ).length;

    const categoryTotal =
      categoryItems.length;

    const categoryDone =
      categoryChecked ===
      categoryTotal;

    const categoryPercentage =
      categoryTotal > 0
        ? Math.round(
            (categoryChecked /
              categoryTotal) *
              100,
          )
        : 0;

    const isGeneralPantry =
      categoryName ===
      'General Pantry';

    const accent =
      getCategoryAccent(
        categoryName,
        theme,
      );

    return (
      <>
        <View
          style={styles.categoryHeader}
        >
          <View
            style={
              styles.categoryTitleArea
            }
          >
            <View
              style={
                styles.categoryTitleRow
              }
            >
              <View
                style={[
                  styles.categoryAccentDot,
                  {
                    backgroundColor:
                      accent,
                  },
                ]}
              />

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.categoryTitle,
                  {
                    color:
                      theme.colors.text,
                  },
                ]}
              >
                {categoryName}
              </Text>

              {!isGeneralPantry &&
              categoryDone ? (
                <View
                  style={[
                    styles.categoryDoneIcon,
                    {
                      backgroundColor:
                        accent,
                    },
                  ]}
                >
                  <Check
                    size={10}
                    color="#FFFFFF"
                    strokeWidth={3}
                  />
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.categoryMeta,
                {
                  color:
                    theme.colors.textMuted,
                },
              ]}
            >
              {`${categoryChecked} of ${categoryTotal} checked`}
            </Text>
          </View>

          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor:
                  !isGeneralPantry &&
                  categoryDone
                    ? accent
                    : accent + '14',

                borderColor:
                  accent + '35',
              },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                {
                  color:
                    !isGeneralPantry &&
                    categoryDone
                      ? '#FFFFFF'
                      : accent,
                },
              ]}
            >
              {categoryTotal}
            </Text>
          </View>
        </View>

        {!isGeneralPantry &&
        !categoryDone &&
        categoryChecked > 0 ? (
          <View
            style={[
              styles.categoryTrack,
              {
                backgroundColor:
                  theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.categoryFill,
                {
                  width:
                    `${categoryPercentage}%`,
                  backgroundColor:
                    accent,
                },
              ]}
            />
          </View>
        ) : null}
      </>
    );
  };


  // ==========================================================
  // ITEMS
  //
  // IMPORTANT:
  // Transparent parent.
  // Every CartItemRow is an individual card.
  // ==========================================================

  const renderItems = (
    categoryItems: CartItemComponent[],
    categoryName: string,
  ) => {
    const accent =
      getCategoryAccent(
        categoryName,
        theme,
      );

    return (
      <View
        style={styles.itemsContainer}
      >
        {categoryItems.map((item) => (
          <CartItemRow
            key={item.ingredient_id}
            item={item}
            accentColor={accent}
            isChecked={checkedIds.includes(
              item.ingredient_id,
            )}
            onToggle={() =>
              toggleCheck(
                item.ingredient_id,
              )
            }
          />
        ))}
      </View>
    );
  };


  // ==========================================================
  // MAIN
  // ==========================================================

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

      {/* ======================================================
          FIXED TOP
      ====================================================== */}

      <View style={styles.fixedTop}>
        <View
          style={[
            styles.shoppingPeriodSection,
            {
              backgroundColor:
                theme.colors.surface,
              borderColor:
                theme.colors.border,
            },
          ]}
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <View
            style={styles.shoppingHeader}
          >

            {/* LEFT SIDE */}

            <View
              style={
                styles.shoppingHeaderLeft
              }
            >
              <View
                style={[
                  styles.shoppingIcon,
                  {
                    backgroundColor:
                      theme.colors.primary +
                      '14',
                  },
                ]}
              >
                <CalendarDays
                  size={17}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.shoppingHeaderText
                }
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.shoppingTitle,
                    {
                      color:
                        theme.colors.text,
                    },
                  ]}
                >
                  Shopping period
                </Text>

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.shoppingSubtitle,
                    {
                      color:
                        theme.colors.textMuted,
                    },
                  ]}
                >
                  Choose your planning window
                </Text>
              </View>
            </View>


            {/* RIGHT SIDE */}

            <View
              style={
                styles.shoppingActions
              }
            >
              {/* PROGRESS */}

              <View
                style={[
                  styles.progressNumber,
                  {
                    backgroundColor:
                      theme.colors.primary +
                      '12',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressNumberValue,
                    {
                      color:
                        theme.colors.primary,
                    },
                  ]}
                >
                  {progressPercentage}%
                </Text>
              </View>


              {/* RESET */}

              {checkedCount > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={resetChecked}
                  style={[
                    styles.resetButton,
                    {
                      borderColor:
                        theme.colors.border,

                      backgroundColor:
                        theme.colors.background,
                    },
                  ]}
                >
                  <RotateCcw
                    size={12}
                    color={
                      theme.colors.textMuted
                    }
                    strokeWidth={2}
                  />

                  <Text
                    style={[
                      styles.resetText,
                      {
                        color:
                          theme.colors.textMuted,
                      },
                    ]}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>


          {/* ==================================================
              DAY SELECTOR
          ================================================== */}

          <View
            style={styles.daysSection}
          >
            <View
              style={styles.daySelector}
            >
              {DAY_OPTIONS.map(
                (option) => {
                  const selected =
                    days === option;

                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.75}
                      disabled={
                        isSwitchingDays
                      }
                      onPress={() =>
                        setDays(option)
                      }
                      style={[
                        styles.dayButton,
                        {
                          backgroundColor:
                            theme.colors
                              .background,

                          borderColor:
                            theme.colors
                              .border,
                        },

                        selected && {
                          backgroundColor:
                            theme.colors
                              .primary,

                          borderColor:
                            theme.colors
                              .primary,
                        },

                        isSwitchingDays &&
                        !selected && {
                          opacity: 0.4,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          {
                            color: selected
                              ? '#FFFFFF'
                              : theme.colors
                                  .text,
                          },
                        ]}
                      >
                        {option}
                      </Text>

                      <Text
                        style={[
                          styles.dayLabel,
                          {
                            color: selected
                              ? '#FFFFFF'
                              : theme.colors
                                  .textMuted,
                          },
                        ]}
                      >
                        {option === 1
                          ? 'day'
                          : 'days'}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>


            {/* OVERALL PROGRESS */}

            {totalCount > 0 ? (
              <View
                style={[
                  styles.overallProgressTrack,
                  {
                    backgroundColor:
                      theme.colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.overallProgressFill,
                    {
                      width:
                        `${progressPercentage}%`,
                      backgroundColor:
                        theme.colors.primary,
                    },
                  ]}
                />
              </View>
            ) : null}


            {/* SWITCHING */}

            {isSwitchingDays ? (
              <View
                style={styles.loadingRow}
              >
                <ActivityIndicator
                  size="small"
                  color={
                    theme.colors.primary
                  }
                />

                <Text
                  style={[
                    styles.loadingRowText,
                    {
                      color:
                        theme.colors.primary,
                    },
                  ]}
                >
                  Updating list...
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>


      {/* ======================================================
          SCROLL CONTENT
      ====================================================== */}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
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
          />
        }
      >

        {/* ====================================================
            ITEM CONTENT
        ==================================================== */}

        {isLoading && !cartData ? (
          /*
           * Initial request:
           * keep the whole Cart screen mounted and show loading
           * only where the cart items will appear.
           */
          <CartItemsSkeleton theme={theme} />
        ) : (
          <>
            {/* ====================================================
                GENERAL PANTRY
            ==================================================== */}

            {generalPantryItems.length > 0 ? (
              <View
                style={styles.category}
              >
                {renderCategoryHeader(
                  'General Pantry',
                  generalPantryItems,
                )}

                {renderItems(
                  generalPantryItems,
                  'General Pantry',
                )}
              </View>
            ) : null}

            {/* ====================================================
                OTHER CATEGORIES
            ==================================================== */}

            {otherCategories.length > 0 ? (
              <View
                style={styles.otherCategories}
              >
                {otherCategories.map(
                  ([
                    categoryName,
                    categoryItems,
                  ]) => (
                    <View
                      key={categoryName}
                      style={styles.category}
                    >
                      {renderCategoryHeader(
                        categoryName,
                        categoryItems,
                      )}

                      {renderItems(
                        categoryItems,
                        categoryName,
                      )}
                    </View>
                  ),
                )}
              </View>
            ) : null}

            {/* ====================================================
                EMPTY STATE
            ==================================================== */}

            {totalCount === 0 ? (
              <View style={styles.empty}>
                <View
                  style={[
                    styles.emptyIcon,
                    {
                      backgroundColor:
                        theme.colors.primary +
                        '10',
                    },
                  ]}
                >
                  <ShoppingCart
                    size={30}
                    color={
                      theme.colors.primary
                    }
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
                  Nothing to shop for
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
                  Add meal routines and your
                  required ingredients will
                  automatically appear here.
                </Text>
              </View>
            ) : null}

            {/* ====================================================
                COMPLETE
            ==================================================== */}

            {isComplete ? (
              <View
                style={[
                  styles.successCard,
                  {
                    backgroundColor:
                      theme.colors.primary +
                      '0D',

                    borderColor:
                      theme.colors.primary +
                      '20',
                  },
                ]}
              >
                <View
                  style={[
                    styles.successIcon,
                    {
                      backgroundColor:
                        theme.colors.primary,
                    },
                  ]}
                >
                  <Sparkles
                    size={17}
                    color="#FFFFFF"
                    strokeWidth={2.2}
                  />
                </View>

                <View
                  style={
                    styles.successContent
                  }
                >
                  <Text
                    style={[
                      styles.successTitle,
                      {
                        color:
                          theme.colors.text,
                      },
                    ]}
                  >
                    Shopping complete!
                  </Text>

                  <Text
                    style={[
                      styles.successText,
                      {
                        color:
                          theme.colors.textMuted,
                      },
                    ]}
                  >
                    You&apos;ve got everything on
                    your list. Nice work.
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  // ==========================================================
  // ROOT
  // ==========================================================

  container: {
    flex: 1,
  },


  // ==========================================================
  // FIXED TOP
  // ==========================================================

  fixedTop: {
    flexGrow: 0,
    flexShrink: 0,

    paddingHorizontal: 16,
    paddingTop: 14,
  },


  // ==========================================================
  // SHOPPING PERIOD
  // ==========================================================

  shoppingPeriodSection: {
    borderWidth: 1,
    borderRadius: 18,

    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,

    marginBottom: 14,

    overflow: 'hidden',
  },


  // ==========================================================
  // HEADER
  //
  // FIX:
  // Header cannot grow when Reset appears.
  // ==========================================================

  shoppingHeader: {
    width: '100%',

    minHeight: 36,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },


  shoppingHeaderLeft: {
    flex: 1,
    minWidth: 0,

    flexDirection: 'row',
    alignItems: 'center',

    marginRight: 8,
  },


  shoppingIcon: {
    width: 36,
    height: 36,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },


  shoppingHeaderText: {
    flex: 1,
    minWidth: 0,

    marginLeft: 9,
  },


  shoppingTitle: {
    fontSize: 15,
    lineHeight: 20,

    fontWeight: '800',
  },


  shoppingSubtitle: {
    fontSize: 11,
    lineHeight: 15,

    fontWeight: '500',

    marginTop: 1,
  },


  // ==========================================================
  // RIGHT ACTIONS
  //
  // FIX:
  // Never shrink / wrap.
  // ==========================================================

  shoppingActions: {
    flexDirection: 'row',
    alignItems: 'center',

    flexShrink: 0,

    marginLeft: 4,
  },


  progressNumber: {
    width: 44,
    height: 32,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },


  progressNumberValue: {
    fontSize: 13,
    lineHeight: 17,

    fontWeight: '900',
  },


  resetButton: {
    height: 32,

    minWidth: 62,

    paddingHorizontal: 8,

    borderRadius: 10,
    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 6,

    flexShrink: 0,
  },


  resetText: {
    fontSize: 11,
    lineHeight: 15,

    fontWeight: '700',

    marginLeft: 4,
  },


  // ==========================================================
  // DAYS
  // ==========================================================

  daysSection: {
    marginTop: 14,
  },


  daySelector: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },


  dayButton: {
    flex: 1,

    height: 44,

    borderRadius: 10,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    minWidth: 0,
  },


  dayNumber: {
    fontSize: 14,
    lineHeight: 18,

    fontWeight: '800',
  },


  dayLabel: {
    fontSize: 11,
    lineHeight: 14,

    fontWeight: '600',

    marginLeft: 2,
  },


  // ==========================================================
  // OVERALL PROGRESS
  // ==========================================================

  overallProgressTrack: {
    height: 5,

    borderRadius: 999,

    overflow: 'hidden',

    marginTop: 12,
  },


  overallProgressFill: {
    height: '100%',

    borderRadius: 999,
  },


  // ==========================================================
  // LOADING ROW
  // ==========================================================

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 8,
  },


  loadingRowText: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '700',

    marginLeft: 6,
  },


  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollArea: {
    flex: 1,
  },


  scrollContent: {
    paddingHorizontal: 16,

    paddingTop: 2,
    paddingBottom: 28,
  },


  // ==========================================================
  // CATEGORY
  // ==========================================================

  category: {
    width: '100%',
  },


  otherCategories: {
    width: '100%',

    marginTop: 24,

    gap: 24,
  },


  // ==========================================================
  // CATEGORY HEADER
  // ==========================================================

  categoryHeader: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 2,

    marginBottom: 11,
  },


  categoryTitleArea: {
    flex: 1,
    minWidth: 0,
  },


  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    minWidth: 0,
  },


  categoryAccentDot: {
    width: 8,
    height: 8,

    borderRadius: 999,

    marginRight: 8,

    flexShrink: 0,
  },


  categoryTitle: {
    fontSize: 16,
    lineHeight: 21,

    fontWeight: '800',

    flexShrink: 1,
  },


  categoryDoneIcon: {
    width: 20,
    height: 20,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 7,

    flexShrink: 0,
  },


  categoryMeta: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '500',

    marginTop: 2,
  },


  categoryBadge: {
    minWidth: 32,
    height: 28,

    paddingHorizontal: 8,

    borderRadius: 10,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 12,

    flexShrink: 0,
  },


  categoryBadgeText: {
    fontSize: 12,
    lineHeight: 16,

    fontWeight: '800',
  },


  // ==========================================================
  // CATEGORY PROGRESS
  // ==========================================================

  categoryTrack: {
    height: 4,

    borderRadius: 999,

    overflow: 'hidden',

    marginBottom: 8,
  },


  categoryFill: {
    height: '100%',

    borderRadius: 999,
  },


  // ==========================================================
  // ITEMS
  //
  // IMPORTANT:
  // Completely transparent parent.
  // CartItemRow owns the card.
  // ==========================================================

  itemsContainer: {
    width: '100%',
  },


  // ==========================================================
  // ITEM SKELETON
  // ==========================================================

  skeletonContainer: {
    width: '100%',
    paddingTop: 8,
  },

  skeletonCategoryHeader: {
    width: '100%',
    height: 34,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 10,
    paddingHorizontal: 2,
  },

  skeletonDot: {
    width: 8,
    height: 8,
    borderRadius: 999,

    marginRight: 8,
  },

  skeletonCategoryTitle: {
    width: '38%',
    height: 14,
    borderRadius: 7,
  },

  skeletonCategoryTitleShort: {
    width: '30%',
  },

  skeletonBadge: {
    width: 32,
    height: 28,
    borderRadius: 10,

    marginLeft: 'auto',
  },

  skeletonItem: {
    width: '100%',
    minHeight: 68,

    borderRadius: 14,
    borderWidth: 1,

    marginBottom: 10,
    paddingHorizontal: 14,

    flexDirection: 'row',
    alignItems: 'center',
  },

  skeletonCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 7,

    flexShrink: 0,
  },

  skeletonItemContent: {
    flex: 1,
    minWidth: 0,

    marginLeft: 12,
    marginRight: 12,
  },

  skeletonLine: {
    height: 11,
    borderRadius: 6,
  },

  skeletonSmallLine: {
    height: 8,
    marginTop: 8,
  },

  skeletonQuantity: {
    width: 42,
    height: 25,
    borderRadius: 8,

    flexShrink: 0,
  },

  skeletonSecondHeader: {
    marginTop: 14,
  },

  // ==========================================================
  // SUCCESS
  // ==========================================================

  successCard: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 18,
    borderWidth: 1,

    padding: 14,

    marginTop: 24,
  },


  successIcon: {
    width: 38,
    height: 38,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },


  successContent: {
    flex: 1,
    minWidth: 0,

    marginLeft: 10,
  },


  successTitle: {
    fontSize: 15,
    lineHeight: 20,

    fontWeight: '800',
  },


  successText: {
    fontSize: 12,
    lineHeight: 17,

    fontWeight: '500',

    marginTop: 1,
  },


  // ==========================================================
  // EMPTY
  // ==========================================================

  empty: {
    alignItems: 'center',

    paddingHorizontal: 28,
    paddingTop: 55,
  },


  emptyIcon: {
    width: 64,
    height: 64,

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 17,
  },


  emptyTitle: {
    fontSize: 20,
    lineHeight: 26,

    fontWeight: '800',

    textAlign: 'center',

    marginBottom: 7,
  },


  emptyText: {
    fontSize: 12,
    lineHeight: 19,

    textAlign: 'center',

    maxWidth: 300,

    fontWeight: '500',
  },


  // ==========================================================
  // ERROR
  // ==========================================================

  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  errorCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },

  errorIcon: {
    width: 68,
    height: 68,

    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',
  },


  errorCopy: {
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
  },

  errorTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    textAlign: 'center',
  },


  errorDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 7,
  },


  retryButton: {
    minHeight: 46,
    minWidth: 132,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },


  retryText: {
    color: '#FFFFFF',

    fontSize: 13,

    fontWeight: '800',
  },


  // ==========================================================
  // BOTTOM
  // ==========================================================

  bottomSpace: {
    height: 20,
  },
});