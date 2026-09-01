import React from 'react';
import { RecipeFormScreen } from './RecipeFormScreen';

export const CreateRecipeScreen = (props: any) => (
  <RecipeFormScreen {...props} mode="create" />
);

export default CreateRecipeScreen;
