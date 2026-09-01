import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TouchableOpacity } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { useTheme } from '../../src/theme/ThemeProvider';
import { renderWithTheme } from '../test-utils';

const Consumer = () => {
  const { themeType, isDark, setThemeType } = useTheme();

  return (
    <>
      <Text testID="theme-type">{themeType}</Text>
      <Text testID="is-dark">{isDark ? 'dark' : 'light'}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={() => setThemeType('dark')}
      >
        <Text>Dark</Text>
      </TouchableOpacity>
    </>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('starts with system theme and loads saved preferences', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const { getByTestId } = await renderWithTheme(<Consumer />);

    await waitFor(() => {
      expect(getByTestId('theme-type')).toHaveTextContent('dark');
    });
  });

  it('persists a changed theme', async () => {
    const { getByText } = await renderWithTheme(<Consumer />);

    await fireEvent.press(getByText('Dark'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@cooking_compass_theme',
        'dark',
      );
    });
  });
});