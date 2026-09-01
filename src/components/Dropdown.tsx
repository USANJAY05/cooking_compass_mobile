import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ChevronDown, Check, X } from 'lucide-react-native';
import { useTheme } from '../theme';
import { BottomSheet } from './BottomSheet';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select...',
  style,
  compact = false,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setVisible(false);
  };

  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          compact ? styles.compactTrigger : styles.trigger,
          {
            backgroundColor: theme.colors.background,
            borderColor: selectedOption ? theme.colors.primary + '30' : theme.colors.border,
          },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            compact ? styles.compactTriggerText : styles.triggerText,
            { color: selectedOption ? theme.colors.text : theme.colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <View style={[styles.chevronWrap, { backgroundColor: theme.colors.primary + '10' }]}>
          <ChevronDown size={compact ? 15 : 16} color={theme.colors.primary} />
        </View>
      </TouchableOpacity>

      <BottomSheet visible={visible} onClose={() => setVisible(false)} maxHeight="60%">
        <View style={styles.menuHeader}>
          <Text style={[styles.menuTitle, { color: theme.colors.text }]}>{label || 'Select an option'}</Text>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={[styles.closeButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
          >
            <X size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = item.value === value;
            return (
              <TouchableOpacity
                style={[
                  styles.optionRow,
                  isSelected && { backgroundColor: theme.colors.primary + '12' },
                  { borderBottomColor: theme.colors.border },
                ]}
                onPress={() => handleSelect(item.value)}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{item.label}</Text>
                {isSelected ? <Check size={18} color={theme.colors.primary} /> : null}
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 8,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  compactTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 90,
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 6,
  },
  compactTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
});