import { Animated, Easing } from 'react-native';
import { ANIMATION } from '../constants/tokens';

// ─────────────────────────────────────────────────────────
// VetCloud Animation Utilities
// Subtle, purposeful motion — not decoration
// ─────────────────────────────────────────────────────────

// Spring config for natural movement
export const SPRING = {
  gentle: { damping: 20, stiffness: 120, useNativeDriver: true },
  snappy: { damping: 15, stiffness: 180, useNativeDriver: true },
  bouncy: { damping: 12, stiffness: 150, useNativeDriver: true },
} as const;

// Timing presets
export const TIMING = {
  instant: { duration: ANIMATION.fast, useNativeDriver: true },
  quick: { duration: ANIMATION.normal, useNativeDriver: true },
  standard: { duration: ANIMATION.slow, useNativeDriver: true },
  deliberate: { duration: ANIMATION.slower, useNativeDriver: true },
} as const;

// ─── Entrance Animations ────────────────────────────────

export function fadeIn(duration = ANIMATION.slower, delay = 0): Animated.CompositeAnimation {
  const value = new Animated.Value(0);
  return {
    value,
    animation: Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }),
  };
}

export function slideUp(duration = ANIMATION.slower, delay = 0, distance = 20): Animated.CompositeAnimation {
  const value = new Animated.Value(distance);
  return {
    value,
    animation: Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(value, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]),
  };
}

export function scaleIn(duration = ANIMATION.slower, delay = 0, from = 0.92): Animated.CompositeAnimation {
  const value = new Animated.Value(from);
  return {
    value,
    animation: Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(value, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]),
  };
}

// ─── Stagger Helper ─────────────────────────────────────

export function staggerDelay(index: number, baseDelay = 60, maxDelay = 400): number {
  return Math.min(index * baseDelay, maxDelay);
}

// ─── Combined Entrance ──────────────────────────────────

export function entranceSequence(
  count: number,
  options?: { fadeDuration?: number; slideDistance?: number; baseDelay?: number }
): Array<{ opacity: Animated.Value; translateY: Animated.Value; animation: Animated.CompositeAnimation }> {
  const { fadeDuration = ANIMATION.slower, slideDistance = 16, baseDelay = 60 } = options || {};

  return Array.from({ length: count }, (_, i) => {
    const delay = staggerDelay(i, baseDelay);
    const opacity = new Animated.Value(0);
    const translateY = new Animated.Value(slideDistance);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: fadeDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    return { opacity, translateY, animation };
  });
}

// ─── Press Feedback ─────────────────────────────────────

export function pressScale(
  animatedValue: Animated.Value,
  pressed: boolean,
  scale = 0.97
): void {
  Animated.spring(animatedValue, {
    toValue: pressed ? scale : 1,
    ...SPRING.snappy,
  }).start();
}

// ─── Count-Up Animation ─────────────────────────────────

export function countUp(
  from: number,
  to: number,
  duration = 800,
  delay = 0
): { value: Animated.Value; animation: Animated.CompositeAnimation } {
  const value = new Animated.Value(from);
  const animation = Animated.sequence([
    Animated.delay(delay),
    Animated.timing(value, {
      toValue: to,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // numbers need JS driver
    }),
  ]);
  return { value, animation };
}

// ─── Pulse Animation (for notifications/alerts) ─────────

export function pulse(
  duration = 1000,
  scale = 1.05
): { value: Animated.Value; animation: Animated.CompositeAnimation } {
  const value = new Animated.Value(1);
  const animation = Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: scale,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ])
  );
  return { value, animation };
}

// ─── Shimmer Effect (for skeletons) ─────────────────────

export function shimmer(duration = 1200): {
  translateX: Animated.Value;
  animation: Animated.CompositeAnimation;
} {
  const translateX = new Animated.Value(-200);
  const animation = Animated.loop(
    Animated.timing(translateX, {
      toValue: 200,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
  return { translateX, animation };
}

// ─── Run All Animations ─────────────────────────────────

export function runAnimations(...animations: Animated.CompositeAnimation[]): void {
  Animated.parallel(animations).start();
}

export function runSequence(...animations: Animated.CompositeAnimation[]): void {
  Animated.sequence(animations).start();
}
