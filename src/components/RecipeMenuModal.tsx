import React from 'react';
import { BookOpen, Edit3, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme';
import { RecipeSummaryComponent } from '../api/types';
import { useDeleteRecipe } from '../api/recipes';
import { ActionMenuSheet } from './ActionMenuSheet';
import { Alert } from 'react-native';

interface RecipeMenuModalProps {
  visible: boolean;
  recipe: RecipeSummaryComponent | null;
  onClose: () => void;
  onOpenRecipe: (recipeId: number) => void;
  onEditRecipe: (recipeId: number) => void;
}

export const RecipeMenuModal: React.FC<RecipeMenuModalProps> = ({ visible, recipe, onClose, onOpenRecipe, onEditRecipe }) => {
  const { theme } = useTheme();
  const deleteMutation = useDeleteRecipe();
  if (!recipe) return null;

  const handleDelete = () => {
    Alert.alert('Delete Recipe', `Are you sure you want to delete "${recipe.name}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(recipe.id, {
        onSuccess: onClose,
        onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail || 'Failed to delete recipe.'),
      }) },
    ]);
  };

  return (
    <ActionMenuSheet
      visible={visible}
      title={recipe.name}
      onClose={onClose}
      items={[
        { key: 'open', label: 'Open Recipe', icon: <BookOpen size={18} color={theme.colors.primary} />, onPress: () => onOpenRecipe(recipe.id) },
        { key: 'edit', label: 'Edit Recipe', icon: <Edit3 size={18} color={theme.colors.primary} />, onPress: () => onEditRecipe(recipe.id) },
        { key: 'delete', label: 'Delete Recipe', icon: <Trash2 size={18} color="#E05242" />, onPress: handleDelete, destructive: true },
      ]}
    />
  );
};
