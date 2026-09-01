import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ChevronDown, Square, CheckSquare } from 'lucide-react-native';
import { useTheme } from '../theme';
import { Category } from '../api/categories';
import { SearchListModal } from './SearchListModal';

interface CategoryMultiSelectProps {
  label?: string;
  categories: Category[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

const buildDisplayLabel = (
  categories: Category[],
  selectedIds: number[],
  placeholder: string
): string => {
  if (selectedIds.length === 0) return placeholder;

  const selectedNames = categories
    .filter((cat) => selectedIds.includes(cat.id))
    .map((cat) => cat.name);

  if (selectedNames.length === 0) return placeholder;
  if (selectedNames.length === 1) return selectedNames[0];
  if (selectedNames.length <= 2) return selectedNames.join(', ');
  return `${selectedNames.length} categories selected`;
};

export const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  label,
  categories,
  selectedIds,
  onChange,
  placeholder = 'Select categories...',
  style,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((cat) => cat.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const displayLabel = buildDisplayLabel(categories, selectedIds, placeholder);

  const toggleCategory = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((catId) => catId !== id)
        : [...selectedIds, id]
    );
  };

  const openModal = () => {
    setSearchQuery('');
    setVisible(true);
  };

  const closeModal = () => {
    setSearchQuery('');
    setVisible(false);
  };

  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.triggerText,
            { color: selectedIds.length > 0 ? theme.colors.text : theme.colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <ChevronDown size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>


      <SearchListModal
        visible={visible}
        onClose={closeModal}
        title={label || 'Select categories'}
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search categories..."
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={{ color: theme.colors.textMuted }}>No categories available.</Text>
          </View>
        }
        footer={
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.colors.primary }]}
            onPress={closeModal}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.optionRow, { borderBottomColor: theme.colors.border }]}
              onPress={() => toggleCategory(item.id)}
            >
              {isSelected ? (
                <CheckSquare size={20} color={theme.colors.primary} />
              ) : (
                <Square size={20} color={theme.colors.textMuted} />
              )}
              <View style={styles.optionTextWrapper}>
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{item.name}</Text>
                {item.description ? (
                  <Text style={[styles.optionDescription, { color: theme.colors.textMuted }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    marginRight: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyList: {
    padding: 24,
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 12,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
