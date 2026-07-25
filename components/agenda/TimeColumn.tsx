import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TYPOGRAPHY } from '../../constants/tokens';

interface TimeColumnProps {
  hours: number[];
  hourHeight: number;
  color?: string;
}

export default function TimeColumn({ hours, hourHeight, color = '#8896A8' }: TimeColumnProps) {
  return (
    <View style={styles.container}>
      {hours.map((hour) => (
        <View key={hour} style={[styles.hourSlot, { height: hourHeight }]}>
          <Text style={[styles.hourLabel, { color }]}>
            {String(hour).padStart(2, '0')}:00
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
  },
  hourSlot: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  hourLabel: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    transform: [{ translateY: -7 }],
  },
});
