import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '../../src/components/Button';
import { OnboardingScreen } from '../../src/components/OnboardingScreen';
import { Segmented } from '../../src/components/Segmented';
import { TextField } from '../../src/components/TextField';
import { ftInToCm, lbToKg } from '../../src/lib/calories';
import { useOnboarding } from '../../src/lib/onboarding-context';
import { spacing } from '../../src/theme';

export default function AboutYou() {
  const router = useRouter();
  const { draft, update } = useOnboarding();

  const [ft, setFt] = useState('');
  const [inch, setInch] = useState('');
  const [lb, setLb] = useState('');

  const isImperial = draft.units === 'imperial';

  const canContinue = isImperial
    ? draft.age && ft && draft.weightKg
    : draft.age && draft.heightCm && draft.weightKg;

  const onContinue = () => {
    if (isImperial) {
      const heightCm = ftInToCm(Number(ft) || 0, Number(inch) || 0);
      const weightKg = lbToKg(Number(lb) || 0);
      update({ heightCm: String(Math.round(heightCm)), weightKg: String(Math.round(weightKg)) });
    }
    router.push('/onboarding/goal');
  };

  return (
    <OnboardingScreen
      step={1}
      totalSteps={3}
      title="Tell us about you"
      subtitle="We use this to calculate your personal calorie needs with the Mifflin-St Jeor formula."
      footer={<Button label="Continue" onPress={onContinue} disabled={!canContinue} />}
    >
      <View style={{ marginBottom: spacing.md }}>
        <Segmented
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ]}
          value={draft.sex}
          onChange={(sex) => update({ sex })}
        />
      </View>

      <View style={{ marginBottom: spacing.md }}>
        <Segmented
          accent="#3DD6FF"
          options={[
            { label: 'Metric', value: 'metric' },
            { label: 'Imperial', value: 'imperial' },
          ]}
          value={draft.units}
          onChange={(units) => update({ units })}
        />
      </View>

      <TextField
        label="Age"
        placeholder="e.g. 28"
        keyboardType="number-pad"
        suffix="yrs"
        value={draft.age}
        onChangeText={(age) => update({ age })}
      />

      {isImperial ? (
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Height"
              placeholder="5"
              keyboardType="number-pad"
              suffix="ft"
              value={ft}
              onChangeText={setFt}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label=" "
              placeholder="9"
              keyboardType="number-pad"
              suffix="in"
              value={inch}
              onChangeText={setInch}
            />
          </View>
        </View>
      ) : (
        <TextField
          label="Height"
          placeholder="e.g. 175"
          keyboardType="number-pad"
          suffix="cm"
          value={draft.heightCm}
          onChangeText={(heightCm) => update({ heightCm })}
        />
      )}

      <TextField
        label="Current weight"
        placeholder={isImperial ? 'e.g. 165' : 'e.g. 75'}
        keyboardType="decimal-pad"
        suffix={isImperial ? 'lb' : 'kg'}
        value={isImperial ? lb : draft.weightKg}
        onChangeText={isImperial ? setLb : (weightKg) => update({ weightKg })}
      />
    </OnboardingScreen>
  );
}
