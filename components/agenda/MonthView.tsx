import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

interface EnrichedAppointment {
  id: string;
  patient_name: string;
  start_time: string;
  appointment_type: string;
  status: string;
}

interface MonthViewProps {
  selectedDate: Date;
  appointments: EnrichedAppointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentPress?: (appointment: EnrichedAppointment) => void;
  loading?: boolean;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function MonthView({
  selectedDate,
  appointments,
  onDateSelect,
  onAppointmentPress,
  loading,
}: MonthViewProps) {
  const { colors } = useTheme();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const today = new Date();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Group appointments by date
  const apptsByDate = useMemo(() => {
    const map: Record<string, EnrichedAppointment[]> = {};
    appointments.forEach((appt) => {
      const d = new Date(appt.start_time);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [appointments]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonLoader variant="grid" />
      </View>
    );
  }

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month header */}
      <View style={styles.monthHeader}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {MONTH_NAMES[month]} {year}
        </Text>
      </View>

      {/* Day names row */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((d) => (
          <Text key={d} style={[styles.dayName, { color: colors.textSecondary }]}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((day, i) => {
          if (day === null) return <View key={`empty-${i}`} style={styles.dayCell} />;

          const dateKey = `${year}-${month}-${day}`;
          const dayAppts = apptsByDate[dateKey] || [];
          const isSelected = day === selectedDate.getDate();
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.primary + '15', borderRadius: RADIUS.sm },
                isToday && !isSelected && { borderColor: colors.primary, borderWidth: 1, borderRadius: RADIUS.sm },
              ]}
              onPress={() => onDateSelect(new Date(year, month, day))}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected ? colors.primary : isToday ? colors.primary : colors.text,
                    fontWeight: isToday || isSelected ? '700' : '400',
                  },
                ]}
              >
                {day}
              </Text>

              {/* Appointment dots */}
              {dayAppts.length > 0 && (
                <View style={styles.dotsRow}>
                  {dayAppts.slice(0, 3).map((appt, j) => (
                    <View
                      key={appt.id}
                      style={[
                        styles.dot,
                        {
                          backgroundColor: APPOINTMENT_TYPE_COLORS[appt.appointment_type] || colors.primary,
                        },
                      ]}
                    />
                  ))}
                  {dayAppts.length > 3 && (
                    <Text style={[styles.moreDots, { color: colors.textSecondary }]}>+{dayAppts.length - 3}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected day appointments */}
      {(() => {
        const selKey = `${year}-${month}-${selectedDate.getDate()}`;
        const selAppts = apptsByDate[selKey] || [];
        if (selAppts.length === 0) return null;

        return (
          <View style={[styles.dayDetail, { borderTopColor: colors.border }]}>
            <Text style={[styles.dayDetailTitle, { color: colors.text }]}>
              {selectedDate.getDate()} de {MONTH_NAMES[month]} — {selAppts.length} cita{selAppts.length > 1 ? 's' : ''}
            </Text>
            {selAppts.map((appt) => {
              const time = new Date(appt.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
              const color = APPOINTMENT_TYPE_COLORS[appt.appointment_type] || colors.primary;
              return (
                <TouchableOpacity
                  key={appt.id}
                  style={[styles.dayApptRow, { borderLeftColor: color }]}
                  onPress={() => onAppointmentPress?.(appt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayApptTime, { color }]}>{time}</Text>
                  <Text style={[styles.dayApptName, { color: colors.text }]}>{appt.patient_name}</Text>
                  <View style={[styles.dayApptBadge, { backgroundColor: color + '20' }]}>
                    <Text style={[styles.dayApptType, { color }]} numberOfLines={1}>
                      {appt.appointment_type}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  monthTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5, textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.sm,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayNumber: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  moreDots: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dayDetail: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  dayDetailTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  dayApptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderLeftWidth: 3,
    borderRadius: 4,
    marginBottom: 4,
    gap: SPACING.sm,
  },
  dayApptTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    width: 50,
  },
  dayApptName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  dayApptBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayApptType: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'capitalize',
  },
});
