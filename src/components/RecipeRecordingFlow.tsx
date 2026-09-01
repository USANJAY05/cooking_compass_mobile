import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatUnitLabel } from '../utils/quantity';
import { scaleIngredientQuantity } from '../utils/nutrition';

export interface RecordingStep {
  step_number: number;
  instruction_text: string;
  timer_seconds?: number | null;
  tip?: string | null;
}

interface Props {
  visible: boolean;
  recipeName: string;
  ingredients: any[];
  ingredientScale: number;
  portionLabel: string;
  initialSteps: RecordingStep[];
  theme: any;
  onClose: () => void;
  onFinish: (steps: RecordingStep[]) => void;
}

export const RecipeRecordingFlow = ({
  visible,
  recipeName,
  ingredients,
  ingredientScale,
  portionLabel,
  initialSteps,
  theme,
  onClose,
  onFinish,
}: Props) => {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'ingredients' | 'recording'>('ingredients');
  const [steps, setSteps] = useState<RecordingStep[]>([]);
  const [index, setIndex] = useState(0);
  const [instruction, setInstruction] = useState('');
  const [tip, setTip] = useState('');

  useEffect(() => {
    if (!visible) return;
    const seeded = (initialSteps || []).map((step, i) => ({
      step_number: i + 1,
      instruction_text: step.instruction_text || '',
      timer_seconds: step.timer_seconds ?? null,
      tip: step.tip || '',
    }));
    setSteps(seeded);
    setIndex(0);
    setInstruction(seeded[0]?.instruction_text || '');
    setTip(seeded[0]?.tip || '');
    setPhase('ingredients');
  }, [visible, initialSteps]);

  const total = Math.max(steps.length, index + 1);
  const progress = Math.min(100, ((index + 1) / total) * 100);
  const isExistingStep = index < steps.length;

  const saveCurrentStep = () => {
    const text = instruction.trim();
    if (!text) return false;

    setSteps((previous) => {
      const next = [...previous];
      next[index] = {
        step_number: index + 1,
        instruction_text: text,
        timer_seconds: next[index]?.timer_seconds ?? null,
        tip: tip.trim() || null,
      };
      return next;
    });
    return true;
  };

  const nextStep = () => {
    if (!saveCurrentStep()) return;

    const nextIndex = index + 1;
    setIndex(nextIndex);
    setInstruction(steps[nextIndex]?.instruction_text || '');
    setTip(steps[nextIndex]?.tip || '');
  };

  const finish = () => {
    if (!saveCurrentStep()) return;

    const finalSteps = [...steps];
    finalSteps[index] = {
      step_number: index + 1,
      instruction_text: instruction.trim(),
      timer_seconds: finalSteps[index]?.timer_seconds ?? null,
      tip: tip.trim() || null,
    };

    onFinish(finalSteps.filter((step) => step.instruction_text.trim()).map((step, i) => ({
      ...step,
      step_number: i + 1,
    })));
  };

  const back = () => {
    if (index === 0) {
      setPhase('ingredients');
      return;
    }
    const previous = index - 1;
    setIndex(previous);
    setInstruction(steps[previous]?.instruction_text || '');
    setTip(steps[previous]?.tip || '');
  };

  const ingredientRows = useMemo(() => ingredients || [], [ingredients]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 12), borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={onClose} style={[styles.close, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <X size={18} color={theme.colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Recording mode</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>{recipeName}</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        {phase === 'ingredients' ? (
          <>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={[styles.hero, { color: theme.colors.text }]}>Let's cook and record it.</Text>
              <Text style={[styles.description, { color: theme.colors.textMuted }]}>We'll ask you what you did one step at a time. Your answers become the recipe's cooking notes.</Text>
              <Text style={[styles.portion, { color: theme.colors.primary }]}>For {portionLabel.toLowerCase()}</Text>
              <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {ingredientRows.length ? ingredientRows.map((ingredient, i) => (
                  <View key={i} style={[styles.ingredientRow, i < ingredientRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.ingredientName, { color: theme.colors.text }]}>{ingredient.name || `Ingredient #${ingredient.ingredient_id}`}</Text>
                    <Text style={[styles.amount, { color: theme.colors.textMuted }]}>{scaleIngredientQuantity(ingredient.quantity, ingredient.unit, ingredientScale)} {formatUnitLabel(ingredient.unit)}</Text>
                  </View>
                )) : <Text style={[styles.empty, { color: theme.colors.textMuted }]}>No ingredients listed.</Text>}
              </View>
            </ScrollView>
            <View style={[styles.footer, { borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 8) + 10 }]}>
              <TouchableOpacity onPress={() => setPhase('recording')} style={[styles.primary, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.primaryText}>{initialSteps?.length ? 'Start recording' : 'Start cooking'}</Text>
                <ChevronRight size={19} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.progressRow}>
                <Text style={[styles.progressText, { color: theme.colors.text }]}>Step {index + 1}</Text>
                <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>{Math.round(progress)}%</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
              </View>

              <Text style={[styles.question, { color: theme.colors.text }]}>What did you do?</Text>
              <Text style={[styles.hint, { color: theme.colors.textMuted }]}>Describe the action naturally, like you are telling someone how to make it.</Text>
              <TextInput
                autoFocus
                multiline
                value={instruction}
                onChangeText={setInstruction}
                placeholder="e.g. Heat oil in a pan, then add the onions."
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.textArea, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              />

              <Text style={[styles.label, { color: theme.colors.text }]}>Optional note</Text>
              <TextInput
                value={tip}
                onChangeText={setTip}
                placeholder="Anything you noticed or want to remember?"
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.noteInput, { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              />

              {isExistingStep ? (
                <Text style={[styles.existingHint, { color: theme.colors.textMuted }]}>This step already exists. Edit it if your real cooking process was different.</Text>
              ) : null}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: theme.colors.border, paddingBottom: Math.max(insets.bottom, 8) + 10 }]}>
              <TouchableOpacity onPress={back} style={[styles.secondary, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <ChevronLeft size={18} color={theme.colors.text} />
                <Text style={[styles.secondaryText, { color: theme.colors.text }]}>{index === 0 ? 'Ingredients' : 'Back'}</Text>
              </TouchableOpacity>
              <View style={styles.recordActions}>
                <TouchableOpacity
                  onPress={finish}
                  disabled={!instruction.trim()}
                  style={[styles.finishButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface, opacity: instruction.trim() ? 1 : 0.45 }]}
                >
                  <Check size={17} color={theme.colors.primary} />
                  <Text style={[styles.finishButtonText, { color: theme.colors.text }]}>Finish & save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={nextStep}
                  disabled={!instruction.trim()}
                  style={[styles.primary, { backgroundColor: theme.colors.primary, opacity: instruction.trim() ? 1 : 0.45 }]}
                >
                  <Text style={styles.primaryText}>Next step</Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 72, paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  close: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  spacer: { width: 40 },
  content: { padding: 20, paddingBottom: 32 },
  hero: { fontSize: 27, lineHeight: 34, fontWeight: '900' },
  description: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  portion: { fontSize: 13, fontWeight: '800', marginTop: 14 },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden', marginTop: 18 },
  ingredientRow: { minHeight: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ingredientName: { flex: 1, fontSize: 14, fontWeight: '600' },
  amount: { fontSize: 12, fontWeight: '700' },
  empty: { padding: 16 },
  footer: { paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, flexDirection: 'row', gap: 8 },
  primary: { flex: 1, minHeight: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  recordActions: { flex: 1, flexDirection: 'row', gap: 8 },
  finishButton: { minHeight: 48, paddingHorizontal: 13, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  finishButtonText: { fontSize: 12.5, fontWeight: '800' },
  secondary: { flex: 0.7, minHeight: 48, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 },
  secondaryText: { fontSize: 13, fontWeight: '700' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: 32 },
  progressFill: { height: '100%', borderRadius: 4 },
  question: { fontSize: 28, lineHeight: 35, fontWeight: '900' },
  hint: { fontSize: 13, lineHeight: 20, marginTop: 7, marginBottom: 18 },
  textArea: { minHeight: 150, borderWidth: 1, borderRadius: 16, padding: 15, fontSize: 16, lineHeight: 23, textAlignVertical: 'top' },
  label: { fontSize: 13, fontWeight: '800', marginTop: 18, marginBottom: 7 },
  noteInput: { minHeight: 52, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontSize: 14 },
  existingHint: { fontSize: 12, lineHeight: 18, marginTop: 10 },
});
