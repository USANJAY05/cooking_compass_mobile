import React from 'react';
import { RecipeFormScreen } from './RecipeFormScreen';

export const EditRecipeScreen = (props: any) => (
  <RecipeFormScreen {...props} mode="edit" />
);

export default EditRecipeScreen;
