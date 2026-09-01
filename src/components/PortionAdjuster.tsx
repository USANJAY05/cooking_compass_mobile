import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import {
  Minus,
  Plus,
  Scale,
  Users,
} from 'lucide-react-native';

import { useTheme } from '../theme';

import {
  PortionMode,
  PortionQuantityUnit,
} from '../utils/nutrition';

interface PortionAdjusterProps {
  mode: PortionMode;
  value: string;

  recipeServings: number;

  quantityUnit: PortionQuantityUnit;
  totalQuantity: number;

  onModeChange: (
    mode: PortionMode,
  ) => void;

  onValueChange: (
    value: string,
  ) => void;
}

export const PortionAdjuster: React.FC<
  PortionAdjusterProps
> = ({
  mode,
  value,
  recipeServings,
  quantityUnit,
  totalQuantity,
  onModeChange,
  onValueChange,
}) => {
  const { theme } = useTheme();

  const numericValue =
    parseFloat(
      String(value).replace(',', '.'),
    ) || 0;

  const canUseServings =
    Number(recipeServings) > 0;

  const canUseQuantity =
    Number(totalQuantity) > 0;

  const step =
    mode === 'servings'
      ? 1
      : quantityUnit === 'kg' ||
        quantityUnit === 'l'
      ? 0.1
      : quantityUnit === 'oz'
      ? 0.5
      : 1;

  const minValue = 1;

  const adjustValue = (
    delta: number,
  ) => {
    const next = Math.max(
      minValue,
      numericValue + delta,
    );

    const rounded =
      mode === 'servings'
        ? Math.round(next)
        : Math.round(next * 100) /
          100;

    onValueChange(
      String(rounded),
    );
  };

  const quantityLabel =
    quantityUnit === 'kg'
      ? 'kg'
      : quantityUnit === 'g'
      ? 'g'
      : quantityUnit === 'mg'
      ? 'mg'
      : quantityUnit === 'l'
      ? 'l'
      : quantityUnit === 'ml'
      ? 'ml'
      : 'oz';

  const subtitle =
    mode === 'servings'
      ? `Original recipe makes ${recipeServings} serving${
          recipeServings === 1
            ? ''
            : 's'
        }`
      : `Total recipe quantity: ${totalQuantity} ${quantityLabel}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color:
              theme.colors.text,
          },
        ]}
      >
        Adjust Portion
      </Text>

      <Text
        style={[
          styles.subtitle,
          {
            color:
              theme.colors.textMuted,
          },
        ]}
      >
        {subtitle}
      </Text>

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            {
              borderColor:
                theme.colors.border,
              opacity: canUseServings ? 1 : 0.45,
            },
            mode === 'servings' && canUseServings && {
              backgroundColor:
                theme.colors.primary +
                '12',
              borderColor:
                theme.colors.primary,
            },
          ]}
          onPress={() =>
            canUseServings && onModeChange('servings')
          }
          disabled={!canUseServings}
        >
          <Users
            size={16}
            color={
              mode === 'servings' && canUseServings
                ? theme.colors.primary
                : theme.colors.textMuted
            }
          />

          <Text
            style={[
              styles.modeText,
              {
                color:
                  mode === 'servings' && canUseServings
                    ? theme.colors.primary
                    : theme.colors.textMuted,
              },
            ]}
          >
            Servings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            {
              borderColor:
                theme.colors.border,
              opacity:
                canUseQuantity
                  ? 1
                  : 0.45,
            },
            mode === 'quantity' &&
              canUseQuantity && {
                backgroundColor:
                  theme.colors.primary +
                  '12',
                borderColor:
                  theme.colors.primary,
              },
          ]}
          onPress={() =>
            canUseQuantity &&
            onModeChange(
              'quantity',
            )
          }
          disabled={!canUseQuantity}
        >
          <Scale
            size={16}
            color={
              mode === 'quantity' &&
              canUseQuantity
                ? theme.colors.primary
                : theme.colors.textMuted
            }
          />

          <Text
            style={[
              styles.modeText,
              {
                color:
                  mode === 'quantity' &&
                  canUseQuantity
                    ? theme.colors.primary
                    : theme.colors.textMuted,
              },
            ]}
          >
            Quantity
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity
          style={[
            styles.stepButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
          onPress={() => adjustValue(-step)}
          accessibilityRole="button"
          accessibilityLabel="Decrease portion"
        >
          <Minus size={18} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.valueGroup}>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TextInput
              value={value}
              onChangeText={(text) => {
                if (mode === 'servings') {
                  const digitsOnly = text.replace(/[^0-9]/g, '');
                  onValueChange(digitsOnly || '1');
                  return;
                }

                const normalized = text.replace(',', '.').replace(/[^0-9.]/g, '');
                const parts = normalized.split('.');
                onValueChange(parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : normalized);
              }}
              keyboardType={mode === 'servings' ? 'number-pad' : 'decimal-pad'}
              inputMode={mode === 'servings' ? 'numeric' : 'decimal'}
              selectTextOnFocus
              returnKeyType="done"
              style={[styles.valueInput, { color: theme.colors.text }]}
              textAlign="center"
              maxLength={8}
              accessibilityLabel={mode === 'servings' ? 'Serving quantity' : `Quantity in ${quantityLabel}`}
            />
            <Text
              style={[
                styles.unitLabel,
                { color: theme.colors.textMuted },
              ]}
            >
              {mode === 'servings'
                ? numericValue === 1
                  ? 'serving'
                  : 'servings'
                : quantityLabel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.stepButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.background,
            },
          ]}
          onPress={() => adjustValue(step)}
          accessibilityRole="button"
          accessibilityLabel="Increase portion"
        >
          <Plus size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },

  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 16,
  },

  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
  },

  modeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },

  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  valueGroup: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputBox: {
    width: '100%',
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
  },


  valueInput: {
    width: '100%',
    height: 38,
    paddingHorizontal: 2,
    paddingVertical: 0,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },

  unitLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
