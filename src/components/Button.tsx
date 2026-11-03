import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
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
  // Style is a plain array, not a function of `pressed` — on Android a
  // function-form style on Pressable can leave the actual touch target
  // sized to the first-pass (content-only) layout instead of the final
  // stretched box, so only the label text area registers taps. Press
  // feedback is applied to the inner content via the children render-prop
  // instead, which doesn't affect the outer touchable's hit area.
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={6}
      android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
      style={[
        styles.base,
        fullWidth && styles.fullWidth,
        { backgroundColor: BG[variant] },
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
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
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
  label: {
    fontSize: font.size.md,
    fontWeight: '700',
  },
  labelPressed: {
    opacity: 0.7,
  },
});
