import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { colors, font, spacing } from '../../src/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Image source={require('../../assets/icon.png')} style={styles.badgeImage} resizeMode="cover" />
        </View>
        <Text style={styles.title}>Platesnap AI</Text>
        <Text style={styles.subtitle}>
          Tell it what you ate, or snap a photo, and let AI handle the tracking. We'll build you a
          calorie and macro plan based on your goals.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button label="Get started" onPress={() => router.push('/onboarding/about-you')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: font.size.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
  },
});
