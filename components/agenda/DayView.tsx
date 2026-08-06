import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { HOUR_HEIGHT, HOURS } from './TimeGrid';
import AppointmentCard, { AppointmentCardData } from './AppointmentCard';
import CurrentTimeLine from './CurrentTimeLine';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

export interface EnrichedAppointment {
  id: string;
  patient_name: string;
  start_time: string;
  end_time: string | null;
  appointment_type: string;
  status: string;
  description?: string | null;
  tutor_phone?: string | null;
  veterinarian?: string | null;
  room?: string | null;
  pet_id?: string | null;
  petPhoto?: string | null;
  petSpecies?: string;
  petBreed?: string;
  tutorName?: string;
}

interface DayViewProps {
  date: Date;
  appointments: EnrichedAppointment[];
  onAppointmentPress?: (appointment: AppointmentCardData) => void;
  onAppointmentContextMenu?: (appointment: AppointmentCardData, x: number, y: number) => void;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  onSlotPress?: (date: Date, hour: number) => void;
  onDragStart?: (appointmentId: string, data: AppointmentCardData, x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  dragState?: { isDragging: boolean; appointmentId: string | null; currentSnapY?: number };
  loading?: boolean;
  columnWidth?: number;
}

export default function DayView({
  date,
  appointments,
  onAppointmentPress,
  onAppointmentContextMenu,
  onStatusChange,
  onSlotPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragState,
  loading,
  columnWidth = 400,
}: DayViewProps) {
  const { colors } = useTheme();
  const today = new Date();

  const dayAppts = useMemo(() => {
    return appointments.filter(a => {
      const d = new Date(a.start_time);
      return d.toDateString() === date.toDateString();
    });
  }, [appointments, date]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonLoader variant="grid" />
      </View>
    );
  }

  const gridWidth = Math.max(columnWidth, 300);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        <View style={styles.gridRow}>
          {/* Time labels */}
          <View style={[styles.timeColumn, { width: 44 }]}>
            {HOURS.map((hour) => (
              <View key={hour} style={{ height: HOUR_HEIGHT, justifyContent: 'flex-start' }}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>
                  {`${hour.toString().padStart(2, '0')}:00`}
                </Text>
              </View>
            ))}
          </View>

          {/* Day column */}
          <View style={[styles.dayColumn, { width: gridWidth, borderRightColor: colors.border + '40' }]}>
            {/* Hour lines */}
            {HOURS.map((hour) => (
              <View
                key={hour}
                style={[styles.hourLine, { top: (hour - 6) * HOUR_HEIGHT, backgroundColor: colors.border }]}
              >
                {/* Add appointment button */}
                {onSlotPress && (
                  <TouchableOpacity
                    style={[styles.addBtn, { top: 2, right: 2 }]}
                    onPress={() => onSlotPress(date, hour)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Plus size={10} color={colors.textSecondary + '60'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Half-hour lines */}
            {HOURS.map((hour) => (
              <View
                key={`half-${hour}`}
                style={[styles.halfHourLine, { top: (hour - 6) * HOUR_HEIGHT + HOUR_HEIGHT / 2, backgroundColor: colors.border + '60' }]}
              />
            ))}

            {/* Appointments */}
            {dayAppts.map((appt) => {
              const startDate = new Date(appt.start_time);
              const endDate = appt.end_time ? new Date(appt.end_time) : new Date(startDate.getTime() + 45 * 60000);
              const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
              const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
              const top = ((startMinutes - 360) / 60) * HOUR_HEIGHT;
              const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;

              return (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  top={top}
                  height={height}
                  onPress={onAppointmentPress}
                  onContextMenu={onAppointmentContextMenu}
                  onStatusChange={onStatusChange}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragEnd={onDragEnd}
                  isDragging={dragState?.isDragging && dragState?.appointmentId === appt.id}
                />
              );
            })}

            {/* Current time line */}
            {date.toDateString() === today.toDateString() && <CurrentTimeLine hourHeight={HOUR_HEIGHT} startHour={6} />}

            {/* Empty state */}
            {dayAppts.length === 0 && (
              <View style={styles.emptyState}>
                <EmptyState
                  title="Sin citas este día"
                  subtitle="No hay citas programadas"
                />
              </View>
            )}

            {/* Time-snap indicator */}
            {dragState?.isDragging && dragState?.currentSnapY != null && (
              <View style={[styles.snapLine, { top: dragState.currentSnapY, backgroundColor: colors.primary }]} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  timeColumn: {
    paddingTop: 0,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'right',
    paddingRight: 8,
    transform: [{ translateY: -6 }],
  },
  dayColumn: {
    position: 'relative',
    borderRightWidth: StyleSheet.hairlineWidth,
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
  emptyState: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  snapLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 50,
    opacity: 0.7,
  },
  addBtn: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
});
