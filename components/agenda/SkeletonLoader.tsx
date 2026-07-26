import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS } from '../../constants/tokens';

interface SkeletonLoaderProps {
  variant?: 'header' | 'toolbar' | 'grid' | 'sidebar' | 'full';
}

function SkeletonBlock({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: RADIUS.sm,
          opacity,
        },
        style,
      ]}
    />
  );
}

export default function SkeletonLoader({ variant = 'full' }: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  if (variant === 'header') {
    return (
      <View style={[styles.row, styles.header, { backgroundColor: colors.surface }]}>
        <SkeletonBlock width={120} height={20} />
        <SkeletonBlock width={300} height={36} />
        <SkeletonBlock width={100} height={36} />
      </View>
    );
  }

  if (variant === 'toolbar') {
    return (
      <View style={[styles.row, styles.toolbar, { backgroundColor: colors.surface }]}>
        <SkeletonBlock width={120} height={36} />
        <SkeletonBlock width={60} height={36} />
        <SkeletonBlock width={160} height={36} />
        <SkeletonBlock width={120} height={36} />
      </View>
    );
  }

  if (variant === 'grid') {
    return (
      <View style={[styles.grid, { backgroundColor: colors.surface }]}>
        <View style={[styles.gridHeader, { borderBottomColor: colors.border }]}>
          {[...Array(7)].map((_, i) => (
            <View key={i} style={styles.gridHeaderCell}>
              <SkeletonBlock width={30} height={12} />
              <SkeletonBlock width={24} height={24} style={{ marginTop: 4 }} />
            </View>
          ))}
        </View>
        <View style={styles.gridBody}>
          {[...Array(8)].map((_, i) => (
            <View key={i} style={styles.gridRow}>
              <SkeletonBlock width={40} height={12} />
              <View style={styles.gridCells}>
                {[...Array(7)].map((_, j) => (
                  <SkeletonBlock key={j} width="100%" height={36} style={{ marginHorizontal: 2 }} />
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (variant === 'sidebar') {
    return (
      <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
        <SkeletonBlock width="100%" height={180} />
        <SkeletonBlock width="100%" height={120} style={{ marginTop: SPACING.md }} />
        <SkeletonBlock width="100%" height={100} style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  return (
    <View style={[styles.full, { backgroundColor: colors.background }]}>
      <SkeletonBlock width="100%" height={60} />
      <SkeletonBlock width="100%" height={48} style={{ marginTop: SPACING.sm }} />
      <View style={styles.fullContent}>
        <SkeletonBlock width="75%" height={400} />
        <SkeletonBlock width="25%" height={400} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  toolbar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  grid: {
    flex: 1,
    padding: SPACING.md,
  },
  gridHeader: {
    flexDirection: 'row',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  gridHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  gridBody: {
    marginTop: SPACING.sm,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    gap: SPACING.sm,
  },
  gridCells: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    padding: SPACING.md,
  },
  full: {
    flex: 1,
    padding: SPACING.md,
  },
  fullContent: {
    flex: 1,
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
});
