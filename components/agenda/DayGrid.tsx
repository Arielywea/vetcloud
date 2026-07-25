import React, { useRef } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import TimeColumn from './TimeColumn';
import AppointmentBlock, { AppointmentBlockData } from './AppointmentBlock';
import { Appointment } from '../../services/directus';

interface DayGridProps {
  hours: number[];
  hourHeight: number;
  dayAppointments: Appointment[];
  selectedDate: string;
  onSlotPress?: (date: string, hour: number) => void;
  onAppointmentPress?: (appointment: AppointmentBlockData) => void;
}

function getHourFromTime(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getHours() + d.getMinutes() / 60;
}

function getMinuteFromTime(dateStr: string): number {
  return new Date(dateStr).getMinutes();
}

function getDurationMinutes(appt: Appointment): number {
  if (appt.end_time) {
    return (new Date(appt.end_time).getTime() - new Date(appt.start_time).getTime()) / 60000;
  }
  return 45;
}

export default function DayGrid({
  hours,
  hourHeight,
  dayAppointments,
  selectedDate,
  onSlotPress,
  onAppointmentPress,
}: DayGridProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const totalGridHeight = hours.length * hourHeight;

  const positioned = dayAppointments.map((appt) => {
    const startHour = getHourFromTime(appt.start_time);
    const duration = getDurationMinutes(appt);
    const relativeHour = startHour - hours[0];
    const top = relativeHour * hourHeight + (getMinuteFromTime(appt.start_time) / 60) * hourHeight;
    const height = (duration / 60) * hourHeight;
    return { appointment: appt, top, height };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Time grid */}
      <ScrollView
        ref={scrollRef}
        style={styles.gridScroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.gridRow, { minHeight: totalGridHeight }]}>
          <TimeColumn hours={hours} hourHeight={hourHeight} color={colors.textLight} />
          <View style={styles.gridArea}>
            {/* Hour lines */}
            {hours.map((hour) => (
              <View
                key={hour}
                style={[styles.hourLine, { top: (hour - hours[0]) * hourHeight, borderColor: colors.border }]}
              />
            ))}

            {/* Slot tap targets */}
            {hours.map((hour) => (
              <View
                key={hour}
                style={[
                  styles.slotTarget,
                  {
                    top: (hour - hours[0]) * hourHeight,
                    height: hourHeight,
                  },
                ]}
                onTouchEnd={() => onSlotPress?.(selectedDate, hour)}
              />
            ))}

            {/* Appointment blocks */}
            {positioned.map((pos) => (
              <AppointmentBlock
                key={pos.appointment.id}
                appointment={pos.appointment}
                top={pos.top}
                height={pos.height}
                onPress={onAppointmentPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#DDE3EC',
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'capitalize',
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: SPACING.lg,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridArea: {
    flex: 1,
    position: 'relative',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  slotTarget: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
