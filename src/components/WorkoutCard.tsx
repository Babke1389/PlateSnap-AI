import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { WorkoutType } from '../lib/types';
import { colors, font, radius, spacing } from '../theme';
import { Button } from './Button';
import { Card } from './Card';
import { Segmented } from './Segmented';
import { TextField } from './TextField';
import { WorkoutWeekRow } from './WorkoutWeekRow';

const TYPE_LABEL: Record<WorkoutType, string> = { cardio: 'Cardio', strength: 'Strength' };
const TYPE_ICON: Record<WorkoutType, keyof typeof Ionicons.glyphMap> = {
  cardio: 'heart',
  strength: 'barbell',
};
const TYPE_COLOR: Record<WorkoutType, string> = { cardio: colors.blue, strength: colors.orange };

export function WorkoutCard({ dateISO }: { dateISO: string }) {
  const { workoutsForDate, addWorkout, removeWorkout } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<WorkoutType>('cardio');
  const [duration, setDuration] = useState('');

  const workouts = workoutsForDate(dateISO);

  const onAdd = () => {
    const mins = Math.round(Number(duration));
    if (!mins || mins <= 0) return;
    addWorkout(type, mins, dateISO);
    setDuration('');
    setShowForm(false);
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Workout</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Ionicons name={showForm ? 'close' : 'add-circle-outline'} size={22} color={colors.lime} />
        </Pressable>
      </View>

      <WorkoutWeekRow refDateISO={dateISO} workoutsForDate={workoutsForDate} />

      {workouts.length > 0 ? (
        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {workouts.map((w) => (
            <View key={w.id} style={styles.entryRow}>
              <View style={[styles.entryIcon, { backgroundColor: TYPE_COLOR[w.type] + '22' }]}>
                <Ionicons name={TYPE_ICON[w.type]} size={16} color={TYPE_COLOR[w.type]} />
              </View>
              <Text style={styles.entryLabel}>{TYPE_LABEL[w.type]}</Text>
              <Text style={styles.entryDuration}>{w.durationMin} min</Text>
              <Pressable onPress={() => removeWorkout(w.id)} style={{ padding: 4 }}>
                <Ionicons name="trash-outline" size={16} color={colors.red} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : !showForm ? (
        <Text style={styles.emptyText}>No workout logged for this day.</Text>
      ) : null}

      {showForm ? (
        <View style={{ marginTop: spacing.md }}>
          <Segmented
            options={[
              { label: 'Cardio', value: 'cardio' },
              { label: 'Strength', value: 'strength' },
            ]}
            value={type}
            onChange={setType}
            accent={TYPE_COLOR[type]}
          />
          <View style={{ marginTop: spacing.sm }}>
            <TextField
              label="Duration"
              placeholder="e.g. 30"
              keyboardType="number-pad"
              suffix="min"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
          <Button label="Log workout" onPress={onAdd} disabled={!duration.trim()} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.md },
  emptyText: { color: colors.textFaint, fontSize: font.size.sm, marginTop: spacing.md },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  entryIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryLabel: { color: colors.textPrimary, fontWeight: '600', fontSize: font.size.sm, flex: 1 },
  entryDuration: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: '600' },
});
