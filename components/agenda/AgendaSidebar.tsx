import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import MonthGrid from './MonthGrid';

interface AgendaSidebarProps {
  selectedDate: string;
  monthDots: Record<string, { color: string }[]>;
  daySummary: {
    programadas: number;
    completadas: number;
    pendientes: number;
    canceladas: number;
    total: number;
  };
  typeFilter: string;
  statusFilter: string;
  vetFilter: string;
  uniqueVets: string[];
  onDayPress: (date: string) => void;
  onTypeFilterChange: (type: string) => void;
  onStatusFilterChange: (status: string) => void;
  onVetFilterChange: (vet: string) => void;
  onClearFilters: () => void;
  onMonthChange?: (direction: -1 | 1) => void;
}

const TYPE_OPTIONS = [
  { key: 'all', label: 'Todos los tipos' },
  { key: 'consulta', label: 'Consulta General' },
  { key: 'vacuna', label: 'Vacunación' },
  { key: 'examenes', label: 'Exámenes' },
  { key: 'cirugia', label: 'Cirugía' },
  { key: 'hospitalizacion', label: 'Hospitalización' },
  { key: 'control', label: 'Control' },
  { key: 'terreno', label: 'Terreno' },
];

const STATUS_OPTIONS = [
  { key: 'all', label: 'Todas' },
  { key: 'programada', label: 'Programada' },
  { key: 'completada', label: 'Completada' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'cancelada', label: 'Cancelada' },
];

export default function AgendaSidebar({
  selectedDate,
  monthDots,
  daySummary,
  typeFilter,
  statusFilter,
  vetFilter,
  uniqueVets,
  onDayPress,
  onTypeFilterChange,
  onStatusFilterChange,
  onVetFilterChange,
  onClearFilters,
  onMonthChange,
}: AgendaSidebarProps) {
  const { colors } = useTheme();

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all' || vetFilter !== 'all';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.surface, borderLeftColor: colors.border }]} showsVerticalScrollIndicator={false}>
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

        {/* Veterinario */}
        <Text style={[styles.filterLabel, { color: colors.text }]}>Veterinario</Text>
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={[
              styles.chip,
              {
                backgroundColor: vetFilter === 'all' ? colors.primary + '18' : colors.surfaceVariant,
                borderColor: vetFilter === 'all' ? colors.primary : 'transparent',
              },
            ]}
            onPress={() => onVetFilterChange('all')}
          >
            <Text style={[styles.chipText, { color: vetFilter === 'all' ? colors.primary : colors.textSecondary }]}>
              Todos
            </Text>
          </TouchableOpacity>
          {uniqueVets.map((vet) => (
            <TouchableOpacity
              key={vet}
              style={[
                styles.chip,
                {
                  backgroundColor: vetFilter === vet ? colors.primary + '18' : colors.surfaceVariant,
                  borderColor: vetFilter === vet ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => onVetFilterChange(vet)}
            >
              <Text style={[styles.chipText, { color: vetFilter === vet ? colors.primary : colors.textSecondary }]}>
                {vet}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tipo de Cita */}
        <Text style={[styles.filterLabel, { color: colors.text, marginTop: SPACING.sm }]}>Tipo de Cita</Text>
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
              >
                <Text style={[styles.chipText, { color: active ? chipColor : colors.textSecondary }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Estado */}
        <Text style={[styles.filterLabel, { color: colors.text, marginTop: SPACING.sm }]}>Estado</Text>
        <View style={styles.filterChips}>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.chip,
                {
                  backgroundColor: statusFilter === opt.key ? colors.primary + '18' : colors.surfaceVariant,
                  borderColor: statusFilter === opt.key ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => onStatusFilterChange(opt.key)}
            >
              <Text style={[styles.chipText, { color: statusFilter === opt.key ? colors.primary : colors.textSecondary }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {hasActiveFilters && (
          <TouchableOpacity style={[styles.clearButton, { borderColor: colors.border }]} onPress={onClearFilters}>
            <Text style={[styles.clearText, { color: colors.textSecondary }]}>Limpiar Filtros</Text>
          </TouchableOpacity>
        )}
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
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Citas programadas</Text>
          <Text style={[styles.summaryCount, { color: colors.text }]}>{daySummary.programadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Citas completadas</Text>
          <Text style={[styles.summaryCount, { color: colors.text }]}>{daySummary.completadas}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Citas pendientes</Text>
          <Text style={[styles.summaryCount, { color: colors.text }]}>{daySummary.pendientes}</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.summaryLabel, { color: colors.text }]}>Citas canceladas</Text>
          <Text style={[styles.summaryCount, { color: colors.text }]}>{daySummary.canceladas}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderLeftWidth: 1,
    paddingTop: SPACING.md,
  },
  section: {
    padding: SPACING.md,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
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
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  clearButton: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  clearText: {
    fontSize: TYPOGRAPHY.sizes.sm,
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
