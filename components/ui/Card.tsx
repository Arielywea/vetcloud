import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';

interface VCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export default function VCard({
  children,
  onPress,
  padding = SPACING.lg,
  style,
  variant = 'default',
}: VCardProps) {
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding,
    };

    const variants = {
      default: SHADOWS.sm,
      outlined: { borderWidth: 1, borderColor: colors.border },
      elevated: SHADOWS.md,
    };

    return { ...base, ...variants[variant] };
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[getCardStyle(), style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
}
