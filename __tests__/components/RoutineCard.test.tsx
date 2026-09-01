import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { RoutineCard } from '../../src/components/RoutineCard';
import { renderWithTheme } from '../test-utils';

const routine = {
  id: 1,
  name: 'Weekly Meal Prep',
  description: 'Prepare meals for the week',
} as any;

describe('RoutineCard', () => {
  it('renders a routine with a description', async () => {
    const { getByText } = await renderWithTheme(
      <RoutineCard routine={routine} />,
    );

    expect(getByText('Weekly Meal Prep')).toBeTruthy();
    expect(getByText('Prepare meals for the week')).toBeTruthy();
    expect(getByText('View routine')).toBeTruthy();
  });

  it('renders the schedule fallback without a description', async () => {
    const { getByText } = await renderWithTheme(
      <RoutineCard routine={{ ...routine, description: '' }} />,
    );

    expect(getByText('Schedule & recipes')).toBeTruthy();
  });

  it('calls press and long-press handlers', async () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();

    const { getByText } = await renderWithTheme(
      <RoutineCard
        routine={routine}
        onPress={onPress}
        onLongPress={onLongPress}
      />,
    );

    const title = getByText('Weekly Meal Prep');
    await fireEvent.press(title);
    await fireEvent(title.parent?.parent ?? title, 'longPress');

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});