import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { entranceSequence, staggerDelay } from '../../utils/animations';
import { ANIMATION } from '../../constants/tokens';

// ─────────────────────────────────────────────────────────
// AnimatedEntrance — wraps children with staggered fade+slide
// ─────────────────────────────────────────────────────────

interface AnimatedEntranceProps {
  children: React.ReactNode;
  count?: number;
  duration?: number;
  stagger?: number;
  distance?: number;
  delay?: number;
  style?: ViewStyle;
}

export default function AnimatedEntrance({
  children,
  count = 1,
  duration = ANIMATION.slower,
  stagger = 60,
  distance = 16,
  delay = 0,
  style,
}: AnimatedEntranceProps) {
  const items = useRef(
    entranceSequence(count, { fadeDuration: duration, slideDistance: distance, baseDelay: stagger })
  ).current;

  useEffect(() => {
    const animations = items.map((item, i) => {
      const itemDelay = delay + staggerDelay(i, stagger);
      return Animated.sequence([
        Animated.delay(itemDelay),
        Animated.parallel([
          Animated.timing(item.opacity, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(item.translateY, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [count]);

  if (count === 1) {
    return (
      <Animated.View
        style={[
          {
            opacity: items[0]?.opacity,
            transform: [{ translateY: items[0]?.translateY }],
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, i) => {
        const item = items[i];
        if (!item) return child;
        return (
          <Animated.View
            style={{
              opacity: item.opacity,
              transform: [{ translateY: item.translateY }],
            }}
          >
            {child}
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}
