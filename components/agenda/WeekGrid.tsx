import React, { useRef, useMemo } from 'react';
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
  selectedDate: string;
  onSlotPress?: (date: string, hour: number) => void;
  onAppointmentPress?: (appointment: AppointmentBlockData) => void;
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function WeekGrid({
  hours,
  hourHeight,
  weekAppointments,
  selectedDate,
  onSlotPress,
  onAppointmentPress,
}: WeekGridProps) {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const gridWidth = screenWidth - (isMobile ? 8 : 288);
  const colWidth = gridWidth / 7;
  const totalGridHeight = hours.length * hourHeight;

  const today = new Date().toISOString().slice(0, 10);

  const dayDates = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(monday);
      dd.setDate(monday.getDate() + i);
      const y = dd.getFullYear();
      const m = String(dd.getMonth() + 1).padStart(2, '0');
      const dayNum = String(dd.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${dayNum}`);
    }
    return dates;
  }, [selectedDate]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        <View style={styles.timeGutter} />
        {dayDates.map((date, i) => {
          const d = new Date(date + 'T12:00:00');
          const isToday = date === today;
          const isSelected = date === selectedDate;
          return (
            <View key={date} style={[styles.dayHeader, { width: colWidth }]}>
              <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                {DAY_NAMES[i]}
              </Text>
              <View
                style={[
                  styles.dayNumberWrap,
                  isSelected && { backgroundColor: colors.primary },
                  isToday && !isSelected && styles.todayRing,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    {
                      color: isSelected ? '#FFF' : isToday ? colors.primary : colors.text,
                      fontWeight: isToday || isSelected ? TYPOGRAPHY.weights.bold : TYPOGRAPHY.weights.semibold,
                    },
                  ]}
                >
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
                        top: (hour - hours[0]) * hourHeight,
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
    paddingBottom: SPACING.xs,
  },
  timeGutter: {
    width: 44,
  },
  dayHeader: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  dayName: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNumberWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  todayRing: {
    borderWidth: 1.5,
    borderColor: '#C9A227',
  },
  dayNumber: {
    fontSize: 13,
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
