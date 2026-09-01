import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import {
  Plus,
  Trash2,
  Globe,
  Lock,
  Square,
  CheckSquare,
  Users,
  Scale,
  Info,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Timer,
  X,
  Tag,
} from 'lucide-react-native';

import {
  useTheme,
  colors,
} from '../theme';

import { useCreateRecipe, useRecipeDetail, useUpdateRecipe } from '../api/recipes';

import { useCategories } from '../api/categories';

import {
  useIngredients,
  useSearchIngredients,
  Ingredient,
} from '../api/ingredients';

import { Dropdown } from '../components/Dropdown';
import { QuantityInput } from '../components/QuantityInput';
import { CategoryMultiSelect } from '../components/CategoryMultiSelect';
import { SearchListModal } from '../components/SearchListModal';
import { DurationPickerField } from '../components/DurationPickerField';
import {
  RecipeCreationMode,
  getRecipeCreationMode,
  setRecipeCreationMode,
  getDefaultRecipeCreationMode,
} from '../settings/RecipeCreationMode';

import { INGREDIENT_UNITS } from '../constants/units';

import {
  getDefaultQuantityForUnit,
  parseQuantity,
} from '../utils/quantity';

/* ==========================================================================
   TYPES
============================================================================ */

interface SelectedIngredient {
  ingredient_id: number;
  name: string;
  quantity: string;
  unit: string;
  display_order: number;
}

interface InstructionStep {
  step_number: number;
  instruction_text: string;
  timerSeconds?: number;
  tip?: string;
}

type CookedQuantityUnit =
  | 'kg'
  | 'g'
  | 'mg'
  | 'l'
  | 'ml'
  | 'oz';

/* ==========================================================================
   UNIT HELPERS
============================================================================ */

const normalizeCookedQuantityUnit = (
  unit?: string | null,
): CookedQuantityUnit => {
  const normalized = String(unit ?? '')
    .trim()
    .toLowerCase();

  switch (normalized) {
    case 'kg':
      return 'kg';

    case 'g':
    case 'gram':
    case 'grams':
      return 'g';

    case 'mg':
      return 'mg';

    case 'l':
    case 'lt':
    case 'ltr':
    case 'liter':
    case 'litre':
    case 'liters':
    case 'litres':
      return 'l';

    case 'ml':
    case 'milliliter':
    case 'millilitre':
    case 'milliliters':
    case 'millilitres':
      return 'ml';

    case 'oz':
    case 'ounce':
    case 'ounces':
      return 'oz';

    default:
      return 'g';
  }
};

const COOKED_QUANTITY_UNITS = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'mg', value: 'mg' },
  { label: 'l', value: 'l' },
  { label: 'ml', value: 'ml' },
  { label: 'oz', value: 'oz' },
];


