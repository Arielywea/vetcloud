import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import TimeGrid, { HOUR_HEIGHT, HOURS } from './TimeGrid';
import AppointmentCard, { AppointmentCardData } from './AppointmentCard';
import DayHeader from './DayHeader';
import CurrentTimeLine from './CurrentTimeLine';
import SkeletonLoader from './SkeletonLoader';
import { SPACING } from '../../constants/tokens';

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

interface WeekViewProps {
  weekDays: Date[];
  appointments: EnrichedAppointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAppointmentPress?: (appointment: AppointmentCardData) => void;
  onAppointmentContextMenu?: (appointment: AppointmentCardData, x: number, y: number) => void;
  onSlotPress?: (date: Date, hour: number) => void;
  onDragStart?: (appointmentId: string, data: AppointmentCardData, x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  dragState?: { isDragging: boolean; appointmentId: string | null };
  loading?: boolean;
  currentUserId?: string;
}

function getApptsForDay(appts: EnrichedAppointment[], date: Date): EnrichedAppointment[] {
  const dateStr = date.toDateString();
  return appts.filter(a => new Date(a.start_time).toDateString() === dateStr);
}

function getStartHour(appts: EnrichedAppointment[], date: Date): number {
  const hours = getApptsForDay(appts, date).map(a => new Date(a.start_time).getHours());
  return hours.length > 0 ? Math.max(6, Math.min(...hours) - 1) : 6;
}

function getEndHour(appts: EnrichedAppointment[], date: Date): number {
  const hours = getApptsForDay(appts, date).map(a => {
    const end = a.end_time ? new Date(a.end_time) : new Date(new Date(a.start_time).getTime() + 45 * 60000);
    return end.getHours();
  });
  return hours.length > 0 ? Math.min(20, Math.max(...hours) + 1) : 19;
}

export default function WeekView({
  weekDays,
  appointments,
  selectedDate,
  onDateSelect,
  onAppointmentPress,
  onAppointmentContextMenu,
  onSlotPress,
  onDragStart,
  onDragMove,
  onDragEnd,
  dragState,
  loading,
  currentUserId,
}: WeekViewProps) {
  const { colors } = useTheme();

  const colWidth = useMemo(() => {
    const screenW = Dimensions.get('window').width;
    const availW = screenW - 52;
    return Math.floor(availW / 7);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonLoader variant="grid" />
      </View>
    );
  }

  const today = new Date();
  const todayStr = today.toDateString();

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={[styles.headersRow, { borderBottomColor: colors.border }]}>
        <View style={{ width: 52 }} />
        {weekDays.map((day) => {
          const dayStr = day.toDateString();
          const count = getApptsForDay(appointments, day).length;
          return (
            <DayHeader
              key={dayStr}
              dayName={day.toLocaleDateString('es-CL', { weekday: 'short' }).slice(0, 2)}
              dayNumber={day.getDate()}
              isToday={dayStr === todayStr}
              isSelected={dayStr === selectedDate.toDateString()}
              appointmentCount={count}
              width={colWidth}
            />
          );
        })}
      </View>

      {/* Scrollable grid */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingTop: 4 }} showsVerticalScrollIndicator={false}>
        <View style={styles.gridRow}>
          {/* Time labels */}
          <View style={{ width: 52 }}>
            {HOURS.map((hour) => (
              <View key={hour} style={{ height: HOUR_HEIGHT, justifyContent: 'flex-start' }}>
                <Text style={[styles.timeLabel, { color: colors.text }]}>
                  {`${hour.toString().padStart(2, '0')}:00`}
                </Text>
              </View>
            ))}
          </View>

          {/* Day columns */}
          {weekDays.map((day) => {
            const dayStr = day.toDateString();
            const dayAppts = getApptsForDay(appointments, day);

            return (
              <View
                key={dayStr}
                style={[styles.dayColumn, { width: colWidth, borderRightColor: colors.border + '40' }]}
              >
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
                        onPress={() => onSlotPress(day, hour)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Plus size={10} color={colors.textSecondary + '60'} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {/* Appointments */}
                {dayAppts.map((appt) => {
                  const startDate = new Date(appt.start_time);
                  const endDate = appt.end_time
                    ? new Date(appt.end_time)
                    : new Date(startDate.getTime() + 45 * 60000);
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
                      onDragStart={onDragStart}
                      onDragMove={onDragMove}
                      onDragEnd={onDragEnd}
                      isDragging={dragState?.isDragging && dragState?.appointmentId === appt.id}
                      compact={colWidth < 120}
                    />
                  );
                })}

                {/* Current time line (only for today) */}
                {dayStr === todayStr && (
                  <CurrentTimeLine hourHeight={HOUR_HEIGHT} startHour={6} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headersRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: SPACING.xs,
  },
  scrollArea: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  dayColumn: {
    position: 'relative',
    borderRightWidth: 1,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'right',
    paddingRight: 8,
    transform: [{ translateY: -6 }],
  },
  addBtn: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
});
