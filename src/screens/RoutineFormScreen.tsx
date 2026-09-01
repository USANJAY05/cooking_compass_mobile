import React, { useEffect, useMemo, useState } from 'react';
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
import { Plus, Trash2, Repeat, Utensils, Square, CheckSquare, CalendarDays } from 'lucide-react-native';
import { useTheme, colors } from '../theme';
import { useCreateRoutine, useRoutineDetail, useUpdateRoutine } from '../api/routines';
import { useRecipes, useSearchRecipes } from '../api/recipes';
import { RecipeSummaryComponent } from '../api/types';
import { DatePickerField } from '../components/DatePickerField';
import { Dropdown } from '../components/Dropdown';
import { SearchListModal } from '../components/SearchListModal';
import { QuantityInput } from '../components/QuantityInput';
import { ROUTINE_QUANTITY_UNITS } from '../constants/units';
import { getDefaultQuantityForUnit, parseQuantity } from '../utils/quantity';
import { getTodayDateString } from '../utils/dates';
import { isSpecificDateRecurrence, toSpecificDateRecurrence } from '../utils/routineSchedule';

type RoutineFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SPECIFIC';

interface SelectedRecipeItem {
  recipe_id: number;
  recipe_name: string;
  quantity: string;
  quantity_unit: string;
}

const DAY_NAMES = [
  { label: 'Sun', index: 0 },
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
];

