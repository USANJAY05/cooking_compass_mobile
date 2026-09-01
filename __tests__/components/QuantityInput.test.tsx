import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { QuantityInput } from '../../src/components/QuantityInput';
import { renderWithTheme } from '../test-utils';

describe('QuantityInput', () => {
  it('renders the current value and count placeholder', async () => {
    const onChange = jest.fn();
    const { getByDisplayValue, getByPlaceholderText } = await renderWithTheme(
      <QuantityInput value="2" unit="serving" onChange={onChange} />,
    );

    expect(getByDisplayValue('2')).toBeTruthy();
    expect(getByPlaceholderText('1')).toBeTruthy();
  });

  it('sanitizes count input before calling onChange', async () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = await renderWithTheme(
      <QuantityInput value="" unit="serving" onChange={onChange} />,
    );

    await fireEvent.changeText(getByDisplayValue(''), 'a12b3');
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('sanitizes measured input and preserves decimals', async () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = await renderWithTheme(
      <QuantityInput value="" unit="g" onChange={onChange} />,
    );

    await fireEvent.changeText(getByDisplayValue(''), '12.345');
    expect(onChange).toHaveBeenCalledWith('12.34');
  });
});