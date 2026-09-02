import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, ChevronDown, Circle, Gauge, Moon, Smartphone, Sun, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme';
import { getDefaultRecipeCreationMode, setDefaultRecipeCreationMode, RecipeCreationMode } from '../settings/RecipeCreationMode';
import { useInteractiveCookingSettings, InteractiveCookingMode } from '../settings/InteractiveCookingSettings';

export const PreferencesSettingsScreen = () => {
  const { theme, themeType, setThemeType } = useTheme();
  const { mode: cookingMode, setMode: setCookingMode } = useInteractiveCookingSettings();
  const [recipeMode, setRecipeMode] = useState<RecipeCreationMode>('normal');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    void getDefaultRecipeCreationMode().then(setRecipeMode);
  }, []);

  const chooseRecipeMode = async (next: RecipeCreationMode) => {
    setRecipeMode(next);
    await setDefaultRecipeCreationMode(next);
  };

  const appearanceOptions = [
    { value: 'system' as const, label: 'System', icon: Smartphone },
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'black' as const, label: 'Black', icon: Circle },
  ];

  const toggle = (key: string) => setOpen(current => current === key ? null : key);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => toggle('appearance')} style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '14' }]}>
              <Sun size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Appearance</Text>
              <Text style={[styles.value, { color: theme.colors.textMuted }]}>
                {appearanceOptions.find(item => item.value === themeType)?.label || 'System'}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.colors.textMuted} style={open === 'appearance' ? styles.rotated : undefined} />
          </TouchableOpacity>
          {open === 'appearance' && (
            <View style={styles.expanded}>
              {appearanceOptions.map((option, index) => {
                const Icon = option.icon;
                const selected = themeType === option.value;
                return (
                  <React.Fragment key={option.value}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => setThemeType(option.value)} style={styles.optionRow}>
                      <Icon size={18} color={selected ? theme.colors.primary : theme.colors.textSecondary} />
                      <Text style={[styles.optionText, { color: theme.colors.text }]}>{option.label}</Text>
                      <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
                        {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
                      </View>
                    </TouchableOpacity>
                    {index < appearanceOptions.length - 1 && <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />}
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <View style={[styles.sectionDivider, { backgroundColor: theme.colors.divider }]} />

          <TouchableOpacity activeOpacity={0.8} onPress={() => toggle('recipe')} style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '14' }]}>
              <Gauge size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Recipe creation</Text>
              <Text style={[styles.value, { color: theme.colors.textMuted }]}>
                {recipeMode === 'normal' ? 'Normal mode' : 'Recording mode'}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.colors.textMuted} style={open === 'recipe' ? styles.rotated : undefined} />
          </TouchableOpacity>
          {open === 'recipe' && (
            <View style={styles.expanded}>
              {[
                { value: 'normal' as const, title: 'Normal mode', description: 'Use the complete recipe form.' },
                { value: 'recording' as const, title: 'Recording mode', description: 'Build the recipe while cooking step by step.' },
              ].map((item, index, items) => {
                const selected = recipeMode === item.value;
                return (
                  <React.Fragment key={item.value}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => void chooseRecipeMode(item.value)} style={styles.optionRow}>
                      <View style={styles.optionCopy}>
                        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{item.title}</Text>
                        <Text style={[styles.description, { color: theme.colors.textMuted }]}>{item.description}</Text>
                      </View>
                      {selected ? <Check size={21} color={theme.colors.primary} /> : <Circle size={21} color={theme.colors.textMuted} />}
                    </TouchableOpacity>
                    {index < items.length - 1 && <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />}
                  </React.Fragment>
                );
              })}
            </View>
          )}

          <View style={[styles.sectionDivider, { backgroundColor: theme.colors.divider }]} />

          <TouchableOpacity activeOpacity={0.8} onPress={() => toggle('interactive')} style={styles.headerRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '14' }]}>
              <ShieldCheck size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Interactive cooking</Text>
              <Text style={[styles.value, { color: theme.colors.textMuted }]}>
                {cookingMode === 'liberal' ? 'Liberal' : 'Strict'}
              </Text>
            </View>
            <ChevronDown size={20} color={theme.colors.textMuted} style={open === 'interactive' ? styles.rotated : undefined} />
          </TouchableOpacity>
          {open === 'interactive' && (
            <View style={styles.expanded}>
              {[
                { value: 'liberal' as InteractiveCookingMode, title: 'Liberal', description: 'Move between cooking steps freely.' },
                { value: 'strict' as InteractiveCookingMode, title: 'Strict', description: 'Complete the current step before moving on.' },
              ].map((item, index, items) => {
                const selected = cookingMode === item.value;
                return (
                  <React.Fragment key={item.value}>
                    <TouchableOpacity activeOpacity={0.8} onPress={() => void setCookingMode(item.value)} style={styles.optionRow}>
                      <View style={styles.optionCopy}>
                        <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{item.title}</Text>
                        <Text style={[styles.description, { color: theme.colors.textMuted }]}>{item.description}</Text>
                      </View>
                      <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
                        {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
                      </View>
                    </TouchableOpacity>
                    {index < items.length - 1 && <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />}
                  </React.Fragment>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  card: { borderRadius: 20, overflow: 'hidden' },
  headerRow: { minHeight: 78, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 43, height: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  headerCopy: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', marginBottom: 3 },
  value: { fontSize: 13 },
  rotated: { transform: [{ rotate: '180deg' }] },
  expanded: { paddingHorizontal: 16, paddingBottom: 8 },
  optionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '700', marginLeft: 13 },
  optionCopy: { flex: 1, paddingRight: 12 },
  optionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  description: { fontSize: 12.5, lineHeight: 18 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  divider: { height: 1, marginLeft: 31 },
  sectionDivider: { height: 1, marginHorizontal: 16 },
});
