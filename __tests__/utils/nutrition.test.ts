import {
  normalizePortionUnit,
  formatPortionUnit,
  isNonZeroNutritionAmount,
  scaleNutritionItems,
  categorizeNutritionItems,
  prepareNutritionBreakdown,
  hasNutritionContent,
  getSummaryNutritionItems,
  hasExtendedNutrition,
  getTotalWeightGrams,
  getPortionScale,
  scaleIngredientQuantity,
  formatNutritionAmount,
  normalizeNutritionItemName,
} from '../../src/utils/nutrition';

const item = (
  code: string,
  name: string,
  amount: number,
  unit: string,
  type?: 'macro' | 'micro' | 'other',
) => ({ code, name, amount, unit, type });

describe('nutrition utilities', () => {
  it.each([
    ['kg', 'kg'],
    ['GRAMS', 'g'],
    ['liter', 'l'],
    ['milliliters', 'ml'],
    ['ounce', 'oz'],
    ['unknown', 'g'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePortionUnit(input)).toBe(expected);
  });

  it('keeps formatPortionUnit compatible with normalizePortionUnit', () => {
    expect(formatPortionUnit('grams')).toBe('g');
  });

  it('recognizes positive finite amounts', () => {
    expect(isNonZeroNutritionAmount(1)).toBe(true);
    expect(isNonZeroNutritionAmount(0)).toBe(false);
    expect(isNonZeroNutritionAmount(-1)).toBe(false);
    expect(isNonZeroNutritionAmount(Number.NaN)).toBe(false);
  });

  it('scales nutrition items', () => {
    const source = [item('PROTEIN', 'Protein', 10, 'g', 'macro')];
    expect(scaleNutritionItems(source, 2)).toEqual([
      item('PROTEIN', 'Protein', 20, 'g', 'macro'),
    ]);
    expect(source[0].amount).toBe(10);
  });

  it('categorizes main, macros, micros, other and ignores weight items', () => {
    const result = categorizeNutritionItems([
      item('CALORIES', 'Calories', 100, 'kcal'),
      item('PROTEIN', 'Protein', 10, 'g', 'macro'),
      item('IRON', 'Iron', 2, 'mg', 'micro'),
      item('SODIUM', 'Sodium', 100, 'mg', 'other'),
      item('TOTAL_WEIGHT', 'Total weight', 200, 'g'),
    ]);

    expect(result.main.map((x) => x.code)).toEqual(['CALORIES']);
    expect(result.macros.map((x) => x.code)).toEqual(['PROTEIN']);
    expect(result.micros.map((x) => x.code)).toEqual(['IRON']);
    expect(result.other.map((x) => x.code)).toEqual(['SODIUM']);
  });

  it('sorts macros in nutritional priority order', () => {
    const result = categorizeNutritionItems([
      item('FAT', 'Fat', 2, 'g'),
      item('PROTEIN', 'Protein', 3, 'g'),
      item('CARBS', 'Carbs', 4, 'g'),
    ]);

    expect(result.macros.map((x) => x.code))
      .toEqual(['PROTEIN', 'CARBS', 'FAT']);
  });

  it('supports legacy macro codes without type', () => {
    const result = categorizeNutritionItems([
      item('SUGAR', 'Sugar', 4, 'g'),
    ]);
    expect(result.macros.map((x) => x.code)).toEqual(['SUGAR']);
  });

  it('filters zero amounts and applies scaling in prepareNutritionBreakdown', () => {
    const result = prepareNutritionBreakdown({
      servings: 2,
      items: [
        item('CALORIES', 'Calories', 100, 'kcal'),
        item('PROTEIN', 'Protein', 10, 'g', 'macro'),
        item('IRON', 'Iron', 0, 'mg', 'micro'),
      ],
    }, 2);

    expect(result.main[0].amount).toBe(200);
    expect(result.macros[0].amount).toBe(20);
    expect(result.micros).toHaveLength(0);
  });

  it('detects nutrition content', () => {
    expect(hasNutritionContent({
      main: [], macros: [], micros: [], other: [],
    })).toBe(false);

    expect(hasNutritionContent({
      main: [item('CALORIES', 'Calories', 100, 'kcal')],
      macros: [], micros: [], other: [],
    })).toBe(true);
  });

  it('returns summary items in calories/protein/carbs/fat order', () => {
    const breakdown = categorizeNutritionItems([
      item('FAT', 'Fat', 9, 'g'),
      item('CALORIES', 'Calories', 100, 'kcal'),
      item('PROTEIN', 'Protein', 10, 'g'),
      item('CARBS', 'Carbs', 20, 'g'),
    ]);

    expect(getSummaryNutritionItems(breakdown).map((x) => x.code))
      .toEqual(['CALORIES', 'PROTEIN', 'CARBS', 'FAT']);
  });

  it('detects extended nutrition', () => {
    const breakdown = categorizeNutritionItems([
      item('CALORIES', 'Calories', 100, 'kcal'),
      item('PROTEIN', 'Protein', 10, 'g'),
      item('IRON', 'Iron', 2, 'mg', 'micro'),
    ]);

    expect(hasExtendedNutrition(breakdown)).toBe(true);
  });

  it('uses explicit total weight when nutrition contains it', () => {
    expect(getTotalWeightGrams(
      [{ quantity: 2, unit: 'kg' }],
      { servings: 1, items: [item('TOTAL_WEIGHT', 'Weight', 1.5, 'kg')] },
    )).toBe(1500);
  });

  it('falls back to weighted ingredients', () => {
    expect(getTotalWeightGrams([
      { quantity: 1, unit: 'kg' },
      { quantity: 500, unit: 'g' },
      { quantity: 2, unit: 'oz' },
    ])).toBeCloseTo(1556.69904625, 8);
  });

  it('calculates serving-based portion scale', () => {
    expect(getPortionScale('servings', 4, 2)).toBe(2);
  });

  it('calculates quantity-based portion scale', () => {
    expect(getPortionScale('quantity', 250, 2, undefined, 1000)).toBe(0.25);
  });

  it('returns 1 when a portion value or weight is invalid', () => {
    expect(getPortionScale('servings', 0, 2)).toBe(1);
    expect(getPortionScale('quantity', 250, 2, undefined, 0)).toBe(1);
  });

  it('scales count ingredients cleanly', () => {
    expect(scaleIngredientQuantity(2, 'piece', 1.5)).toBe('3');
    expect(scaleIngredientQuantity(1, 'piece', 0.5)).toBe('0.5');
  });

  it('normalizes backend carbohydrate naming to Carbs for display', () => {
    expect(normalizeNutritionItemName({
      code: 'CARBOHYDRATE',
      name: 'Carbohydrate, by difference',
    })).toBe('Carbs');

    expect(normalizeNutritionItemName({
      code: 'CARBS',
      name: 'Carbohydrates',
    })).toBe('Carbs');
  });

  it('normalizes backend dietary fiber naming to Fiber for display', () => {
    expect(normalizeNutritionItemName({
      code: 'FIBER',
      name: 'Fiber, total dietary',
    })).toBe('Fiber');

    expect(normalizeNutritionItemName({
      code: 'DIETARY_FIBER',
      name: 'Dietary Fiber',
    })).toBe('Fiber');
  });

  it('formats small and large nutrition amounts', () => {
    expect(formatNutritionAmount(9.44, 'g')).toBe('9.4g');
    expect(formatNutritionAmount(12.7, 'g')).toBe('13g');
    expect(formatNutritionAmount(120, 'kcal')).toBe('120 kcal');
    expect(formatNutritionAmount(2.5, 'mg')).toBe('2.5mg');
  });
});


describe('nutrition display normalization', () => {
  it('normalizes backend carbohydrate and fiber names', () => {
    expect(normalizeNutritionItemName({ code: 'CARBOHYDRATE', name: 'Carbohydrate, by difference' })).toBe('Carbs');
    expect(normalizeNutritionItemName({ code: 'FIBER', name: 'Fiber, total dietary' })).toBe('Fiber');
  });
});
