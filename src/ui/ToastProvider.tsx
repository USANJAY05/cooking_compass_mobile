import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Toast, { BaseToastProps } from 'react-native-toast-message';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

const MuvethToast = ({ type, text1, text2 }: BaseToastProps & { type: 'success' | 'error' | 'info' | 'warning' }) => {
  const { theme } = useTheme();
  const icon = type === 'success'
    ? <CheckCircle2 size={22} color={theme.colors.primary} />
    : type === 'warning'
      ? <AlertTriangle size={22} color="#D97706" />
      : type === 'info'
        ? <Info size={22} color="#2563EB" />
        : <XCircle size={22} color="#DC2626" />;

  return (
    <View style={[styles.toast, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {icon}
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {text1}
        </Text>
        {text2 ? (
          <Text style={[styles.message, { color: theme.colors.textMuted }]} numberOfLines={2}>
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const toastConfig = {
  muvethSuccess: (props: BaseToastProps) => <MuvethToast {...props} type="success" />,
  muvethError: (props: BaseToastProps) => <MuvethToast {...props} type="error" />,
  muvethInfo: (props: BaseToastProps) => <MuvethToast {...props} type="info" />,
  muvethWarning: (props: BaseToastProps) => <MuvethToast {...props} type="warning" />,
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      {children}
      <Toast
        config={toastConfig}
        topOffset={Math.max(insets.top + 18, 42)}
        bottomOffset={insets.bottom + 18}
      />
    </>
  );
};

const styles = StyleSheet.create({
  toast: {
    width: '92%',
    minHeight: 66,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 12,
  },
  copy: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '800' },
  message: { fontSize: 13, lineHeight: 18 },
});
