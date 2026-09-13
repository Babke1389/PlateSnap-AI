import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../lib/store';
import { MeasurementType } from '../lib/types';
import { colors, font, spacing } from '../theme';
import { Button } from './Button';
import { Card } from './Card';
import { Segmented } from './Segmented';
import { SimpleLineChart } from './SimpleLineChart';
import { TextField } from './TextField';

const TYPE_LABEL: Record<MeasurementType, string> = {
  waist: 'Waist',
  chest: 'Chest',
  hips: 'Hips',
  arms: 'Arms',
  thighs: 'Thighs',
};

const TYPE_FIELD: Record<MeasurementType, 'waistCm' | 'chestCm' | 'hipsCm' | 'armsCm' | 'thighsCm'> = {
  waist: 'waistCm',
  chest: 'chestCm',
  hips: 'hipsCm',
  arms: 'armsCm',
  thighs: 'thighsCm',
};

const TYPES: MeasurementType[] = ['waist', 'chest', 'hips', 'arms', 'thighs'];

export function BodyMeasurementsCard() {
  const router = useRouter();
  const { isPro, bodyMeasurements, addBodyMeasurement } = useStore();
  const [selected, setSelected] = useState<MeasurementType>('waist');
  const [showForm, setShowForm] = useState(false);
  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');

  if (!isPro) {
    return (
      <Card style={styles.lockedCard}>
        <Ionicons name="body" size={28} color={colors.orange} />
        <Text style={styles.lockedTitle}>Body measurements are a Pro feature</Text>
        <Text style={styles.lockedSub}>
          Track waist, chest, hips, arms and thighs over time, with a trend line for each.
        </Text>
        <Button label="Unlock Pro" onPress={() => router.push('/paywall')} />
      </Card>
    );
  }

  const field = TYPE_FIELD[selected];
  const entries = bodyMeasurements
    .filter((m) => m[field] != null)
    .map((m) => ({ dateISO: m.dateISO, value: m[field] as number }));

  const current = entries[entries.length - 1]?.value;
  const start = entries[0]?.value;
  const delta = current != null && start != null ? Math.round((current - start) * 10) / 10 : null;

  const onSave = () => {
    const fields: Record<string, number> = {};
    if (waist.trim()) fields.waistCm = Number(waist);
    if (chest.trim()) fields.chestCm = Number(chest);
    if (hips.trim()) fields.hipsCm = Number(hips);
    if (arms.trim()) fields.armsCm = Number(arms);
    if (thighs.trim()) fields.thighsCm = Number(thighs);
    if (Object.keys(fields).length === 0) return;
    addBodyMeasurement(fields);
    setWaist('');
    setChest('');
    setHips('');
    setArms('');
    setThighs('');
    setShowForm(false);
  };

  const canSave = [waist, chest, hips, arms, thighs].some((v) => v.trim());

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Body Measurements</Text>
        <Pressable onPress={() => setShowForm((v) => !v)}>
          <Ionicons name={showForm ? 'close' : 'add-circle-outline'} size={22} color={colors.lime} />
        </Pressable>
      </View>

      <Segmented
        options={TYPES.map((t) => ({ label: TYPE_LABEL[t], value: t }))}
        value={selected}
        onChange={setSelected}
      />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{current != null ? `${current} cm` : '—'}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: delta == null ? colors.textPrimary : delta <= 0 ? colors.lime : colors.orange }]}>
            {delta == null ? '—' : `${delta > 0 ? '+' : ''}${delta} cm`}
          </Text>
          <Text style={styles.statLabel}>Since start</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
        <SimpleLineChart
          entries={entries}
          color={colors.blue}
          emptyMessage={`Log ${TYPE_LABEL[selected].toLowerCase()} a couple of times to see a trend line.`}
        />
      </View>

      {showForm ? (
        <View style={{ marginTop: spacing.md }}>
          <Text style={styles.formHint}>Leave any field blank to skip it for today.</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextField label="Waist" keyboardType="decimal-pad" suffix="cm" value={waist} onChangeText={setWaist} />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Chest" keyboardType="decimal-pad" suffix="cm" value={chest} onChangeText={setChest} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextField label="Hips" keyboardType="decimal-pad" suffix="cm" value={hips} onChangeText={setHips} />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Arms" keyboardType="decimal-pad" suffix="cm" value={arms} onChangeText={setArms} />
            </View>
          </View>
          <TextField label="Thighs" keyboardType="decimal-pad" suffix="cm" value={thighs} onChangeText={setThighs} />
          <Button label="Save measurements" onPress={onSave} disabled={!canSave} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.md },
  statsRow: { flexDirection: 'row', marginTop: spacing.md, justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statValue: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md },
  statLabel: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  formHint: { color: colors.textFaint, fontSize: font.size.xs, marginBottom: spacing.sm },
  lockedCard: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  lockedTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md, textAlign: 'center' },
  lockedSub: {
    color: colors.textFaint,
    fontSize: font.size.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
