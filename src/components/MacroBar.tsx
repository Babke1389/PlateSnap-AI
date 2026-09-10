import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

interface Props {
  label: string;
  color: string;
  valueG: number;
  targetG: number;
}

export function MacroBar({ label, color, valueG, targetG }: Props) {
  const pct = targetG > 0 ? Math.min(valueG / targetG, 1) : 0;
  return (
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(valueG)}
          <Text style={styles.target}>/{Math.round(targetG)}g</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontSize: font.size.sm,
    fontWeight: '600',
  },
  value: {
    color: colors.textPrimary,
    fontSize: font.size.sm,
    fontWeight: '700',
  },
  target: {
    color: colors.textFaint,
    fontWeight: '400',
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
