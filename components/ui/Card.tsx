import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';

interface VCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  /** Panels are set apart from the ground by tone alone (default). `outlined` adds a border where a
   *  panel sits on a surface of the same tone; `elevated` is only for things that float. */
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
    ...(variant === 'elevated' ? SHADOWS.lg : variant === 'outlined' ? { borderWidth: 1, borderColor: colors.border } : null),
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