const formatTimer = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const WizardStepTimer = ({ valueSeconds, onChangeSeconds, theme }: any) => {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(valueSeconds || 0);

  useEffect(() => {
    if (!running) return;
    const startedAt = Date.now() - elapsed * 1000;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) setElapsed(valueSeconds || 0);
  }, [valueSeconds, running]);

  const stopAndSave = () => {
    setRunning(false);
    onChangeSeconds(elapsed);
  };

  const handleTimeChange = (seconds: number) => {
    if (running) setRunning(false);
    setElapsed(seconds);
    onChangeSeconds(seconds);
  };

  return (
    <View style={styles.wizardTimer}>
      <View style={styles.wizardTimerRow}>
        <View style={styles.wizardTimerPickerWrap}>
          <DurationPickerField
            valueSeconds={running ? elapsed : valueSeconds || 0}
            onChangeSeconds={handleTimeChange}
            compact
          />
        </View>
        <TouchableOpacity
          onPress={() => (running ? stopAndSave() : setRunning(true))}
          style={[styles.wizardTimerButton, { backgroundColor: theme.colors.primary }]}
        >
          <Play size={15} color="#fff" fill="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>
            {running ? 'Stop & save' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ==========================================================================
   SCREEN
============================================================================ */

export const RecipeFormScreen = ({
  navigation,
  route,
  mode = 'create',
}: any) => {
  const { theme } = useTheme();
  const recipeId = route?.params?.recipeId as number | undefined;
  const isEdit = mode === 'edit';
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const recipeQuery = useRecipeDetail(recipeId);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  /* ------------------------------------------------------------------------
     BASIC INFO
  ------------------------------------------------------------------------ */

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [preparationTime, setPreparationTime] = useState(0);
  const [cookingTime, setCookingTime] = useState(0);
  const [servings, setServings] = useState('2');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');

  const commitTagDraft = () => {
    const drafts = tagDraft
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (drafts.length === 0) {
      setTagDraft('');
      return;
    }

    setTagNames((current) => {
      const next = [...current];
      for (const tag of drafts) {
        if (next.length >= 50) break;
        const normalized = tag.replace(/^#/, '').trim();
        if (!normalized) continue;
        if (!next.some((existing) => existing.toLowerCase() === normalized.toLowerCase())) {
          next.push(normalized);
        }
      }
      return next;
    });
    setTagDraft('');
  };

  const removeTag = (tagToRemove: string) => {
    setTagNames((current) => current.filter((tag) => tag !== tagToRemove));
  };
  const [creationMode, setCreationMode] = useState<RecipeCreationMode>('normal');
  const [creationModeLoaded, setCreationModeLoaded] = useState(isEdit);

  /* ------------------------------------------------------------------------
     FINAL COOKED QUANTITY
  ------------------------------------------------------------------------ */

  const [cookedWeight, setCookedWeight] = useState('');
  const [cookedWeightUnit, setCookedWeightUnit] = useState<CookedQuantityUnit>('g');
  const [recordingStep, setRecordingStep] = useState(0);

  /* ------------------------------------------------------------------------
     INGREDIENTS
  ------------------------------------------------------------------------ */

  const [recipeIngredients, setRecipeIngredients] = useState<SelectedIngredient[]>([]);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');

  /* ------------------------------------------------------------------------
     INSTRUCTIONS
  ------------------------------------------------------------------------ */

  const [instructions, setInstructions] = useState<InstructionStep[]>([
    { step_number: 1, instruction_text: '', timerSeconds: 0, tip: '' },
  ]);


  /* ------------------------------------------------------------------------
     DATA
  ------------------------------------------------------------------------ */

  const { data: categories = [] } = useCategories();

  const { data: defaultIngredients = [] } = useIngredients(1, 50);

  const { data: searchResults = [] } = useSearchIngredients(ingredientSearchQuery);

  const displayedIngredients =
    ingredientSearchQuery.trim().length > 0 ? searchResults : defaultIngredients;

  useEffect(() => {
    if (isEdit) return;
    void getDefaultRecipeCreationMode().then((mode) => {
      setCreationMode(mode);
      setCreationModeLoaded(true);
    });
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit || !recipeQuery.data) return;
    const recipe = recipeQuery.data;
    setName(recipe.name || '');
    setDescription(recipe.description || '');
    setPreparationTime(Math.max(0, Number(recipe.preparation_time ?? 0) * 60));
    setCookingTime(Math.max(0, Number(recipe.cooking_time ?? 0) * 60));
    setServings(recipe.servings ? String(recipe.servings) : '1');
    setVisibility(recipe.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE');
    setSelectedCategoryIds(Array.isArray(recipe.category_ids) ? recipe.category_ids : []);
    setTagNames(Array.isArray(recipe.tag_names) ? recipe.tag_names.filter((tag: any) => typeof tag === 'string' && tag.trim()).map((tag: string) => tag.trim()) : []);
    void getRecipeCreationMode(recipe.id).then(setCreationMode);
    const cooked = Number(recipe.cooked_weight_amount);
    setCookedWeight(Number.isFinite(cooked) && cooked > 0 ? String(cooked) : '');
    setCookedWeightUnit(normalizeCookedQuantityUnit(recipe.cooked_weight_unit));
    setRecipeIngredients((recipe.ingredients || []).map((item: any, index: number) => ({
      ingredient_id: Number(item.ingredient_id),
      name: item.name || `Ingredient #${item.ingredient_id}`,
      quantity: item.quantity != null ? String(item.quantity) : getDefaultQuantityForUnit(item.unit || 'g'),
      unit: item.unit || 'g',
      display_order: Number(item.display_order) || index + 1,
    })));
    setInstructions((recipe.instructions || []).length > 0
      ? recipe.instructions.map((item: any, index: number) => ({
          step_number: index + 1,
          instruction_text: item.instruction_text || '',
          timerSeconds: Number(item.timer_seconds) || 0,
          tip: item.tip || '',
        }))
      : [{ step_number: 1, instruction_text: '', timerSeconds: 0, tip: '' }]
    );
  }, [isEdit, recipeQuery.data]);

  /* ==========================================================================
     COOKED QUANTITY CALCULATIONS
  ========================================================================== */

  const cookedWeightNumeric = useMemo(() => {
    const value = parseFloat(cookedWeight.replace(',', '.'));

    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return value;
  }, [cookedWeight]);

  const weightPerServing = useMemo(() => {
    const servingCount = parseInt(servings, 10);

    if (
      cookedWeightNumeric === null ||
      !Number.isFinite(servingCount) ||
      servingCount <= 0
    ) {
      return null;
    }

    return cookedWeightNumeric / servingCount;
  }, [cookedWeightNumeric, servings]);

  /* ==========================================================================
     INGREDIENT HELPERS
  ========================================================================== */

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setIngredientSearchQuery('');
  };

  const toggleIngredientInRecipe = (ingredient: Ingredient) => {
    const alreadySelected = recipeIngredients.some(
      (item) => item.ingredient_id === ingredient.id,
    );

    if (alreadySelected) {
      const updated = recipeIngredients.filter(
        (item) => item.ingredient_id !== ingredient.id,
      );

      setRecipeIngredients(
        updated.map((item, index) => ({
          ...item,
          display_order: index + 1,
        })),
      );

      return;
    }

    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredient_id: ingredient.id,
        name: ingredient.name,
        quantity: getDefaultQuantityForUnit(ingredient.default_unit || 'g'),
        unit: ingredient.default_unit || 'g',
        display_order: recipeIngredients.length + 1,
      },
    ]);
  };

  const updateIngredient = (
    index: number,
    field: 'quantity' | 'unit',
    value: string,
  ) => {
    const updated = [...recipeIngredients];

    if (field === 'unit') {
      updated[index] = {
        ...updated[index],
        unit: value,
        quantity: getDefaultQuantityForUnit(value),
      };
    } else {
      updated[index] = {
        ...updated[index],
        quantity: value,
      };
    }

    setRecipeIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    const updated = recipeIngredients.filter((_, i) => i !== index);

    setRecipeIngredients(
      updated.map((item, i) => ({
        ...item,
        display_order: i + 1,
      })),
    );
  };

  /* ==========================================================================
     INSTRUCTION HELPERS
  ========================================================================== */

  const addInstructionStep = () => {
    setInstructions([
      ...instructions,
      {
        step_number: instructions.length + 1,
        instruction_text: '',
        timerSeconds: 0,
        tip: '',
      },
    ]);
  };

  const updateInstruction = (
    index: number,
    field: 'instruction_text' | 'tip',
    value: string,
  ) => {
    const updated = [...instructions];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setInstructions(updated);
  };

  const updateInstructionTimer = (index: number, seconds: number) => {
    const updated = [...instructions];

    updated[index] = {
      ...updated[index],
      timerSeconds: seconds,
    };

    setInstructions(updated);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length === 1) {
      Alert.alert(
        'Required',
        'A recipe must have at least one instruction step.',
      );

      return;
    }

    const updated = instructions.filter((_, i) => i !== index);

    setInstructions(
      updated.map((item, i) => ({
        ...item,
        step_number: i + 1,
      })),
    );
  };

  /* ==========================================================================
     INPUT HELPERS
  ========================================================================== */

  const handleServingsChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setServings(cleaned);
  };

  const handleCookedWeightChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, '');
    setCookedWeight(cleaned);
  };

  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing Recipe Name', 'Please enter a recipe name.');
      return;
    }

    const prep = Number(preparationTime) || 0;
    const cook = Number(cookingTime) || 0;
    const serv = parseInt(servings, 10);

    if (!Number.isFinite(serv) || serv <= 0) {
      Alert.alert('Invalid Servings', 'Please enter at least 1 serving.');
      return;
    }

    /* ----------------------------------------------------------
       COOKED QUANTITY
    ---------------------------------------------------------- */

    let cookedWeightAmount: number | null = null;

    if (cookedWeight.trim()) {
      cookedWeightAmount = parseFloat(cookedWeight.replace(',', '.'));

      if (!Number.isFinite(cookedWeightAmount) || cookedWeightAmount <= 0) {
        Alert.alert(
          'Invalid Cooked Quantity',
          'Please enter a valid final cooked quantity.',
        );

        return;
      }
    }

    /* ----------------------------------------------------------
       INGREDIENTS
    ---------------------------------------------------------- */

    if (recipeIngredients.length === 0) {
      Alert.alert('Missing Ingredients', 'Please add at least one ingredient.');
      return;
    }

    /* ----------------------------------------------------------
       INSTRUCTIONS
    ---------------------------------------------------------- */

    const validInstructions = instructions.filter(
      (item) => item.instruction_text.trim().length > 0,
    );

    if (validInstructions.length === 0 && creationMode === 'normal') {
      Alert.alert(
        'Missing Instructions',
        'Please enter at least one preparation step.',
      );

      return;
    }

    /* ----------------------------------------------------------
       PAYLOAD
    ---------------------------------------------------------- */

    const payload: any = {
      name: name.trim(),
      description: description.trim() || null,
      preparation_time: Math.ceil(prep / 60),
      cooking_time: Math.ceil(cook / 60),
      total_time: Math.ceil((prep + cook) / 60),
      servings: serv,
      visibility,
      category_ids: selectedCategoryIds,
      tag_names: tagNames,

      ingredients: recipeIngredients.map((item) => ({
        ingredient_id: item.ingredient_id,
        name: item.name.trim(),
        quantity: parseQuantity(item.quantity, item.unit),
        unit: item.unit.trim() || 'g',
        display_order: item.display_order,
      })),

      instructions: validInstructions.map((item, index) => ({
        step_number: index + 1,
        instruction_text: item.instruction_text.trim(),
        timer_seconds: item.timerSeconds ? item.timerSeconds : null,
        tip: item.tip?.trim() || null,
      })),
    };

    if (cookedWeightAmount !== null) {
      payload.cooked_weight_amount = cookedWeightAmount;
      payload.cooked_weight_unit = cookedWeightUnit;
    } else {
      payload.cooked_weight_amount = null;
      payload.cooked_weight_unit = null;
    }

    const callbacks = {
      onSuccess: (result: any) => {
        const savedId = Number(result?.id ?? recipeId);
        if (Number.isFinite(savedId) && savedId > 0) {
          void setRecipeCreationMode(savedId, creationMode);
        }
        Alert.alert(
          isEdit ? 'Recipe Updated' : 'Recipe Created',
          creationMode === 'recording'
            ? 'Your recipe has been saved. Use Cook to record the steps while you make it.'
            : isEdit ? 'Your recipe has been updated successfully!' : 'Your recipe has been created successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      },
      onError: (err: any) => {
        const errorDetail = err?.response?.data?.detail;
        const message = Array.isArray(errorDetail)
          ? errorDetail.map((detail: any) => {
              const field = Array.isArray(detail.loc) ? detail.loc.filter((part: string) => part !== 'body').join('.') : '';
              return field ? `${field}: ${detail.msg}` : detail.msg;
            }).join('\n')
          : typeof errorDetail === 'string' ? errorDetail : `Failed to ${isEdit ? 'update' : 'create'} recipe. Please check your entries.`;
        Alert.alert(isEdit ? 'Unable to Update Recipe' : 'Unable to Create Recipe', message);
      },
    };
    if (isEdit) {
      if (!recipeId) return;
      updateMutation.mutate({ id: recipeId, data: payload }, callbacks);
    } else {
      createMutation.mutate(payload, callbacks);
    }
  };

  /* ==========================================================================
     RECORDING WIZARD
  ========================================================================== */

  const recordingSteps = ['Info', 'Ingredients', 'Steps', 'Details', 'Visibility'];

  const goToRecordingStep = (next: number) => {
    if (next < 0 || next >= recordingSteps.length) return;
    setRecordingStep(next);
  };

  const nextRecordingStep = () => {
    if (recordingStep === 0 && !name.trim()) {
      Alert.alert('Missing Recipe Name', 'Add a recipe name before continuing.');
      return;
    }
    if (recordingStep === 1 && recipeIngredients.length === 0) {
      Alert.alert('Missing Ingredients', 'Add at least one ingredient. You can always come back and add more.');
      return;
    }
    if (recordingStep === 2 && instructions.filter((item) => item.instruction_text.trim()).length === 0) {
      Alert.alert('Missing Steps', 'Add at least one cooking step.');
      return;
    }
    if (recordingStep === 3) {
      const serv = parseInt(servings, 10);
      if (!Number.isFinite(serv) || serv <= 0) {
        Alert.alert('Invalid Servings', 'Enter at least 1 serving.');
        return;
      }
      if (cookedWeight.trim()) {
        const value = parseFloat(cookedWeight.replace(',', '.'));
        if (!Number.isFinite(value) || value <= 0) {
          Alert.alert('Invalid Cooked Quantity', 'Enter a valid final cooked quantity or leave it blank.');
          return;
        }
      }
    }
    setRecordingStep((value) => Math.min(value + 1, recordingSteps.length - 1));
  };

  const renderRecordingWizard = () => (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.wizardFixedHeader, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wizardStepper}
          keyboardShouldPersistTaps="handled"
        >
          {recordingSteps.map((label, index) => {
            const active = index === recordingStep;
            const complete = index < recordingStep;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => goToRecordingStep(index)}
                activeOpacity={0.8}
                style={styles.wizardStepTab}
              >
                <View
                  style={[
                    styles.wizardStepCircle,
                    {
                      borderColor: active || complete ? theme.colors.primary : theme.colors.border,
                      backgroundColor: complete ? theme.colors.primary : theme.colors.surface,
                    },
                  ]}
                >
                  {complete ? (
                    <Check size={14} color="#fff" />
                  ) : (
                    <Text style={[styles.wizardStepNumber, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text numberOfLines={1} style={[styles.wizardStepLabel, { color: active ? theme.colors.primary : theme.colors.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {recordingStep === 1 && (
        <View
          style={[
            styles.wizardFixedIngredientAction,
            {
              backgroundColor: theme.colors.background,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsIngredientModalOpen(true)}
            style={[
              styles.wizardAddButton,
              styles.wizardAddButtonFixed,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Plus size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add ingredients</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.wizardBody}
        contentContainerStyle={styles.wizardBodyContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wizardSectionContent}>
          {recordingStep === 0 && (
            <View>
              <View style={styles.wizardField}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
                <TextInput value={name} onChangeText={setName} placeholder="Recipe name" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
              </View>
              <View style={styles.wizardFieldLast}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
                <TextInput value={description} onChangeText={setDescription} multiline numberOfLines={4} placeholder="Recipe description" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.wizardDescriptionInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
              </View>
              <View style={styles.wizardField}>
                <CategoryMultiSelect
                  label="Categories"
                  categories={categories}
                  selectedIds={selectedCategoryIds}
                  onChange={setSelectedCategoryIds}
                  placeholder={categories.length ? "Select categories..." : "Loading categories..."}
                />
              </View>
              <View style={styles.wizardFieldLast}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
                <View style={[styles.tagInputBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                  <View style={styles.tagChipWrap}>
                    {tagNames.map((tag) => (
                      <View key={tag} style={[styles.tagChip, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '30' }]}>
                        <Text style={[styles.tagChipText, { color: theme.colors.primary }]}>{tag}</Text>
                        <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={6}>
                          <X size={13} color={theme.colors.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TextInput
                      value={tagDraft}
                      onChangeText={setTagDraft}
                      onSubmitEditing={commitTagDraft}
                      onBlur={commitTagDraft}
                      placeholder={tagNames.length ? 'Add another tag' : 'e.g. quick, healthy'}
                      placeholderTextColor={theme.colors.textMuted}
                      style={[styles.tagDraftInput, { color: theme.colors.text }]}
                      returnKeyType="done"
                    />
                  </View>
                </View>
                <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>Separate tags with commas.</Text>
              </View>
            </View>
          )}

          {recordingStep === 1 && (
            <View style={styles.wizardIngredientsContent}>
              <View style={styles.wizardIngredientsListSpace}>
              {recipeIngredients.length === 0 ? (
                <Text style={[styles.wizardEmpty, { color: theme.colors.textMuted }]}>No ingredients yet.</Text>
              ) : recipeIngredients.map((item, index) => (
                <View key={`${item.ingredient_id}-${index}`} style={[styles.wizardIngredient, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                  <Text style={[styles.ingredientName, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <QuantityInput compact value={item.quantity} unit={item.unit} onChange={(value) => updateIngredient(index, 'quantity', value)} />
                  <Dropdown value={item.unit} options={INGREDIENT_UNITS} onChange={(value) => updateIngredient(index, 'unit', value)} compact />
                  <TouchableOpacity onPress={() => removeIngredient(index)} style={styles.deleteButton}><Trash2 size={17} color={colors.error} /></TouchableOpacity>
                </View>
              ))}
              </View>
            </View>
          )}

          {recordingStep === 2 && (
            <View>
              {instructions.map((step, index) => (
                <View key={index} style={[styles.wizardInstruction, { borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
                  <View style={styles.stepHeader}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                    <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Step {index + 1}</Text>
                    {instructions.length > 1 && <TouchableOpacity onPress={() => removeInstruction(index)} style={styles.deleteStepButton}><Trash2 size={17} color={colors.error} /></TouchableOpacity>}
                  </View>
                  <TextInput value={step.instruction_text} onChangeText={(value) => updateInstruction(index, 'instruction_text', value)} multiline numberOfLines={4} placeholder={`What do you do in step ${index + 1}?`} placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.stepInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                  <WizardStepTimer valueSeconds={step.timerSeconds || 0} onChangeSeconds={(seconds) => updateInstructionTimer(index, seconds)} theme={theme} />
                  <View style={styles.wizardFieldLast}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>Tip</Text>
                    <TextInput value={step.tip} onChangeText={(value) => updateInstruction(index, 'tip', value)} placeholder="Optional" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                  </View>
                </View>
              ))}
              <TouchableOpacity activeOpacity={0.8} onPress={addInstructionStep} style={[styles.wizardAddButton, { backgroundColor: theme.colors.primary }]}>
                <Plus size={18} color="#fff" /><Text style={styles.addButtonText}>Add another step</Text>
              </TouchableOpacity>
            </View>
          )}

          {recordingStep === 3 && (
            <View>
              <View style={styles.wizardField}><DurationPickerField label="Prep time" valueSeconds={preparationTime} onChangeSeconds={setPreparationTime} /></View>
              <View style={styles.wizardField}><DurationPickerField label="Cook time" valueSeconds={cookingTime} onChangeSeconds={setCookingTime} /></View>
              <View style={styles.wizardField}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Servings</Text>
                <TextInput keyboardType="number-pad" value={servings} onChangeText={handleServingsChange} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
              </View>
              <View style={styles.wizardFieldLast}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Final cooked quantity</Text>
                <View style={styles.wizardQuantityRow}><TextInput keyboardType="decimal-pad" value={cookedWeight} onChangeText={handleCookedWeightChange} placeholder="e.g. 1000" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { flex: 1, color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} /><Dropdown value={cookedWeightUnit} options={COOKED_QUANTITY_UNITS} onChange={(value) => setCookedWeightUnit(value as CookedQuantityUnit)} compact /></View>
              </View>
            </View>
          )}

          {recordingStep === 4 && (
            <View>
              {(['PRIVATE', 'PUBLIC'] as const).map((value) => {
                const selected = visibility === value;
                return (
                  <TouchableOpacity key={value} onPress={() => setVisibility(value)} style={[styles.visibilityOption, styles.wizardVisibilityOption, { borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: selected ? theme.colors.primary + '10' : theme.colors.background }]}>
                    {value === 'PUBLIC' ? <Globe size={20} color={selected ? theme.colors.primary : theme.colors.textMuted} /> : <Lock size={20} color={selected ? theme.colors.primary : theme.colors.textMuted} />}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.modeTitle, { color: theme.colors.text }]}>{value === 'PUBLIC' ? 'Public' : 'Private'}</Text>
                      <Text style={[styles.modeDescription, { color: theme.colors.textMuted }]}>{value === 'PUBLIC' ? 'Anyone can view this recipe.' : 'Only you can view this recipe.'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.wizardFixedFooter, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border, paddingBottom: 24 }]}>
        <TouchableOpacity disabled={recordingStep === 0} onPress={() => setRecordingStep((value) => Math.max(0, value - 1))} style={[styles.wizardNavSecondary, { borderColor: theme.colors.border, opacity: recordingStep === 0 ? 0.35 : 1 }]}>
          <ChevronLeft size={18} color={theme.colors.text} /><Text style={[styles.wizardNavSecondaryText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>
        {recordingStep < recordingSteps.length - 1 ? (
          <TouchableOpacity onPress={nextRecordingStep} style={[styles.wizardNavPrimary, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.wizardNavPrimaryText}>Next</Text><ChevronRight size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSubmit} disabled={isSaving} style={[styles.wizardNavPrimary, { backgroundColor: theme.colors.primary, opacity: isSaving ? 0.65 : 1 }]}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <><Check size={18} color="#fff" /><Text style={styles.wizardNavPrimaryText}>Save recipe</Text></>}
          </TouchableOpacity>
        )}
      </View>

      <SearchListModal
        visible={isIngredientModalOpen}
        onClose={closeIngredientModal}
        title="Add Ingredients"
        data={displayedIngredients}
        keyExtractor={(item) => item.id.toString()}
        searchQuery={ingredientSearchQuery}
        onSearchChange={setIngredientSearchQuery}
        searchPlaceholder="Search ingredients..."
        ListEmptyComponent={<View style={styles.emptyListContainer}><Text style={{ color: theme.colors.textMuted }}>No ingredients found.</Text></View>}
        footer={<TouchableOpacity activeOpacity={0.85} style={[styles.modalDoneButton, { backgroundColor: theme.colors.primary }]} onPress={closeIngredientModal}><Text style={styles.modalDoneButtonText}>Done</Text></TouchableOpacity>}
        renderItem={({ item }) => {
          const isSelected = recipeIngredients.some((entry) => entry.ingredient_id === item.id);
          return <TouchableOpacity activeOpacity={0.7} style={[styles.ingredientSelectItem, { borderBottomColor: theme.colors.border }, isSelected && { backgroundColor: theme.colors.primary + '10' }]} onPress={() => toggleIngredientInRecipe(item)}>{isSelected ? <CheckSquare size={21} color={theme.colors.primary} /> : <Square size={21} color={theme.colors.textMuted} />}<View style={styles.ingredientSelectContent}><Text style={[styles.ingredientSelectName, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>{item.description ? <Text style={[styles.ingredientSelectDesc, { color: theme.colors.textMuted }]} numberOfLines={1}>{item.description}</Text> : null}</View><Text style={[styles.defaultUnitBadge, { color: theme.colors.textMuted }]}>{item.default_unit}</Text></TouchableOpacity>;
        }}
      />
    </KeyboardAvoidingView>
  );

  /* ==========================================================================
     UI
  ========================================================================== */

  if (!isEdit && !creationModeLoaded) {
    return <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (!isEdit && creationMode === 'recording') {
    return renderRecordingWizard();
  }

  if (isEdit && recipeQuery.isLoading) {
    return <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (isEdit && (recipeQuery.isError || !recipeQuery.data)) {
    return <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}><Text style={[styles.errorText, { color: theme.colors.text }]}>Unable to load this recipe.</Text><TouchableOpacity onPress={() => recipeQuery.refetch()} style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        {/* <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: theme.colors.text }]}>
            Create Recipe
          </Text>

          <Text style={[styles.pageSubtitle, { color: theme.colors.textMuted }]}>
            Add the details, ingredients and preparation steps.
          </Text>
        </View> */}

        {/* RECIPE DETAILS */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: theme.colors.primary + '14' },
              ]}
            >
              <Text style={[styles.sectionIconText, { color: theme.colors.primary }]}>
                🍴
              </Text>
            </View>

            <View style={styles.sectionTitleContent}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recipe Details
              </Text>

              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Tell us about your dish
              </Text>
            </View>
          </View>

          {/* NAME */}

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              Recipe name
              <Text style={{ color: colors.error }}> *</Text>
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              placeholder="e.g. Avocado Toast"
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* DESCRIPTION */}

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>

            <TextInput
              style={[
                styles.input,
                styles.descriptionInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              placeholder="What makes this recipe special?"
              placeholderTextColor={theme.colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* TIME */}

          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <DurationPickerField label="Prep time" valueSeconds={preparationTime} onChangeSeconds={setPreparationTime} />
            </View>
            <View style={styles.infoColumn}>
              <DurationPickerField label="Cook time" valueSeconds={cookingTime} onChangeSeconds={setCookingTime} />
            </View>
          </View>

          {/* SERVINGS */}

          <View style={styles.field}>
            <View style={styles.labelWithIcon}>
              <Users size={14} color={theme.colors.textMuted} />

              <Text
                style={[styles.label, { color: theme.colors.text, marginBottom: 0 }]}
              >
                Servings
                <Text style={{ color: colors.error }}> *</Text>
              </Text>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  marginTop: 7,
                },
              ]}
              keyboardType="number-pad"
              placeholder="e.g. 2"
              placeholderTextColor={theme.colors.textMuted}
              value={servings}
              onChangeText={handleServingsChange}
            />

            <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>
              The number of servings this recipe makes.
            </Text>
          </View>

          {/* FINAL COOKED QUANTITY */}

          <View
            style={[
              styles.cookedWeightCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.cookedWeightHeader}>
              <View
                style={[
                  styles.cookedWeightIcon,
                  { backgroundColor: theme.colors.primary + '14' },
                ]}
              >
                <Scale size={17} color={theme.colors.primary} />
              </View>

              <View style={styles.cookedWeightHeaderText}>
                <View style={styles.titleWithOptional}>
                  <Text
                    style={[styles.cookedWeightTitle, { color: theme.colors.text }]}
                  >
                    Final cooked quantity
                  </Text>

                  <View
                    style={[
                      styles.optionalBadge,
                      { backgroundColor: theme.colors.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionalBadgeText,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      OPTIONAL
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.cookedWeightSubtitle,
                    { color: theme.colors.textMuted },
                  ]}
                >
                  Enter the final amount after cooking.
                </Text>
              </View>
            </View>

            <View style={styles.weightInputRow}>
              <TextInput
                style={[
                  styles.weightInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                keyboardType="decimal-pad"
                placeholder="e.g. 2"
                placeholderTextColor={theme.colors.textMuted}
                value={cookedWeight}
                onChangeText={handleCookedWeightChange}
              />

              <Dropdown
                value={cookedWeightUnit}
                options={COOKED_QUANTITY_UNITS}
                onChange={(value) => setCookedWeightUnit(normalizeCookedQuantityUnit(value))}
                compact
                style={styles.cookedUnitDropdown}
              />
            </View>

            <View
              style={[
                styles.weightInfo,
                { backgroundColor: theme.colors.primary + '0A' },
              ]}
            >
              <Info size={15} color={theme.colors.primary} />

              <Text style={[styles.weightInfoText, { color: theme.colors.textMuted }]}>
                This quantity is used when the user adjusts a recipe by quantity
                instead of servings.
              </Text>
            </View>

            {weightPerServing !== null && cookedWeightNumeric !== null ? (
              <View
                style={[
                  styles.perServingCard,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View>
                  <Text
                    style={[styles.perServingLabel, { color: theme.colors.textMuted }]}
                  >
                    APPROXIMATE PER SERVING
                  </Text>

                  <Text style={[styles.perServingValue, { color: theme.colors.text }]}>
                    {weightPerServing} {cookedWeightUnit}
                  </Text>
                </View>

                <Users size={18} color={theme.colors.primary} />
              </View>
            ) : null}
          </View>

          {/* VISIBILITY */}

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Visibility</Text>

            <View style={styles.visibilityRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.visibilityOption,
                  { borderColor: theme.colors.border },
                  visibility === 'PRIVATE' && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setVisibility('PRIVATE')}
              >
                <Lock
                  size={17}
                  color={visibility === 'PRIVATE' ? '#fff' : theme.colors.textMuted}
                />

                <View>
                  <Text
                    style={[
                      styles.visibilityTitle,
                      { color: visibility === 'PRIVATE' ? '#fff' : theme.colors.text },
                    ]}
                  >
                    Private
                  </Text>

                  <Text
                    style={[
                      styles.visibilityDescription,
                      {
                        color:
                          visibility === 'PRIVATE'
                            ? '#ffffffcc'
                            : theme.colors.textMuted,
                      },
                    ]}
                  >
                    Only you can see it
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.visibilityOption,
                  { borderColor: theme.colors.border },
                  visibility === 'PUBLIC' && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setVisibility('PUBLIC')}
              >
                <Globe
                  size={17}
                  color={visibility === 'PUBLIC' ? '#fff' : theme.colors.textMuted}
                />

                <View>
                  <Text
                    style={[
                      styles.visibilityTitle,
                      { color: visibility === 'PUBLIC' ? '#fff' : theme.colors.text },
                    ]}
                  >
                    Public Feed
                  </Text>

                  <Text
                    style={[
                      styles.visibilityDescription,
                      {
                        color:
                          visibility === 'PUBLIC' ? '#ffffffcc' : theme.colors.textMuted,
                      },
                    ]}
                  >
                    Share with others
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* CATEGORIES */}

        <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: theme.colors.primary + '14' },
                ]}
              >
                <Text
                  style={[styles.sectionIconText, { color: theme.colors.primary }]}
                >
                  #
                </Text>
              </View>

              <View style={styles.sectionTitleContent}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Categories
                </Text>

                <Text
                  style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}
                >
                  Organize your recipe
                </Text>
              </View>
            </View>

            <CategoryMultiSelect
              label=""
              categories={categories}
              selectedIds={selectedCategoryIds}
              onChange={setSelectedCategoryIds}
              placeholder="Select categories..."
            />
          </View>

        {/* TAGS */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIcon, { backgroundColor: theme.colors.primary + '14' }]}>
              <Tag size={17} color={theme.colors.primary} />
            </View>
            <View style={styles.sectionTitleContent}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tags</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>Add searchable labels</Text>
            </View>
          </View>
          <View style={[styles.tagInputBox, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
            <View style={styles.tagChipWrap}>
              {tagNames.map((tag) => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: theme.colors.primary + '12', borderColor: theme.colors.primary + '30' }]}>
                  <Text style={[styles.tagChipText, { color: theme.colors.primary }]}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)} hitSlop={6}>
                    <X size={13} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              <TextInput
                value={tagDraft}
                onChangeText={setTagDraft}
                onSubmitEditing={commitTagDraft}
                onBlur={commitTagDraft}
                placeholder={tagNames.length ? 'Add another tag' : 'e.g. quick, healthy'}
                placeholderTextColor={theme.colors.textMuted}
                style={[styles.tagDraftInput, { color: theme.colors.text }]}
                returnKeyType="done"
              />
            </View>
          </View>
          <Text style={[styles.helperText, { color: theme.colors.textMuted }]}>Separate tags with commas.</Text>
        </View>

        {/* INGREDIENTS */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: theme.colors.primary + '14' },
              ]}
            >
              <Text style={[styles.sectionIconText, { color: theme.colors.primary }]}>
                🥕
              </Text>
            </View>

            <View style={styles.sectionTitleContent}>
              <View style={styles.sectionHeaderLine}>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Ingredients
                  </Text>

                  <Text
                    style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}
                  >
                    {recipeIngredients.length === 0
                      ? 'Add what you need'
                      : `${recipeIngredients.length} ${
                          recipeIngredients.length === 1 ? 'ingredient' : 'ingredients'
                        } added`}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setIsIngredientModalOpen(true)}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {recipeIngredients.length === 0 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.emptyIngredients,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              onPress={() => setIsIngredientModalOpen(true)}
            >
              <Plus size={22} color={theme.colors.primary} />

              <Text
                style={[styles.emptyIngredientsTitle, { color: theme.colors.text }]}
              >
                Add ingredients
              </Text>

              <Text
                style={[
                  styles.emptyIngredientsText,
                  { color: theme.colors.textMuted },
                ]}
              >
                Select ingredients for your recipe
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.ingredientsList,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              {recipeIngredients.map((item, index) => (
                <View
                  key={`${item.ingredient_id}-${index}`}
                  style={[
                    styles.ingredientRow,
                    index < recipeIngredients.length - 1 && {
                      borderBottomColor: theme.colors.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View style={styles.ingredientNumber}>
                    <Text
                      style={[
                        styles.ingredientNumberText,
                        { color: theme.colors.textMuted },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <Text
                    style={[styles.ingredientName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <QuantityInput
                    compact
                    value={item.quantity}
                    unit={item.unit}
                    onChange={(value) => updateIngredient(index, 'quantity', value)}
                  />

                  <Dropdown
                    value={item.unit}
                    options={INGREDIENT_UNITS}
                    onChange={(value) => updateIngredient(index, 'unit', value)}
                    compact
                  />

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => removeIngredient(index)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={17} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* PREPARATION */}

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: theme.colors.primary + '14' },
              ]}
            >
              <Text style={[styles.sectionIconText, { color: theme.colors.primary }]}>
                ☰
              </Text>
            </View>

            <View style={styles.sectionTitleContent}>
              <View style={styles.sectionHeaderLine}>
                <View>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Preparation
                  </Text>

                  <Text
                    style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}
                  >
                    {`${instructions.length} ${instructions.length === 1 ? 'step' : 'steps'}`}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                  onPress={addInstructionStep}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.addButtonText}>Step</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {instructions.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepContainer,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <View style={styles.stepHeader}>
                <View
                  style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}
                >
                  <Text style={styles.stepNumberText}>{step.step_number}</Text>
                </View>

                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  Step {step.step_number}
                </Text>

                {instructions.length > 1 && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => removeInstruction(index)}
                    style={styles.deleteStepButton}
                  >
                    <Trash2 size={17} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.stepInput,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                placeholder={`What do you do in step ${step.step_number}?`}
                placeholderTextColor={theme.colors.textMuted}
                value={step.instruction_text}
                onChangeText={(value) =>
                  updateInstruction(index, 'instruction_text', value)
                }
                multiline
                numberOfLines={3}
              />

              <View style={styles.stepExtraRow}>
                <View style={styles.stepTimer}>
                  <DurationPickerField
                    label="Timer"
                    valueSeconds={step.timerSeconds || 0}
                    onChangeSeconds={(seconds) => updateInstructionTimer(index, seconds)}
                    compact
                  />
                </View>

                <View style={styles.stepTip}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Tip</Text>

                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.background,
                      },
                    ]}
                    placeholder="Optional tip"
                    placeholderTextColor={theme.colors.textMuted}
                    value={step.tip}
                    onChangeText={(value) => updateInstruction(index, 'tip', value)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* CREATE */}

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
            isSaving && { opacity: 0.65 },
          ]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{isEdit ? 'Update Recipe' : 'Create Recipe'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* INGREDIENT MODAL */}

      <SearchListModal
        visible={isIngredientModalOpen}
        onClose={closeIngredientModal}
        title="Add Ingredients"
        data={displayedIngredients}
        keyExtractor={(item) => item.id.toString()}
        searchQuery={ingredientSearchQuery}
        onSearchChange={setIngredientSearchQuery}
        searchPlaceholder="Search ingredients..."
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <Text style={{ color: theme.colors.textMuted }}>No ingredients found.</Text>
          </View>
        }
        footer={
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.modalDoneButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={closeIngredientModal}
          >
            <Text style={styles.modalDoneButtonText}>Done</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isSelected = recipeIngredients.some(
            (entry) => entry.ingredient_id === item.id,
          );

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.ingredientSelectItem,
                { borderBottomColor: theme.colors.border },
                isSelected && { backgroundColor: theme.colors.primary + '10' },
              ]}
              onPress={() => toggleIngredientInRecipe(item)}
            >
              {isSelected ? (
                <CheckSquare size={21} color={theme.colors.primary} />
              ) : (
                <Square size={21} color={theme.colors.textMuted} />
              )}

              <View style={styles.ingredientSelectContent}>
                <Text
                  style={[styles.ingredientSelectName, { color: theme.colors.text }]}
                >
                  {item.name}
                </Text>

                {item.description ? (
                  <Text
                    style={[
                      styles.ingredientSelectDesc,
                      { color: theme.colors.textMuted },
                    ]}
                    numberOfLines={1}
                  >
                    {item.description}
                  </Text>
                ) : null}
              </View>

              <Text
                style={[styles.defaultUnitBadge, { color: theme.colors.textMuted }]}
              >
                {item.default_unit}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
    </KeyboardAvoidingView>
  );
};

/* ==========================================================================
   STYLES
============================================================================ */

const styles = StyleSheet.create({
  wizardFixedHeader: { borderBottomWidth: 1, paddingTop: 8, paddingBottom: 8 },
  wizardStepper: { flexGrow: 1, width: '100%', paddingHorizontal: 8, paddingVertical: 4, justifyContent: 'space-between' },
  wizardStepTab: { width: 68, alignItems: 'center', gap: 5 },
  wizardStepCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  wizardStepNumber: { fontSize: 12, fontWeight: '800' },
  wizardStepLabel: { fontSize: 9.5, fontWeight: '700', textAlign: 'center' },
  wizardBody: { flex: 1 },
  wizardBodyContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 36 },
  wizardSectionContent: { paddingBottom: 8 },
  wizardField: { marginBottom: 26 },
  wizardFieldLast: { marginBottom: 8 },
  wizardAddButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  wizardAddButtonFixed: { marginBottom: 0, width: '100%' },
  wizardFixedIngredientAction: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1 },
  wizardIngredientsContent: { flex: 1 },
  wizardIngredientsListSpace: { paddingBottom: 8 },
  wizardEmpty: { textAlign: 'center', paddingVertical: 24 },
  wizardIngredient: { borderWidth: 1, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  wizardInstruction: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14 },
  wizardQuantityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wizardVisibilityOption: { marginBottom: 18, paddingVertical: 16, paddingHorizontal: 14 },
  wizardFixedFooter: { borderTopWidth: 1, paddingTop: 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  wizardNavSecondary: { minHeight: 48, paddingHorizontal: 18, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  wizardNavSecondaryText: { fontSize: 14, fontWeight: '700' },
  wizardNavPrimary: { flex: 1, minHeight: 48, paddingHorizontal: 18, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  wizardNavPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  wizardTimer: { marginTop: 2, marginBottom: 16 },
  wizardTimerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wizardTimerPickerWrap: { flex: 1 },
  wizardTimerButton: { minHeight: 46, paddingHorizontal: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  wizardDescriptionInput: { height: 150, minHeight: 150, paddingTop: 10, textAlignVertical: 'top' },
  tagInputBox: { minHeight: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  tagChipWrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  tagChipText: { fontSize: 12, fontWeight: '700' },
  tagDraftInput: { flexGrow: 1, minWidth: 120, height: 34, paddingHorizontal: 4, fontSize: 13 },

  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  pageHeader: { marginBottom: 28 },
  pageTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, marginTop: 5 },
  section: { marginBottom: 28 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 17 },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionIconText: { fontSize: 17, fontWeight: '700' },
  sectionTitleContent: { flex: 1 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionSubtitle: { fontSize: 12, marginTop: 3 },
  modeCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  modeOption: { minHeight: 88, paddingHorizontal: 15, paddingVertical: 13, flexDirection: 'row', alignItems: 'center' },
  modeCopy: { flex: 1, paddingRight: 12 },
  modeTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  modeDescription: { fontSize: 12.5, lineHeight: 18 },
  modeRadio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  modeRadioDot: { width: 10, height: 10, borderRadius: 5 },
  modeDivider: { height: 1, marginLeft: 15 },
  sectionHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
  labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  input: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  descriptionInput: { height: 86, paddingTop: 12, textAlignVertical: 'top' },
  helperText: { fontSize: 11, marginTop: 6, lineHeight: 16 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoColumn: { flex: 1 },
  pickerField: { marginBottom: 0 },
  durationField: { minHeight: 54, borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8, justifyContent: 'center' },
  durationFieldCompact: { minHeight: 46, paddingVertical: 6 },
  durationValue: { fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
  durationValueCompact: { fontSize: 13, fontWeight: '800' },
  durationHint: { fontSize: 9, fontWeight: '600', marginTop: 2, letterSpacing: 0.5 },
  cookedWeightCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  cookedWeightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cookedWeightIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cookedWeightHeaderText: { flex: 1 },
  titleWithOptional: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cookedWeightTitle: { fontSize: 14, fontWeight: '700' },
  cookedWeightSubtitle: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  optionalBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  optionalBadgeText: { fontSize: 9, fontWeight: '600' },
  weightInputRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  cookedUnitDropdown: { width: 82 },
  weightInput: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  weightInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 9,
    marginTop: 10,
  },
  weightInfoText: { flex: 1, fontSize: 11, lineHeight: 16 },
  perServingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  perServingLabel: { fontSize: 10, marginBottom: 2 },
  perServingValue: { fontSize: 16, fontWeight: '800' },
  visibilityRow: { flexDirection: 'row', gap: 10 },
  visibilityOption: {
    flex: 1,
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  visibilityTitle: { fontSize: 13, fontWeight: '600' },
  visibilityDescription: { fontSize: 10, marginTop: 2 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 9,
  },
  addButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyIngredients: {
    minHeight: 130,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyIngredientsTitle: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  emptyIngredientsText: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  ingredientsList: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  ingredientRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
  },
  ingredientNumber: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientNumberText: { fontSize: 11, fontWeight: '600' },
  ingredientName: { flex: 1, fontSize: 13, fontWeight: '600' },
  deleteButton: { padding: 6 },
  stepContainer: { borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 12 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  stepNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepNumberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  deleteStepButton: { padding: 5 },
  stepInput: { height: 82, paddingTop: 11, textAlignVertical: 'top', marginBottom: 13 },
  stepExtraRow: { flexDirection: 'row', gap: 10 },
  stepTimer: { flex: 1 },
  stepTip: { flex: 2 },
  saveButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ingredientSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  ingredientSelectContent: { flex: 1 },
  ingredientSelectName: { fontSize: 14, fontWeight: '600' },
  ingredientSelectDesc: { fontSize: 11, marginTop: 3 },
  defaultUnitBadge: { fontSize: 12, fontWeight: '600' },
  emptyListContainer: { paddingVertical: 30, alignItems: 'center' },
  modalDoneButton: {
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalDoneButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  durationModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 18 },
  durationModalCard: { borderWidth: 1, borderRadius: 18, padding: 16, maxHeight: '82%' },
  unitModalCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  durationModalTitle: { fontSize: 18, fontWeight: '800' },
  durationModalSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 4, marginBottom: 14 },
  durationWheelsRow: { flexDirection: 'row', gap: 8 },
  durationWheelColumn: { flex: 1 },
  durationWheelLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  durationWheel: { height: 190, borderRadius: 10, borderWidth: 1, borderColor: '#00000012' },
  durationWheelContent: { padding: 4 },
  durationWheelItem: { height: 38, borderRadius: 8, borderWidth: 1, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  durationWheelText: { fontSize: 14, fontWeight: '700' },
  durationPreview: { marginTop: 14, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#00000008' },
  durationPreviewValue: { fontSize: 24, fontWeight: '800', letterSpacing: 1.5 },
  durationActions: { flexDirection: 'row', gap: 9, marginTop: 14 },
  durationCancelButton: { flex: 1, minHeight: 44, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  durationDoneButton: { flex: 1, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  durationCancelText: { fontSize: 13, fontWeight: '700' },
  durationDoneText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  unitOptionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 4 },
  unitOption: { width: '30%', minHeight: 46, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  unitOptionText: { fontSize: 14, fontWeight: '800' },
  durationModalCancel: { minHeight: 42, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  durationModalCancelText: { fontSize: 13, fontWeight: '700' },
  errorText: { fontSize: 16, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});