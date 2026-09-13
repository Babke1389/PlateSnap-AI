import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeforeAfterPhotos } from '../../src/components/BeforeAfterPhotos';
import { BodyMeasurementsCard } from '../../src/components/BodyMeasurementsCard';
import { Button } from '../../src/components/Button';
import { CalorieTrendChart } from '../../src/components/CalorieTrendChart';
import { Card } from '../../src/components/Card';
import { WeightChart } from '../../src/components/WeightChart';
import { useStore } from '../../src/lib/store';
import { colors, font, spacing } from '../../src/theme';

export default function Progress() {
  const router = useRouter();
  const { profile, targets, isPro, weightLog, totalsForDate, streakDays } = useStore();

  if (!profile) return null;

  const current = weightLog[weightLog.length - 1]?.weightKg ?? profile.weightKg;
  const start = weightLog[0]?.weightKg ?? profile.weightKg;
  const changed = current - start;
  const toGoal = current - profile.goalWeightKg;
  const streak = streakDays();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Progress</Text>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{current.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Current kg</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, { color: changed <= 0 ? colors.lime : colors.orange }]}>
              {changed > 0 ? '+' : ''}
              {changed.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>Since start</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{Math.abs(toGoal).toFixed(1)}</Text>
            <Text style={styles.statLabel}>{toGoal <= 0 ? 'kg past goal' : 'kg to goal'}</Text>
          </Card>
        </View>

        <Card style={{ marginTop: spacing.md, alignItems: 'center' }}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Weight trend</Text>
          </View>
          <WeightChart entries={weightLog} goalWeightKg={profile.goalWeightKg} />
        </Card>

        <Button
          label="Log today's weight"
          style={{ marginTop: spacing.md }}
          onPress={() => router.push('/log-weight')}
        />

        <Card style={{ marginTop: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="flame" size={28} color={colors.orange} />
          <View style={{ marginLeft: spacing.md }}>
            <Text style={styles.streakValue}>{streak} day streak</Text>
            <Text style={styles.streakSub}>Keep logging meals daily to build your streak.</Text>
          </View>
        </Card>

        <View style={{ marginTop: spacing.md }}>
          {isPro && targets ? (
            <Card style={{ alignItems: 'center' }}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Calorie trend (14 days)</Text>
              </View>
              <CalorieTrendChart totalsForDate={totalsForDate} goalCalories={targets.calorieTarget} />
            </Card>
          ) : (
            <Card style={styles.lockedCard}>
              <Ionicons name="stats-chart" size={28} color={colors.orange} />
              <Text style={styles.lockedTitle}>Calorie trends are a Pro feature</Text>
              <Text style={styles.lockedSub}>
                See your daily calories over the last two weeks against your goal, at a glance.
              </Text>
              <Button label="Unlock Pro" onPress={() => router.push('/paywall')} />
            </Card>
          )}
        </View>

        <View style={{ marginTop: spacing.md }}>
          <BodyMeasurementsCard />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <BeforeAfterPhotos />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  title: { color: colors.textPrimary, fontSize: font.size.xl, fontWeight: '800', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.textPrimary, fontSize: font.size.lg, fontWeight: '800' },
  statLabel: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 4, textAlign: 'center' },
  chartHeader: { width: '100%' },
  sectionTitle: { color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm },
  streakValue: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md },
  streakSub: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2, maxWidth: 240 },
  lockedCard: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  lockedTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md, textAlign: 'center' },
  lockedSub: {
    color: colors.textFaint,
    fontSize: font.size.sm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
