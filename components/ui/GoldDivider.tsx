import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GoldDividerProps {
  style?: ViewStyle;
  variant?: 'gold' | 'subtle' | 'strong';
}

export default function GoldDivider({ style, variant = 'gold' }: GoldDividerProps) {
  const getColors = (): { start: string; mid: string; end: string } => {
    switch (variant) {
      case 'gold':
        return { start: 'transparent', mid: '#C9A22740', end: 'transparent' };
      case 'strong':
        return { start: 'transparent', mid: '#C9A22780', end: 'transparent' };
      case 'subtle':
        return { start: 'transparent', mid: '#DDE3EC', end: 'transparent' };
    }
  };

  const c = getColors();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.line, { backgroundColor: c.start }]} />
      <View style={[styles.lineMid, { backgroundColor: c.mid }]} />
      <View style={[styles.line, { backgroundColor: c.end }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 1,
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  lineMid: {
    flex: 2,
    height: 1,
  },
});