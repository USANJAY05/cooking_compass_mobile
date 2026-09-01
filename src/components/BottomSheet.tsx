import React, { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: ViewStyle['maxHeight'];
  contentStyle?: ViewStyle;
  showHandle?: boolean;
  closeOnBackdropPress?: boolean;
}

/** Shared bottom-to-top surface used for menus, pickers and contextual actions. */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  maxHeight = '82%',
  contentStyle,
  showHandle = true,
  closeOnBackdropPress = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={closeOnBackdropPress ? onClose : undefined}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              maxHeight,
              paddingBottom: Math.max(insets.bottom, 12),
            },
            contentStyle,
          ]}
        >
          {showHandle ? (
            <View style={styles.handleTrack}>
              <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.48)' },
  sheet: {
    width: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  handleTrack: { height: 24, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 42, height: 4, borderRadius: 4 },
});
