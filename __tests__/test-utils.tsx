import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../src/theme/ThemeProvider';

export const renderWithTheme = async (ui: React.ReactElement) =>
  render(<ThemeProvider>{ui}</ThemeProvider>);

export const renderWithProviders = renderWithTheme;

export const flushPromises = () =>
  new Promise<void>((resolve) => setImmediate(resolve));