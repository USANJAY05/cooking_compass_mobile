import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import {
  NutritionData,
  hasNutritionContent,
  prepareNutritionBreakdown,
} from '../../utils/nutrition';
import { NutritionSection } from './NutritionSection';

interface NutritionPanelProps {
  nutrition: NutritionData;
  scale?: number;
  portionLabel?: string;
  showHeader?: boolean;
}

export const NutritionPanel: React.FC<NutritionPanelProps> = ({
  nutrition,
  scale = 1,
  portionLabel,
  showHeader = true,
}) => {
  const { theme } = useTheme();
  const breakdown = prepareNutritionBreakdown(nutrition, scale);

  if (!hasNutritionContent(breakdown)) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {showHeader ? (
        <View style={styles.header}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nutrition</Text>
          {portionLabel ? (
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>{portionLabel}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <NutritionSection title="Main" items={breakdown.main} variant="hero" />
        <NutritionSection title="Macros" items={breakdown.macros} variant="cards" />
        <NutritionSection title="Micros" items={breakdown.micros} variant="grid" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    paddingTop: 16,
  },
});
