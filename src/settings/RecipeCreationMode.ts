import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecipeCreationMode = 'normal' | 'recording';

const MODE_PREFIX = '@muveth_recipe_creation_mode:';
const DEFAULT_MODE_KEY = '@muveth_default_recipe_creation_mode';

export const getDefaultRecipeCreationMode = async (): Promise<RecipeCreationMode> => {
  try {
    const value = await AsyncStorage.getItem(DEFAULT_MODE_KEY);
    return value === 'recording' ? 'recording' : 'normal';
  } catch {
    return 'normal';
  }
};

export const setDefaultRecipeCreationMode = async (mode: RecipeCreationMode) => {
  try {
    await AsyncStorage.setItem(DEFAULT_MODE_KEY, mode);
  } catch {
    // Keep the preference usable in-memory when storage is unavailable.
  }
};

export const getRecipeCreationMode = async (recipeId: number): Promise<RecipeCreationMode> => {
  try {
    const value = await AsyncStorage.getItem(`${MODE_PREFIX}${recipeId}`);
    return value === 'recording' ? 'recording' : 'normal';
  } catch {
    return 'normal';
  }
};

export const setRecipeCreationMode = async (recipeId: number, mode: RecipeCreationMode) => {
  try {
    await AsyncStorage.setItem(`${MODE_PREFIX}${recipeId}`, mode);
  } catch {
    // Keep the recipe usable if local metadata cannot be persisted.
  }
};
