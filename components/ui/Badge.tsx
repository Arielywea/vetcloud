import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { getTextOnPrimary } from '../../constants/colors';

type Tone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface VBadgeProps {
  children?: string | number;
  label?: string | number;
  color?: string;
  /** Visual style, or a semantic tone (rendered as a soft badge in that tone's color) */
  variant?: 'filled' | 'outlined' | 'soft' | Tone;
  size?: 'sm' | 'md';
  onPress?: () => void;
  selected?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export default function VBadge({
  children,
  label,
  color,
  variant = 'soft',
  size = 'md',
  onPress,
  selected,
  accessibilityLabel,
  style,
}: VBadgeProps) {
  const { colors } = useTheme();
  const toneColor: Record<Tone, string> = {
    success: colors.success,
    danger: colors.error,
    warning: colors.warning,
    info: colors.info,
    neutral: colors.textSecondary,
  };
  const isTone = variant in toneColor;
  const badgeColor = color || (isTone ? toneColor[variant as Tone] : colors.primary);
  const kind: 'filled' | 'outlined' | 'soft' = isTone ? 'soft' : (variant as 'filled' | 'outlined' | 'soft');
  const displayText = String(label ?? children ?? '');

  const sizes = {
    sm: { paddingVertical: 3, paddingHorizontal: SPACING.sm },
    md: { paddingVertical: SPACING.xs + 1, paddingHorizontal: SPACING.md },
  };
  const box: ViewStyle = {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    ...sizes[size],
    ...(kind === 'filled'
      ? { backgroundColor: badgeColor }
      : kind === 'outlined'
        ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: badgeColor }
        // Soft: the hue lives in the tint and border; text stays neutral so it's readable in both themes
        : { backgroundColor: alpha(badgeColor, 0.14), borderWidth: 1, borderColor: alpha(badgeColor, 0.35) }),
  };
  const textColor = kind === 'filled' ? getTextOnPrimary(badgeColor).default : colors.text;
  const textStyle = [styles.text, { color: textColor, fontSize: size === 'sm' ? 12 : TYPOGRAPHY.sizes.sm }];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[box, styles.pressable, style]}
        accessibilityRole="button"
        accessibilityState={selected !== undefined ? { selected } : undefined}
        accessibilityLabel={accessibilityLabel || displayText}
      >
        <Text style={textStyle}>{displayText}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[box, style]} accessibilityLabel={accessibilityLabel}>
      <Text style={textStyle}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  // Pressable chips need a finger-sized target even when the pill is small
  pressable: {
    minHeight: 32,
    justifyContent: 'center',
  },
});
