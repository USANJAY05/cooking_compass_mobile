export type QuantityUnitKind = 'count' | 'weight' | 'volume';

const COUNT_UNITS = new Set([
  'SERVING',
  'serving',
  'piece',
  'pinch',
  'clove',
  'slice',
  'PORTION',
  'BATCH',
  'BOWL',
]);

const WEIGHT_UNITS = new Set(['g', 'G', 'kg', 'KG', 'oz', 'lb']);


export const getUnitKind = (unit: string): QuantityUnitKind => {
  if (COUNT_UNITS.has(unit) || COUNT_UNITS.has(unit.toUpperCase())) {
    return 'count';
  }
  if (WEIGHT_UNITS.has(unit) || WEIGHT_UNITS.has(unit.toUpperCase())) {
    return 'weight';
  }
  return 'volume';
};

export const getDefaultQuantityForUnit = (unit: string): string => {
  const kind = getUnitKind(unit);
  const normalized = unit.toUpperCase();

  if (kind === 'count') {
    return '1';
  }

  if (kind === 'weight') {
    return normalized === 'KG' ? '1' : '100';
  }

  if (normalized === 'L') {
    return '1';
  }

  return '250';
};

export const getQuantityPlaceholder = (unit: string): string => {
  return getDefaultQuantityForUnit(unit);
};

export const sanitizeQuantityInput = (text: string, unit: string): string => {
  const kind = getUnitKind(unit);

  if (kind === 'count') {
    return text.replace(/[^0-9]/g, '').slice(0, 4);
  }

  let cleaned = text.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');

  if (parts.length > 2) {
    cleaned = `${parts[0]}.${parts.slice(1).join('')}`;
  }

  if (parts.length === 2) {
    cleaned = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }

  return cleaned;
};

export const parseQuantity = (value: string, unit: string): number => {
  const parsed = parseFloat(value);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return getUnitKind(unit) === 'count' ? Math.round(parsed) : parsed;
  }

  return parseFloat(getDefaultQuantityForUnit(unit));
};

export const formatUnitLabel = (unit: string): string => {
  const labels: Record<string, string> = {
    SERVING: 'serving',
    G: 'g',
    KG: 'kg',
    ML: 'ml',
    L: 'l',
    g: 'g',
    kg: 'kg',
    ml: 'ml',
    l: 'l',
    serving: 'serving',
    cup: 'cup',
    tbsp: 'tbsp',
    tsp: 'tsp',
    oz: 'oz',
    lb: 'lb',
    piece: 'piece',
    pinch: 'pinch',
    clove: 'clove',
    slice: 'slice',
  };

  return labels[unit] || unit.toLowerCase();
};

export const formatQuantityWithUnit = (quantity: string | number, unit: string): string => {
  const numeric = typeof quantity === 'number' ? quantity : parseFloat(quantity);
  const displayQty = Number.isNaN(numeric) ? quantity : numeric;
  return `${displayQty} ${formatUnitLabel(unit)}`;
};
