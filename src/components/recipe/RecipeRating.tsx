import React from 'react';
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
