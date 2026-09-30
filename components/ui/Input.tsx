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
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...props
}: VInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  // Callers' handlers run too (spreading them after ours used to replace ours and freeze the border)
  const onFocus: TextInputProps['onFocus'] = (e) => {
    onFocusProp?.(e);
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: ANIMATION.fast,
      useNativeDriver: false,
    }).start();
  };

  const onBlur: TextInputProps['onBlur'] = (e) => {
    onBlurProp?.(e);
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
            borderWidth: 1.5, // constant: animating width shifts layout on focus
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
          accessibilityLabel={label}
          accessibilityHint={error || hint}
          {...props}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>
      {error && <Text accessibilityRole="alert" style={[styles.error, { color: colors.error }]}>{error}</Text>}
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
