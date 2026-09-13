import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { colors, font } from '../theme';

interface Point {
  dateISO: string;
  value: number;
}

interface Props {
  entries: Point[];
  height?: number;
  color?: string;
  emptyMessage?: string;
}

export function SimpleLineChart({
  entries,
  height = 160,
  color = colors.lime,
  emptyMessage = 'Log this a couple of times to see a trend line.',
}: Props) {
  const width = 320;
  const padding = 16;

  if (entries.length < 2) {
    return (
      <View style={[styles.empty, { height }]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const values = entries.map((e) => e.value);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const range = max - min || 1;

  const stepX = (width - padding * 2) / (entries.length - 1);
  const toY = (v: number) => height - padding - ((v - min) / range) * (height - padding * 2);

  const points = entries.map((e, i) => `${padding + i * stepX},${toY(e.value)}`).join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      {entries.map((e, i) => (
        <Circle key={e.dateISO} cx={padding + i * stepX} cy={toY(e.value)} r={4} fill={color} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textFaint, fontSize: font.size.sm, textAlign: 'center' },
});
