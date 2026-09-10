import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../src/components/Button';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { TextField } from '../../src/components/TextField';
import { ACTIVITY_LABEL, lbToKg } from '../../src/lib/calories';
import { useOnboarding } from '../../src/lib/onboarding-context';
import { ActivityLevel } from '../../src/lib/types';
import { colors, font, radius, spacing } from '../../src/theme';

const LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'veryActive'];

export default function Goal() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  const isImperial = draft.units === 'imperial';
  const [goalLb, setGoalLb] = useState('');

  const canContinue = isImperial ? !!goalLb : !!draft.goalWeightKg;

  const onContinue = () => {
    if (isImperial) {
      update({ goalWeightKg: String(Math.round(lbToKg(Number(goalLb) || 0))) });
    }
    router.push('/onboarding/result');
  };

  return (
    <OnboardingScreen
      step={2}
      totalSteps={3}
      title="What's your goal?"
      subtitle="Set a target weight and how active you typically are."
      footer={<Button label="Calculate my plan" onPress={onContinue} disabled={!canContinue} />}
    >
      <TextField
        label="Goal weight"
        placeholder={isImperial ? 'e.g. 150' : 'e.g. 68'}
        keyboardType="decimal-pad"
        suffix={isImperial ? 'lb' : 'kg'}
        value={isImperial ? goalLb : draft.goalWeightKg}
        onChangeText={isImperial ? setGoalLb : (goalWeightKg) => update({ goalWeightKg })}
      />

      <Text style={styles.sectionLabel}>Activity level</Text>
      {LEVELS.map((level) => {
        const active = draft.activityLevel === level;
        return (
          <Pressable
            key={level}
            onPress={() => update({ activityLevel: level })}
            style={[styles.option, active && styles.optionActive]}
          >
            <View style={[styles.radio, active && styles.radioActive]} />
            <Text style={[styles.optionText, active && styles.optionTextActive]}>
              {ACTIVITY_LABEL[level]}
            </Text>
          </Pressable>
        );
      })}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: font.size.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  optionActive: {
    borderColor: colors.lime,
    backgroundColor: colors.cardAlt,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  radioActive: {
    borderColor: colors.lime,
    backgroundColor: colors.lime,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: font.size.sm,
    flex: 1,
  },
  optionTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
