// ============================================================
// MUVETH Kitchen Design Tokens
// Health-first product theme for the MUVETH ecosystem.
// ============================================================

import { Platform } from 'react-native';

// ============================================================
// BRAND COLORS
// ============================================================

export const colors = {
  // MUVETH parent brand
  navy: '#172554',
  navySoft: '#26366F',
  indigo: '#4338CA',

  // MUVETH Kitchen / Health accent
  green: '#22C55E',
  greenDark: '#15803D',
  greenLight: '#DCFCE7',
  greenSoft: '#ECFDF3',

  // Supporting food accent
  orange: '#F59E0B',
  orangeLight: '#FEF3C7',
  yellow: '#FBBF24',
  yellowLight: '#FEF9C3',

  // LIGHT MODE
  backgroundLight: '#F7FAF7',
  surfaceLight: '#FFFFFF',
  surfaceSecondaryLight: '#EEF7F0',
  textLight: '#132238',
  textSecondaryLight: '#52606D',
  textMutedLight: '#7A8694',
  borderLight: '#DCE5DE',
  dividerLight: '#E7EEE9',

  // DARK MODE
  backgroundDark: '#0B1110',
  surfaceDark: '#121A17',
  surfaceSecondaryDark: '#18231E',
  textDark: '#F2F7F3',
  textSecondaryDark: '#C3D1C8',
  textMutedDark: '#8FA198',
  borderDark: '#2B3931',
  dividerDark: '#202C26',

  // BLACK / OLED MODE
  backgroundBlack: '#000000',
  surfaceBlack: '#080B09',
  surfaceSecondaryBlack: '#101612',
  textBlack: '#FFFFFF',
  textSecondaryBlack: '#D7E0DA',
  textMutedBlack: '#8D9992',
  borderBlack: '#252C28',
  dividerBlack: '#191E1B',

  // NUTRITION
  protein: '#E85D75',
  carbs: '#D89A16',
  fats: '#4F7FDB',
  calories: '#E87928',

  // SEMANTIC
  success: '#22C55E',
  warning: '#D97706',
  error: '#DC4C4C',
  info: '#4F7FDB',

  // BASIC
  white: '#FFFFFF',
  black: '#000000',
};

// ============================================================
// SPACING
// ============================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

// ============================================================
// BORDER RADIUS
// ============================================================

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  // Brand pairing: Avenir Next on iOS; modern system sans on Android.
  // This keeps the app dependency-free while giving MUVETH a geometric,
  // premium feel on Apple devices and a native feel on Android.
  fontFamily: {
    display: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'sans-serif' }) as string,
    body: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'sans-serif' }) as string,
    mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
  },

  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },
};

// ============================================================
// THEME TYPE
// ============================================================

export type Theme = {
  dark: boolean;
  colors: {
    brandNavy: string;
    primary: string;
    primaryDark: string;
    primaryLight: string;
    orange: string;
    orangeLight: string;
    yellow: string;
    yellowLight: string;
    green: string;
    greenLight: string;
    background: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    divider: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    protein: string;
    carbs: string;
    fats: string;
    calories: string;
    white: string;
  };
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
};

// ============================================================
// LIGHT THEME
// ============================================================

export const lightTheme: Theme = {
  dark: false,
  colors: {
    brandNavy: colors.navy,
    primary: colors.green,
    primaryDark: colors.greenDark,
    primaryLight: '#4ADE80',
    orange: colors.orange,
    orangeLight: colors.orangeLight,
    yellow: colors.yellow,
    yellowLight: colors.yellowLight,
    green: colors.green,
    greenLight: colors.greenLight,
    background: colors.backgroundLight,
    surface: colors.surfaceLight,
    surfaceSecondary: colors.surfaceSecondaryLight,
    text: colors.textLight,
    textSecondary: colors.textSecondaryLight,
    textMuted: colors.textMutedLight,
    border: colors.borderLight,
    divider: colors.dividerLight,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    protein: colors.protein,
    carbs: colors.carbs,
    fats: colors.fats,
    calories: colors.calories,
    white: colors.white,
  },
  spacing,
  borderRadius,
  typography,
};

// ============================================================
// DARK THEME
// ============================================================

export const darkTheme: Theme = {
  dark: true,
  colors: {
    brandNavy: colors.navy,
    primary: '#4ADE80',
    primaryDark: colors.green,
    primaryLight: '#86EFAC',
    orange: '#FBBF24',
    orangeLight: '#78350F',
    yellow: '#FCD34D',
    yellowLight: '#713F12',
    green: '#4ADE80',
    greenLight: '#163C24',
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    surfaceSecondary: colors.surfaceSecondaryDark,
    text: colors.textDark,
    textSecondary: colors.textSecondaryDark,
    textMuted: colors.textMutedDark,
    border: colors.borderDark,
    divider: colors.dividerDark,
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#7EA2F7',
    protein: '#F4728B',
    carbs: '#F0B52B',
    fats: '#7EA2F7',
    calories: '#FB923C',
    white: colors.white,
  },
  spacing,
  borderRadius,
  typography,
};

// ============================================================
// BLACK / OLED THEME
// ============================================================

export const blackTheme: Theme = {
  dark: true,
  colors: {
    brandNavy: colors.navy,
    primary: '#4ADE80',
    primaryDark: colors.green,
    primaryLight: '#86EFAC',
    orange: '#FBBF24',
    orangeLight: '#713F12',
    yellow: '#FCD34D',
    yellowLight: '#713F12',
    green: '#4ADE80',
    greenLight: '#163C24',
    background: colors.backgroundBlack,
    surface: colors.surfaceBlack,
    surfaceSecondary: colors.surfaceSecondaryBlack,
    text: colors.textBlack,
    textSecondary: colors.textSecondaryBlack,
    textMuted: colors.textMutedBlack,
    border: colors.borderBlack,
    divider: colors.dividerBlack,
    success: '#4ADE80',
    warning: '#FCD34D',
    error: '#FF6B6B',
    info: '#7EA2F7',
    protein: '#FF6F88',
    carbs: '#FCD34D',
    fats: '#7EA2F7',
    calories: '#FB923C',
    white: colors.white,
  },
  spacing,
  borderRadius,
  typography,
};
