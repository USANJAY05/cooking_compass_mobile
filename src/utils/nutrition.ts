import { getUnitKind } from './quantity';

export type NutritionType = 'macro' | 'micro' | 'other';

export interface NutritionItem {
  code: string;
  name: string;
  amount: number;
  unit: string;
  type?: NutritionType;
}

export interface NutritionData {
  servings: number;
  items?: NutritionItem[];
}

export type NutritionCategory =
  | 'main'
  | 'macros'
  | 'micros'
  | 'other';

export interface NutritionBreakdown {
  main: NutritionItem[];
  macros: NutritionItem[];
  micros: NutritionItem[];
  other: NutritionItem[];
}

const MAIN_CODES = new Set([
  'CALORIES',
  'ENERGY',
  'CALORIE',
  'KCAL',
]);

const MACRO_CODES = new Set([
  'PROTEIN',
  'CARBOHYDRATES',
  'CARBS',
  'CARBOHYDRATE',
  'FAT',
  'TOTAL_FAT',
  'FIBER',
  'DIETARY_FIBER',
  'FIBRE',
  'SUGAR',
  'SUGARS',
  'TOTAL_SUGARS',
  'SATURATED_FAT',
  'TRANS_FAT',
  'CHOLESTEROL',
]);

const WEIGHT_CODES = new Set([
  'TOTAL_WEIGHT',
  'WEIGHT',
  'GRAMS',
  'TOTAL_GRAMS',
]);

export type PortionMode = 'servings' | 'quantity';

export type PortionQuantityUnit =
  | 'kg'
  | 'g'
  | 'mg'
  | 'l'
  | 'ml'
  | 'oz';

export const normalizePortionUnit = (
  unit?: string | null,
): PortionQuantityUnit => {
  const normalized = String(unit ?? '')
    .trim()
    .toLowerCase();

  switch (normalized) {
    case 'kg':
      return 'kg';

    case 'g':
    case 'gram':
    case 'grams':
      return 'g';

    case 'mg':
      return 'mg';

    case 'l':
    case 'lt':
    case 'ltr':
    case 'liter':
    case 'litre':
    case 'liters':
    case 'litres':
      return 'l';

    case 'ml':
    case 'milliliter':
    case 'millilitre':
    case 'milliliters':
    case 'millilitres':
      return 'ml';

    case 'oz':
    case 'ounce':
    case 'ounces':
      return 'oz';

    default:
      return 'g';
  }
};

/**
 * Used by PortionAdjuster.
 *
 * IMPORTANT:
 * Keep this exported because PortionAdjuster imports it.
 */
export const formatPortionUnit = (
  unit?: string | null,
): PortionQuantityUnit => {
  return normalizePortionUnit(unit);
};

const toGrams = (
  amount: number,
  unit: string,
): number => {
  const normalized = String(unit ?? '')
    .trim()
    .toLowerCase();

  switch (normalized) {
    case 'kg':
      return amount * 1000;

    case 'oz':
      return amount * 28.349523125;

    case 'mg':
      return amount / 1000;

    case 'g':
    default:
      return amount;
  }
};

const ingredientToGrams = (
  quantity: number,
  unit: string,
): number | null => {
  const kind = getUnitKind(unit);

  if (kind !== 'weight') {
    return null;
  }

  return toGrams(quantity, unit);
};

/**
 * Frontend display normalization for nutrition names.
 * The backend currently returns carbohydrate as
 * "Carbohydrate, by difference"; keep the UI concise until
 * the database naming is updated.
 */
export const normalizeNutritionItemName = (
  item: Pick<NutritionItem, 'code' | 'name'>,
): string => {
  const code = String(item.code ?? '').trim().toUpperCase();
  const name = String(item.name ?? '').trim().toLowerCase();

  if (
    code === 'CARBOHYDRATE' ||
    code === 'CARBOHYDRATES' ||
    code === 'CARBS' ||
    name === 'carbohydrate, by difference' ||
    name === 'carbohydrates, by difference' ||
    name === 'carbohydrate' ||
    name === 'carbohydrates'
  ) {
    return 'Carbs';
  }

  if (
    code === 'FIBER' ||
    code === 'DIETARY_FIBER' ||
    code === 'FIBRE' ||
    name === 'fiber, total dietary' ||
    name === 'dietary fiber' ||
    name === 'total dietary fiber'
  ) {
    return 'Fiber';
  }

  return item.name;
};

