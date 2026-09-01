import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import {
  useColorScheme,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  Theme,
  lightTheme,
  darkTheme,
  blackTheme,
} from './tokens';


// ============================================================
// THEME TYPE
// ============================================================

export type ThemeType =
  | 'light'
  | 'dark'
  | 'black'
  | 'system';


// ============================================================
// CONTEXT TYPE
// ============================================================

interface ThemeContextType {
  theme: Theme;

  themeType: ThemeType;

  isDark: boolean;

  isBlack: boolean;

  setThemeType: (
    type: ThemeType
  ) => Promise<void>;
}


// ============================================================
// CONTEXT
// ============================================================

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );


// ============================================================
// STORAGE KEY
// ============================================================

const THEME_STORAGE_KEY =
  '@cooking_compass_theme';


// ============================================================
// PROVIDER
// ============================================================

export const ThemeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  // ----------------------------------------------------------
  // System theme
  // ----------------------------------------------------------

  const systemColorScheme =
    useColorScheme();


  // ----------------------------------------------------------
  // Selected theme
  // ----------------------------------------------------------

  const [
    themeType,
    setThemeTypeState,
  ] = useState<ThemeType>('system');


  // ----------------------------------------------------------
  // Initialization
  // ----------------------------------------------------------

  const [
    isReady,
    setIsReady,
  ] = useState(false);


  // ==========================================================
  // LOAD SAVED THEME
  // ==========================================================

  useEffect(() => {

    const loadTheme = async () => {

      try {

        const savedTheme =
          await AsyncStorage.getItem(
            THEME_STORAGE_KEY
          );


        if (
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'black' ||
          savedTheme === 'system'
        ) {

          setThemeTypeState(
            savedTheme
          );
        }

      } catch (error) {

        console.error(
          'Failed to load theme preference:',
          error
        );

      } finally {

        setIsReady(true);

      }
    };


    loadTheme();

  }, []);


  // ==========================================================
  // SET THEME
  // ==========================================================

  const setThemeType = async (
    type: ThemeType
  ) => {

    // Immediately update UI
    setThemeTypeState(type);


    try {

      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        type
      );

    } catch (error) {

      console.error(
        'Failed to save theme preference:',
        error
      );

    }
  };


  // ==========================================================
  // DETERMINE CURRENT THEME
  // ==========================================================

  let currentTheme: Theme;


  switch (themeType) {

    case 'light':

      currentTheme =
        lightTheme;

      break;


    case 'dark':

      currentTheme =
        darkTheme;

      break;


    case 'black':

      currentTheme =
        blackTheme;

      break;


    case 'system':

    default:

      currentTheme =
        systemColorScheme === 'dark'
          ? darkTheme
          : lightTheme;

      break;
  }


  // ==========================================================
  // THEME FLAGS
  // ==========================================================

  const isDark =
    currentTheme.dark;


  const isBlack =
    themeType === 'black';


  // ==========================================================
  // WAIT FOR THEME
  // ==========================================================

  if (!isReady) {

    return null;
  }


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <ThemeContext.Provider
      value={{
        theme: currentTheme,

        themeType,

        isDark,

        isBlack,

        setThemeType,
      }}
    >

      {children}

    </ThemeContext.Provider>
  );
};


// ============================================================
// USE THEME HOOK
// ============================================================

export const useTheme = (): ThemeContextType => {

  const context =
    useContext(ThemeContext);


  if (!context) {

    throw new Error(
      'useTheme must be used within a ThemeProvider'
    );
  }


  return context;
};