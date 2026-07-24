import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface AnimatedIconProps {
  children: React.ReactNode;
  delay?: number;
  animate?: 'fade' | 'scale' | 'fadeScale' | 'none';
  style?: ViewStyle;
}

export default function AnimatedIcon({
  children,
  delay = 0,
  animate = 'fadeScale',
  style,
}: AnimatedIconProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (animate === 'none') return;

    const animations: Animated.CompositeAnimation[] = [];

    if (animate === 'fade' || animate === 'fadeScale') {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        })
      );
    }

    if (animate === 'scale' || animate === 'fadeScale') {
      animations.push(
        Animated.spring(scale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          delay,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, [animate, delay, opacity, scale]);

  const animatedStyle = {
    opacity: animate === 'none' ? 1 : opacity,
    transform: animate === 'none' ? [] : [{ scale }],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}