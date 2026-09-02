import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme';
import { CartItemComponent } from '../api/types';

interface CartItemRowProps {
  item: CartItemComponent;
  isChecked: boolean;
  onToggle: () => void;
  accentColor?: string;
  showIndicator?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  isChecked,
  onToggle,
  accentColor,
  showIndicator = true,
}) => {
  const { theme } = useTheme();
  const accent = accentColor || theme.colors.primary;

  const displayName =
    item.name ||
    item.ingredient_name ||
    'Unnamed ingredient';

  const rawQuantity =
    item.quantity ??
    item.total_quantity;

  const quantity = Number(rawQuantity);

  const formattedQuantity = Number.isFinite(quantity)
    ? Number.isInteger(quantity)
      ? quantity.toString()
      : quantity
          .toFixed(2)
          .replace(/\.?0+$/, '')
    : String(rawQuantity ?? '');

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
        },
        isChecked && styles.checkedCard,
      ]}
    >
      <View style={styles.leftContent}>
        {showIndicator && (
          <View
            style={[
              styles.checkIndicator,
              {
                backgroundColor: isChecked
                  ? accent
                  : 'transparent',
                borderColor: isChecked
                  ? accent
                  : theme.colors.borderStrong || `${accent}55`,
              },
            ]}
          >
            {isChecked && (
              <Check
                size={13}
                color="#FFFFFF"
                strokeWidth={3}
              />
            )}
          </View>
        )}

        <View
          style={[
            styles.nameContainer,
            !showIndicator && styles.nameContainerNoIndicator,
          ]}
        >
          <Text
            numberOfLines={2}
            style={[
              styles.ingredientName,
              {
                color: isChecked
                  ? theme.colors.textMuted
                  : theme.colors.text,
              },
              isChecked && styles.checkedName,
            ]}
          >
            {displayName}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.quantityPill,
          {
            backgroundColor: isChecked
              ? theme.colors.background
              : `${accent}10`,
            borderColor: isChecked
              ? theme.colors.border
              : `${accent}35`,
          },
        ]}
      >
        <Text
          style={[
            styles.quantityText,
            {
              color: isChecked
                ? theme.colors.textMuted
                : accent,
            },
          ]}
        >
          {formattedQuantity}
        </Text>

        {item.unit ? (
          <Text
            style={[
              styles.unitText,
              {
                color: isChecked
                  ? theme.colors.textMuted
                  : accent,
              },
            ]}
          >
            {item.unit}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    marginBottom: 10,
  },
  checkedCard: {
    opacity: 0.72,
  },
  leftContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  checkIndicator: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    flexShrink: 0,
  },
  nameContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  nameContainerNoIndicator: {
    paddingLeft: 0,
  },
  ingredientName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  checkedName: {
    textDecorationLine: 'line-through',
    opacity: 0.8,
  },
  quantityPill: {
    minWidth: 56,
    minHeight: 34,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quantityText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
    marginLeft: 3,
  },
});