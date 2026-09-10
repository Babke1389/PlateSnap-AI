import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { WeightEntry } from '../lib/types';
import { colors, font } from '../theme';

interface Props {
  entries: WeightEntry[];
  goalWeightKg: number;
  height?: number;
}

export function WeightChart({ entries, goalWeightKg, height = 180 }: Props) {
  const width = 320;
  const padding = 16;

  if (entries.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>Log your weight a couple of times to see a trend line.</Text>
      </View>
    );
  }

  const weights = entries.map((e) => e.weightKg);
  const allValues = [...weights, goalWeightKg];
  const min = Math.min(...allValues) - 1;
  const max = Math.max(...allValues) + 1;
  const range = max - min || 1;

  const stepX = (width - padding * 2) / (entries.length - 1);
  const toY = (w: number) => height - padding - ((w - min) / range) * (height - padding * 2);

  const points = entries.map((e, i) => `${padding + i * stepX},${toY(e.weightKg)}`).join(' ');
  const goalY = toY(goalWeightKg);

  return (
    <Svg width={width} height={height}>
      <Line
        x1={padding}
        x2={width - padding}
        y1={goalY}
        y2={goalY}
        stroke={colors.textFaint}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <Polyline points={points} fill="none" stroke={colors.lime} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {entries.map((e, i) => (
        <Circle key={e.id} cx={padding + i * stepX} cy={toY(e.weightKg)} r={4} fill={colors.lime} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textFaint,
    fontSize: font.size.sm,
    textAlign: 'center',
  },
});
