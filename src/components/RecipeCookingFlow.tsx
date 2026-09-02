import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Info, Pause, Play, RotateCcw, ShieldCheck, X } from 'lucide-react-native';
import { formatUnitLabel } from '../utils/quantity';
import { scaleIngredientQuantity } from '../utils/nutrition';

export const RecipeCookingFlow = ({
  visible,
  phase,
  recipeName,
  ingredients,
  ingredientScale,
  portionLabel,
  checkedIngredients,
  onToggleIngredient,
  onStartSteps,
  steps,
  activeStepIndex,
  onClose,
  onGoToStep,
  completedSteps,
  onToggleStepComplete,
  timerRemaining,
  timerRunning,
  onToggleTimer,
  onResetTimer,
  formatTimer,
  theme,
  strictMode = false,
}: any) => {
  const insets =
    useSafeAreaInsets();

  const bottomInset =
    Math.max(
      insets.bottom,
      8,
    );

  const [tipVisible, setTipVisible] = useState(false);

  useEffect(() => {
    setTipVisible(false);
  }, [activeStepIndex, phase]);

  /*
   * ========================================================================
   * INGREDIENT PHASE
   * ========================================================================
   */

  if (
    phase ===
    'ingredients'
  ) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={
          onClose
        }
      >
        <View
          style={[
            styles.cookContainer,
            {
              backgroundColor:
                theme.colors
                  .background,
            },
          ]}
        >
          {/* HEADER */}

          <View
            style={[
              styles.cookHeader,
              {
                paddingTop:
                  Math.max(
                    insets.top,
                    12,
                  ),
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor:
                    theme.colors
                      .surface,
                },
              ]}
            >
              <X
                size={18}
                color={
                  theme.colors
                    .text
                }
                strokeWidth={2.5}
              />
            </TouchableOpacity>

            <View
              style={
                styles.cookHeaderCenter
              }
            >
              <Text
                style={[
                  styles.cookHeaderTitle,
                  {
                    color:
                      theme
                        .colors
                        .text,
                  },
                ]}
              >
                Ingredients
              </Text>

              <Text
                style={[
                  styles.cookHeaderSubtitle,
                  {
                    color:
                      theme
                        .colors
                        .textMuted,
                  },
                ]}
              >
                Get everything ready
              </Text>
            </View>

            <View
              style={
                styles.headerSpacer
              }
            />
          </View>

          {/* BODY */}

          <ScrollView
            style={
              styles.cookBody
            }
            contentContainerStyle={
              styles.cookIngredientsContent
            }
            showsVerticalScrollIndicator={
              false
            }
          >
            <Text
              style={[
                styles.cookRecipeName,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              {recipeName}
            </Text>

            <Text
              style={[
                styles.cookSubtitle,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
            >
              Gather everything below
              for{' '}
              {portionLabel.toLowerCase()}
            </Text>

            <View
              style={[
                styles.cookIngredientCard,
                {
                  backgroundColor:
                    theme.colors
                      .surface,
                },
              ]}
            >
              {ingredients &&
              ingredients.length >
                0 ? (
                ingredients.map(
                  (
                    ingredient: any,
                    index: number,
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
                          onToggleIngredient(
                            index,
                          )
                        }
                        style={[
                          styles.ingredientRow,
                          index <
                            ingredients.length -
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
                            />
                          ) : null}
                        </View>

                        <Text
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
                          numberOfLines={
                            2
                          }
                        >
                          {ingredient.name ||
                            `Ingredient #${ingredient.ingredient_id}`}
                        </Text>

                        <Text
                          style={[
                            styles.cookIngredientAmount,
                            {
                              color:
                                theme
                                  .colors
                                  .textMuted,
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
          </ScrollView>

        {/* FOOTER */}

          <View
            style={[
              styles.cookFooter,
              {
                backgroundColor:
                  theme.colors
                    .background,
                borderTopColor:
                  theme.colors
                    .border,
                paddingBottom:
                  bottomInset + 10,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                onStartSteps
              }
              disabled={
                !steps ||
                steps.length ===
                  0
              }
              style={[
                styles.primaryCookButton,
                {
                  backgroundColor:
                    theme.colors
                      .primary,
                  opacity:
                    !steps ||
                    steps.length ===
                      0
                      ? 0.5
                      : 1,
                },
              ]}
            >
              <Text
                style={
                  styles.primaryCookButtonText
                }
              >
                Start step-by-step
              </Text>

              <ChevronRight
                size={19}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  /*
   * ========================================================================
   * STEP PHASE
   * ========================================================================
   */

  if (
    !steps ||
    steps.length === 0
  ) {
    return null;
  }

  const step =
    steps[activeStepIndex];

  const isFirst =
    activeStepIndex === 0;

  const isLast =
    activeStepIndex ===
    steps.length - 1;

  const isDone =
    !!completedSteps[
      step.step_number
    ];

  const progress =
    ((activeStepIndex + 1) /
      steps.length) *
    100;

  const timerComplete = !step.timer_seconds || timerRemaining === 0;
  const canAdvance = !strictMode || (isDone && timerComplete);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={
        onClose
      }
    >
      <View
        style={[
          styles.cookContainer,
          {
            backgroundColor:
              theme.colors
                .background,
          },
        ]}
      >
        {/* HEADER */}

        <View
          style={[
            styles.cookHeader,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  12,
                ),
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClose}
            style={[
              styles.closeButton,
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
            <X
              size={18}
              color={
                theme.colors
                  .text
              }
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View
            style={
              styles.cookHeaderCenter
            }
          >
            <Text
              style={[
                styles.cookStepCount,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              Step{' '}
              {activeStepIndex +
                1}{' '}
              of {steps.length}
            </Text>

            <Text
              style={[
                styles.cookHeaderSubtitle,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
            >
              {Math.round(
                progress,
              )}
              % complete
            </Text>
          </View>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* PROGRESS */}

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor:
                theme.colors
                  .border,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor:
                  theme.colors
                    .primary,
              },
            ]}
          />
        </View>

        {/* BODY */}

        <ScrollView
          style={
            styles.cookBody
          }
          contentContainerStyle={
            styles.cookStepContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.largeStepNumber,
              {
                backgroundColor:
                  theme.colors
                    .primary,
              },
            ]}
          >
            <Text
              style={
                styles.largeStepNumberText
              }
            >
              {step.step_number}
            </Text>
          </View>

          <View style={styles.instructionHeaderRow}>
            <Text
              style={[
                styles.cookInstruction,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              {step.instruction_text}
            </Text>

            {step.tip ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTipVisible((value) => !value)}
                style={[
                  styles.instructionInfoButton,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Show instruction tip"
              >
                <Info size={17} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : null}
          </View>

          {step.tip && tipVisible ? (
            <View style={styles.tipRow}>
              <View
                style={[
                  styles.tipBox,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.tipText, { color: theme.colors.textMuted }]}>
                  {step.tip}
                </Text>
              </View>
            </View>
          ) : null}

          {/* TIMER */}

          {step.timer_seconds ? (
            <View
              style={[
                styles.timerCard,
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
              <View>
                <Text
                  style={[
                    styles.timerValue,
                    {
                      color:
                        theme.colors
                          .text,
                    },
                  ]}
                >
                  {formatTimer(
                    timerRemaining ??
                      step.timer_seconds,
                  )}
                </Text>

                <Text
                  style={[
                    styles.timerHint,
                    {
                      color:
                        theme.colors
                          .textMuted,
                    },
                  ]}
                >
                  {timerRunning
                    ? 'Timer running'
                    : timerRemaining ===
                        0
                      ? "Time's up"
                      : 'Timer paused'}
                </Text>
              </View>

              <View
                style={
                  styles.timerControls
                }
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={
                    onResetTimer
                  }
                  style={[
                    styles.timerButton,
                    {
                      backgroundColor:
                        theme.colors
                          .background,
                      borderColor:
                        theme.colors
                          .border,
                    },
                  ]}
                >
                  <RotateCcw
                    size={18}
                    color={
                      theme.colors
                        .text
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    onToggleTimer
                  }
                  style={[
                    styles.timerButton,
                    {
                      backgroundColor:
                        theme.colors
                          .primary,
                      borderColor:
                        theme.colors
                          .primary,
                    },
                  ]}
                >
                  {timerRunning ? (
                    <Pause
                      size={18}
                      color="#FFFFFF"
                      fill="#FFFFFF"
                    />
                  ) : (
                    <Play
                      size={18}
                      color="#FFFFFF"
                      fill="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* DONE */}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              onToggleStepComplete(
                step.step_number,
              )
            }
            style={[
              styles.doneRow,
              {
                backgroundColor:
                  isDone
                    ? theme.colors
                        .primary +
                      '10'
                    : theme.colors
                        .surface,
                borderColor:
                  isDone
                    ? theme.colors
                        .primary
                    : theme.colors
                        .border,
              },
            ]}
          >
            {isDone ? (
              <CheckCircle2
                size={20}
                color={
                  theme.colors
                    .primary
                }
              />
            ) : (
              <Circle
                size={20}
                color={
                  theme.colors
                    .textMuted
                }
              />
            )}

            <Text
              style={[
                styles.doneText,
                {
                  color:
                    isDone
                      ? theme
                          .colors
                          .primary
                      : theme
                          .colors
                          .textMuted,
                },
              ]}
            >
              {isDone
                ? 'Marked as done'
                : 'Mark step as done'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {strictMode && !canAdvance ? (
          <View style={[styles.strictHint, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <ShieldCheck size={16} color={theme.colors.primary} />
            <Text style={[styles.strictHintText, { color: theme.colors.textMuted }]}>
              Complete this step{step.timer_seconds ? ' and finish the timer' : ''} before continuing.
            </Text>
          </View>
        ) : null}

        {/* FOOTER */}

        <View
          style={[
            styles.cookFooter,
            {
              backgroundColor:
                theme.colors
                  .background,
              borderTopColor:
                theme.colors
                  .border,
              paddingBottom:
                bottomInset + 10,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              onGoToStep(
                activeStepIndex -
                  1,
              )
            }
            style={[
              styles.navButton,
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
            <ChevronLeft
              size={18}
              color={
                theme.colors
                  .text
              }
              strokeWidth={2.5}
            />

            <Text
              style={[
                styles.navButtonText,
                {
                  color:
                    theme.colors
                      .text,
                },
              ]}
            >
              {isFirst
                ? 'Ingredients'
                : 'Back'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!canAdvance) return;
              if (isLast) {
                onClose();
              } else {
                onGoToStep(activeStepIndex + 1);
              }
            }}
            style={[
              styles.navButtonPrimary,
              {
                backgroundColor:
                  theme.colors
                    .primary,
                opacity: canAdvance ? 1 : 0.45,
              },
            ]}
          >
            <Text
              style={
                styles.navButtonPrimaryText
              }
            >
              {isLast
                ? 'Finish'
                : 'Next step'}
            </Text>

            {!isLast ? (
              <ChevronRight
                size={18}
                color="#FFFFFF"
                strokeWidth={2.5}
              />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  closeButton: {
    width: 40,
    height: 40,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCard: {
    minHeight: 90,

    borderRadius: 8,

    padding: 14,
    marginTop: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerButton: {
    width: 44,
    height: 44,

    borderRadius: 8,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },
  cookIngredientCard: {
    marginTop: 18,
    borderRadius: 8,
    overflow: 'hidden',
  },
  ingredientName: {
    flex: 1,
    minWidth: 0,

    fontSize: 14,
    lineHeight: 19,

    fontWeight: '600',

    paddingRight: 8,
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
  timerValue: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    fontVariant: [
      'tabular-nums',
    ],
  },
  tipText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  cookHeaderTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  cookInstruction: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '600',
  },
  navButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cookSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 4,
  },
  largeStepNumber: {
    width: 48,
    height: 48,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 18,
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cookIngredientAmount: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  cookRecipeName: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
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
  cookFooter: {
    minHeight: 72,

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderTopWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },
  progressTrack: {
    height: 5,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cookHeaderSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  cookBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  headerSpacer: {
    width: 40,
  },
  ingredientRow: {
    minHeight: 58,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cookIngredientsContent: {
    paddingBottom: 24,
  },
  cookStepContent: {
    paddingBottom: 28,
  },
  doneText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
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
  timerHint: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
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
  emptyHint: {
    padding: 16,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  largeStepNumberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  tipBox: {
    marginTop: 11,

    paddingHorizontal: 11,
    paddingVertical: 9,

    borderRadius: 8,
    borderWidth: 1,
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
  cookStepCount: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  cookHeaderCenter: {
    flex: 1,
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
  timerControls: {
    flexDirection: 'row',
    gap: 8,
  },

  instructionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  instructionInfoButton: {
    width: 34,
    height: 34,
    marginTop: 2,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipRow: {
    marginTop: 14,
    gap: 10,
  },


  strictHint: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  strictHintText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
  },

});
