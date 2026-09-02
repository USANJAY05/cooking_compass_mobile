import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Easing,
} from 'react-native';

import {
  Clock,
  Users,
  Star,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Play,
  Pencil,
  Info,
} from 'lucide-react-native';

import {
  useRecipeDetail,
  useUpdateRecipe,
} from '../api/recipes';
import { useCategories } from '../api/categories';

import { PortionAdjuster } from '../components/PortionAdjuster';
import { RecipeRating } from '../components/recipe/RecipeRating';
import { RecipeNutrition } from '../components/recipe/RecipeNutrition';
import { RecipeCookingFlow } from '../components/RecipeCookingFlow';
import { RecipeRecordingFlow, RecordingStep } from '../components/RecipeRecordingFlow';
import { getRecipeCreationMode, RecipeCreationMode } from '../settings/RecipeCreationMode';
import { useInteractiveCookingSettings } from '../settings/InteractiveCookingSettings';

import {
  useTheme,
  colors,
} from '../theme';

import {
  getTotalWeightGrams,
  normalizePortionUnit,
  PortionMode,
  scaleIngredientQuantity,
} from '../utils/nutrition';

import { formatUnitLabel } from '../utils/quantity';

/*
 * ============================================================================
 * HELPERS
 * ============================================================================
 */

const convertPortionQuantity = (
  value: number,
  fromUnit: string,
  toUnit: string,
): number | null => {
  const from = normalizePortionUnit(fromUnit);
  const to = normalizePortionUnit(toUnit);

  const weightToGrams: Record<string, number> = {
    mg: 0.001,
    g: 1,
    kg: 1000,
    oz: 28.349523125,
  };

  const volumeToMl: Record<string, number> = {
    ml: 1,
    l: 1000,
  };

  if (from === to) return value;

  if (weightToGrams[from] && weightToGrams[to]) {
    return (value * weightToGrams[from]) / weightToGrams[to];
  }

  if (volumeToMl[from] && volumeToMl[to]) {
    return (value * volumeToMl[from]) / volumeToMl[to];
  }

  return null;
};


/*
 * ============================================================================
 * SCREEN
 * ============================================================================
 */

