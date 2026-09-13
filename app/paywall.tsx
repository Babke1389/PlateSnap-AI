import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { useStore } from '../src/lib/store';
import { colors, font, radius, spacing } from '../src/theme';

const FEATURES = [
  {
    icon: 'camera',
    label: 'Unlimited photo scans',
    desc: 'Free plan includes 1 AI photo scan per day — Pro removes the limit.',
  },
  {
    icon: 'star',
    label: 'Save favorite meals',
    desc: 'One-tap re-log meals you eat often, no retyping.',
  },
  {
    icon: 'share-outline',
    label: 'Export your data',
    desc: 'Download your full meal & weight history as a CSV file.',
  },
  {
    icon: 'images',
    label: 'Before & After photos',
    desc: 'Save a photo at the start and another at your goal, side by side.',
  },
  {
    icon: 'stats-chart',
    label: 'Calorie trends',
    desc: 'See your daily calories over the last two weeks against your goal, at a glance.',
  },
  {
    icon: 'body',
    label: 'Body measurements',
    desc: 'Track waist, chest, hips, arms and thighs over time, with a trend line for each.',
  },
] as const;

export default function Paywall() {
  const router = useRouter();
  const { setPro } = useStore();

  const onSubscribe = () => {
    setPro(true);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.badge}>
          <Ionicons name="sparkles" size={32} color={colors.lime} />
        </View>
        <Text style={styles.title}>Platesnap AI Pro</Text>
        <Text style={styles.subtitle}>Unlock the fastest way to log meals.</Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={18} color={colors.lime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Monthly</Text>
          <Text style={styles.price}>$6.99/mo</Text>
        </View>

        <Button label="Continue" onPress={onSubscribe} style={{ marginTop: spacing.lg }} />
        <Button label="Not now" variant="ghost" onPress={() => router.back()} />

        <Text style={styles.disclaimer}>
          Demo mode: this screen isn't connected to a real payment processor yet, so tapping
          Continue just unlocks Pro on this device for testing. Wire up Stripe / App Store /
          Play Billing here before shipping.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, alignItems: 'center' },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  title: { color: colors.textPrimary, fontSize: font.size.xxl, fontWeight: '800', marginTop: spacing.md },
  subtitle: { color: colors.textSecondary, fontSize: font.size.md, marginTop: spacing.xs },
  features: { width: '100%', marginTop: spacing.xl, gap: spacing.md },
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
  priceCard: {
    width: '100%',
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.lime,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: { color: colors.textSecondary, fontWeight: '600' },
  price: { color: colors.lime, fontWeight: '800', fontSize: font.size.lg },
  disclaimer: {
    color: colors.textFaint,
    fontSize: font.size.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 16,
  },
});
