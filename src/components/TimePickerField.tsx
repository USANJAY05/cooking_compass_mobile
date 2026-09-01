import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { useTheme } from '../theme';

interface TimePickerFieldProps {
  label?: string;
  valueMinutes: number;
  onChangeMinutes: (minutes: number) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  mode?: 'picker' | 'minutes';
}

const minutesToDate = (totalMinutes: number): Date => {
  const safeMinutes = Math.max(0, totalMinutes || 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return new Date(2000, 0, 1, hours, minutes);
};

const dateToMinutes = (date: Date): number => date.getHours() * 60 + date.getMinutes();

const formatDuration = (totalMinutes: number, placeholder: string): string => {
  if (!totalMinutes) return placeholder;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  valueMinutes,
  onChangeMinutes,
  placeholder = 'Select time',
  style,
  compact = false,
  mode = 'picker',
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(() => minutesToDate(valueMinutes));

  if (mode === 'minutes') {
    return (
      <View style={style}>
        {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}
        <View
          style={[
            compact ? styles.compactMinutesInput : styles.minutesInput,
            { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
          ]}
        >
          <TextInput
            style={[compact ? styles.compactMinutesText : styles.minutesText, { color: theme.colors.text }]}
            keyboardType="number-pad"
            value={valueMinutes > 0 ? String(valueMinutes) : ''}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '');
              onChangeMinutes(digits ? parseInt(digits, 10) : 0);
            }}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={[styles.minutesSuffix, { color: theme.colors.textMuted }]}>min</Text>
        </View>
      </View>
    );
  }

  const openPicker = () => {
    setTempDate(minutesToDate(valueMinutes));
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed' || !selected) return;
      onChangeMinutes(dateToMinutes(selected));
      return;
    }

    if (selected) {
      setTempDate(selected);
    }
  };

  const confirmIOS = () => {
    onChangeMinutes(dateToMinutes(tempDate));
    setShowPicker(false);
  };

  const displayText = formatDuration(valueMinutes, placeholder);

  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          compact ? styles.compactTrigger : styles.trigger,
          { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
        ]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Clock size={compact ? 14 : 16} color={theme.colors.primary} />
        <Text
          style={[
            compact ? styles.compactTriggerText : styles.triggerText,
            { color: valueMinutes ? theme.colors.text : theme.colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.iosSheet, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.iosHeader, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.iosAction, { color: theme.colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.iosTitle, { color: theme.colors.text }]}>{label || 'Select Time'}</Text>
                <TouchableOpacity onPress={confirmIOS}>
                  <Text style={[styles.iosAction, { color: theme.colors.primary, fontWeight: '700' }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={handleChange}
                themeVariant={theme.dark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={minutesToDate(valueMinutes)}
            mode="time"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  compactTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  compactTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  minutesInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  compactMinutesInput: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  minutesText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  compactMinutesText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  minutesSuffix: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  iosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iosTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  iosAction: {
    fontSize: 16,
  },
});