export const RecipeDetailScreen = ({
  route,
  navigation,
}: any) => {
  const {
    recipeId,
    initialPortionMode,
    initialPortionValue,
    initialPortionUnit,
  } = route.params || {};

  const { theme } = useTheme();
  const { isStrict: strictCooking } = useInteractiveCookingSettings();
  const updateRecipeMutation = useUpdateRecipe();
  const { data: categories = [] } = useCategories();

  const {
    data: recipe,
    isLoading,
    error,
    refetch,
  } = useRecipeDetail(recipeId);

  const rateMutation =
    useRateRecipe();

  /*
   * --------------------------------------------------------------------------
   * STATE
   * --------------------------------------------------------------------------
   */

  const [creationMode, setCreationMode] = useState<RecipeCreationMode>('normal');
  const [recordingVisible, setRecordingVisible] = useState(false);

  useEffect(() => {
    if (!recipe?.id) return;
    void getRecipeCreationMode(recipe.id).then(setCreationMode);
  }, [recipe?.id]);

  const [
    userRating,
    setUserRating,
  ] = useState<number | null>(null);

  const [
    portionMode,
    setPortionMode,
  ] = useState<PortionMode>(
    'servings',
  );

  const [
    portionValue,
    setPortionValue,
  ] = useState('1');

  const [
    checkedIngredients,
    setCheckedIngredients,
  ] = useState<
    Record<number, boolean>
  >({});

  const [
    completedSteps,
    setCompletedSteps,
  ] = useState<
    Record<number, boolean>
  >({});

  const [expandedTipStep, setExpandedTipStep] =
    useState<number | null>(null);

  const [
    cookModeVisible,
    setCookModeVisible,
  ] = useState(false);

  const [
    cookPhase,
    setCookPhase,
  ] = useState<
    'ingredients' | 'steps'
  >('ingredients');

  const [
    activeStepIndex,
    setActiveStepIndex,
  ] = useState(0);

  const [
    timerRemaining,
    setTimerRemaining,
  ] = useState<number | null>(
    null,
  );

  const [
    timerRunning,
    setTimerRunning,
  ] = useState(false);

  /*
   * --------------------------------------------------------------------------
   * ANIMATION
   * --------------------------------------------------------------------------
   */

  const pageOpacity =
    useRef(
      new Animated.Value(0),
    ).current;

  const pageTranslateY =
    useRef(
      new Animated.Value(12),
    ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        pageOpacity,
        {
          toValue: 1,
          duration: 280,
          easing:
            Easing.out(
              Easing.cubic,
            ),
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        pageTranslateY,
        {
          toValue: 0,
          duration: 280,
          easing:
            Easing.out(
              Easing.cubic,
            ),
          useNativeDriver: true,
        },
      ),
    ]).start();
  }, [
    pageOpacity,
    pageTranslateY,
  ]);

  /*
   * --------------------------------------------------------------------------
   * TIMER
   * --------------------------------------------------------------------------
   */

  const timerIntervalRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  useEffect(() => {
    if (!recipe) return;

    const recipeServings = Number(recipe.servings);
    const hasServings = Number.isFinite(recipeServings) && recipeServings > 0;
    const hasCookedQuantity =
      Number.isFinite(cookedQuantityAmount) && cookedQuantityAmount > 0;

    // When opened from a routine, preserve the user's saved portion as the
    // source value. The other mode is calculated from the recipe's own
    // servings/cooked quantity instead of falling back to a default.
    if (initialPortionMode && initialPortionValue != null) {
      const sourceValue = Number(initialPortionValue);

      if (Number.isFinite(sourceValue) && sourceValue > 0) {
        if (initialPortionMode === 'servings' && hasServings) {
          setPortionMode('servings');
          setPortionValue(String(Math.round(sourceValue * 100) / 100));
          return;
        }

        if (initialPortionMode === 'quantity' && hasCookedQuantity) {
          const converted = convertPortionQuantity(
            sourceValue,
            initialPortionUnit || cookedQuantityUnit,
            cookedQuantityUnit,
          );

          if (converted != null && converted > 0) {
            setPortionMode('quantity');
            setPortionValue(String(Math.round(converted * 100) / 100));
            return;
          }
        }
      }
    }

    if (hasServings) {
      setPortionMode('servings');
      setPortionValue(String(recipeServings));
    } else if (hasCookedQuantity) {
      setPortionMode('quantity');
      setPortionValue(String(Math.round(cookedQuantityAmount * 100) / 100));
    }
  }, [
    recipe?.id,
    recipe?.servings,
    cookedQuantityAmount,
    cookedQuantityUnit,
    initialPortionMode,
    initialPortionValue,
    initialPortionUnit,
  ]);

  useEffect(() => {
    if (
      !cookModeVisible ||
      cookPhase !== 'steps'
    ) {
      return;
    }

    const step =
      recipe?.instructions?.[
        activeStepIndex
      ];

    if (timerIntervalRef.current) {
      clearInterval(
        timerIntervalRef.current,
      );

      timerIntervalRef.current =
        null;
    }

    setTimerRemaining(
      step?.timer_seconds ??
        null,
    );

    setTimerRunning(
      !!step?.timer_seconds,
    );
  }, [
    activeStepIndex,
    cookModeVisible,
    cookPhase,
    recipe?.instructions,
  ]);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    timerIntervalRef.current =
      setInterval(() => {
        setTimerRemaining(
          (previous) => {
            if (
              previous === null
            ) {
              return previous;
            }

            if (previous <= 1) {
              if (
                timerIntervalRef.current
              ) {
                clearInterval(
                  timerIntervalRef.current,
                );
              }

              setTimerRunning(false);

              Alert.alert(
                "Time's up",
                'The timer for this step has finished.',
              );

              return 0;
            }

            return previous - 1;
          },
        );
      }, 1000);

    return () => {
      if (
        timerIntervalRef.current
      ) {
        clearInterval(
          timerIntervalRef.current,
        );
      }
    };
  }, [timerRunning]);

  useEffect(() => {
    return () => {
      if (
        timerIntervalRef.current
      ) {
        clearInterval(
          timerIntervalRef.current,
        );
      }
    };
  }, []);

  /*
   * --------------------------------------------------------------------------
   * ACTIONS
   * --------------------------------------------------------------------------
   */

  const handleSelectRating = (
    score: number,
  ) => {
    setUserRating(score);

    rateMutation.mutate(
      {
        recipeId,
        rating: score,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Thank you!',
            `You rated this recipe ${score} star${
              score > 1 ? 's' : ''
            }.`,
          );
        },

        onError: (err: any) => {
          Alert.alert(
            'Error',
            err?.response?.data
              ?.detail ||
              'Failed to submit rating.',
          );
        },
      },
    );
  };

  const toggleIngredient = (
    index: number,
  ) => {
    setCheckedIngredients(
      (previous) => ({
        ...previous,
        [index]:
          !previous[index],
      }),
    );
  };

  const toggleStep = (
    stepNumber: number,
  ) => {
    setCompletedSteps(
      (previous) => ({
        ...previous,
        [stepNumber]:
          !previous[stepNumber],
      }),
    );
  };

  const startCooking = () => {
    if (creationMode === 'recording') {
      setRecordingVisible(true);
      return;
    }

    setCookPhase('ingredients');
    setActiveStepIndex(0);
    setCookModeVisible(true);
  };

  const finishRecording = (recordedSteps: RecordingStep[]) => {
    if (!recipe) return;

    const validSteps = recordedSteps.filter((step) => step.instruction_text.trim());
    if (!validSteps.length) return;

    updateRecipeMutation.mutate(
      {
        id: recipe.id,
        data: {
          name: recipe.name,
          description: recipe.description ?? null,
          preparation_time: Number(recipe.preparation_time ?? 0),
          cooking_time: Number(recipe.cooking_time ?? 0),
          total_time: Number(recipe.total_time ?? 0),
          servings: Number(recipe.servings),
          cooked_weight_amount: recipe.cooked_weight_amount ?? null,
          cooked_weight_unit: recipe.cooked_weight_unit ?? null,
          visibility: recipe.visibility,
          image_urls: recipe.image_urls ?? [],
          category_ids: recipe.category_ids ?? [],
          tag_names: recipe.tag_names ?? [],
          ingredients: (recipe.ingredients ?? []).map((item: any, index: number) => ({
            ingredient_id: Number(item.ingredient_id),
            name: item.name || `Ingredient #${item.ingredient_id}`,
            quantity: Number(item.quantity),
            unit: item.unit,
            display_order: Number(item.display_order) || index + 1,
          })),
          instructions: validSteps.map((step, index) => ({
            step_number: index + 1,
            instruction_text: step.instruction_text.trim(),
            timer_seconds: step.timer_seconds ?? null,
            tip: step.tip?.trim() || null,
          })),
        },
      },
      {
        onSuccess: () => {
          setRecordingVisible(false);
          void refetch();
          Alert.alert('Recipe recorded', 'Your cooking notes have been saved to the recipe.');
        },
        onError: (err: any) => {
          Alert.alert('Could not save notes', err?.response?.data?.detail || 'Please try again.');
        },
      },
    );
  };

  const closeCookMode = () => {
    if (
      timerIntervalRef.current
    ) {
      clearInterval(
        timerIntervalRef.current,
      );
    }

    setTimerRunning(false);
    setCookModeVisible(false);
  };

  const beginStepByStep = () => {
    setActiveStepIndex(0);
    setCookPhase('steps');
  };

  const backToIngredients =
    () => {
      if (
        timerIntervalRef.current
      ) {
        clearInterval(
          timerIntervalRef.current,
        );
      }

      setTimerRunning(false);
      setCookPhase(
        'ingredients',
      );
    };

  const goToStep = (
    index: number,
    steps: any[],
  ) => {
    if (index < 0) {
      backToIngredients();
      return;
    }

    const clamped = Math.max(
      0,
      Math.min(
        index,
        steps.length - 1,
      ),
    );

    setActiveStepIndex(
      clamped,
    );
  };

  const formatTimer = (
    seconds: number,
  ) => {
    const minutes = Math.floor(
      seconds / 60,
    );

    const remainingSeconds =
      seconds % 60;

    return `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  /*
   * --------------------------------------------------------------------------
   * DERIVED DATA
   *
   * IMPORTANT: This hook must run before any conditional return.
   * --------------------------------------------------------------------------
   */

  const totalWeightGrams = useMemo(
    () =>
      getTotalWeightGrams(
        recipe?.ingredients ?? [],
        recipe?.nutrition,
      ),
    [
      recipe?.ingredients,
      recipe?.nutrition,
    ],
  );

  const cookedQuantityUnit = normalizePortionUnit(
    recipe?.cooked_weight_unit,
  );

  const cookedQuantityAmount =
    Number(recipe?.cooked_weight_amount) > 0
      ? Number(recipe?.cooked_weight_amount)
      : totalWeightGrams;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('EditRecipe', { recipeId })}
          activeOpacity={0.75}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit recipe"
        >
          <Pencil size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, recipeId, theme.colors.primary]);

  const recipeCategoryNames = useMemo(() => {
    const ids = recipe?.category_ids ?? [];
    return categories
      .filter((category) => ids.includes(category.id))
      .map((category) => category.name);
  }, [categories, recipe?.category_ids]);

  const recipeTagLabels = useMemo(() => {
    if (Array.isArray(recipe?.tag_names) && recipe.tag_names.length > 0) {
      return recipe.tag_names.filter((tag) => typeof tag === 'string' && tag.trim());
    }
    return (recipe?.tag_ids ?? []).map((id) => `#${id}`);
  }, [recipe?.tag_ids, recipe?.tag_names]);

  /*
   * --------------------------------------------------------------------------
   * LOADING
   * --------------------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <View
        style={[
          styles.centerContainer,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        <View
          style={[
            styles.stateIcon,
            {
              backgroundColor:
                theme.colors
                  .primary + '12',
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

        <Text
          style={[
            styles.stateText,
            {
              color:
                theme.colors
                  .textMuted,
            },
          ]}
        >
          Loading recipe...
        </Text>
      </View>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * ERROR
   * --------------------------------------------------------------------------
   */

  if (!recipe) {
    return (
      <View
        style={[
          styles.centerContainer,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        <View
          style={[
            styles.stateIcon,
            {
              backgroundColor:
                colors.error +
                '12',
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
            styles.errorTitle,
            {
              color:
                theme.colors.text,
            },
          ]}
        >
          Couldn&apos;t load recipe
        </Text>

        <Text
          style={[
            styles.errorDescription,
            {
              color:
                theme.colors
                  .textMuted,
            },
          ]}
        >
          Something went wrong
          while loading this recipe.
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            refetch()
          }
          style={[
            styles.primaryButton,
            {
              backgroundColor:
                theme.colors
                  .primary,
            },
          ]}
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * DERIVED DATA
   * --------------------------------------------------------------------------
   */

  const primaryImage =
    recipe.image_urls &&
    recipe.image_urls.length > 0
      ? recipe.image_urls[0]
      : null;

  const numericPortion =
    parseFloat(portionValue) ||
    (portionMode === 'servings'
      ? recipe.servings
      : cookedQuantityAmount);

  const ingredientScale =
    portionMode === 'servings'
      ? numericPortion / Math.max(recipe.servings, 1)
      : numericPortion / Math.max(cookedQuantityAmount, 1);

  const nutritionScale =
    portionMode === 'servings'
      ? numericPortion /
        Math.max(
          recipe.nutrition
            ?.servings ??
            recipe.servings,
          1,
        )
      : ingredientScale;

  const portionLabel =
    portionMode === 'servings'
      ? `Per ${Math.round(
          numericPortion,
        )} serving${
          numericPortion === 1
            ? ''
            : 's'
        }`
      : `Per ${Math.round(
          numericPortion * 100,
        ) / 100} ${cookedQuantityUnit}`;

  const completedStepCount =
    Object.values(
      completedSteps,
    ).filter(Boolean).length;

  const totalSteps =
    recipe.instructions
      ?.length ?? 0;

  /*
   * ==========================================================================
   * RENDER
   * ==========================================================================
   */

  return (
    <>
      <Animated.ScrollView
        style={[
          styles.container,
          {
            backgroundColor:
              theme.colors
                .background,
            opacity: pageOpacity,
            transform: [
              {
                translateY:
                  pageTranslateY,
              },
            ],
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ================================================================ */}
        {/* HERO                                                             */}
        {/* ================================================================ */}

        <View
          style={[
            styles.hero,
            {
              backgroundColor:
                theme.colors.surface,
            },
          ]}
        >
          {primaryImage ? (
            <Image
              source={{
                uri: primaryImage,
              }}
              style={
                styles.heroImage
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.heroPlaceholder,
                {
                  backgroundColor:
                    theme.colors
                      .surface,
                },
              ]}
            >
              <Leaf
                size={32}
                color={
                  theme.colors
                    .primary
                }
              />

              <Text
                style={[
                  styles.heroPlaceholderText,
                  {
                    color:
                      theme.colors
                        .textMuted,
                  },
                ]}
              >
                No recipe image
              </Text>
            </View>
          )}

          {totalSteps > 0 || creationMode === 'recording' ? (
            <TouchableOpacity
              style={[
                styles.startCookingButton,
                {
                  backgroundColor:
                    theme.colors
                      .primary,
                },
              ]}
              onPress={
                startCooking
              }
              activeOpacity={0.85}
            >
              <Play
                size={17}
                color="#FFFFFF"
                fill="#FFFFFF"
              />

              <Text
                style={
                  styles.startCookingText
                }
              >
                {creationMode === 'recording' ? 'Record & Cook' : 'Start Cooking'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ================================================================ */}
        {/* CONTENT                                                          */}
        {/* ================================================================ */}

        <View
          style={styles.content}
        >
          {/* TITLE */}

          <View
            style={styles.titleRow}
          >
            <View
              style={
                styles.titleContent
              }
            >
              <Text
                style={[
                  styles.title,
                  {
                    color:
                      theme.colors
                        .text,
                  },
                ]}
              >
                {recipe.name}
              </Text>

              {recipe.rating
                ?.count ? (
                <View
                  style={
                    styles.ratingSummary
                  }
                >
                  <Star
                    size={14}
                    color="#F59E0B"
                    fill="#F59E0B"
                  />

                  <Text
                    style={[
                      styles.ratingSummaryText,
                      {
                        color:
                          theme
                            .colors
                            .textMuted,
                      },
                    ]}
                  >
                    {recipe.rating.average.toFixed(
                      1,
                    )}{' '}
                    ·{' '}
                    {
                      recipe
                        .rating
                        .count
                    }{' '}
                    rating
                    {recipe.rating
                      .count === 1
                      ? ''
                      : 's'}
                  </Text>
                </View>
              ) : null}
            </View>

            <View
              style={[
                styles.visibilityBadge,
                {
                  backgroundColor:
                    theme.colors
                      .primary +
                    '12',
                  borderColor:
                    theme.colors
                      .primary +
                    '25',
                },
              ]}
            >
              {recipe.visibility ===
              'PUBLIC' ? (
                <Globe
                  size={14}
                  color={
                    theme.colors
                      .primary
                  }
                />
              ) : (
                <Lock
                  size={14}
                  color={
                    theme.colors
                      .primary
                  }
                />
              )}

              <Text
                style={[
                  styles.visibilityText,
                  {
                    color:
                      theme.colors
                        .primary,
                  },
                ]}
              >
                {recipe.visibility}
              </Text>
            </View>

          </View>

          {/* DESCRIPTION */}

          {recipe.description ? (
            <Text
              style={[
                styles.description,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
            >
              {recipe.description}
            </Text>
          ) : null}

          {(recipeCategoryNames.length > 0 || recipeTagLabels.length > 0) ? (
            <View style={[styles.recipeMetaCard, { backgroundColor: theme.colors.surface, }]}>
              {recipeCategoryNames.length > 0 ? (
                <View style={styles.recipeMetaGroup}>
                  <Text style={[styles.recipeMetaLabel, { color: theme.colors.textMuted }]}>Categories</Text>
                  <View style={styles.recipeMetaChipWrap}>
                    {recipeCategoryNames.map((name) => (
                      <View key={name} style={[styles.recipeMetaChip, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '25' }]}>
                        <Text style={[styles.recipeMetaChipText, { color: theme.colors.primary }]}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {recipeTagLabels.length > 0 ? (
                <View style={[styles.recipeMetaGroup, recipeCategoryNames.length > 0 && styles.recipeMetaGroupSpacing]}>
                  <Text style={[styles.recipeMetaLabel, { color: theme.colors.textMuted }]}>Tags</Text>
                  <View style={styles.recipeMetaChipWrap}>
                    {recipeTagLabels.map((tag) => (
                      <View key={tag} style={[styles.recipeMetaChip, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                        <Text style={[styles.recipeMetaChipText, { color: theme.colors.text }]}>{tag.startsWith('#') ? tag : `#${tag}`}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {/* ============================================================ */}
          {/* QUICK STATS                                                  */}
          {/* ============================================================ */}

          <View
            style={[
              styles.statsCard,
              {
                backgroundColor:
                  theme.colors.surface,
              },
            ]}
          >
            <StatItem
              icon={
                <Clock
                  size={18}
                  color={
                    theme.colors
                      .primary
                  }
                />
              }
              label="Prep"
              value={`${recipe.preparation_time || 0}m`}
              theme={theme}
            />

            <View
              style={[
                styles.statDivider,
                {
                  backgroundColor:
                    theme.colors
                      .border,
                },
              ]}
            />

            <StatItem
              icon={
                <Clock
                  size={18}
                  color={
                    theme.colors
                      .primary
                  }
                />
              }
              label="Cook"
              value={`${recipe.cooking_time || 0}m`}
              theme={theme}
            />

            <View
              style={[
                styles.statDivider,
                {
                  backgroundColor:
                    theme.colors
                      .border,
                },
              ]}
            />

            <StatItem
              icon={
                <Users
                  size={18}
                  color={
                    theme.colors
                      .primary
                  }
                />
              }
              label="Yield"
              value={
                portionMode ===
                'servings'
                  ? `${Math.round(
                      numericPortion,
                    )} srv`
                  : `${Math.round(
                      numericPortion,
                    )}g`
              }
              theme={theme}
            />
          </View>

          {/* ============================================================ */}
          {/* ============================================================ */}
          <RecipeRating
            rating={recipe.rating}
            userRating={userRating}
            isPending={rateMutation.isPending}
            onRate={handleSelectRating}
          />

          {/* PORTIONS                                                     */}
          {/* ============================================================ */}

          <View
            style={styles.section}
          >
            <PortionAdjuster
                mode={portionMode}
                value={
                  portionValue
                }
                recipeServings={
                  recipe.servings
                }
                quantityUnit={cookedQuantityUnit}
                totalQuantity={cookedQuantityAmount}
                onModeChange={(mode) => {
                  const current = Number(portionValue);
                  const servings = Number(recipe.servings);
                  const totalQuantity = Number(cookedQuantityAmount);

                  if (mode === portionMode) return;

                  if (mode === 'quantity') {
                    if (current > 0 && servings > 0 && totalQuantity > 0) {
                      const quantity =
                        portionMode === 'servings'
                          ? (totalQuantity * current) / servings
                          : current;
                      setPortionValue(
                        String(Math.round(quantity * 100) / 100),
                      );
                      setPortionMode('quantity');
                    }
                    return;
                  }

                  if (current > 0 && servings > 0 && totalQuantity > 0) {
                    const servingsValue =
                      portionMode === 'quantity'
                        ? (current / totalQuantity) * servings
                        : current;
                    setPortionValue(
                      String(Math.max(1, Math.round(servingsValue * 100) / 100)),
                    );
                    setPortionMode('servings');
                  }
                }}
                onValueChange={
                  setPortionValue
                }
              />
          </View>

          {/* ============================================================ */}
          {/* NUTRITION                                                    */}
          {/* ============================================================ */}

          {showNutrition &&
          nutritionBreakdown ? (
            <View
              style={styles.section}
            >
              <SectionHeader
                title="Nutrition"
                hint={portionLabel}
                theme={theme}
              />

              <View
                style={[
                  styles.nutritionCard,
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
                {caloriesItem ? (
                  <View
                    style={
                      styles.calorieRow
                    }
                  >
                    <View
                      style={[
                        styles.nutritionIcon,
                        {
                          backgroundColor:
                            colors.calories +
                            '15',
                        },
                      ]}
                    >
                      <Flame
                        size={20}
                        color={
                          colors.calories
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.flexOne
                      }
                    >
                      <Text
                        style={[
                          styles.calorieValue,
                          {
                            color:
                              theme
                                .colors
                                .text,
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
                            color:
                              theme
                                .colors
                                .textMuted,
                          },
                        ]}
                      >
                        Total energy
                      </Text>
                    </View>
                  </View>
                ) : null}

                {macroBars.length >
                  0 &&
                macroTotal > 0 ? (
                  <View
                    style={[
                      styles.macroBarTrack,
                      {
                        backgroundColor:
                          theme.colors
                            .border,
                      },
                    ]}
                  >
                    {macroBars.map(
                      (
                        macro,
                        index,
                      ) => (
                        <View
                          key={
                            index
                          }
                          style={{
                            flex:
                              macro
                                .item!
                                .amount /
                              macroTotal,
                            backgroundColor:
                              macro.color,
                          }}
                        />
                      ),
                    )}
                  </View>
                ) : null}

                <View style={styles.nutritionGrid}>
                  {proteinItem ? (
                    <View style={styles.nutritionGridItem}>
                      <MacroItem
                        icon={
                          <Beef
                            size={14}
                            color={colors.protein}
                          />
                        }
                        value={formatNutritionAmount(
                          proteinItem.amount,
                          proteinItem.unit,
                        )}
                        label="Protein"
                        theme={theme}
                      />
                    </View>
                  ) : null}

                  {carbsItem ? (
                    <View style={styles.nutritionGridItem}>
                      <MacroItem
                        icon={
                          <Wheat
                            size={14}
                            color={colors.carbs}
                          />
                        }
                        value={formatNutritionAmount(
                          carbsItem.amount,
                          carbsItem.unit,
                        )}
                        label="Carbs"
                        theme={theme}
                      />
                    </View>
                  ) : null}

                  {fatItem ? (
                    <View style={styles.nutritionGridItem}>
                      <MacroItem
                        icon={
                          <Droplets
                            size={14}
                            color={colors.fats}
                          />
                        }
                        value={formatNutritionAmount(
                          fatItem.amount,
                          fatItem.unit,
                        )}
                        label="Fat"
                        theme={theme}
                      />
                    </View>
                  ) : null}

                  {highlightItems.map((highlight, index) => {
                    const Icon = highlight.icon;

                    return (
                      <View
                        key={index}
                        style={styles.nutritionGridItem}
                      >
                        <View
                          style={[
                            styles.highlightIcon,
                            {
                              backgroundColor:
                                highlight.color + '15',
                            },
                          ]}
                        >
                          <Icon
                            size={14}
                            color={highlight.color}
                          />
                        </View>

                        <View
                          style={styles.nutritionText}
                        >
                          <Text
                            style={[
                              styles.highlightValue,
                              {
                                color:
                                  theme.colors.text,
                              },
                            ]}
                          >
                            {formatNutritionAmount(
                              highlight.item!.amount,
                              highlight.item!.unit,
                            )}
                          </Text>

                          <Text
                            style={[
                              styles.highlightLabel,
                              {
                                color:
                                  theme.colors.textMuted,
                              },
                            ]}
                          >
                            {highlight.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.fullNutritionButton,
                    {
                      borderTopColor:
                        theme.colors
                          .border,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate(
                      'NutritionDetail',
                      {
                        recipeName:
                          recipe.name,
                        nutrition:
                          recipe.nutrition,
                        scale:
                          nutritionScale,
                        portionLabel,
                      },
                    )
                  }
                >
                  <Text
                    style={[
                      styles.fullNutritionText,
                      {
                        color:
                          theme.colors
                            .primary,
                      },
                    ]}
                  >
                    See full nutrition
                    breakdown
                  </Text>

                  <ChevronRight
                    size={17}
                    color={
                      theme.colors
                        .primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ============================================================ */}
          {/* INGREDIENTS                                                   */}
          {/* ============================================================ */}

          <View
            style={styles.section}
          >
            <SectionHeader
              title="Ingredients"
              hint={portionLabel}
              theme={theme}
            />

            <View
              style={[
                styles.ingredientCard,
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
              {recipe.ingredients &&
              recipe.ingredients.length >
                0 ? (
                recipe.ingredients.map(
                  (
                    ingredient,
                    index,
                  ) => {
                    const isChecked =
                      !!checkedIngredients[
                        index
                      ];

                    return (
                      <TouchableOpacity
                        key={
                          index
                        }
                        activeOpacity={
                          0.65
                        }
                        onPress={() =>
                          toggleIngredient(
                            index,
                          )
                        }
                        style={[
                          styles.ingredientRow,
                          index <
                            recipe
                              .ingredients
                              .length -
                              1 && {
                            borderBottomWidth: 1,
                            borderBottomColor:
                              theme
                                .colors
                                .border,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.checkBox,
                            {
                              backgroundColor:
                                isChecked
                                  ? theme
                                      .colors
                                      .primary
                                  : 'transparent',
                              borderColor:
                                isChecked
                                  ? theme
                                      .colors
                                      .primary
                                  : theme
                                      .colors
                                      .border,
                            },
                          ]}
                        >
                          {isChecked ? (
                            <CheckCircle2
                              size={16}
                              color="#FFFFFF"
                              strokeWidth={
                                2.5
                              }
                            />
                          ) : null}
                        </View>

                        <Text
                          numberOfLines={
                            2
                          }
                          style={[
                            styles.ingredientName,
                            {
                              color:
                                isChecked
                                  ? theme
                                      .colors
                                      .textMuted
                                  : theme
                                      .colors
                                      .text,
                            },
                            isChecked &&
                              styles.strikethrough,
                          ]}
                        >
                          {ingredient.name ||
                            `Ingredient #${ingredient.ingredient_id}`}
                        </Text>

                        <View
                          style={[
                            styles.amountPill,
                            {
                              backgroundColor:
                                isChecked
                                  ? theme
                                      .colors
                                      .background
                                  : theme
                                      .colors
                                      .primary +
                                    '10',
                              borderColor:
                                isChecked
                                  ? theme
                                      .colors
                                      .border
                                  : theme
                                      .colors
                                      .primary +
                                    '28',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.amountText,
                              {
                                color:
                                  isChecked
                                    ? theme
                                        .colors
                                        .textMuted
                                    : theme
                                        .colors
                                        .primary,
                              },
                            ]}
                          >
                            {scaleIngredientQuantity(
                              ingredient.quantity,
                              ingredient.unit,
                              ingredientScale,
                            )}{' '}
                            {formatUnitLabel(
                              ingredient.unit,
                            )}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  },
                )
              ) : (
                <Text
                  style={[
                    styles.emptyHint,
                    {
                      color:
                        theme.colors
                          .textMuted,
                    },
                  ]}
                >
                  No ingredients
                  listed.
                </Text>
              )}
            </View>
          </View>

          {/* ============================================================ */}
          {/* INSTRUCTIONS                                                  */}
          {/* ============================================================ */}

          <View
            style={styles.section}
          >
            <SectionHeader
              title="Instructions"
              hint={
                totalSteps > 0
                  ? `${completedStepCount}/${totalSteps} done`
                  : undefined
              }
              theme={theme}
            />

            {recipe.instructions &&
            recipe.instructions.length > 0 ? (
              recipe.instructions.map((step) => {
                const isDone =
                  !!completedSteps[step.step_number];

                return (
                  <View
                    key={step.step_number}
                    style={[
                      styles.instructionCard,
                      {
                        backgroundColor:
                          theme.colors.surface,
                      },
                      isDone && styles.completedCard,
                    ]}
                  >
                    <View style={styles.instructionRow}>
                      {/* Step number */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          toggleStep(step.step_number)
                        }
                      >
                        <View
                          style={[
                            styles.stepNumber,
                            {
                              backgroundColor: isDone
                                ? theme.colors.primary + '15'
                                : theme.colors.primary,
                            },
                          ]}
                        >
                          {isDone ? (
                            <CheckCircle2
                              size={20}
                              color={theme.colors.primary}
                            />
                          ) : (
                            <Text
                              style={styles.stepNumberText}
                            >
                              {step.step_number}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Instruction content */}
                      <View style={styles.instructionContent}>
                        <View style={styles.instructionHeader}>
                          <Text
                            style={[
                              styles.instructionText,
                              {
                                color: theme.colors.text,
                              },
                              isDone && styles.strikethrough,
                              styles.instructionTextFlex,
                            ]}
                          >
                            {step.instruction_text}
                          </Text>

                          {step.tip ? (
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                setExpandedTipStep((current) =>
                                  current === step.step_number
                                    ? null
                                    : step.step_number,
                                )
                              }
                              style={[
                                styles.infoButton,
                                {
                                  backgroundColor: theme.colors.primary + '10',
                                  borderColor: theme.colors.primary + '30',
                                },
                              ]}
                              accessibilityRole="button"
                              accessibilityLabel={`Show tip for step ${step.step_number}`}
                            >
                              <Info
                                size={16}
                                color={theme.colors.primary}
                                strokeWidth={2.4}
                              />
                            </TouchableOpacity>
                          ) : null}
                        </View>

                        {step.tip && expandedTipStep === step.step_number ? (
                          <View
                            style={[
                              styles.tipBox,
                              {
                                backgroundColor: theme.colors.surfaceSecondary,
                              },
                            ]}
                          >
                            <View style={styles.tipHeader}>
                              <Info size={14} color={theme.colors.primary} />
                              <Text style={[styles.tipTitle, { color: theme.colors.text }]}>Tip</Text>
                            </View>
                            <Text style={[styles.tipText, { color: theme.colors.textMuted }]}>
                              {step.tip}
                            </Text>
                          </View>
                        ) : null}

                        {step.timer_seconds ? (
                          <View
                            style={[
                              styles.timerBadge,
                              {
                                backgroundColor:
                                  colors.calories + '12',
                                borderColor:
                                  colors.calories + '25',
                              },
                            ]}
                          >
                            <Timer
                              size={14}
                              color={colors.calories}
                            />

                            <Text
                              style={[
                                styles.timerBadgeText,
                                {
                                  color: colors.calories,
                                },
                              ]}
                            >
                              {Math.round(
                                step.timer_seconds / 60,
                              )}{' '}
                              min
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor:
                      theme.colors.surface,
                    borderColor:
                      theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emptyHint,
                    {
                      color: theme.colors.textMuted,
                    },
                  ]}
                >
                  No instructions listed.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* ================================================================ */}
      {/* COOK MODE                                                        */}
      {/* ============================================================ */}
          <RecipeNutrition
            nutrition={recipe.nutrition}
            scale={nutritionScale}
            portionLabel={portionLabel}
            onSeeFullBreakdown={() =>
              navigation.navigate('NutritionDetail', {
                recipeName: recipe.name,
                nutrition: recipe.nutrition,
                scale: nutritionScale,
                portionLabel,
              })
            }
          />

          {/* ================================================================ */}

      <RecipeRecordingFlow
        visible={recordingVisible}
        recipeName={recipe.name}
        ingredients={recipe.ingredients ?? []}
        ingredientScale={ingredientScale}
        portionLabel={portionLabel}
        initialSteps={recipe.instructions ?? []}
        theme={theme}
        onClose={() => setRecordingVisible(false)}
        onFinish={finishRecording}
      />

      <RecipeCookingFlow
        visible={
          cookModeVisible
        }
        phase={cookPhase}
        recipeName={
          recipe.name
        }
        ingredients={
          recipe.ingredients ??
          []
        }
        ingredientScale={
          ingredientScale
        }
        portionLabel={
          portionLabel
        }
        checkedIngredients={
          checkedIngredients
        }
        onToggleIngredient={
          toggleIngredient
        }
        onStartSteps={
          beginStepByStep
        }
        steps={
          recipe.instructions
        }
        activeStepIndex={
          activeStepIndex
        }
        onClose={
          closeCookMode
        }
        onGoToStep={(
          index: number,
        ) =>
          goToStep(
            index,
            recipe.instructions ??
              [],
          )
        }
        completedSteps={
          completedSteps
        }
        onToggleStepComplete={
          toggleStep
        }
        timerRemaining={
          timerRemaining
        }
        timerRunning={
          timerRunning
        }
        onToggleTimer={() =>
          setTimerRunning(
            (running) =>
              !running,
          )
        }
        onResetTimer={() => {
          const step =
            recipe
              .instructions?.[
              activeStepIndex
            ];

          setTimerRunning(
            !!step?.timer_seconds,
          );

          setTimerRemaining(
            step?.timer_seconds ??
              null,
          );
        }}
        formatTimer={
          formatTimer
        }
        theme={theme}
        strictMode={strictCooking}
      />
    </>
  );
};

/*
 * ============================================================================
 * STAT ITEM
 * ============================================================================
 */

const StatItem = ({
  icon,
  label,
  value,
  theme,
}: any) => (
  <View
    style={styles.statItem}
  >
    {icon}

    <Text
      style={[
        styles.statLabel,
        {
          color:
            theme.colors
              .textMuted,
        },
      ]}
    >
      {label}
    </Text>

    <Text
      style={[
        styles.statValue,
        {
          color:
            theme.colors.text,
        },
      ]}
    >
      {value}
    </Text>
  </View>
);

/*
 * ============================================================================
 * SECTION TITLE
 * ============================================================================
 */

const SectionTitle = ({
  title,
  theme,
}: any) => (
  <Text
    style={[
      styles.sectionTitle,
      {
        color:
          theme.colors.text,
      },
    ]}
  >
    {title}
  </Text>
);

const SectionHeader = ({
  title,
  hint,
  theme,
}: any) => (
  <View
    style={
      styles.sectionHeader
    }
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
      {title}
    </Text>

    {hint ? (
      <Text
        style={[
          styles.sectionHint,
          {
            color:
              theme.colors
                .textMuted,
          },
        ]}
      >
        {hint}
      </Text>
    ) : null}
  </View>
);

/*
 * ============================================================================
 * MACRO ITEM
 * ============================================================================
 */

const MacroItem = ({
  icon,
  value,
  label,
  theme,
}: any) => (
  <View
    style={styles.macroItem}
  >
    {icon}

    <Text
      style={[
        styles.macroValue,
        {
          color:
            theme.colors.text,
        },
      ]}
    >
      {value}
    </Text>

    <Text
      style={[
        styles.macroLabel,
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
);

/*
 * ============================================================================
 * COOK MODE
 * ============================================================================
 */


/*
 * ============================================================================
 * STYLES
 * ============================================================================
 *
 * IMPORTANT:
 * All major components intentionally use 8px.
 * This matches Profile / Cart / Routine.
 * ============================================================================
 */

const styles = StyleSheet.create({
  /*
   * --------------------------------------------------------------------------
   * BASE
   * --------------------------------------------------------------------------
   */

  container: {
    flex: 1,
  },

  flexOne: {
    flex: 1,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  stateIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  stateText: {
    fontSize: 13,
    fontWeight: '500',
  },

  errorTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },

  errorDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: 20,
  },

  primaryButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /*
   * --------------------------------------------------------------------------
   * HERO
   * --------------------------------------------------------------------------
   */

  hero: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },

  heroImage: {
    width: '100%',
    height: 270,
  },

  heroPlaceholder: {
    width: '100%',
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroPlaceholderText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },

  startCookingButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,

    minHeight: 44,

    paddingHorizontal: 15,

    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  startCookingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /*
   * --------------------------------------------------------------------------
   * CONTENT
   * --------------------------------------------------------------------------
   */

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  titleContent: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
  },

  ratingSummaryText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  visibilityBadge: {
    minHeight: 30,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
  },

  visibilityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  recipeMetaCard: { borderRadius: 14, padding: 12, marginBottom: 16 },
  recipeMetaGroup: {},
  recipeMetaGroupSpacing: { marginTop: 12 },
  recipeMetaLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 },
  recipeMetaChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  recipeMetaChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  recipeMetaChipText: { fontSize: 12, fontWeight: '700' },
  description: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    marginBottom: 18,
  },

  /*
   * --------------------------------------------------------------------------
   * STATS
   * --------------------------------------------------------------------------
   */

  statsCard: {
    minHeight: 82,

    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,

    paddingVertical: 13,

    marginBottom: 24,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statDivider: {
    width: 1,
    height: 42,
  },

  statLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 5,
  },

  statValue: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    marginTop: 2,
  },

  /*
   * --------------------------------------------------------------------------
   * SECTIONS
   * --------------------------------------------------------------------------
   */

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    minHeight: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  sectionHint: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },

  /*
   * --------------------------------------------------------------------------
   * RATING
   * --------------------------------------------------------------------------
   */

  ratingCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },

  ratingScoreBadge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },

  ratingScore: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },

  ratingCopy: {
    flex: 1,
    minWidth: 0,
  },

  ratingTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },

  ratingHint: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },

  ratingActionRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  starButton: {
    padding: 2,
  },

  /*
   * --------------------------------------------------------------------------
   * COMPONENT CARD
   * --------------------------------------------------------------------------
   */

  componentCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },

  /*
   * --------------------------------------------------------------------------
   * NUTRITION
   * --------------------------------------------------------------------------
   */

  nutritionCard: {
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },

  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    paddingHorizontal: 4,
    paddingBottom: 12,
    marginBottom: 2,
  },

  nutritionIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  calorieValue: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
  },

  calorieLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 1,
  },

  macroBarTrack: {
    height: 9,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 14,
  },

  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },

  nutritionGridItem: {
    width: '31.8%',
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 9,
    borderRadius: 12,
  },

  macroItem: {
    flex: 1,
    minHeight: 72,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  macroValue: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },

  macroLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },

  nutritionText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  highlightIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  highlightValue: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },

  highlightLabel: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '500',
  },

  fullNutritionButton: {
    minHeight: 40,

    borderTopWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    paddingTop: 11,
  },

  fullNutritionText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  /*
   * --------------------------------------------------------------------------
   * INGREDIENTS
   * --------------------------------------------------------------------------
   */

  ingredientCard: {
    borderRadius: 8,
    overflow: 'hidden',
  },

  ingredientRow: {
    minHeight: 58,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  checkBox: {
    width: 22,
    height: 22,

    borderRadius: 8,
    borderWidth: 1.5,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  ingredientName: {
    flex: 1,
    minWidth: 0,

    fontSize: 14,
    lineHeight: 19,

    fontWeight: '600',

    paddingRight: 8,
  },

  amountPill: {
    minHeight: 31,

    paddingHorizontal: 8,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    maxWidth: 110,
  },

  amountText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },

  strikethrough: {
    textDecorationLine: 'line-through',
  },

  /*
   * --------------------------------------------------------------------------
   * INSTRUCTIONS
   * --------------------------------------------------------------------------
   */

  instructionCard: {
    borderRadius: 8,

    padding: 14,

    marginBottom: 10,
  },

  completedCard: {
    opacity: 0.6,
  },

  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  stepNumber: {
    width: 32,
    height: 32,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  instructionContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  infoButton: {
    marginTop: 1,

    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timerBadge: {
    minHeight: 29,

    paddingHorizontal: 8,

    borderRadius: 8,
    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,

    alignSelf: 'flex-start',
    marginTop: 8,
  },

  timerBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },

  instructionText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },

  instructionTextFlex: {
    flex: 1,
    minWidth: 0,
  },

  tipBox: {
    marginTop: 11,

    paddingHorizontal: 11,
    paddingVertical: 9,

    borderRadius: 8,
    borderWidth: 1,
  },

  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },

  tipTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  emptyCard: {
    borderRadius: 8,
  },

  emptyHint: {
    padding: 16,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  /*
   * --------------------------------------------------------------------------
   * COOK MODE
   * --------------------------------------------------------------------------
   */

  cookContainer: {
    flex: 1,
  },

  cookHeader: {
    minHeight: 68,

    paddingHorizontal: 16,
    paddingBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeButton: {
    width: 40,
    height: 40,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  cookHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cookHeaderTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },

  cookHeaderSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 2,
  },

  cookStepCount: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },

  headerSpacer: {
    width: 40,
  },

  progressTrack: {
    height: 5,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  cookBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  cookIngredientsContent: {
    paddingBottom: 24,
  },

  cookStepContent: {
    paddingBottom: 28,
  },

  cookRecipeName: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
  },

  cookSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 4,
  },

  cookIngredientCard: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },

  cookIngredientAmount: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },

  largeStepNumber: {
    width: 48,
    height: 48,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,
  },

  largeStepNumberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  cookInstruction: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '600',
  },

  timerCard: {
    minHeight: 90,

    borderWidth: 1,
    borderRadius: 8,

    padding: 14,
    marginTop: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timerValue: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    fontVariant: [
      'tabular-nums',
    ],
  },

  timerHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 2,
  },

  timerControls: {
    flexDirection: 'row',
    gap: 8,
  },

  timerButton: {
    width: 44,
    height: 44,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  doneRow: {
    minHeight: 48,

    marginTop: 18,

    paddingHorizontal: 13,

    borderWidth: 1,
    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  doneText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },

  /*
   * --------------------------------------------------------------------------
   * COOK FOOTER
   * --------------------------------------------------------------------------
   */

  cookFooter: {
    minHeight: 72,

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderTopWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  primaryCookButton: {
    flex: 1,

    minHeight: 46,

    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  primaryCookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  navButton: {
    flex: 1,

    minHeight: 46,

    borderWidth: 1,
    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
  },

  navButtonPrimary: {
    flex: 1.5,

    minHeight: 46,

    borderRadius: 8,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  navButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  navButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});