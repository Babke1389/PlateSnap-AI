import { Redirect } from 'expo-router';
import React from 'react';
import { useStore } from '../src/lib/store';

export default function Index() {
  const { onboardingComplete } = useStore();
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding'} />;
}
