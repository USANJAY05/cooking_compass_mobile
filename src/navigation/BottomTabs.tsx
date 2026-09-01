import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Utensils, CalendarDays, ShoppingCart, Plus, User } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { RecipesScreen } from '../screens/RecipesScreen';
import { RoutineScreen } from '../screens/RoutineScreen';
import { CartScreen } from '../screens/CartScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useTheme } from '../theme';
import { getTodayDateString } from '../utils/dates';

const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Recipes"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
      }}
    >
      <Tab.Screen 
        name="Recipes" 
        component={RecipesScreen} 
        options={({ navigation }) => ({
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Utensils color={color} size={size} />,
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }} onPress={() => navigation.navigate('CreateRecipe')}>
              <Plus color={theme.colors.primary} size={24} />
            </TouchableOpacity>
          )
        })}
      />
      <Tab.Screen 
        name="Routine" 
        component={RoutineScreen} 
        options={({ navigation, route }) => ({
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <CalendarDays color={color} size={size} />,
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() =>
                navigation.navigate('CreateRoutine', {
                  initialDate:
                    (route.params as { selectedDate?: string } | undefined)?.selectedDate ??
                    getTodayDateString(),
                })
              }
            >
              <Plus color={theme.colors.primary} size={24} />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <ShoppingCart color={color} size={size} />
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <User color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
};
