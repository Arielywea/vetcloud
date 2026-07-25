import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import { Appointment } from '../../services/directus';
import MonthGrid from './MonthGrid';

interface AgendaSidebarProps {
  selectedDate: string;
  monthDots: Record<string, { color: string }[]>;
  dayAppointments: Appointment[];
  typeFilter: string;
  onDayPress: (date: string) => void;
  onTypeFilterChange: (type: string) => void;
  onMonthChange?: (direction: -1 | 1) => void;
}

const TYPE_OPTIONS = [
  { key: 'all', label: 'Todos' },
  { key: 'consulta', label: 'Consulta' },
  { key: 'vacuna', label: 'Vacuna' },
  { key: 'cirugia', label: 'Cirugía' },
  { key: 'control', label: 'Control' },
  { key: 'terreno', label: 'Terreno' },
];

export default function AgendaSidebar({
  selectedDate,
  monthDots,
  dayAppointments,
  typeFilter,
  onDayPress,
  onTypeFilterChange,
  onMonthChange,
}: AgendaSidebarProps) {
  const { colors } = useTheme();

  const daySummary = useMemo(() => {
    const filtered = typeFilter === 'all'
      ? dayAppointments
      : dayAppointments.filter((a) => a.appointment_type === typeFilter);
    return {
      total: filtered.length,
      programadas: filtered.filter((a) => !a.end_time).length,
      completadas: filtered.filter((a) => a.end_time).length,
    };
  }, [dayAppointments, typeFilter]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface }]} showsVerticalScrollIndicator={false}>
      {/* Mini Calendar */}
      <MonthGrid
        selectedDate={selectedDate}
        monthDots={monthDots}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
      />

      {/* Quick Filters */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Filtros Rápidos</Text>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Tipo de Cita</Text>
        <View style={styles.filterChips}>
          {TYPE_OPTIONS.map((opt) => {
            const active = typeFilter === opt.key;
            const chipColor = opt.key === 'all' ? colors.primary : APPOINTMENT_TYPE_COLORS[opt.key] || colors.primary;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? chipColor + '18' : colors.surfaceVariant,
                    borderColor: active ? chipColor : 'transparent',
                  },
                ]}
                onPress={() => onTypeFilterChange(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, { color: active ? chipColor : colors.textSecondary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Day Summary */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Resumen del Día</Text>
        <Text style={[styles.summaryDate, { color: colors.text }]}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Programadas</Text>
          <Text style={[styles.summaryCount, { color: colors.text }]}>{daySummary.programadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Completadas</Text>
          <Text style={[styles.summaryCount, { color: colors.text }]}>{daySummary.completadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.summaryLabel, { color: colors.text, fontWeight: TYPOGRAPHY.weights.bold }]}>Total</Text>
          <Text style={[styles.summaryCount, { color: colors.text, fontWeight: TYPOGRAPHY.weights.bold }]}>{daySummary.total}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderLeftWidth: 1,
    borderLeftColor: '#DDE3EC',
    paddingTop: SPACING.md,
  },
  section: {
    padding: SPACING.md,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  summaryDate: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'capitalize',
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  summaryCount: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
