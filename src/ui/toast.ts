import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastPayload {
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

const TYPE_MAP: Record<ToastType, string> = {
  success: 'muvethSuccess',
  error: 'muvethError',
  info: 'muvethInfo',
  warning: 'muvethWarning',
};

export const toast = {
  show(payload: ToastPayload) {
    Toast.show({
      type: TYPE_MAP[payload.type],
      text1: payload.title ?? (payload.type === 'error' ? 'Something went wrong' : 'MUVETH Kitchen'),
      text2: payload.message,
      visibilityTime: payload.durationMs ?? 3500,
      autoHide: true,
      position: 'top',
      swipeable: true,
    });
  },
  hide() {
    Toast.hide();
  },
};
