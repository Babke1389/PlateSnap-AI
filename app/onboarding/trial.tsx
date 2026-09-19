import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';
import { Button } from '../../src/components/Button';
import {
  getCurrentOffering,
  isPurchasesConfigured,
  isUserCancelledError,
  purchasePackage,
} from '../../src/lib/purchases';
import { useStore } from '../../src/lib/store';
import { colors, font, radius, spacing } from '../../src/theme';

const purchasesConfigured = isPurchasesConfigured();

const FEATURES = [
  {
    icon: 'barcode',
    label: 'Logging made effortless',
    desc: 'Scan a barcode, snap a photo, or describe it — logging takes seconds.',
  },
  {
    icon: 'pie-chart',
    label: 'Goals that fit your life',
    desc: 'Set custom calorie and macro targets tailored to your plan.',
  },
  {
    icon: 'bar-chart',
    label: 'Insights to help you grow',
    desc: 'Stay focused with a daily streak and nutrition trends.',
  },
] as const;

export default function Trial() {
  const router = useRouter();
  const { startTrial } = useStore();
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!purchasesConfigured) return;
    getCurrentOffering()
      .then((offering) => setPkg(offering?.availablePackages[0] ?? null))
      .catch(() => setPkg(null));
  }, []);

  const enterApp = () => router.replace('/(tabs)');

  const onStartTrial = async () => {
    if (!purchasesConfigured) {
      startTrial();
      enterApp();
      return;
    }
    if (!pkg) return;
    setStarting(true);
    try {
      await purchasePackage(pkg);
      enterApp();
    } catch (err) {
      if (!isUserCancelledError(err)) {
        Alert.alert(
          'Could not start trial',
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          This is your moment to turn <Text style={styles.titleAccent}>habits into results.</Text>
        </Text>

        <View style={styles.badge}>
          <Ionicons name="sparkles" size={40} color={colors.orange} />
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color={colors.orange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Button
          label={starting ? 'Starting...' : 'Try free for 7 days'}
          onPress={onStartTrial}
          loading={starting}
          disabled={purchasesConfigured && !pkg}
          style={{ marginTop: spacing.xl }}
        />
        <Button label="No thanks" variant="ghost" onPress={enterApp} />

        {!purchasesConfigured ? (
          <Text style={styles.disclaimer}>
            Demo mode: no payment method required and nothing is charged — starting the trial just
            unlocks Pro on this device for 7 days for testing. Wire up real billing before
            shipping.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, alignItems: 'center', flexGrow: 1, justifyContent: 'center' },
  title: {
    color: colors.textPrimary,
    fontSize: font.size.xxl,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
  },
  titleAccent: { color: colors.orange },
  badge: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  features: { width: '100%', gap: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { color: colors.textPrimary, fontWeight: '700', fontSize: font.size.sm },
  featureDesc: { color: colors.textFaint, fontSize: font.size.xs, marginTop: 2 },
  disclaimer: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 16,
  },
});