export const isNonZeroNutritionAmount = (
  amount: number,
): boolean => {
  if (!Number.isFinite(amount) || amount <= 0) {
    return false;
  }

  return (
    Math.round(amount * 100) / 100 > 0
  );
};

export const scaleNutritionItems = (
  items: NutritionItem[],
  scale: number,
): NutritionItem[] => {
  return items.map((item) => ({
    ...item,
    amount: item.amount * scale,
  }));
};

export const categorizeNutritionItems = (
  items: NutritionItem[] = [],
): NutritionBreakdown => {
  const main: NutritionItem[] = [];
  const macros: NutritionItem[] = [];
  const micros: NutritionItem[] = [];
  const other: NutritionItem[] = [];

  for (const item of items) {
    const code = String(item.code ?? '')
      .toUpperCase();

    if (!code) {
      continue;
    }

    if (WEIGHT_CODES.has(code)) {
      continue;
    }

    if (MAIN_CODES.has(code)) {
      main.push(item);
      continue;
    }

    const type = String(item.type ?? '')
      .toLowerCase();

    if (type === 'macro') {
      macros.push(item);
      continue;
    }

    if (type === 'micro') {
      micros.push(item);
      continue;
    }

    if (type === 'other') {
      other.push(item);
      continue;
    }

    /*
     * Backward compatibility:
     * old backend responses may not contain type.
     */
    if (MACRO_CODES.has(code)) {
      macros.push(item);
    } else {
      micros.push(item);
    }
  }

  const sortByName = (
    a: NutritionItem,
    b: NutritionItem,
  ) => a.name.localeCompare(b.name);

  const sortMacros = (
    a: NutritionItem,
    b: NutritionItem,
  ) => {
    const order = [
      'PROTEIN',
      'CARBOHYDRATES',
      'CARBS',
      'FAT',
      'TOTAL_FAT',
      'FIBER',
      'DIETARY_FIBER',
      'SUGAR',
      'SUGARS',
      'SATURATED_FAT',
      'TRANS_FAT',
      'CHOLESTEROL',
    ];

    const aIndex = order.indexOf(
      a.code.toUpperCase(),
    );

    const bIndex = order.indexOf(
      b.code.toUpperCase(),
    );

    if (
      aIndex === -1 &&
      bIndex === -1
    ) {
      return sortByName(a, b);
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  };

  main.sort(sortByName);
  macros.sort(sortMacros);
  micros.sort(sortByName);
  other.sort(sortByName);

  return {
    main,
    macros,
    micros,
    other,
  };
};

export const prepareNutritionBreakdown = (
  nutrition: NutritionData,
  scale = 1,
): NutritionBreakdown => {
  const scaledItems = scaleNutritionItems(
    nutrition?.items ?? [],
    scale,
  );

  const nonZeroItems = scaledItems.filter(
    (item) =>
      isNonZeroNutritionAmount(item.amount),
  );

  return categorizeNutritionItems(
    nonZeroItems,
  );
};

export const hasNutritionContent = (
  breakdown: NutritionBreakdown,
): boolean => {
  return (
    breakdown.main.length > 0 ||
    breakdown.macros.length > 0 ||
    breakdown.micros.length > 0 ||
    breakdown.other.length > 0
  );
};

const SUMMARY_GROUPS: string[][] = [
  ['CALORIES', 'CALORIE', 'ENERGY', 'KCAL'],
  ['PROTEIN', 'PROTEIN_G'],
  ['CARBOHYDRATES', 'CARBS', 'CARBOHYDRATE'],
  ['FAT', 'TOTAL_FAT', 'TOTAL FAT'],
];

const SUMMARY_CODE_SET = new Set(
  SUMMARY_GROUPS.flat(),
);

export const getSummaryNutritionItems = (
  breakdown: NutritionBreakdown,
): NutritionItem[] => {
  const pool = [
    ...breakdown.main,
    ...breakdown.macros,
  ];

  return SUMMARY_GROUPS
    .map((codes) =>
      pool.find((item) =>
        codes.includes(
          item.code.toUpperCase(),
        ),
      ),
    )
    .filter(
      (
        item,
      ): item is NutritionItem =>
        !!item,
    );
};

export const hasExtendedNutrition = (
  breakdown: NutritionBreakdown,
): boolean => {
  const extraMacros =
    breakdown.macros.filter(
      (item) =>
        !SUMMARY_CODE_SET.has(
          item.code.toUpperCase(),
        ),
    );

  return (
    extraMacros.length > 0 ||
    breakdown.micros.length > 0 ||
    breakdown.other.length > 0
  );
};

export const getTotalWeightGrams = (
  ingredients: {
    quantity: number;
    unit: string;
  }[],
  nutrition?: NutritionData | null,
): number => {
  const weightItem =
    nutrition?.items?.find(
      (item) =>
        WEIGHT_CODES.has(
          item.code.toUpperCase(),
        ),
    );

  if (weightItem) {
    return toGrams(
      weightItem.amount,
      weightItem.unit,
    );
  }

  let total = 0;
  let hasWeight = false;

  for (const ingredient of ingredients) {
    const grams =
      ingredientToGrams(
        ingredient.quantity,
        ingredient.unit,
      );

    if (grams !== null) {
      total += grams;
      hasWeight = true;
    }
  }

  return hasWeight ? total : 0;
};

export const getPortionScale = (
  mode: PortionMode,
  portionValue: number,
  recipeServings: number,
  nutrition?: NutritionData | null,
  totalWeightGrams?: number,
): number => {
  if (portionValue <= 0) {
    return 1;
  }

  if (mode === 'servings') {
    return (
      portionValue /
      Math.max(recipeServings, 1)
    );
  }

  const weight =
    totalWeightGrams ?? 0;

  if (weight <= 0) {
    return 1;
  }

  return portionValue / weight;
};

export const scaleIngredientQuantity = (
  quantity: number,
  unit: string,
  scale: number,
): string => {
  const scaled = quantity * scale;

  if (scaled <= 0) {
    return '0';
  }

  if (getUnitKind(unit) === 'count') {
    const rounded =
      Math.round(scaled * 10) / 10;

    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1);
  }

  if (scaled < 10) {
    return (
      Math.round(scaled * 10) / 10
    ).toFixed(1);
  }

  return String(
    Math.round(scaled),
  );
};

