import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

const HOUR_HEIGHT = 80;
const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 - 19:00

interface TimeGridProps {
  width: number;
  children?: React.ReactNode;
}

export default function TimeGrid({ width, children }: TimeGridProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Time labels column */}
      <View style={[styles.timeColumn, { width: 52 }]}>
        {HOURS.map((hour) => (
          <View key={hour} style={{ height: HOUR_HEIGHT, justifyContent: 'flex-start' }}>
            <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
              {`${hour.toString().padStart(2, '0')}:00`}
            </Text>
          </View>
        ))}
      </View>

      {/* Grid area */}
      <View style={[styles.gridArea, { width }]}>
        {/* Hour lines */}
        {HOURS.map((hour) => (
          <View
            key={hour}
            style={[styles.hourLine, { top: (hour - 6) * HOUR_HEIGHT, backgroundColor: colors.border }]}
          />
        ))}

        {/* Half-hour lines */}
        {HOURS.map((hour) => (
          <View
            key={`half-${hour}`}
            style={[styles.halfHourLine, { top: (hour - 6) * HOUR_HEIGHT + HOUR_HEIGHT / 2, backgroundColor: colors.border + '60' }]}
          />
        ))}

        {/* Children (appointments, current time line, etc.) */}
        {children}
      </View>
    </View>
  );
}

export { HOUR_HEIGHT, HOURS };

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  timeColumn: {
    paddingTop: 0,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    textAlign: 'right',
    paddingRight: 8,
    transform: [{ translateY: -6 }],
  },
  gridArea: {
    position: 'relative',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  halfHourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
});