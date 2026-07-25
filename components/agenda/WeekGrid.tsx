import React, { useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import TimeColumn from './TimeColumn';
import AppointmentBlock, { AppointmentBlockData } from './AppointmentBlock';
import { PositionedAppointment } from './useAgendaLayout';

interface WeekGridProps {
  hours: number[];
  hourHeight: number;
  weekAppointments: PositionedAppointment[];
  onSlotPress?: (date: string, hour: number) => void;
  onAppointmentPress?: (appointment: AppointmentBlockData) => void;
  dayLabels?: string[];
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function WeekGrid({
  hours,
  hourHeight,
  weekAppointments,
  onSlotPress,
  onAppointmentPress,
  dayLabels,
}: WeekGridProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const gridWidth = screenWidth - (isMobile ? 8 : 288);
  const colWidth = gridWidth / 7;

  const today = new Date().toISOString().slice(0, 10);

  const getDayDates = useCallback(() => {
    const dates: string[] = [];
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const dayDates = getDayDates();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        <View style={styles.timeGutter} />
        {dayDates.map((date, i) => {
          const d = new Date(date + 'T12:00:00');
          const isToday = date === today;
          return (
            <View key={date} style={[styles.dayHeader, { width: colWidth }]}>
              <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                {DAY_NAMES[i]}
              </Text>
              <View style={[styles.dayNumberWrap, isToday && { backgroundColor: colors.primary }]}>
                <Text style={[styles.dayNumber, { color: isToday ? '#FFF' : colors.text }]}>
                  {d.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Grid */}
      <ScrollView
        ref={scrollRef}
        style={styles.gridScroll}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridRow}>
          <TimeColumn hours={hours} hourHeight={hourHeight} color={colors.textLight} />
          <View style={styles.gridArea}>
            {/* Hour lines */}
            {hours.map((hour) => (
              <View
                key={hour}
                style={[styles.hourLine, { top: (hour - 8) * hourHeight, borderColor: colors.border }]}
              />
            ))}

            {/* Day columns with tap targets */}
            {dayDates.map((date, dayIdx) => (
              <View
                key={date}
                style={[styles.dayColumn, { left: dayIdx * colWidth, width: colWidth }]}
              >
                {hours.map((hour) => (
                  <View
                    key={hour}
                    style={[
                      styles.slotTarget,
                      {
                        top: (hour - 8) * hourHeight,
                        height: hourHeight,
                      },
                    ]}
                    onTouchEnd={() => onSlotPress?.(date, hour)}
                  />
                ))}
              </View>
            ))}

            {/* Appointment blocks */}
            {weekAppointments.map((pos) => (
              <View
                key={pos.appointment.id}
                style={{
                  position: 'absolute',
                  left: pos.dayIndex * colWidth + (pos.column * colWidth) / pos.totalColumns,
                  width: colWidth / pos.totalColumns - 2,
                }}
              >
                <AppointmentBlock
                  appointment={pos.appointment}
                  top={pos.top}
                  height={pos.height}
                  onPress={onAppointmentPress}
                  compact={colWidth / pos.totalColumns < 80}
                />
              </View>
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
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE3EC',
    paddingBottom: SPACING.sm,
  },
  timeGutter: {
    width: 52,
  },
  dayHeader: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  dayName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumberWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dayNumber: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  gridScroll: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: SPACING.xl,
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
    borderTopColor: '#DDE3EC',
  },
  dayColumn: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  slotTarget: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