export const formatNutritionAmount = (
  amount: number,
  unit: string,
): string => {
  const normalized =
    String(unit ?? '').toLowerCase();

  const rounded =
    amount < 10
      ? Math.round(amount * 10) / 10
      : Math.round(amount);

  const display =
    Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1);

  if (
    normalized === 'kcal' ||
    normalized === 'cal'
  ) {
    return `${display} kcal`;
  }

  if (normalized === 'g') {
    return `${display}g`;
  }

  if (normalized === 'mg') {
    return `${display}mg`;
  }

  if (
    normalized === 'mcg' ||
    normalized === 'µg' ||
    normalized === 'ug'
  ) {
    return `${display}mcg`;
  }

  return `${display} ${unit}`;
};

export const getNutritionItemColor = (
  code: string,
): string | null => {
  switch (
    String(code ?? '').toUpperCase()
  ) {
    case 'CALORIES':
    case 'CALORIE':
    case 'ENERGY':
    case 'KCAL':
      return 'calories';

    case 'PROTEIN':
    case 'PROTEIN_G':
      return 'protein';

    case 'CARBOHYDRATES':
    case 'CARBS':
    case 'CARBOHYDRATE':
      return 'carbs';

    case 'FAT':
    case 'TOTAL_FAT':
    case 'TOTAL FAT':
      return 'fats';

    default:
      return null;
  }
};