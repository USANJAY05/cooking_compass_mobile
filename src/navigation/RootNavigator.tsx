import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabs } from './BottomTabs';
import { LoginScreen } from '../screens/LoginScreen';
import { CreateRecipeScreen } from '../screens/CreateRecipeScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { EditRecipeScreen } from '../screens/EditRecipeScreen';
import { CreateRoutineScreen } from '../screens/CreateRoutineScreen';
import { RoutineDetailScreen } from '../screens/RoutineDetailScreen';
import { EditRoutineScreen } from '../screens/EditRoutineScreen';
import { NutritionDetailScreen } from '../screens/NutritionDetailScreen';
import { AppearanceSettingsScreen } from '../screens/AppearanceSettingsScreen';
import { AccountSettingsScreen } from '../screens/AccountSettingsScreen';
import { SecuritySettingsScreen } from '../screens/SecuritySettingsScreen';
import { InteractiveCookingSettingsScreen } from '../screens/InteractiveCookingSettingsScreen';
import { RecipeCreationSettingsScreen } from '../screens/RecipeCreationSettingsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { color: theme.colors.text },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen 
              name="CreateRecipe" 
              component={CreateRecipeScreen} 
              options={{
                headerShown: true,
                title: 'Create Recipe',
              }}
            />
            <Stack.Screen 
              name="RecipeDetail" 
              component={RecipeDetailScreen} 
              options={{
                headerShown: true,
                title: 'Recipe Detail',
              }}
            />
            <Stack.Screen 
              name="EditRecipe" 
              component={EditRecipeScreen} 
              options={{
                headerShown: true,
                title: 'Edit Recipe',
              }}
            />
            <Stack.Screen 
              name="CreateRoutine" 
              component={CreateRoutineScreen} 
              options={{
                headerShown: true,
                title: 'Create Routine',
              }}
            />
            <Stack.Screen 
              name="RoutineDetail" 
              component={RoutineDetailScreen} 
              options={{
                headerShown: true,
                title: 'Routine Detail',
              }}
            />
            <Stack.Screen 
              name="EditRoutine" 
              component={EditRoutineScreen} 
              options={{
                headerShown: true,
                title: 'Edit Routine',
              }}
            />
            <Stack.Screen
              name="NutritionDetail"
              component={NutritionDetailScreen}
              options={{
                headerShown: true,
                title: 'Full Nutrition',
              }}
            />
            <Stack.Screen
              name="AppearanceSettings"
              component={AppearanceSettingsScreen}
              options={{ headerShown: true, title: 'Appearance' }}
            />
            <Stack.Screen
              name="AccountSettings"
              component={AccountSettingsScreen}
              options={{ headerShown: true, title: 'Account information' }}
            />
            <Stack.Screen
              name="SecuritySettings"
              component={SecuritySettingsScreen}
              options={{ headerShown: true, title: 'Security' }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{
                headerShown: true,
                title: 'About',
              }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{
                headerShown: true,
                title: 'Privacy Policy',
              }}
            />

            <Stack.Screen
              name="Terms"
              component={TermsScreen}
              options={{
                headerShown: true,
                title: 'Terms of Service',
              }}
            />
            <Stack.Screen
              name="RecipeCreationSettings"
              component={RecipeCreationSettingsScreen}
              options={{ headerShown: true, title: 'Recipe creation' }}
            />
            <Stack.Screen
              name="InteractiveCookingSettings"
              component={InteractiveCookingSettingsScreen}
              options={{ headerShown: true, title: 'Interactive cooking' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
