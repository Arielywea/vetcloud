import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface MonthGridProps {
  selectedDate: string;
  monthDots: Record<string, { color: string }[]>;
  onDayPress?: (date: string) => void;
  onMonthChange?: (direction: -1 | 1) => void;
}

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function MonthGrid({ selectedDate, monthDots, onDayPress, onMonthChange }: MonthGridProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const today = new Date().toISOString().slice(0, 10);

  const calendarDays = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const prev = new Date(year, month, -i);
      days.push({
        date: prev.toISOString().slice(0, 10),
        day: prev.getDate(),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const cur = new Date(year, month, i);
      days.push({
        date: cur.toISOString().slice(0, 10),
        day: i,
        isCurrentMonth: true,
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      days.push({
        date: next.toISOString().slice(0, 10),
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [selectedDate]);

  const monthLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      {/* Month header with navigation */}
      <View style={styles.monthHeader}>
        {onMonthChange && (
          <TouchableOpacity onPress={() => onMonthChange(-1)} style={styles.navBtn}>
            <ChevronLeft size={16} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={[styles.monthTitle, { color: colors.text }]}>{monthLabel}</Text>
        {onMonthChange && (
          <TouchableOpacity onPress={() => onMonthChange(1)} style={styles.navBtn}>
            <ChevronRight size={16} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((name) => (
          <Text key={name} style={[styles.dayName, { color: colors.textSecondary }]}>
            {name}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {calendarDays.map((day) => {
          const isSelected = day.date === selectedDate;
          const isToday = day.date === today;
          const dots = monthDots[day.date] || [];
          const uniqueColors = [...new Set(dots.map((d) => d.color))].slice(0, 3);

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.primary },
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => onDayPress?.(day.date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: isSelected ? '#FFF' : day.isCurrentMonth ? colors.text : colors.textLight,
                  },
                ]}
              >
                {day.day}
              </Text>
              {uniqueColors.length > 0 && (
                <View style={styles.dotsRow}>
                  {uniqueColors.map((c, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: c }]} />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  navBtn: {
    padding: SPACING.xs,
  },
  monthTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'capitalize',
    minWidth: 120,
    textAlign: 'center',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  todayCell: {
    borderWidth: 1.5,
    borderColor: '#C9A227',
  },
  dayText: {
    fontSize: 12,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
