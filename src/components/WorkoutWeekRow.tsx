import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { todayISO, weekDatesISO } from '../lib/calories';
import { Workout } from '../lib/types';
import { colors, font, spacing } from '../theme';

interface Props {
  refDateISO: string;
  workoutsForDate: (dateISO: string) => Workout[];
}

export function WorkoutWeekRow({ refDateISO, workoutsForDate }: Props) {
  const today = todayISO();
  const days = weekDatesISO(refDateISO);

  return (
    <View style={styles.row}>
      {days.map((iso) => {
        const workouts = workoutsForDate(iso);
        const hasCardio = workouts.some((w) => w.type === 'cardio');
        const hasStrength = workouts.some((w) => w.type === 'strength');
        const isToday = iso === today;
        const letter = new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });

        return (
          <View key={iso} style={styles.dayCol}>
            <Text style={[styles.letter, isToday && styles.letterActive]}>{letter}</Text>
            <View style={[styles.circle, isToday && styles.circleToday]}>
              {hasCardio || hasStrength ? (
                <View style={styles.dots}>
                  {hasCardio ? <View style={[styles.dot, { backgroundColor: colors.blue }]} /> : null}
                  {hasStrength ? <View style={[styles.dot, { backgroundColor: colors.orange }]} /> : null}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1 },
  letter: { color: colors.textFaint, fontSize: font.size.xs, fontWeight: '600', marginBottom: spacing.xs },
  letterActive: { color: colors.textPrimary, fontWeight: '800' },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleToday: { borderColor: colors.textSecondary },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
});
