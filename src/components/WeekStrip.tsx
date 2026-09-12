import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { todayISO, weekDatesISO } from '../lib/calories';
import { colors, font, spacing } from '../theme';

interface Props {
  selectedDateISO: string;
  onSelect: (dateISO: string) => void;
  hasEntry: (dateISO: string) => boolean;
}

export function WeekStrip({ selectedDateISO, onSelect, hasEntry }: Props) {
  const today = todayISO();
  const days = weekDatesISO(selectedDateISO);

  return (
    <View style={styles.row}>
      {days.map((iso) => {
        const isToday = iso === today;
        const isSelected = iso === selectedDateISO;
        const logged = hasEntry(iso);
        const letter = new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' });

        return (
          <View key={iso} style={styles.dayCol}>
            <View style={styles.dotSlot}>{isToday ? <View style={styles.todayDot} /> : null}</View>
            <Text style={[styles.letter, isSelected && styles.letterActive]}>{letter}</Text>
            <Pressable
              style={[styles.circle, isSelected && styles.circleSelected]}
              onPress={() => onSelect(iso)}
            >
              {logged ? <View style={[styles.fillDot, isSelected && styles.fillDotSelected]} /> : null}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dayCol: { alignItems: 'center', flex: 1 },
  dotSlot: { height: 6, marginBottom: 2 },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.lime },
  letter: { color: colors.textFaint, fontSize: font.size.xs, fontWeight: '600', marginBottom: spacing.xs },
  letterActive: { color: colors.textPrimary, fontWeight: '800' },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    borderColor: colors.lime,
    borderStyle: 'dashed',
  },
  fillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textFaint },
  fillDotSelected: { backgroundColor: colors.lime },
});
