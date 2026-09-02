import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  ChevronRight,
  Clock3,
} from 'lucide-react-native';

import {
  useTheme,
} from '../theme';
import { RoutineSummaryComponent } from '../api/types';


interface RoutineCardProps {
  routine: RoutineSummaryComponent;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const RoutineCard: React.FC<
  RoutineCardProps
> = ({
  routine,
  onPress,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const accent = theme.colors.primary;

  const hasDescription =
    Boolean(
      routine.description?.trim(),
    );

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor:
            theme.colors.surface,
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.78}
    >
      {/* ACCENT */}

      <View
        style={[
          styles.accent,
          {
            backgroundColor:
              accent,
          },
        ]}
      />

      {/* CONTENT */}

      <View style={styles.content}>
        {/* TITLE ROW */}

        <View
          style={styles.titleRow}
        >
          <Text
            style={[
              styles.title,
              {
                color:
                  theme.colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {routine.name}
          </Text>

          <View
            style={[
              styles.arrow,
              {
                borderColor:
                  accent + '30',
                backgroundColor:
                  accent + '0F',
              },
            ]}
          >
            <ChevronRight
              size={14}
              color={accent}
              strokeWidth={2.2}
            />
          </View>
        </View>

        {/* DESCRIPTION */}

        {hasDescription ? (
          <Text
            style={[
              styles.description,
              {
                color:
                  theme.colors
                    .textMuted,
              },
            ]}
            numberOfLines={1}
          >
            {routine.description}
          </Text>
        ) : (
          <View
            style={
              styles.emptyDescription
            }
          >
            <Clock3
              size={13}
              color={
                accent
              }
              strokeWidth={2}
            />

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    theme.colors
                      .textMuted,
                },
              ]}
            >
              Schedule & recipes
            </Text>
          </View>
        )}

        {/* ACTION */}

        <View
          style={styles.bottomRow}
        >
          <Text
            style={[
              styles.actionText,
              {
                color:
                  accent,
              },
            ]}
          >
            View routine
          </Text>

          <ChevronRight
            size={11}
            color={
              accent
            }
            strokeWidth={2.5}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accent: {
    width: 4,
    marginVertical: 12,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 15,
    paddingRight: 12,
    paddingVertical: 12,
  },
  titleRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },
  title: {
    flex: 1,
    minWidth: 0,
    paddingRight: 9,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
  },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth:
      StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginTop: 4,
    paddingRight: 5,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});
