import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Segmented } from '../../src/components/Segmented';
import { TextField } from '../../src/components/TextField';
import { ACTIVITY_LABEL } from '../../src/lib/calories';
import { exportDataAsCsv } from '../../src/lib/csv';
import { isPurchasesConfigured, restorePurchases } from '../../src/lib/purchases';
import { useStore } from '../../src/lib/store';
import { ActivityLevel } from '../../src/lib/types';
import { colors, font, spacing } from '../../src/theme';

const LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'veryActive'];
const purchasesConfigured = isPurchasesConfigured();

export default function Settings() {
  const router = useRouter();
  const {
    profile,
    updateProfile,
    isPro,
    setPro,
    trialEndsAt,
    resetAll,
    meals,
    weightLog,
    favorites,
    removeFavorite,
  } = useStore();
  const [goalWeightKg, setGoalWeightKg] = useState(String(profile?.goalWeightKg ?? ''));
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel ?? 'moderate'
  );
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  if (!profile) return null;

  const onRestore = async () => {
    setRestoring(true);
    try {
      const status = await restorePurchases();
      Alert.alert(
        status.isPro ? 'Restored' : 'Nothing to restore',
        status.isPro
          ? 'Your Pro subscription is active on this device.'
          : "We couldn't find an active subscription for this account."
      );
    } catch (err) {
      Alert.alert('Restore failed', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setRestoring(false);
    }
  };

  const trialActive = isPro && !!trialEndsAt && new Date(trialEndsAt).getTime() > Date.now();
  const trialDaysLeft = trialActive
    ? Math.max(1, Math.ceil((new Date(trialEndsAt!).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : 0;

  const dirty = Number(goalWeightKg) !== profile.goalWeightKg || activityLevel !== profile.activityLevel;

  const onSave = () => {
    updateProfile({
      ...profile,
      goalWeightKg: Number(goalWeightKg) || profile.goalWeightKg,
      activityLevel,
    });
  };

  const onExport = async () => {
    if (!isPro) {
      router.push('/paywall');
      return;
    }
    setExporting(true);
    try {
      await exportDataAsCsv(meals, weightLog);
    } catch (err) {
      Alert.alert('Export failed', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setExporting(false);
    }
  };

  const onReset = () => {
    Alert.alert('Reset all data', 'This deletes your profile, meals, and history from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetAll();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        <Card style={styles.proCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>
              {trialActive ? 'Free trial active' : isPro ? 'Platesnap AI Pro' : 'Free plan'}
            </Text>
            <Text style={styles.proSub}>
              {trialActive
                ? `${trialDaysLeft} day${trialDaysLeft === 1 ? '' : 's'} left in your trial — all Pro features are unlocked.`
                : isPro
                ? 'All Pro features are unlocked: unlimited scans, favorites, export, photos, trends & measurements.'
                : 'Unlock unlimited scans, favorites, data export, Before & After photos, calorie trends, and body measurements.'}
            </Text>
          </View>
          {isPro ? (
            <Ionicons name="checkmark-circle" size={28} color={colors.lime} />
          ) : (
            <Button label="Upgrade" fullWidth={false} onPress={() => router.push('/paywall')} />
          )}
        </Card>
        {isPro && !purchasesConfigured ? (
          <Button
            label="Turn off Pro (testing)"
            variant="ghost"
            onPress={() => setPro(false)}
            style={{ marginTop: spacing.xs }}
          />
        ) : null}
        {purchasesConfigured && !isPro ? (
          <Button
            label={restoring ? 'Restoring...' : 'Restore purchases'}
            variant="ghost"
            loading={restoring}
            onPress={onRestore}
            style={{ marginTop: spacing.xs }}
          />
        ) : null}

        <Text style={styles.sectionTitle}>Goal</Text>
        <Card>
          <TextField
            label="Goal weight (kg)"
            keyboardType="decimal-pad"
            value={goalWeightKg}
            onChangeText={setGoalWeightKg}
          />
          <Text style={styles.label}>Activity level</Text>
          <View style={{ gap: spacing.xs }}>
            <Segmented
              options={LEVELS.slice(0, 3).map((l) => ({ label: ACTIVITY_LABEL[l].split(' ')[0], value: l }))}
              value={LEVELS.slice(0, 3).includes(activityLevel) ? activityLevel : LEVELS[0]}
              onChange={setActivityLevel}
            />
            <Segmented
              options={LEVELS.slice(3).map((l) => ({ label: ACTIVITY_LABEL[l].split(' ')[0], value: l }))}
              value={LEVELS.slice(3).includes(activityLevel) ? activityLevel : LEVELS[3]}
              onChange={setActivityLevel}
            />
          </View>
          {dirty ? <Button label="Save changes" style={{ marginTop: spacing.md }} onPress={onSave} /> : null}
        </Card>

        <Text style={styles.sectionTitle}>Profile</Text>
        <Card>
          <Row label="Age" value={`${profile.age} yrs`} />
          <Row label="Height" value={`${profile.heightCm} cm`} />
          <Row label="Current weight" value={`${profile.weightKg} kg`} />
          <Row label="Sex" value={profile.sex === 'male' ? 'Male' : 'Female'} last />
        </Card>

        {isPro && favorites.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Favorites</Text>
            <Card>
              {favorites.map((fav, i) => (
                <View key={fav.id} style={[styles.row, i < favorites.length - 1 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{fav.description}</Text>
                    <Text style={styles.favoriteMeta}>
                      {fav.calories} kcal · P {fav.proteinG}g · C {fav.carbsG}g · F {fav.fatG}g
                    </Text>
                  </View>
                  <Pressable onPress={() => removeFavorite(fav.id)} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.red} />
                  </Pressable>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Data</Text>
        <Button
          label={exporting ? 'Exporting...' : isPro ? 'Export data (CSV)' : 'Export data (CSV) — Pro'}
          variant="outline"
          onPress={onExport}
          loading={exporting}
          style={{ marginBottom: spacing.sm }}
        />
        <Button label="Reset all data" variant="danger" onPress={onReset} />

        <Text style={styles.footerNote}>
          Meal calorie estimates are generated by AI and may not be perfectly accurate. Use as a
          guide, not medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  title: { color: colors.textPrimary, fontSize: font.size.xl, fontWeight: '800', marginBottom: spacing.md },
  proCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  proTitle: { color: colors.textPrimary, fontWeight: '800', fontSize: font.size.md },
  proSub: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  sectionTitle: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: font.size.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  label: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: '600', marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { color: colors.textSecondary, fontSize: font.size.sm },
  rowValue: { color: colors.textPrimary, fontWeight: '600', fontSize: font.size.sm },
  favoriteMeta: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  footerNote: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
