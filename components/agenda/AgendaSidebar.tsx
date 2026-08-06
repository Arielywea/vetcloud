import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS, APPOINTMENT_STATUS_LIST } from '../../constants/colors';

interface Filters {
  veterinarian: string;
  species: string;
  appointmentType: string;
  status: string;
}

interface AgendaSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  veterinarians: string[];
  appointmentTypes: string[];
  statuses: string[];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_NAMES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const STATUS_OPTIONS = [
  { key: 'all', label: 'Todas', color: '#6B7280', dot: '#6B7280' },
  ...APPOINTMENT_STATUS_LIST,
];

export default function AgendaSidebar({
  selectedDate,
  onDateSelect,
  filters,
  onFilterChange,
  veterinarians,
  appointmentTypes,
  statuses,
}: AgendaSidebarProps) {
  const { colors } = useTheme();
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onDateSelect(d);
  };

  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onDateSelect(d);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface, borderLeftColor: colors.border }]} showsVerticalScrollIndicator={false}>
      {/* Mini calendar */}
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={prevMonth}>
            <Text style={[styles.calNav, { color: colors.primary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.calTitle, { color: colors.text }]}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Text style={[styles.calNav, { color: colors.primary }]}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dayNamesRow}>
          {DAY_NAMES.map((d) => (
            <Text key={d} style={[styles.dayName, { color: colors.textSecondary }]}>{d}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {calendarDays.map((day, i) => {
            if (day === null) return <View key={`empty-${i}`} style={styles.dayCell} />;
            const isSelected = day === selectedDate.getDate() && month === selectedDate.getMonth();
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: colors.primary, borderRadius: 14 },
                  isToday && !isSelected && { borderColor: colors.primary, borderWidth: 1, borderRadius: 14 },
                ]}
                onPress={() => onDateSelect(new Date(year, month, day))}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isSelected ? '#FFF' : isToday ? colors.primary : colors.text,
                      fontWeight: isToday || isSelected ? '700' : '400',
                    },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Filters */}
      <View style={[styles.filterSection, { borderTopColor: colors.border }]}>
        <Text style={[styles.filterTitle, { color: colors.text }]}>Filtros</Text>

        {/* Vet filter */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Veterinario</Text>
          <View style={styles.filterChips}>
            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: !filters.veterinarian ? colors.primary + '20' : colors.background, borderColor: !filters.veterinarian ? colors.primary : colors.border },
              ]}
              onPress={() => onFilterChange({ ...filters, veterinarian: '' })}
            >
              <Text style={[styles.chipText, { color: !filters.veterinarian ? colors.primary : colors.textSecondary }]}>Todos</Text>
            </TouchableOpacity>
            {veterinarians.map((vet) => (
              <TouchableOpacity
                key={vet}
                style={[
                  styles.chip,
                  { backgroundColor: filters.veterinarian === vet ? colors.primary + '20' : colors.background, borderColor: filters.veterinarian === vet ? colors.primary : colors.border },
                ]}
                onPress={() => onFilterChange({ ...filters, veterinarian: vet })}
              >
                <Text style={[styles.chipText, { color: filters.veterinarian === vet ? colors.primary : colors.textSecondary }]} numberOfLines={1}>{vet}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status filter */}
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Estado</Text>
          <View style={styles.filterChips}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.chip,
                  { backgroundColor: filters.status === opt.key || (!filters.status && opt.key === 'all') ? colors.primary + '20' : colors.background, borderColor: filters.status === opt.key || (!filters.status && opt.key === 'all') ? colors.primary : colors.border },
                ]}
                onPress={() => onFilterChange({ ...filters, status: opt.key === 'all' ? '' : opt.key })}
              >
                <View style={[styles.chipDot, { backgroundColor: opt.color }]} />
                <Text
                  style={[
                    styles.chipText,
                    { color: filters.status === opt.key || (!filters.status && opt.key === 'all') ? colors.primary : colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderLeftWidth: 1,
  },
  calendarSection: {
    padding: SPACING.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  calNav: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  calTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  dayNamesRow: {
    flexDirection: 'row',
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  filterSection: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  filterTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.sm,
  },
  filterGroup: {
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
    letterSpacing: 0.5, textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
