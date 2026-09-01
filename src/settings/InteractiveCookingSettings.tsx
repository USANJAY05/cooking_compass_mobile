import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type InteractiveCookingMode = 'liberal' | 'strict';

interface InteractiveCookingContextValue {
  mode: InteractiveCookingMode;
  isStrict: boolean;
  setMode: (mode: InteractiveCookingMode) => Promise<void>;
}

const STORAGE_KEY = '@cooking_compass_interactive_cooking_mode';
const Context = createContext<InteractiveCookingContextValue | undefined>(undefined);

export const InteractiveCookingProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<InteractiveCookingMode>('liberal');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'strict' || saved === 'liberal') setModeState(saved);
    }).catch(() => undefined);
  }, []);

  const setMode = async (next: InteractiveCookingMode) => {
    setModeState(next);
    try { await AsyncStorage.setItem(STORAGE_KEY, next); } catch { /* keep in-memory preference */ }
  };

  return <Context.Provider value={{ mode, isStrict: mode === 'strict', setMode }}>{children}</Context.Provider>;
};

export const useInteractiveCookingSettings = () => {
  const value = useContext(Context);
  if (!value) throw new Error('useInteractiveCookingSettings must be used inside InteractiveCookingProvider');
  return value;
};
