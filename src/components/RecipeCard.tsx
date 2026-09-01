import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Clock, Users, Star, Image as ImageIcon } from 'lucide-react-native';
import { useTheme, colors } from '../theme';
import { RecipeSummaryComponent } from '../api/types';

interface RecipeCardProps {
  recipe: RecipeSummaryComponent;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress, onLongPress }) => {
  const { theme } = useTheme();

  const formattedPrepTime = recipe.preparation_time 
    ? `${recipe.preparation_time}m` 
    : recipe.cooking_time 
      ? `${recipe.cooking_time}m` 
      : 'N/A';

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.primary + '22',
        }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {recipe.thumbnail_url ? (
        <View style={styles.imageWrap}>
          <Image 
            source={{ uri: recipe.thumbnail_url }} 
            style={styles.image} 
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={[styles.placeholderImage, { backgroundColor: theme.colors.primary + '10' }]}>
          <ImageIcon size={24} color={theme.colors.primary} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={2}>
          {recipe.name}
        </Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color={colors.info} />
            <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
              {formattedPrepTime}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Users size={14} color={theme.colors.primary} />
            <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
              {recipe.servings} {recipe.servings === 1 ? 'serving' : 'servings'}
            </Text>
          </View>
        </View>
        
        {recipe.rating && recipe.rating.count > 0 ? (
          <View style={styles.ratingRow}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>
              {recipe.rating.average.toFixed(1)}
            </Text>
            <Text style={[styles.ratingCountText, { color: theme.colors.textMuted }]}>
              ({recipe.rating.count})
            </Text>
          </View>
        ) : (
          <View style={styles.ratingRow}>
            <Star size={14} color={theme.colors.textMuted} />
            <Text style={[styles.ratingCountText, { color: theme.colors.textMuted }]}>
              No reviews
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 7,
    overflow: 'hidden',
  },
  imageWrap: {
    width: 104,
    height: 112,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: 104,
    height: 112,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    padding: 13,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '800',
  },
  ratingCountText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
});
