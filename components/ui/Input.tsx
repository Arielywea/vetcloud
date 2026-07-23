import React, { useState, useRef } from 'react';
import { View, StyleSheet, TextInput, TextInputProps, ViewStyle, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, ANIMATION } from '../../constants/tokens';

interface VInputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function VInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: VInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: ANIMATION.normal,
      useNativeDriver: false,
    }).start();
  };

  const onBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: ANIMATION.normal,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            borderWidth,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: leftIcon ? SPACING.xl + SPACING.md : SPACING.lg,
              paddingRight: rightIcon ? SPACING.xl + SPACING.md : SPACING.lg,
            },
            style,
          ]}
          placeholderTextColor={colors.textLight}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
      {hint && !error && <Text style={[styles.hint, { color: colors.textLight }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.regular, marginBottom: SPACING.sm },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md + 2,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  iconLeft: { position: 'absolute', left: SPACING.md, zIndex: 1 },
  iconRight: { position: 'absolute', right: SPACING.md, zIndex: 1 },
  error: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xs },
  hint: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xs },
});
