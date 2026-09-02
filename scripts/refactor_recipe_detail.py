from pathlib import Path
import re

root = Path('.')
screen_path = root / 'src/screens/RecipeDetailScreen.tsx'
portion_path = root / 'src/components/PortionAdjuster.tsx'
screen = screen_path.read_text()

rating_component = '''import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../../theme';

type RecipeRatingValue = { average: number; count: number };

interface RecipeRatingProps {
  rating?: RecipeRatingValue | null;
  userRating: number | null;
  isPending?: boolean;
  onRate: (score: number) => void;
}

export const RecipeRating: React.FC<RecipeRatingProps> = ({ rating, userRating, isPending = false, onRate }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rate this recipe</Text>
      <View style={[styles.ratingCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.ratingOverview}>
          <View style={[styles.ratingScoreBadge, { backgroundColor: theme.colors.primary + '12' }]}>
            <Star size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.ratingScore, { color: theme.colors.text }]}>{rating?.average ? rating.average.toFixed(1) : '—'}</Text>
          </View>
          <View style={styles.ratingCopy}>
            <Text style={[styles.ratingTitle, { color: theme.colors.text }]}>{userRating ? `You rated this ${userRating}/5` : 'How was this recipe?'}</Text>
            <Text style={[styles.ratingHint, { color: theme.colors.textMuted }]}>{rating?.count ? `${rating.count} community rating${rating.count === 1 ? '' : 's'}` : 'Tap a star to share your rating'}</Text>
          </View>
        </View>
        <View style={[styles.ratingActionRow, { borderTopColor: theme.colors.border }]}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const isFilled = userRating !== null && starIndex <= userRating;
              return (
                <TouchableOpacity key={starIndex} onPress={() => onRate(starIndex)} style={styles.starButton} disabled={isPending} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`Rate ${starIndex} out of 5`}>
                  <Star size={28} color={isFilled ? '#F59E0B' : theme.colors.border} fill={isFilled ? '#F59E0B' : 'transparent'} strokeWidth={1.8} />
                </TouchableOpacity>
              );
            })}
          </View>
          {isPending ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, lineHeight: 22, fontWeight: '800', letterSpacing: -0.1, marginBottom: 10 },
  ratingCard: { borderRadius: 16, overflow: 'hidden' },
  ratingOverview: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  ratingScoreBadge: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 1 },
  ratingScore: { fontSize: 14, lineHeight: 18, fontWeight: '900' },
  ratingCopy: { flex: 1, minWidth: 0 },
  ratingTitle: { fontSize: 15, lineHeight: 20, fontWeight: '800' },
  ratingHint: { fontSize: 11.5, lineHeight: 16, fontWeight: '600', marginTop: 3 },
  ratingActionRow: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  starButton: { padding: 2 },
});
'''

nutrition_component = '''import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Flame, Beef, Wheat, Droplets, Leaf, Cookie, Waves, ChevronRight } from 'lucide-react-native';
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
  const highlightItems = [{ item: fiberItem, label: 'Fiber', icon: Leaf, color: colors.carbs }, { item: sugarItem, label: 'Sugar', icon: Cookie, color: colors.calories }, { item: sodiumItem, label: 'Sodium', icon: Waves, color: colors.info }].filter((item) => item.item);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nutrition</Text>
        <Text style={[styles.sectionHint, { color: theme.colors.textMuted }]}>{portionLabel}</Text>
      </View>
      <View style={[styles.nutritionCard, { backgroundColor: theme.colors.surface }]}>
        {caloriesItem ? (
          <View style={styles.calorieRow}>
            <View style={[styles.nutritionIcon, { backgroundColor: colors.calories + '15' }]}><Flame size={20} color={colors.calories} /></View>
            <View style={styles.flexOne}>
              <Text style={[styles.calorieValue, { color: theme.colors.text }]}>{formatNutritionAmount(caloriesItem.amount, caloriesItem.unit)}</Text>
              <Text style={[styles.calorieLabel, { color: theme.colors.textMuted }]}>Total energy</Text>
            </View>
          </View>
        ) : null}
        {macroBars.length > 0 && macroTotal > 0 ? (
          <View style={[styles.macroBarTrack, { backgroundColor: theme.colors.border }]}>
            {macroBars.map((macro, index) => <View key={index} style={{ flex: macro.item!.amount / macroTotal, backgroundColor: macro.color }} />)}
          </View>
        ) : null}
        <View style={styles.nutritionGrid}>
          {proteinItem ? <View style={styles.nutritionGridItem}><MacroItem icon={<Beef size={14} color={colors.protein} />} value={formatNutritionAmount(proteinItem.amount, proteinItem.unit)} label="Protein" theme={theme} /></View> : null}
          {carbsItem ? <View style={styles.nutritionGridItem}><MacroItem icon={<Wheat size={14} color={colors.carbs} />} value={formatNutritionAmount(carbsItem.amount, carbsItem.unit)} label="Carbs" theme={theme} /></View> : null}
          {fatItem ? <View style={styles.nutritionGridItem}><MacroItem icon={<Droplets size={14} color={colors.fats} />} value={formatNutritionAmount(fatItem.amount, fatItem.unit)} label="Fat" theme={theme} /></View> : null}
          {highlightItems.map((highlight, index) => {
            const Icon = highlight.icon;
            return <View key={index} style={styles.nutritionGridItem}><View style={[styles.highlightIcon, { backgroundColor: highlight.color + '15' }]}><Icon size={14} color={highlight.color} /></View><View style={styles.nutritionText}><Text style={[styles.highlightValue, { color: theme.colors.text }]}>{formatNutritionAmount(highlight.item!.amount, highlight.item!.unit)}</Text><Text style={[styles.highlightLabel, { color: theme.colors.textMuted }]}>{highlight.label}</Text></View></View>;
          })}
        </View>
        <TouchableOpacity activeOpacity={0.7} style={[styles.fullNutritionButton, { borderTopColor: theme.colors.border }]} onPress={onSeeFullBreakdown}>
          <Text style={[styles.fullNutritionText, { color: theme.colors.primary }]}>See full nutrition breakdown</Text>
          <ChevronRight size={17} color={theme.colors.primary} />
        </TouchableOpacity>
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
'''

