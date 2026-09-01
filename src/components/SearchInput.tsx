import React from 'react';
import { TextInput, TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  clearButtonStyle?: StyleProp<ViewStyle>;
  autoFocus?: boolean;
  testID?: string;
}

/** Shared search field. Keep search input behavior consistent across the app. */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  inputStyle,
  iconColor,
  clearButtonStyle,
  autoFocus = false,
  testID,
}) => {
  const { theme } = useTheme();
  const resolvedIconColor = iconColor ?? theme.colors.textMuted;

  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={resolvedIconColor} strokeWidth={2} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { color: theme.colors.text }, inputStyle]}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={8}
          activeOpacity={0.7}
          style={clearButtonStyle}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={17} color={theme.colors.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    fontSize: 15,
    paddingVertical: 0,
  },
});
