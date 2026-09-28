import React, { useRef } from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { getTextOnPrimary } from '../../constants/colors';

interface VButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

// Strong ease-out: instant response on press, quick settle on release.
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function VButton({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: VButtonProps) {
  const { colors, onAccentText } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const inactive = disabled || loading;

  // One feedback channel only: a 0.97 press. No opacity dip on top of it.
  const pressTo = (toValue: number, duration: number) =>
    Animated.timing(scale, { toValue, duration, easing: EASE_OUT, useNativeDriver: true }).start();

  const sizes = {
    sm: { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md, minHeight: 32 },
    md: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg, minHeight: 40 },
    lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, minHeight: 48 },
  };

  const variants: Record<string, ViewStyle> = {
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
    accent: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  };

  const textColor = (() => {
    switch (variant) {
      case 'primary': return onAccentText.default;
      case 'danger': return getTextOnPrimary(colors.error).default;
      default: return colors.primary;
    }
  })();

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      onPressIn={() => pressTo(0.97, 110)}
      onPressOut={() => pressTo(1, 180)}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Animated.View
        style={[
          styles.base,
          sizes[size],
          variants[variant],
          { opacity: inactive ? 0.55 : 1, transform: [{ scale }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            <Text style={[styles.text, { color: textColor, fontSize: size === 'sm' ? TYPOGRAPHY.sizes.sm : TYPOGRAPHY.sizes.md }]}>
              {children}
            </Text>
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.1,
  },
});
