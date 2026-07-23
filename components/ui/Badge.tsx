import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface VBadgeProps {
  children: string;
  color?: string;
  variant?: 'filled' | 'outlined' | 'soft';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export default function VBadge({
  children,
  color,
  variant = 'soft',
  size = 'md',
  style,
}: VBadgeProps) {
  const { colors } = useTheme();
  const badgeColor = color || colors.primary;

  const getBadgeStyle = (): ViewStyle => {
    const sizes = {
      sm: { paddingVertical: 2, paddingHorizontal: SPACING.sm },
      md: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
    };

    const variants: Record<string, ViewStyle> = {
      filled: { backgroundColor: badgeColor },
      outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: badgeColor },
      soft: { backgroundColor: badgeColor + '18' },
    };

    return {
      borderRadius: RADIUS.sm,
      alignSelf: 'flex-start',
      ...sizes[size],
      ...variants[variant],
    };
  };

  const getTextColor = () => {
    if (variant === 'filled') return '#FFFFFF';
    return badgeColor;
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: size === 'sm' ? TYPOGRAPHY.sizes.xs : TYPOGRAPHY.sizes.sm,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
