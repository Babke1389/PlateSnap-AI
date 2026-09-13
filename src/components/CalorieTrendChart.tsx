import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { addDaysISO, todayISO } from '../lib/calories';
import { colors, font, spacing } from '../theme';

interface Props {
  totalsForDate: (dateISO: string) => { calories: number };
  goalCalories: number;
  days?: number;
}

export function CalorieTrendChart({ totalsForDate, goalCalories, days = 14 }: Props) {
  const width = 320;
  const height = 160;
  const padding = 8;
  const chartHeight = height - padding * 2;

  const today = todayISO();
  const entries = Array.from({ length: days }, (_, i) => {
    const dateISO = addDaysISO(today, -(days - 1 - i));
    return { dateISO, calories: totalsForDate(dateISO).calories };
  });

  const maxValue = Math.max(goalCalories, ...entries.map((e) => e.calories), 1) * 1.1;
  const barWidth = width / days;
  const goalY = padding + chartHeight - (goalCalories / maxValue) * chartHeight;

  return (
    <View>
      <Svg width={width} height={height}>
        <Line
          x1={0}
          x2={width}
          y1={goalY}
          y2={goalY}
          stroke={colors.textFaint}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        {entries.map((e, i) => {
          const barHeight = Math.max((e.calories / maxValue) * chartHeight, e.calories > 0 ? 2 : 0);
          const over = e.calories > goalCalories;
          return (
            <Rect
              key={e.dateISO}
              x={i * barWidth + barWidth * 0.2}
              y={padding + chartHeight - barHeight}
              width={barWidth * 0.6}
              height={barHeight}
              rx={2}
              fill={over ? colors.orange : colors.lime}
            />
          );
        })}
      </Svg>
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>{days} days ago</Text>
        <Text style={styles.legendText}>Today</Text>
      </View>
      <View style={styles.keyRow}>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: colors.lime }]} />
          <Text style={styles.legendText}>At or under goal</Text>
        </View>
        <View style={styles.keyItem}>
          <View style={[styles.keyDot, { backgroundColor: colors.orange }]} />
          <Text style={styles.legendText}>Over goal</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  legendText: { color: colors.textFaint, fontSize: font.size.xs },
  keyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  keyDot: { width: 8, height: 8, borderRadius: 4 },
});
