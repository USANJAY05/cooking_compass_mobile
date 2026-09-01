import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { PortionAdjuster } from '../../src/components/PortionAdjuster';
import { renderWithTheme } from '../test-utils';

describe('PortionAdjuster', () => {
  const baseProps = {
    mode: 'servings' as const,
    value: '2',
    recipeServings: 4,
    quantityUnit: 'g' as const,
    totalQuantity: 1000,
    onModeChange: jest.fn(),
    onValueChange: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('shows the current serving value and recipe information', async () => {
    const { getByText, getByDisplayValue } = await renderWithTheme(
      <PortionAdjuster {...baseProps} />,
    );

    expect(getByText('Adjust Portion')).toBeTruthy();
    expect(getByText('Original recipe makes 4 servings')).toBeTruthy();
    expect(getByDisplayValue('2')).toBeTruthy();
  });

  it('decreases the serving value but never below one', async () => {
    const { getByLabelText } = await renderWithTheme(
      <PortionAdjuster {...baseProps} value="1" />,
    );

    await fireEvent.press(getByLabelText('Decrease portion'));

    expect(baseProps.onValueChange).toHaveBeenCalledWith('1');
  });

  it('switches to quantity mode when quantity is available', async () => {
    const { getByText } = await renderWithTheme(
      <PortionAdjuster {...baseProps} />,
    );

    await fireEvent.press(getByText('Quantity'));

    expect(baseProps.onModeChange).toHaveBeenCalledWith('quantity');
  });

  it('shows quantity mode information', async () => {
    const { getByText } = await renderWithTheme(
      <PortionAdjuster {...baseProps} mode="quantity" value="250" />,
    );

    expect(getByText('Total recipe quantity: 1000 g')).toBeTruthy();
  });
});