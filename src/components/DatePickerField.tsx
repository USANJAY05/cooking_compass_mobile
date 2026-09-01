import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useTheme } from '../theme';
import { formatDateString, parseDateString } from '../utils/dates';

interface DatePickerFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minimumDate?: Date;
  style?: StyleProp<ViewStyle>;
}

const parseDate = (value: string): Date => {
  if (!value) return new Date();
  return parseDateString(value);
};

const formatDateValue = (date: Date): string => formatDateString(date);

const formatDisplayDate = (value: string): string => {
  if (!value) return 'Select date';
  const date = parseDate(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  style,
}) => {
  const { theme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(() => parseDate(value));

  const openPicker = () => {
    setTempDate(parseDate(value));
    setShowPicker(true);
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed' || !selected) return;
      onChange(formatDateValue(selected));
      return;
    }

    if (selected) {
      setTempDate(selected);
    }
  };

  const confirmIOS = () => {
    onChange(formatDateValue(tempDate));
    setShowPicker(false);
  };

  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}

      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Calendar size={18} color={theme.colors.primary} />
        <Text style={[styles.triggerText, { color: theme.colors.text }]}>{formatDisplayDate(value)}</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.iosSheet, { backgroundColor: theme.colors.surface }]}>
              <View style={[styles.iosHeader, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={[styles.iosAction, { color: theme.colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.iosTitle, { color: theme.colors.text }]}>{label || 'Select Date'}</Text>
                <TouchableOpacity onPress={confirmIOS}>
                  <Text style={[styles.iosAction, { color: theme.colors.primary, fontWeight: '700' }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                themeVariant={theme.dark ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={parseDate(value)}
            mode="date"
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
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
    gap: 10,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  triggerText: {
    fontSize: 15,
    fontWeight: '500',
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
