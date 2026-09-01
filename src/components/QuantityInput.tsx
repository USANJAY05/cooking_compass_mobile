import React from 'react';
import { TextInput, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { getQuantityPlaceholder, getUnitKind, sanitizeQuantityInput } from '../utils/quantity';

interface QuantityInputProps {
  value: string;
  unit: string;
  onChange: (value: string) => void;
  compact?: boolean;
  style?: StyleProp<TextStyle>;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  unit,
  onChange,
  compact = false,
  style,
}) => {
  const { theme } = useTheme();
  const kind = getUnitKind(unit);
  const placeholder = getQuantityPlaceholder(unit);

  return (
    <TextInput
      style={[
        compact ? styles.compactInput : styles.input,
        kind === 'count' ? styles.countInput : styles.measureInput,
        { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
        style,
      ]}
      keyboardType={kind === 'count' ? 'number-pad' : 'decimal-pad'}
      value={value}
      onChangeText={(text) => onChange(sanitizeQuantityInput(text, unit))}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  compactInput: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  countInput: {
    minWidth: 52,
  },
  measureInput: {
    minWidth: 68,
  },
});
