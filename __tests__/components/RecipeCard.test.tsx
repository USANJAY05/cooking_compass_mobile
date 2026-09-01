import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { RecipeCard } from '../../src/components/RecipeCard';
import { renderWithTheme } from '../test-utils';

const recipe = {
  id: 1,
  name: 'Tomato Pasta',
  preparation_time: 15,
  cooking_time: 20,
  total_time: 35,
  servings: 2,
  thumbnail_url: null,
  rating: { average: 4.5, count: 12 },
} as any;

describe('RecipeCard', () => {
  it('renders recipe details and rating', async () => {
    const { getByText } = await renderWithTheme(
      <RecipeCard recipe={recipe} />,
    );

    expect(getByText('Tomato Pasta')).toBeTruthy();
    expect(getByText('15m')).toBeTruthy();
    expect(getByText('2 servings')).toBeTruthy();
    expect(getByText('4.5')).toBeTruthy();
    expect(getByText('(12)')).toBeTruthy();
  });

  it('renders no reviews when there is no rating', async () => {
    const { getByText } = await renderWithTheme(
      <RecipeCard recipe={{ ...recipe, rating: undefined }} />,
    );

    expect(getByText('No reviews')).toBeTruthy();
  });

  it('calls onPress', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithTheme(
      <RecipeCard recipe={recipe} onPress={onPress} />,
    );

    await fireEvent.press(getByText('Tomato Pasta'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});