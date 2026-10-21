import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { useReducedMotion, EASE_OUT } from '../../hooks/useReducedMotion';

type NativeAnimation = 'none' | 'fade' | 'slide';

/**
 * react-native-web animates Modal with 300 ms `ease-in` and a full-height slide.
 * On web the Modal gets animationType "none" and its content fades in here
 * (180 ms, strong ease-out, opacity only); native keeps the platform animation.
 */
export function modalAnimation(native: NativeAnimation): NativeAnimation {
  return Platform.OS === 'web' ? 'none' : native;
}

export default function ModalEnter({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const opacity = useRef(new Animated.Value(Platform.OS === 'web' && !reduced ? 0 : 1)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' || reduced) {
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, { toValue: 1, duration: 180, easing: EASE_OUT, useNativeDriver: false }).start();
  }, [opacity, reduced]);

  if (Platform.OS !== 'web') return <>{children}</>;
  return <Animated.View style={[styles.fill, { opacity }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
