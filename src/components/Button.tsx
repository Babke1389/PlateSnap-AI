import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const BG: Record<Variant, string> = {
  primary: colors.lime,
  secondary: colors.blue,
  outline: 'transparent',
  ghost: 'transparent',
  danger: colors.red,
};

const TEXT_COLOR: Record<Variant, string> = {
  primary: '#0B0D12',
  secondary: '#0B0D12',
  outline: colors.textPrimary,
  ghost: colors.textSecondary,
  danger: '#0B0D12',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  fullWidth = true,
}: Props) {
  // The colored/rounded shape lives on a plain, non-interactive View, and the
  // Pressable is a plain child that just fills it. On Android, a Pressable
  // that itself carries alignSelf:'stretch' / width:'100%' can end up with a
  // touch region that doesn't match its painted bounds (a long-standing RN
  // Android quirk), so only the label area responds to taps. Letting the
  // outer View own the sizing and the Pressable simply stretch to fill it
  // (the default behavior for a block child) keeps its hit box always in
  // sync with what's drawn. collapsable={false} additionally opts the
  // Pressable out of native view-flattening, which can otherwise strand its
  // touch target at a stale, smaller layout.
  return (
    <View
      style={[
        styles.shape,
        fullWidth && styles.fullWidth,
        { backgroundColor: BG[variant] },
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        hitSlop={6}
        collapsable={false}
        android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
        style={styles.touchable}
      >
        {({ pressed }) =>
          loading ? (
            <ActivityIndicator color={TEXT_COLOR[variant]} />
          ) : (
            <Text
              style={[
                styles.label,
                { color: TEXT_COLOR[variant] },
                pressed && !disabled && styles.labelPressed,
              ]}
            >
              {label}
            </Text>
          )
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.4,
  },
  touchable: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: font.size.md,
    fontWeight: '700',
  },
  labelPressed: {
    opacity: 0.7,
  },
});
