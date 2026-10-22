import React, { useRef } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, alpha } from '../../constants/tokens';
import { EASE_OUT } from '../../hooks/useReducedMotion';

interface VIconButtonProps {
  icon: React.ReactNode;
  /** Required: an icon alone says nothing to a screen reader */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  style?: ViewStyle;
}

// Icon-only button with the same press feedback as VButton (0.97) and a tone on hover.
export default function VIconButton({ icon, label, onPress, disabled = false, size = 40, style }: VIconButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const pressTo = (toValue: number, duration: number) =>
    Animated.timing(scale, { toValue, duration, easing: EASE_OUT, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => pressTo(0.97, 110)}
      onPressOut={() => pressTo(1, 180)}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-disabled={disabled}
    >
      {({ hovered }: any) => (
        <Animated.View
          style={[
            styles.base,
            { width: size, height: size, opacity: disabled ? 0.55 : 1, transform: [{ scale }] },
            hovered && !disabled && { backgroundColor: alpha(colors.primary, 0.08) },
            style,
          ]}
        >
          {icon}
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
});
