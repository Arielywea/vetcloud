import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { TYPOGRAPHY } from '../../constants/tokens';

interface DayHeaderProps {
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  appointmentCount: number;
  width: number;
}

export default function DayHeader({ dayName, dayNumber, isToday, isSelected, appointmentCount, width }: DayHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { width }]}>
      <Text style={[styles.dayName, { color: colors.textSecondary }]}>{dayName}</Text>
      <View
        style={[
          styles.dayNumberWrap,
          isSelected && { backgroundColor: colors.primary },
          isToday && !isSelected && [styles.todayRing, { borderColor: colors.accent }],
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            {
              color: isSelected ? '#FFF' : isToday ? colors.primary : colors.text,
              fontWeight: isToday || isSelected ? '700' : '600',
            },
          ]}
        >
          {dayNumber}
        </Text>
      </View>
      {appointmentCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>{appointmentCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 8,
  },
  dayName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5, textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  todayRing: {
    borderWidth: 1.5,
  },
  dayNumber: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  badge: {
    marginTop: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
