import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface VBadgeProps {
  children?: string;
  label?: string;
  color?: string;
  variant?: 'filled' | 'outlined' | 'soft';
  size?: 'sm' | 'md';
  onPress?: () => void;
  style?: ViewStyle;
}

export default function VBadge({
  children,
  label,
  color,
  variant = 'soft',
  size = 'md',
  onPress,
  style,
}: VBadgeProps) {
  const { colors } = useTheme();
  const badgeColor = color || colors.primary;
  const displayText = label || children || '';

  const getBadgeStyle = (): ViewStyle => {
    const sizes = {
      sm: { paddingVertical: 3, paddingHorizontal: SPACING.sm },
      md: { paddingVertical: SPACING.xs + 1, paddingHorizontal: SPACING.md },
    };

    const variants: Record<string, ViewStyle> = {
      filled: { backgroundColor: badgeColor },
      outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: badgeColor },
      soft: { backgroundColor: badgeColor + '20' },
    };

    return {
      borderRadius: RADIUS.full,
      alignSelf: 'flex-start',
      ...sizes[size],
      ...variants[variant],
    };
  };

  const getTextColor = () => {
    if (variant === 'filled') return '#FFFFFF';
    return badgeColor;
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[getBadgeStyle(), style]}>
        <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? TYPOGRAPHY.sizes.xs : TYPOGRAPHY.sizes.sm }]}>
          {displayText}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? TYPOGRAPHY.sizes.xs : TYPOGRAPHY.sizes.sm }]}>
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
