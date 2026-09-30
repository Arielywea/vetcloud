import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';

interface VCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  /** Elevation is declared once: a border (default/outlined) or a shadow (elevated), never both */
  variant?: 'default' | 'outlined' | 'elevated';
  accessibilityLabel?: string;
}

// No entrance or hover animation: cards appear in lists opened many times a day,
// and animating shadows isn't a transform/opacity change.
export default function VCard({
  children,
  onPress,
  padding = SPACING.xl + SPACING.sm,
  style,
  variant = 'default',
  accessibilityLabel,
}: VCardProps) {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: RADIUS.lg,
    padding,
    ...(variant === 'elevated' ? SHADOWS.sm : { borderWidth: 1, borderColor: colors.border }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[cardStyle, style]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
