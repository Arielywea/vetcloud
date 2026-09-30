import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, ANIMATION } from '../../constants/tokens';

interface VEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'pet' | 'medical' | 'data';
}

export default function VEmptyState({ icon, title, description, action, variant = 'default' }: VEmptyStateProps) {
  const { colors } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // A quiet fade only: empty states show up constantly while filtering
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: ANIMATION.normal,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
      useNativeDriver: true,
    }).start();
  }, []);

  const getVariantColor = () => {
    switch (variant) {
      case 'pet': return colors.accent;
      case 'medical': return colors.info;
      case 'data': return colors.warning;
      default: return colors.primary;
    }
  };

  const variantColor = getVariantColor();

  return (
    <Animated.View style={[styles.container, { opacity: opacityAnim }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          { backgroundColor: variantColor + '12' },
        ]}
      >
        {icon}
      </Animated.View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING['2xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  action: {
    marginTop: SPACING.xl,
  },
});
