import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
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
  // Pressable here is react-native-gesture-handler's, not core RN's. Core
  // RN's Pressable/TouchableOpacity both sit on top of the same JS-side
  // "Pressability" module, which on this RN version measures its own hit
  // region and compares it against the native hit test — on Fabric that
  // measured region can go stale relative to the view's final flex-resolved
  // layout, so only a center strip (the pre-flex size) keeps registering
  // taps, no matter which flexbox mechanism (stretch, flex-grow) produces
  // the final width. RNGH's Pressable instead attaches a native gesture
  // recognizer straight to the view, so its hit area is whatever the OS
  // already knows the view's bounds to be — no separate JS measurement to
  // go stale.
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
