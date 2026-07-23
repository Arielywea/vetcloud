import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, ANIMATION } from '../../constants/tokens';

interface VButtonProps {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

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
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: RADIUS.md,
      gap: SPACING.sm,
    };

    const sizes = {
      sm: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
      md: { paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.lg },
      lg: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },
    };

    const variants: Record<string, ViewStyle> = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.primaryContainer, borderWidth: 1, borderColor: colors.border },
      ghost: { backgroundColor: 'transparent' },
      danger: { backgroundColor: colors.error },
    };

    return {
      ...base,
      ...sizes[size],
      ...variants[variant],
      opacity: disabled || loading ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
    };
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return colors.primary;
      case 'ghost': return colors.primary;
      case 'danger': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? TYPOGRAPHY.sizes.sm : TYPOGRAPHY.sizes.md }]}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
