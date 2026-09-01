import React from 'react';
import { Alert } from 'react-native';
import { BookOpen, Edit3, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme';
import { RoutineSummaryComponent } from '../api/types';
import { useDeleteRoutine } from '../api/routines';
import { ActionMenuSheet } from './ActionMenuSheet';

interface RoutineMenuModalProps {
  visible: boolean;
  routine: RoutineSummaryComponent | null;
  onClose: () => void;
  onOpenRoutine: (routineId: number) => void;
  onEditRoutine: (routineId: number) => void;
}

export const RoutineMenuModal: React.FC<RoutineMenuModalProps> = ({ visible, routine, onClose, onOpenRoutine, onEditRoutine }) => {
  const { theme } = useTheme();
  const deleteMutation = useDeleteRoutine();
  if (!routine) return null;

  const handleDelete = () => {
    Alert.alert('Delete Routine', `Are you sure you want to delete "${routine.name}"? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(routine.id, {
        onSuccess: onClose,
        onError: (err: any) => Alert.alert('Error', err?.response?.data?.detail || 'Failed to delete routine.'),
      }) },
    ]);
  };

  return (
    <ActionMenuSheet
      visible={visible}
      title={routine.name}
      onClose={onClose}
      items={[
        { key: 'open', label: 'Open Routine', icon: <BookOpen size={18} color={theme.colors.primary} />, onPress: () => onOpenRoutine(routine.id) },
        { key: 'edit', label: 'Edit Routine', icon: <Edit3 size={18} color={theme.colors.primary} />, onPress: () => onEditRoutine(routine.id) },
        { key: 'delete', label: 'Delete Routine', icon: <Trash2 size={18} color="#E05242" />, onPress: handleDelete, destructive: true },
      ]}
    />
  );
};
