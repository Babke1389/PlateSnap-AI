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
  // Width comes from flex-grow in a row, not from alignSelf:'stretch' or a
  // percentage width on the Pressable itself. Both of the earlier
  // approaches (stretch directly on the Pressable, and an absolutely
  // positioned Pressable overlay) painted correctly but left Android's
  // touch region wrong — undersized in one case, zero-sized in the other.
  // flex-grow resolves the Pressable's own main-axis size in the same
  // layout pass as everything else, which is the one sizing path that has
  // actually matched its touch region on-device.
  return (
    <View style={fullWidth ? styles.row : undefined}>
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        hitSlop={6}
        collapsable={false}
        android_ripple={{ color: 'rgba(0,0,0,0.12)' }}
        style={[
          styles.shape,
          fullWidth && styles.flexFill,
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  flexFill: {
    flex: 1,
  },
  shape: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
