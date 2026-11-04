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
  // The label sits in normal flow so the outer box sizes itself off the
  // content + padding like any button. The Pressable is a *separate*,
  // absolutely-positioned layer pinned to all four edges of that box
  // (StyleSheet.absoluteFillObject) instead of being the sized element
  // itself. A Pressable that has to carry the stretch/percentage sizing
  // directly (alignSelf:'stretch' + width:'100%') can end up on Android
  // with a native touch region that doesn't match its painted bounds —
  // the paint reflects the final layout pass but the hit-test rect can be
  // left over from an earlier one. Absolute-filling a parent whose own
  // size is already settled sidesteps that resync entirely: the Pressable's
  // bounds are always read directly off the parent's resolved box.
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
      {loading ? (
        <ActivityIndicator color={TEXT_COLOR[variant]} />
      ) : (
        <Text style={[styles.label, { color: TEXT_COLOR[variant] }]}>{label}</Text>
      )}
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        hitSlop={6}
        collapsable={false}
        android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shape: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
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
  label: {
    fontSize: font.size.md,
    fontWeight: '700',
  },
});
