import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { PICKER_HEIGHT, ITEM_HEIGHT, WheelColumn } from './WheelColumn';

export interface TimeValue {
  hour12: number; // 1-12
  minute: number; // 0-59
  period: 'AM' | 'PM';
}

interface Props {
  value: TimeValue;
  onChange: (value: TimeValue) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function FadeMask({ position }: { position: 'top' | 'bottom' }) {
  const bands = [0.95, 0.82, 0.65, 0.45, 0.25, 0.1];
  return (
    <View
      style={[styles.fade, position === 'top' ? styles.fadeTop : styles.fadeBottom]}
      pointerEvents="none"
    >
      {bands.map((opacity, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: `rgba(15,19,25,${opacity})` }} />
      ))}
    </View>
  );
}

export function InlineTimePicker({ value, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.pill} pointerEvents="none" />
        <WheelColumn
          items={HOURS}
          selectedIndex={value.hour12 - 1}
          onChange={(i) => onChange({ ...value, hour12: i + 1 })}
        />
        <Text style={styles.colon}>:</Text>
        <WheelColumn
          items={MINUTES}
          selectedIndex={value.minute}
          onChange={(i) => onChange({ ...value, minute: i })}
        />
        <WheelColumn
          items={PERIODS}
          selectedIndex={value.period === 'AM' ? 0 : 1}
          onChange={(i) => onChange({ ...value, period: i === 0 ? 'AM' : 'PM' })}
          width={56}
        />
        <FadeMask position="top" />
        <FadeMask position="bottom" />
      </View>
    </View>
  );
}

const FADE_HEIGHT = ITEM_HEIGHT * 1.5;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#0F1319',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: PICKER_HEIGHT,
  },
  pill: {
    position: 'absolute',
    left: spacing.xs,
    right: spacing.xs,
    top: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(198,255,61,0.10)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(198,255,61,0.35)',
    borderRadius: 10,
  },
  colon: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: FADE_HEIGHT,
    flexDirection: 'column',
    zIndex: 2,
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
    transform: [{ scaleY: -1 }],
  },
});
