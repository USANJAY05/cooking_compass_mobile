import {
  getUnitKind,
  getDefaultQuantityForUnit,
  getQuantityPlaceholder,
  sanitizeQuantityInput,
  parseQuantity,
  formatUnitLabel,
  formatQuantityWithUnit,
} from '../../src/utils/quantity';

describe('quantity utilities', () => {
  describe('getUnitKind', () => {
    it.each([
      ['serving', 'count'],
      ['piece', 'count'],
      ['pinch', 'count'],
      ['g', 'weight'],
      ['kg', 'weight'],
      ['oz', 'weight'],
      ['lb', 'weight'],
      ['ml', 'volume'],
      ['l', 'volume'],
      ['cup', 'volume'],
    ])('%s is a %s unit', (unit, expected) => {
      expect(getUnitKind(unit)).toBe(expected);
    });
  });

  describe('defaults', () => {
    it('uses 1 for count units', () => {
      expect(getDefaultQuantityForUnit('serving')).toBe('1');
    });

    it('uses 100 for grams', () => {
      expect(getDefaultQuantityForUnit('g')).toBe('100');
    });

    it('uses 1 for kilograms', () => {
      expect(getDefaultQuantityForUnit('kg')).toBe('1');
    });

    it('uses 1 for liters', () => {
      expect(getDefaultQuantityForUnit('L')).toBe('1');
    });

    it('uses 250 for common volume units', () => {
      expect(getDefaultQuantityForUnit('ml')).toBe('250');
      expect(getQuantityPlaceholder('cup')).toBe('250');
    });
  });

  describe('sanitizeQuantityInput', () => {
    it('keeps only digits for count units', () => {
      expect(sanitizeQuantityInput('a12b3', 'serving')).toBe('123');
    });

    it('limits count input to four digits', () => {
      expect(sanitizeQuantityInput('123456', 'piece')).toBe('1234');
    });

    it('keeps one decimal point for measured units', () => {
      expect(sanitizeQuantityInput('12.3.45', 'g')).toBe('12.345');
    });

    it('limits decimals to two places', () => {
      expect(sanitizeQuantityInput('12.3456', 'g')).toBe('12.34');
    });
  });

  describe('parseQuantity', () => {
    it('parses a positive count and rounds it', () => {
      expect(parseQuantity('2.8', 'serving')).toBe(3);
    });

    it('parses measured quantities without rounding', () => {
      expect(parseQuantity('2.8', 'kg')).toBe(2.8);
    });

    it('falls back to the unit default for invalid input', () => {
      expect(parseQuantity('abc', 'g')).toBe(100);
    });

    it('falls back for zero or negative input', () => {
      expect(parseQuantity('0', 'serving')).toBe(1);
      expect(parseQuantity('-2', 'kg')).toBe(1);
    });
  });

  describe('formatting', () => {
    it.each([
      ['SERVING', 'serving'],
      ['KG', 'kg'],
      ['G', 'g'],
      ['ML', 'ml'],
      ['cup', 'cup'],
      ['unknown', 'unknown'],
    ])('formats %s as %s', (unit, expected) => {
      expect(formatUnitLabel(unit)).toBe(expected);
    });

    it('formats a quantity with its unit', () => {
      expect(formatQuantityWithUnit(250, 'g')).toBe('250 g');
      expect(formatQuantityWithUnit('2', 'serving')).toBe('2 serving');
    });
  });
});
