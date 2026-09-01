import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Circle } from 'lucide-react-native';
import { useTheme } from '../theme';
import { getDefaultRecipeCreationMode, setDefaultRecipeCreationMode, RecipeCreationMode } from '../settings/RecipeCreationMode';

export const RecipeCreationSettingsScreen = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<RecipeCreationMode>('normal');

  useEffect(() => {
    void getDefaultRecipeCreationMode().then(setMode);
  }, []);

  const choose = async (next: RecipeCreationMode) => {
    setMode(next);
    await setDefaultRecipeCreationMode(next);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Recipe creation</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Choose how the Create Recipe button should start.</Text>

      {[
        { value: 'normal' as const, title: 'Normal mode', description: 'Use the complete recipe form. Best when you already know the recipe.' },
        { value: 'recording' as const, title: 'Recording mode', description: 'Build the recipe while cooking with a step-by-step wizard. You can move between steps and keep all changes.' },
      ].map((item) => {
        const selected = mode === item.value;
        return (
          <TouchableOpacity
            key={item.value}
            activeOpacity={0.8}
            onPress={() => void choose(item.value)}
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: selected ? theme.colors.primary : theme.colors.border }]}
          >
            <View style={styles.copy}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textMuted }]}>{item.description}</Text>
            </View>
            {selected ? <Check size={22} color={theme.colors.primary} /> : <Circle size={22} color={theme.colors.textMuted} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 16 },
  copy: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardDescription: { fontSize: 13, lineHeight: 19 },
});
