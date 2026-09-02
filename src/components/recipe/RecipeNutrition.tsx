import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Beef, Wheat, Droplets, Cookie, Waves, ChevronRight } from 'lucide-react-native';
import { useTheme, colors } from '../../theme';
import { NutritionData, prepareNutritionBreakdown, getSummaryNutritionItems, hasNutritionContent, formatNutritionAmount } from '../../utils/nutrition';

interface RecipeNutritionProps {
  nutrition: NutritionData | null | undefined;
  scale: number;
  portionLabel: string;
  onSeeFullBreakdown: () => void;
}

const findMacro = (items: any[], codes: string[], names: string[]) => items.find((item) => {
  const code = String(item.code).toUpperCase();
  const name = String(item.name).toUpperCase();
  return codes.includes(code) || names.includes(name);
});

const findNutrient = (buckets: any[][], codes: string[], names: string[]) => {
  for (const bucket of buckets) {
    const match = findMacro(bucket ?? [], codes, names);
    if (match) return match;
  }
  return undefined;
};

export const RecipeNutrition: React.FC<RecipeNutritionProps> = ({ nutrition, scale, portionLabel, onSeeFullBreakdown }) => {
  const { theme } = useTheme();
  if (!nutrition) return null;
  const breakdown = prepareNutritionBreakdown(nutrition, scale);
  if (!hasNutritionContent(breakdown)) return null;

  const summaryItems = getSummaryNutritionItems(breakdown);
  const allBuckets = [summaryItems, breakdown.macros ?? [], breakdown.micros ?? []];
  const caloriesItem = findNutrient(allBuckets, ['CALORIES', 'CALORIE', 'ENERGY', 'KCAL'], ['CALORIES', 'CALORIE', 'ENERGY']);
  const proteinItem = findNutrient(allBuckets, ['PROTEIN', 'PROTEIN_G'], ['PROTEIN']);
  const carbsItem = findNutrient(allBuckets, ['CARBS', 'CARBOHYDRATES', 'CARBOHYDRATE'], ['CARBS', 'CARBOHYDRATES', 'CARBOHYDRATE', 'CARBOHYDRATE, BY DIFFERENCE', 'CARBOHYDRATES, BY DIFFERENCE']);
  const fatItem = findNutrient(allBuckets, ['FAT', 'TOTAL_FAT', 'TOTAL FAT'], ['FAT', 'TOTAL FAT']);
  const fiberItem = findNutrient(allBuckets, ['FIBER', 'DIETARY_FIBER', 'FIBRE'], ['FIBER', 'DIETARY FIBER', 'FIBER, TOTAL DIETARY', 'TOTAL DIETARY FIBER', 'FIBRE']);
  const sugarItem = findNutrient(allBuckets, ['SUGAR', 'SUGARS', 'TOTAL_SUGARS'], ['SUGAR', 'SUGARS', 'TOTAL SUGARS']);
  const sodiumItem = findNutrient(allBuckets, ['SODIUM', 'SODIUM_MG'], ['SODIUM']);
  const macroTotal = (proteinItem?.amount ?? 0) + (carbsItem?.amount ?? 0) + (fatItem?.amount ?? 0);
  const macroBars = [{ item: proteinItem, color: colors.protein }, { item: carbsItem, color: colors.carbs }, { item: fatItem, color: colors.fats }].filter((item) => item.item);
  const highlightItems = [{ item: fiberItem, label: 'Fiber', icon: Wheat, color: colors.carbs }, { item: sugarItem, label: 'Sugar', icon: Cookie, color: colors.calories }, { item: sodiumItem, label: 'Sodium', icon: Waves, color: colors.info }].filter((item) => item.item);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nutrition</Text>
        <Text style={[styles.sectionHint, { color: theme.colors.textMuted }]}>{portionLabel}</Text>
      </View>
      <View style={[styles.nutritionCard, { backgroundColor: theme.colors.surface }]}>
        {caloriesItem ? <View style={styles.calorieRow}><View style={[styles.nutritionIcon, { backgroundColor: colors.calories + '15' }]}><Flame size={20} color={colors.calories} /></View><View style={styles.flexOne}><Text style={[styles.calorieValue, { color: theme.colors.text }]}>{formatNutritionAmount(caloriesItem.amount, caloriesItem.unit)}</Text><Text style={[styles.calorieLabel, { color: theme.colors.textMuted }]}>Total energy</Text></View></View> : null}
        {macroBars.length > 0 && macroTotal > 0 ? <View style={[styles.macroBarTrack, { backgroundColor: theme.colors.border }]}>{macroBars.map((macro, index) => <View key={index} style={{ flex: macro.item!.amount / macroTotal, backgroundColor: macro.color }} />)}</View> : null}
        <View style={styles.nutritionGrid}>
          {proteinItem ? <View style={styles.nutritionGridItem}><MacroItem icon={<Beef size={14} color={colors.protein} />} value={formatNutritionAmount(proteinItem.amount, proteinItem.unit)} label="Protein" theme={theme} /></View> : null}
          {carbsItem ? <View style={styles.nutritionGridItem}><MacroItem icon={<Wheat size={14} color={colors.carbs} />} value={formatNutritionAmount(carbsItem.amount, carbsItem.unit)} label="Carbs" theme={theme} /></View> : null}
          {fatItem ? <View style={styles.nutritionGridItem}><MacroItem icon={<Droplets size={14} color={colors.fats} />} value={formatNutritionAmount(fatItem.amount, fatItem.unit)} label="Fat" theme={theme} /></View> : null}
          {highlightItems.map((highlight, index) => { const Icon = highlight.icon; return <View key={index} style={styles.nutritionGridItem}><View style={[styles.highlightIcon, { backgroundColor: highlight.color + '15' }]}><Icon size={14} color={highlight.color} /></View><View style={styles.nutritionText}><Text style={[styles.highlightValue, { color: theme.colors.text }]}>{formatNutritionAmount(highlight.item!.amount, highlight.item!.unit)}</Text><Text style={[styles.highlightLabel, { color: theme.colors.textMuted }]}>{highlight.label}</Text></View></View>; })}
        </View>
        <TouchableOpacity activeOpacity={0.7} style={[styles.fullNutritionButton, { borderTopColor: theme.colors.border }]} onPress={onSeeFullBreakdown}><Text style={[styles.fullNutritionText, { color: theme.colors.primary }]}>See full nutrition breakdown</Text><ChevronRight size={17} color={theme.colors.primary} /></TouchableOpacity>
      </View>
    </View>
  );
};

