import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

interface VStatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; label: string };
  onPress?: () => void;
  style?: ViewStyle;
}

export default function VStatCard({ label, value, icon, color, trend, onPress, style }: VStatCardProps) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm, style]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>{icon}</View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      {trend && (
        <Text
          style={[
            styles.trend,
            { color: trend.value >= 0 ? colors.success : colors.error },
          ]}
        >
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity activeOpacity={0.7} onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  trend: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.xs,
  },
});