component_dir = root / 'src/components/recipe'
component_dir.mkdir(parents=True, exist_ok=True)
(component_dir / 'RecipeRating.tsx').write_text(rating_component)
(component_dir / 'RecipeNutrition.tsx').write_text(nutrition_component)

# PortionAdjuster: remove only the decorative outer border.
portion = portion_path.read_text()
portion = portion.replace("          backgroundColor: theme.colors.surface,\n          borderColor: theme.colors.border,\n", "          backgroundColor: theme.colors.surface,\n", 1)
portion = portion.replace("  container: {\n    borderWidth: 1,\n", "  container: {\n", 1)
portion_path.write_text(portion)

# Imports and component imports.
screen = screen.replace("  useRateRecipe,\n", "")
screen = screen.replace("  Flame,\n  ChevronRight,\n  Beef,\n  Wheat,\n  Droplets,\n  Leaf,\n  Cookie,\n  Waves,\n", "")
screen = screen.replace("  prepareNutritionBreakdown,\n  getSummaryNutritionItems,\n  hasNutritionContent,\n  formatNutritionAmount,\n", "")
screen = screen.replace("import { PortionAdjuster } from '../components/PortionAdjuster';\n", "import { PortionAdjuster } from '../components/PortionAdjuster';\nimport { RecipeRating } from '../components/recipe/RecipeRating';\nimport { RecipeNutrition } from '../components/recipe/RecipeNutrition';\n")

# Extracted rating state and mutation remain screen state because the screen owns API interaction.
# Remove only the rating UI helper handler's local state remains intact.

# Remove nutrition-only helpers from the screen.
screen = re.sub(r"\nconst findMacro = \(.*?\n\};\n\nconst findNutrient = \(.*?\n\};\n", "\n", screen, count=1, flags=re.S)

# Remove nutrition derived data, leaving nutritionScale and portionLabel intact.
screen = re.sub(r"\n  const nutritionBreakdown =\n.*?\n  const completedStepCount =", "\n  const completedStepCount =", screen, count=1, flags=re.S)

# Replace inline rating section.
rating_pattern = r"\n          /\* ============================================================ \*/\n          /\* RATING.*?\n          /\* PORTIONS"
rating_replacement = '''\n          <RecipeRating\n            rating={recipe.rating}\n            userRating={userRating}\n            isPending={rateMutation.isPending}\n            onRate={handleSelectRating}\n          />\n\n          {/* ============================================================ */}\n          {/* PORTIONS'''
screen, rating_count = re.subn(rating_pattern, rating_replacement, screen, count=1, flags=re.S)

# Replace inline nutrition section.
nutrition_pattern = r"\n          /\* ============================================================ \*/\n          /\* NUTRITION.*?\n          /\* INGREDIENTS"
nutrition_replacement = '''\n          <RecipeNutrition\n            nutrition={recipe.nutrition}\n            scale={nutritionScale}\n            portionLabel={portionLabel}\n            onSeeFullBreakdown={() =>\n              navigation.navigate('NutritionDetail', {\n                recipeName: recipe.name,\n                nutrition: recipe.nutrition,\n                scale: nutritionScale,\n                portionLabel,\n              })\n            }\n          />\n\n          {/* ============================================================ */}\n          {/* INGREDIENTS'''
screen, nutrition_count = re.subn(nutrition_pattern, nutrition_replacement, screen, count=1, flags=re.S)

if rating_count != 1:
    raise SystemExit(f'Expected one rating section, found {rating_count}')
if nutrition_count != 1:
    raise SystemExit(f'Expected one nutrition section, found {nutrition_count}')

screen_path.write_text(screen)
print('Recipe detail component extraction completed')
