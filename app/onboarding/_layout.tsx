import { Stack } from 'expo-router';
import React from 'react';
import { OnboardingProvider } from '../../src/lib/onboarding-context';
import { colors } from '../../src/theme';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </OnboardingProvider>
  );
}
