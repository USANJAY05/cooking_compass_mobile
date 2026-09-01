import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, Gauge, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme';
import { useInteractiveCookingSettings, InteractiveCookingMode } from '../settings/InteractiveCookingSettings';

export const InteractiveCookingSettingsScreen = () => {
  const { theme } = useTheme();
  const { mode, setMode } = useInteractiveCookingSettings();

  const options: { value: InteractiveCookingMode; title: string; description: string; icon: typeof Gauge }[] = [
    { value: 'liberal', title: 'Liberal', description: 'Move between cooking steps freely. Timers and checkboxes are helpful, but never block you.', icon: Gauge },
    { value: 'strict', title: 'Strict', description: 'Complete the current step and finish its timer before moving to the next step.', icon: ShieldCheck },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Interactive cooking</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>Choose how much guidance MUVETH Kitchen should enforce while you cook.</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {options.map((option, index) => {
            const selected = mode === option.value;
            const Icon = option.icon;
            return <React.Fragment key={option.value}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => void setMode(option.value)} style={styles.option}>
                <View style={[styles.iconBox, { backgroundColor: selected ? theme.colors.primary + '16' : theme.colors.surfaceSecondary }]}>
                  <Icon size={20} color={selected ? theme.colors.primary : theme.colors.textSecondary} />
                </View>
                <View style={styles.copy}>
                  <Text style={[styles.optionTitle, { color: theme.colors.text }]}>{option.title}</Text>
                  <Text style={[styles.description, { color: theme.colors.textMuted }]}>{option.description}</Text>
                </View>
                <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
                  {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
                </View>
              </TouchableOpacity>
              {index < options.length - 1 ? <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} /> : null}
            </React.Fragment>;
          })}
        </View>
        <View style={[styles.note, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Check size={17} color={theme.colors.primary} />
          <Text style={[styles.noteText, { color: theme.colors.textMuted }]}>Liberal is the default so you can cook at your own pace.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  title: { fontFamily: 'Avenir Next', fontSize: 27, fontWeight: '900', marginBottom: 5 },
  subtitle: { fontSize: 14, lineHeight: 21, marginBottom: 22 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  option: { minHeight: 100, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  copy: { flex: 1, paddingRight: 12 },
  optionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  description: { fontSize: 12.5, lineHeight: 18 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  divider: { height: 1, marginLeft: 73 },
  note: { marginTop: 16, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  noteText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '600' },
});
