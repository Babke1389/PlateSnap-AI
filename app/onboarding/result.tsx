import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { calcTargets } from '../../src/lib/calories';
import { useOnboarding } from '../../src/lib/onboarding-context';
import { useStore } from '../../src/lib/store';
import { Profile } from '../../src/lib/types';
import { colors, font, spacing } from '../../src/theme';

export default function Result() {
  const router = useRouter();
  const { draft } = useOnboarding();
  const { completeOnboarding } = useStore();

  const profile: Profile = useMemo(
    () => ({
      sex: draft.sex,
      age: Number(draft.age) || 25,
      heightCm: Number(draft.heightCm) || 170,
      weightKg: Number(draft.weightKg) || 70,
      goalWeightKg: Number(draft.goalWeightKg) || Number(draft.weightKg) || 70,
      activityLevel: draft.activityLevel,
      units: draft.units,
      createdAt: new Date().toISOString(),
    }),
    [draft]
  );

  const targets = useMemo(() => calcTargets(profile), [profile]);

  const goalCopy =
    targets.goalDirection === 'lose'
      ? 'a steady deficit to lose weight'
      : targets.goalDirection === 'gain'
      ? 'a surplus to gain weight'
      : 'maintenance to hold your weight';

  const onStart = () => {
    completeOnboarding(profile);
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScreen
      step={3}
      totalSteps={3}
      title="Your plan is ready"
      subtitle={`Based on your stats, here's ${goalCopy}.`}
      footer={<Button label="Start tracking" onPress={onStart} />}
    >
      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>Daily calorie target</Text>
        <Text style={styles.heroValue}>{targets.calorieTarget}</Text>
        <Text style={styles.heroUnit}>kcal / day</Text>
      </Card>

      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <Text style={styles.gridLabel}>BMR</Text>
          <Text style={styles.gridValue}>{targets.bmr}</Text>
        </Card>
        <Card style={styles.gridCard}>
          <Text style={styles.gridLabel}>Maintenance</Text>
          <Text style={styles.gridValue}>{targets.tdee}</Text>
        </Card>
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <Text style={styles.macroTitle}>Suggested macros</Text>
        <View style={styles.macroRow}>
          <MacroPill color={colors.protein} label="Protein" value={targets.proteinG} />
          <MacroPill color={colors.carbs} label="Carbs" value={targets.carbsG} />
          <MacroPill color={colors.fat} label="Fat" value={targets.fatG} />
        </View>
      </Card>
    </OnboardingScreen>
  );
}

function MacroPill({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.macroPill}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroValue}>{value}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: font.size.sm,
    fontWeight: '600',
  },
  heroValue: {
    color: colors.lime,
    fontSize: 56,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  heroUnit: {
    color: colors.textFaint,
    fontSize: font.size.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  gridCard: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    color: colors.textSecondary,
    fontSize: font.size.xs,
    fontWeight: '600',
  },
  gridValue: {
    color: colors.textPrimary,
    fontSize: font.size.lg,
    fontWeight: '800',
    marginTop: 4,
  },
  macroTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroPill: {
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: spacing.xs,
  },
  macroValue: {
    color: colors.textPrimary,
    fontWeight: '800',
    fontSize: font.size.md,
  },
  macroLabel: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    marginTop: 2,
  },
});
