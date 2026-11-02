import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import {
  cancelReminder,
  notificationsSupported,
  requestNotificationPermission,
  scheduleDailyReminder,
} from '../lib/notifications';
import { colors, font, spacing } from '../theme';
import { Button } from './Button';
import { Card } from './Card';
import { TextField } from './TextField';

function formatTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export function ReminderCard() {
  const { reminders, addReminder, removeReminder, updateReminder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [time, setTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const [saving, setSaving] = useState(false);

  const canSave = label.trim().length > 0;

  const onAdd = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Notifications are off',
          'Enable notifications for this app in your phone Settings to use reminders.'
        );
        return;
      }
      const h = time.getHours();
      const m = time.getMinutes();
      const notificationId = await scheduleDailyReminder(label.trim(), h, m);
      addReminder({ label: label.trim(), hour: h, minute: m, enabled: true, notificationId });
      setLabel('');
      setShowForm(false);
    } catch (err) {
      Alert.alert('Could not set reminder', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (id: string, enabled: boolean) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      const notificationId = await scheduleDailyReminder(reminder.label, reminder.hour, reminder.minute);
      updateReminder(id, { enabled: true, notificationId });
    } else {
      if (reminder.notificationId) await cancelReminder(reminder.notificationId);
      updateReminder(id, { enabled: false, notificationId: null });
    }
  };

  const onDelete = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder?.notificationId) cancelReminder(reminder.notificationId);
    removeReminder(id);
  };

  if (!notificationsSupported) {
    return (
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>Reminders</Text>
        </View>
        <View style={styles.unsupportedRow}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textFaint} />
          <Text style={styles.emptyText}>
            Reminders need a real app build to work on Android — they can't run inside Expo Go
            here yet. This will work once the app is built for real.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Ionicons name={showForm ? 'close' : 'add-circle-outline'} size={22} color={colors.lime} />
        </Pressable>
      </View>

      {reminders.length === 0 && !showForm ? (
        <Text style={styles.emptyText}>
          No reminders yet — set one for water, workouts, meal prep, anything.
        </Text>
      ) : (
        reminders.map((r) => (
          <View key={r.id} style={styles.row}>
            <Ionicons name="notifications-outline" size={18} color={colors.textFaint} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <Text style={styles.rowTime}>{formatTime(r.hour, r.minute)} daily</Text>
            </View>
            <Switch
              value={r.enabled}
              onValueChange={(v) => onToggle(r.id, v)}
              trackColor={{ false: colors.cardAlt, true: colors.lime }}
              thumbColor="#fff"
            />
            <Pressable onPress={() => onDelete(r.id)} style={{ marginLeft: spacing.sm, padding: 4 }}>
              <Ionicons name="trash-outline" size={16} color={colors.red} />
            </Pressable>
          </View>
        ))
      )}

      {showForm ? (
        <View style={{ marginTop: spacing.md }}>
          <TextField
            label="Remind me to..."
            placeholder="e.g. Drink water"
            value={label}
            onChangeText={setLabel}
          />
          <Text style={styles.label}>Time</Text>
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              is24Hour={false}
              themeVariant="dark"
              textColor={colors.textPrimary}
              onChange={(_, selected) => {
                if (selected) setTime(selected);
              }}
              style={styles.picker}
            />
          </View>
          <Button label="Save reminder" onPress={onAdd} disabled={!canSave} loading={saving} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.md },
  emptyText: { color: colors.textFaint, fontSize: font.size.sm, flex: 1 },
  unsupportedRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: { color: colors.textPrimary, fontWeight: '600', fontSize: font.size.sm },
  rowTime: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  label: {
    color: colors.textSecondary,
    fontSize: font.size.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pickerWrap: {
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  picker: {
    height: 160,
    width: '100%',
  },
});
