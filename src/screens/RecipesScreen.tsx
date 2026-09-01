import React from 'react';
import {
  Platform,
  StyleSheet,
} from 'react-native';
import {
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';

import { useTheme } from '../theme';

import { RecipesFeedScreen } from './RecipesFeedScreen';
import { RecipesMineScreen } from './RecipesMineScreen';

const Tab = createMaterialTopTabNavigator();

export const RecipesScreen = () => {
  const { theme } = useTheme();

  const isIOS = Platform.OS === 'ios';

  return (
    <Tab.Navigator
      lazy
      lazyPreloadDistance={0}
      screenOptions={{
        /*
         * ============================================================
         * TAB COLORS
         * ============================================================
         */

        tabBarActiveTintColor:
          theme.colors.primary,

        tabBarInactiveTintColor:
          theme.colors.textMuted,

        /*
         * ============================================================
         * ACTIVE INDICATOR
         * ============================================================
         */

        tabBarIndicatorStyle: {
          backgroundColor:
            theme.colors.primary,

          height: 2,

          borderRadius: 999,
        },

        /*
         * ============================================================
         * TAB BAR
         * ============================================================
         */

        tabBarStyle: {
          /*
           * Keep the existing theme background.
           *
           * Unlike the bottom tab bar, this is a content-level
           * segmented navigation control, so keeping the surface
           * background is appropriate.
           */
          backgroundColor:
            theme.colors.surface,

          borderBottomWidth:
            StyleSheet.hairlineWidth,

          borderBottomColor:
            theme.colors.border,

          elevation: 0,

          shadowOpacity: 0,

          /*
           * Remove unnecessary Android shadow.
           */
          ...(isIOS && {
            shadowColor: 'transparent',
          }),
        },

        /*
         * ============================================================
         * TAB LABEL
         * ============================================================
         */

        tabBarLabelStyle: {
          fontSize: 13,

          fontWeight: '800',

          textTransform: 'none',

          /*
           * Prevent labels from becoming too tall.
           */
          lineHeight: 18,
        },

        /*
         * ============================================================
         * TAB PRESS FEEDBACK
         * ============================================================
         */

        tabBarPressColor:
          theme.colors.primary + '12',

        /*
         * ============================================================
         * SWIPE
         * ============================================================
         */

        swipeEnabled: true,
      }}
    >
      {/* ==========================================================
          EXPLORE
          ========================================================== */}

      <Tab.Screen
        name="Feed"
        component={RecipesFeedScreen}
        options={{
          tabBarLabel: 'Explore',
        }}
      />

      {/* ==========================================================
          MY RECIPES
          ========================================================== */}

      <Tab.Screen
        name="Mine"
        component={RecipesMineScreen}
        options={{
          tabBarLabel: 'My Recipes',
        }}
      />
    </Tab.Navigator>
  );
};