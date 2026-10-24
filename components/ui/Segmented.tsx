import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import VButton from './Button';
import { SPACING } from '../../constants/tokens';

interface SegmentedProps<T extends string> {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T | null;
  onChange: (value: T) => void;
  /** Spoken name of the group ("Especie") */
  label: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

// One choice out of a few: the chosen option filled, the rest outlined. Same buttons as everywhere
// (no second visual language for selectors).
export default function Segmented<T extends string>({ options, value, onChange, label, size = 'md', style }: SegmentedProps<T>) {
  return (
    <View style={[styles.row, style]} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o) => (
        <VButton
          key={o.value}
          size={size}
          variant={value === o.value ? 'filled' : 'secondary'}
          onPress={() => onChange(o.value)}
          accessibilityLabel={`${label}: ${o.label}${value === o.value ? ', seleccionado' : ''}`}
        >
          {o.label}
        </VButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
});
