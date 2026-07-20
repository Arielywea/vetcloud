import React from 'react';
import { View, useWindowDimensions, StyleSheet, ScrollView, ScrollViewProps } from 'react-native';

const MAX_WIDTH = 800;
const BREAKPOINT_TABLET = 600;
const BREAKPOINT_DESKTOP = 1024;

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_TABLET;
  const isTablet = width >= BREAKPOINT_TABLET && width < BREAKPOINT_DESKTOP;
  const isDesktop = width >= BREAKPOINT_DESKTOP;
  return { width, isMobile, isTablet, isDesktop };
}

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: any;
  scroll?: boolean;
  scrollProps?: ScrollViewProps;
}

export function ScreenContainer({ children, style, scroll = false, scrollProps }: ScreenContainerProps) {
  const { isDesktop } = useResponsive();

  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, style, isDesktop && styles.containerDesktop]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDesktop: {
    alignItems: 'center',
  },
  content: {
    paddingBottom: 32,
  },
  contentDesktop: {
    maxWidth: MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
  },
});
