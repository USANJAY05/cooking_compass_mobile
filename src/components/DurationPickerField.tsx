import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Timer } from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { useTheme } from '../theme';

interface DurationPickerFieldProps {
  label?: string;
  valueSeconds: number;
  onChangeSeconds: (seconds: number) => void;
  compact?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const splitDuration = (seconds: number) => {
  const safe = Math.max(0, Math.round(seconds || 0));
  return {
    hours: Math.floor(safe / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
};

const formatDuration = (seconds: number) => {
  const { hours, minutes, seconds: secs } = splitDuration(seconds);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const hourValues = Array.from({ length: 24 }, (_, i) => i);
const minuteValues = Array.from({ length: 60 }, (_, i) => i);
const secondValues = Array.from({ length: 60 }, (_, i) => i);

export const DurationPickerField: React.FC<DurationPickerFieldProps> = ({
  label,
  valueSeconds,
  onChangeSeconds,
  compact = false,
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(() => splitDuration(valueSeconds));

  const draftSeconds = useMemo(
    () => draft.hours * 3600 + draft.minutes * 60 + draft.seconds,
    [draft],
  );

  const open = () => {
    setDraft(splitDuration(valueSeconds));
    setVisible(true);
  };

  const confirm = () => {
    onChangeSeconds(draftSeconds);
    setVisible(false);
  };

  return (
    <View>
      {label ? <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={open}
        style={[styles.trigger, compact && styles.compactTrigger, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
      >
        <Timer size={compact ? 15 : 17} color={theme.colors.primary} />
        <Text style={[compact ? styles.compactValue : styles.value, { color: theme.colors.text }]}>{formatDuration(valueSeconds)}</Text>
      </TouchableOpacity>

      <BottomSheet
        visible={visible}
        onClose={() => setVisible(false)}
        maxHeight="58%"
        contentStyle={{ borderWidth: 0 }}
      >
        <View style={styles.sheetHeader}>
          <View>
            <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>{label || 'Timer'}</Text>
            <Text style={[styles.sheetSubtitle, { color: theme.colors.textMuted }]}>Set hours, minutes and seconds</Text>
          </View>
          <Text style={[styles.preview, { color: theme.colors.primary }]}>{formatDuration(draftSeconds)}</Text>
        </View>

        <View style={[styles.pickerFrame, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.column}>
            <Text style={[styles.columnLabel, { color: theme.colors.textMuted }]}>Hours</Text>
            <Picker
              selectedValue={draft.hours}
              onValueChange={(value) => setDraft((current) => ({ ...current, hours: clamp(Number(value), 0, 23) }))}
              style={styles.picker}
              itemStyle={{ color: theme.colors.text, fontSize: 20 }}
            >
              {hourValues.map((value) => <Picker.Item key={value} label={String(value).padStart(2, '0')} value={value} />)}
            </Picker>
          </View>
          <Text style={[styles.separator, { color: theme.colors.textMuted }]}>:</Text>
          <View style={styles.column}>
            <Text style={[styles.columnLabel, { color: theme.colors.textMuted }]}>Minutes</Text>
            <Picker
              selectedValue={draft.minutes}
              onValueChange={(value) => setDraft((current) => ({ ...current, minutes: clamp(Number(value), 0, 59) }))}
              style={styles.picker}
              itemStyle={{ color: theme.colors.text, fontSize: 20 }}
            >
              {minuteValues.map((value) => <Picker.Item key={value} label={String(value).padStart(2, '0')} value={value} />)}
            </Picker>
          </View>
          <Text style={[styles.separator, { color: theme.colors.textMuted }]}>:</Text>
          <View style={styles.column}>
            <Text style={[styles.columnLabel, { color: theme.colors.textMuted }]}>Seconds</Text>
            <Picker
              selectedValue={draft.seconds}
              onValueChange={(value) => setDraft((current) => ({ ...current, seconds: clamp(Number(value), 0, 59) }))}
              style={styles.picker}
              itemStyle={{ color: theme.colors.text, fontSize: 20 }}
            >
              {secondValues.map((value) => <Picker.Item key={value} label={String(value).padStart(2, '0')} value={value} />)}
            </Picker>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => setVisible(false)} style={[styles.cancel, { borderColor: theme.colors.border }]}>
            <Text style={[styles.cancelText, { color: theme.colors.textMuted }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirm} style={[styles.done, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', marginBottom: 7 },
  trigger: { minHeight: 46, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  compactTrigger: { minHeight: 46, paddingHorizontal: 10, borderRadius: 8 },
  value: { fontSize: 15, fontWeight: '700', flex: 1 },
  compactValue: { fontSize: 13, fontWeight: '700', flex: 1 },
  sheetHeader: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { fontSize: 18, fontWeight: '800' },
  sheetSubtitle: { marginTop: 3, fontSize: 12, fontWeight: '500' },
  preview: { fontSize: 18, fontWeight: '800' },
  pickerFrame: { marginHorizontal: 16, borderRadius: 16, minHeight: 210, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingHorizontal: 6 },
  column: { flex: 1, alignItems: 'center' },
  columnLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  picker: { width: '100%', height: 170 },
  separator: { width: 12, fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center', alignSelf: 'center', marginTop: 16 },
  actions: { flexDirection: 'row', gap: 10, padding: 16 },
  cancel: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontWeight: '700' },
  done: { flex: 1, minHeight: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  doneText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
