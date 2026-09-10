import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { TextField } from '../src/components/TextField';
import { useStore } from '../src/lib/store';
import { colors, font, spacing } from '../src/theme';

export default function LogWeight() {
  const router = useRouter();
  const { profile, addWeightEntry } = useStore();
  const [weight, setWeight] = useState(profile ? String(profile.weightKg) : '');

  const onSave = () => {
    const kg = Number(weight);
    if (!kg || kg <= 0) return;
    addWeightEntry(kg);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Log today's weight</Text>
        <Text style={styles.subtitle}>Your daily targets recalculate automatically.</Text>
        <TextField
          label="Weight"
          keyboardType="decimal-pad"
          suffix="kg"
          autoFocus
          value={weight}
          onChangeText={setWeight}
        />
        <Button label="Save" onPress={onSave} disabled={!weight} />
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, marginTop: spacing.xl },
  title: { color: colors.textPrimary, fontSize: font.size.xl, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: font.size.sm, marginTop: spacing.xs, marginBottom: spacing.lg },
});