const MacroItem = ({ icon, value, label, theme }: any) => <View style={styles.macroItem}>{icon}<Text style={[styles.macroValue, { color: theme.colors.text }]}>{value}</Text><Text style={[styles.macroLabel, { color: theme.colors.textMuted }]}>{label}</Text></View>;

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionHeader: { minHeight: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', letterSpacing: -0.1 },
  sectionHint: { fontSize: 11, lineHeight: 16, fontWeight: '600' },
  flexOne: { flex: 1 },
  nutritionCard: { borderRadius: 16, padding: 12, overflow: 'hidden' },
  calorieRow: { flexDirection: 'row', alignItems: 'center', minHeight: 62, paddingHorizontal: 4, paddingBottom: 12, marginBottom: 2 },
  nutritionIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  calorieValue: { fontSize: 24, lineHeight: 29, fontWeight: '800' },
  calorieLabel: { fontSize: 11, lineHeight: 15, fontWeight: '500', marginTop: 1 },
  macroBarTrack: { height: 9, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', marginBottom: 14 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 12 },
  nutritionGridItem: { width: '31.8%', minHeight: 72, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 9, borderRadius: 12 },
  macroItem: { flex: 1, minHeight: 72, borderRadius: 12, paddingHorizontal: 6, paddingVertical: 9, alignItems: 'center', justifyContent: 'center', gap: 4 },
  macroValue: { fontSize: 13, lineHeight: 17, fontWeight: '800' },
  macroLabel: { fontSize: 10, lineHeight: 14, fontWeight: '500' },
  nutritionText: { alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  highlightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  highlightValue: { fontSize: 12, lineHeight: 16, fontWeight: '800' },
  highlightLabel: { fontSize: 9, lineHeight: 13, fontWeight: '500' },
  fullNutritionButton: { minHeight: 40, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingTop: 11 },
  fullNutritionText: { fontSize: 13, lineHeight: 18, fontWeight: '700' },
});
