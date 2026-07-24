import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, ANIMATION } from '../../constants/tokens';

interface VCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
  hoverable?: boolean;
}

export default function VCard({
  children,
  onPress,
  padding = SPACING.xl + SPACING.sm,
  style,
  variant = 'default',
  hoverable = true,
}: VCardProps) {
  const { colors } = useTheme();
  const elevation = React.useRef(new Animated.Value(0)).current;

  const onHoverIn = React.useCallback(() => {
    if (!hoverable) return;
    Animated.timing(elevation, {
      toValue: 4,
      duration: ANIMATION.normal,
      useNativeDriver: false,
    }).start();
  }, [hoverable, elevation]);

  const onHoverOut = React.useCallback(() => {
    if (!hoverable) return;
    Animated.timing(elevation, {
      toValue: 0,
      duration: ANIMATION.normal,
      useNativeDriver: false,
    }).start();
  }, [hoverable, elevation]);

  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: RADIUS.lg,
      padding,
    };

    const variants = {
      default: { ...SHADOWS.xs, borderWidth: 1, borderColor: '#E8ECF2' },
      outlined: { borderWidth: 1, borderColor: colors.border },
      elevated: SHADOWS.sm,
    };

    return { ...base, ...variants[variant] };
  };

  const animatedStyle = {
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: elevation.interpolate({
      inputRange: [0, 4],
      outputRange: [0.03, 0.09],
    }),
    shadowRadius: elevation.interpolate({
      inputRange: [0, 4],
      outputRange: [2, 10],
    }),
    elevation,
  };

  if (onPress) {
    return (
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          onPressIn={onHoverIn}
          onPressOut={onHoverOut}
          style={[getCardStyle(), style]}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, getCardStyle(), style]}>
      {children}
    </Animated.View>
  );
}
