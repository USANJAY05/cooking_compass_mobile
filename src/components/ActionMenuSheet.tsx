import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { useTheme } from '../theme';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionMenuSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  items: ActionMenuItem[];
}

export const ActionMenuSheet: React.FC<ActionMenuSheetProps> = ({ visible, title, onClose, items }) => {
  const { theme } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="70%">
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <View style={[styles.accent, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.close, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        >
          <X size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

      {items.map((item) => {
        const color = item.destructive ? '#E05242' : theme.colors.text;
        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.72}
            disabled={item.disabled}
            onPress={() => {
              onClose();
              item.onPress();
            }}
            style={[styles.item, item.disabled && styles.disabled]}
          >
            <View style={[styles.icon, { backgroundColor: (item.destructive ? '#E05242' : theme.colors.primary) + '12' }]}>
              {item.icon}
            </View>
            <Text style={[styles.itemText, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  header: { minHeight: 64, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  accent: { width: 4, height: 30, borderRadius: 4, marginRight: 12 },
  title: { flex: 1, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  close: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 20 },
  item: { minHeight: 62, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  disabled: { opacity: 0.45 },
});