export const RoutineFormScreen = ({ navigation, route, mode = 'create' }: any) => {
  const initialDate = route?.params?.initialDate ?? getTodayDateString();
  const routineId = route?.params?.routineId as number | undefined;
  const isEdit = mode === 'edit';
  const { theme } = useTheme();
  const createMutation = useCreateRoutine();
  const updateMutation = useUpdateRoutine();
  const routineQuery = useRoutineDetail(routineId);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<RoutineFrequency>('WEEKLY');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [startDate, setStartDate] = useState(initialDate);
  const [specificDate, setSpecificDate] = useState(initialDate);

  // Routine Items State
  const [items, setItems] = useState<SelectedRecipeItem[]>([]);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');

  const isSearchingRecipes = recipeSearchQuery.trim().length > 0;

  const { data: myRecipesData } = useRecipes({ scope: 'mine', limit: 50 });
  const { data: mySearchData } = useSearchRecipes(recipeSearchQuery.trim(), { scope: 'mine', limit: 50 });

  const filteredRecipes = useMemo(() => {
    if (isSearchingRecipes) return mySearchData?.items || [];
    return myRecipesData?.items || [];
  }, [isSearchingRecipes, myRecipesData, mySearchData]);

  // Hydrate edit state from the saved routine. Without this, the edit form
  // starts with an empty/default recipe quantity instead of the persisted one.
  useEffect(() => {
    if (!isEdit || !routineQuery.data) return;

    const routine = routineQuery.data;
    setName(routine.name || '');
    setDescription(routine.description || '');

    const recurrence = routine.recurrence;
    const routineFrequency = recurrence?.frequency;
    if (isSpecificDateRecurrence(recurrence)) {
      setFrequency('SPECIFIC');
    } else if (routineFrequency === 'DAILY' || routineFrequency === 'WEEKLY' || routineFrequency === 'MONTHLY') {
      setFrequency(routineFrequency);
    }

    if (Array.isArray(recurrence?.days_of_week)) {
      setSelectedDaysOfWeek(recurrence.days_of_week);
    }

    if (recurrence?.start_date) {
      setStartDate(recurrence.start_date);
      setSpecificDate(recurrence.start_date);
    }

    setItems(
      (routine.recipes || []).map((item) => ({
        recipe_id: Number(item.recipe_id),
        recipe_name: item.recipe_name || `Recipe #${item.recipe_id}`,
        quantity: item.quantity != null ? String(item.quantity) : getDefaultQuantityForUnit(item.quantity_unit || 'SERVING'),
        quantity_unit: item.quantity_unit || 'SERVING',
      })),
    );
  }, [isEdit, routineQuery.data]);

  const toggleDay = (dayIndex: number) => {
    setSelectedDaysOfWeek((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setRecipeSearchQuery('');
  };

  const toggleRecipeInRoutine = (recipe: RecipeSummaryComponent) => {
    if (items.some((item) => item.recipe_id === recipe.id)) {
      setItems((prev) => prev.filter((item) => item.recipe_id !== recipe.id));
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        quantity: '1',
        quantity_unit: 'SERVING',
      },
    ]);
  };

  const updateItem = (index: number, field: 'quantity' | 'quantity_unit', value: string) => {
    setItems((prev) => {
      const updated = [...prev];
      if (field === 'quantity_unit') {
      updated[index] = {
        ...updated[index],
        quantity_unit: value,
        quantity: getDefaultQuantityForUnit(value),
      };
      } else {
        updated[index] = { ...updated[index], quantity: value };
      }
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter a routine name.');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Missing Recipes', 'Please add at least one recipe to this routine.');
      return;
    }

    const recurrence =
      frequency === 'SPECIFIC'
        ? toSpecificDateRecurrence(specificDate)
        : {
            frequency,
            interval: 1,
            days_of_week: frequency === 'WEEKLY' ? selectedDaysOfWeek : undefined,
            start_date: startDate,
          };

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      status: isEdit ? (routineQuery.data?.status || 'ACTIVE') : 'ACTIVE',
      items: items.map((item) => ({
        recipe_id: item.recipe_id,
        quantity: parseQuantity(item.quantity, item.quantity_unit),
        quantity_unit: item.quantity_unit.trim() || 'SERVING',
      })),
      recurrence,
    };

    const callbacks = {
      onSuccess: () => {
        Alert.alert('Success', isEdit ? 'Routine updated successfully!' : 'Routine created successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'create'} routine.`);
      },
    };
    if (isEdit) {
      if (!routineId) return;
      updateMutation.mutate({ id: routineId, data: payload }, callbacks);
    } else {
      createMutation.mutate(payload, callbacks);
    }
  };

  if (isEdit && routineQuery.isLoading) {
    return <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }
  if (isEdit && (routineQuery.isError || !routineQuery.data)) {
    return <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}><Text style={[styles.errorText, { color: theme.colors.text }]}>Unable to load this routine.</Text><TouchableOpacity onPress={() => routineQuery.refetch()} style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Basic Details */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>Routine Details</Text>

          <Text style={[styles.label, { color: theme.colors.text }]}>Routine Name *</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            placeholder="e.g. Healthy Weekday Dinners"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]}
            placeholder="Brief description of this routine..."
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Schedule & Recurrence */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>Schedule & Frequency</Text>

          <Text style={[styles.label, { color: theme.colors.text }]}>Frequency</Text>
          <View style={styles.frequencyRow}>
            {(['DAILY', 'WEEKLY', 'MONTHLY', 'SPECIFIC'] as const).map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.freqOption,
                  frequency === freq && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setFrequency(freq)}
              >
                {freq === 'SPECIFIC' ? (
                  <CalendarDays size={14} color={frequency === freq ? '#fff' : theme.colors.textMuted} />
                ) : (
                  <Repeat size={14} color={frequency === freq ? '#fff' : theme.colors.textMuted} />
                )}
                <Text style={[styles.freqText, { color: frequency === freq ? '#fff' : theme.colors.text }]}>
                  {freq === 'SPECIFIC' ? 'Date' : freq}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequency === 'SPECIFIC' ? (
            <DatePickerField
              label="Specific Date"
              value={specificDate}
              onChange={setSpecificDate}
              style={{ marginTop: 12 }}
            />
          ) : null}

          {frequency === 'WEEKLY' && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Days of Week</Text>
              <View style={styles.chipContainer}>
                {DAY_NAMES.map((day) => {
                  const isSelected = selectedDaysOfWeek.includes(day.index);
                  return (
                    <TouchableOpacity
                      key={day.index}
                      style={[
                        styles.chip,
                        isSelected ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
                      ]}
                      onPress={() => toggleDay(day.index)}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#fff' : theme.colors.text }]}>{day.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {frequency !== 'SPECIFIC' ? (
            <DatePickerField
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              minimumDate={new Date()}
              style={{ marginTop: 12 }}
            />
          ) : null}
        </View>

        {/* Scheduled Recipe Items */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>Scheduled Recipes *</Text>
            <TouchableOpacity style={[styles.addButtonSmall, { backgroundColor: theme.colors.primary }]} onPress={() => setIsRecipeModalOpen(true)}>
              <Plus size={16} color="#fff" />
              <Text style={styles.addButtonTextSmall}>Add Recipe</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <Text style={[styles.emptyHint, { color: theme.colors.textMuted }]}>
              No recipes added to this routine yet. Tap &quot;Add Recipe&quot; above.
            </Text>
          ) : (
            items.map((item, index) => (
              <View key={index} style={[styles.recipeRow, { borderColor: theme.colors.border }]}>
                <Utensils size={16} color={theme.colors.primary} />
                <Text style={[styles.recipeName, { color: theme.colors.text }]} numberOfLines={1}>
                  {item.recipe_name}
                </Text>
                <QuantityInput
                  compact
                  value={item.quantity}
                  unit={item.quantity_unit}
                  onChange={(val) => updateItem(index, 'quantity', val)}
                />
                <Dropdown
                  value={item.quantity_unit}
                  options={ROUTINE_QUANTITY_UNITS}
                  onChange={(val) => updateItem(index, 'quantity_unit', val)}
                  compact
                />
                <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteButton}>
                  <Trash2 size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }, isSaving && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isEdit ? 'Update Routine' : 'Save Routine'}</Text>}
        </TouchableOpacity>
      </ScrollView>

      <SearchListModal
        visible={isRecipeModalOpen}
        onClose={closeRecipeModal}
        title="Select Recipes"
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        searchQuery={recipeSearchQuery}
        onSearchChange={setRecipeSearchQuery}
        searchPlaceholder="Search recipes..."
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={{ color: theme.colors.textMuted }}>No recipes in your collection.</Text>
          </View>
        }
        footer={
          <TouchableOpacity
            style={[styles.modalDoneButton, { backgroundColor: theme.colors.primary }]}
            onPress={closeRecipeModal}
          >
            <Text style={styles.modalDoneButtonText}>Done</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isSelected = items.some((entry) => entry.recipe_id === item.id);
          return (
            <TouchableOpacity
              style={[
                styles.recipeSelectItem,
                isSelected && { backgroundColor: theme.colors.primary + '12' },
                { borderBottomColor: theme.colors.border },
              ]}
              onPress={() => toggleRecipeInRoutine(item)}
            >
              {isSelected ? (
                <CheckSquare size={20} color={theme.colors.primary} />
              ) : (
                <Square size={20} color={theme.colors.textMuted} />
              )}
              <Text style={[styles.recipeSelectName, { color: theme.colors.text, flex: 1 }]}>{item.name}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{item.servings} servings</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 120 },
  sectionCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: { height: 44, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 15, marginBottom: 12 },
  multilineInput: { height: 60, paddingTop: 10, textAlignVertical: 'top' },
  frequencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqOption: { flexGrow: 1, flexBasis: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 40, borderRadius: 8, borderWidth: 1 },
  freqText: { fontSize: 13, fontWeight: '600' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 13, fontWeight: '500' },
  addButtonSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addButtonTextSmall: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyHint: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginVertical: 12 },
  recipeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1 },
  recipeName: { flex: 2, fontSize: 15, fontWeight: '500' },
  qtyInput: { width: 50, height: 38, borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, fontSize: 14, textAlign: 'center' },
  unitInput: { width: 80, height: 38, borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, fontSize: 14 },
  deleteButton: { padding: 4 },
  submitButton: { height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  recipeSelectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  recipeSelectName: { fontSize: 16, fontWeight: '600' },
  emptyList: { padding: 24, alignItems: 'center' },
  modalDoneButton: { marginTop: 12, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  modalDoneButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
