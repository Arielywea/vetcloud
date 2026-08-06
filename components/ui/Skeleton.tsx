import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, ANIMATION } from '../../constants/tokens';

interface VSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'pulse' | 'shimmer';
}

export default function VSkeleton({
  width = '100%',
  height = 16,
  borderRadius = RADIUS.lg,
  style,
  variant = 'shimmer',
}: VSkeletonProps) {
  const { colors } = useTheme();

  if (variant === 'shimmer') {
    return <ShimmerSkeleton width={width} height={height} borderRadius={borderRadius} style={style} colors={colors} />;
  }

  return <PulseSkeleton width={width} height={height} borderRadius={borderRadius} style={style} colors={colors} />;
}

// ─── Shimmer Variant (sweeping gradient) ────────────────

function ShimmerSkeleton({
  width,
  height,
  borderRadius,
  style,
  colors,
}: {
  width: number | string;
  height: number;
  borderRadius: number;
  style?: ViewStyle;
  colors: any;
}) {
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.surfaceVariant,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            'transparent',
            colors.primaryContainer + '60',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

// ─── Pulse Variant (opacity blink) ──────────────────────

function PulseSkeleton({
  width,
  height,
  borderRadius,
  style,
  colors,
}: {
  width: number | string;
  height: number;
  borderRadius: number;
  style?: ViewStyle;
  colors: any;
}) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: ANIMATION.slower,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: ANIMATION.slower,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.primaryContainer,
          opacity,
        },
        style,
      ]}
    />
  );
}

// ─── Composite Skeleton Layouts ─────────────────────────

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 16 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <VSkeleton width={40} height={40} borderRadius={RADIUS.md} />
        <View style={{ flex: 1, gap: 6 }}>
          <VSkeleton width="60%" height={14} />
          <VSkeleton width="40%" height={10} />
        </View>
      </View>
      <VSkeleton height={12} />
      <VSkeleton width="80%" height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

export function SkeletonStat({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: RADIUS.lg, padding: 20, alignItems: 'center' }, style]}>
      <VSkeleton width={48} height={48} borderRadius={RADIUS.md} style={{ marginBottom: 12 }} />
      <VSkeleton width={60} height={24} style={{ marginBottom: 8 }} />
      <VSkeleton width={80} height={12} />
    </View>
  );
}

export function SkeletonList({ count = 3, style }: { count?: number; style?: ViewStyle }) {
  return (
    <View style={[{ gap: 8 }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
