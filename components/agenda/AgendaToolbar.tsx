import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Calendar, Filter } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface AgendaToolbarProps {
  view: 'day' | 'week' | 'month';
  selectedDate: string;
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
  onNewAppointment: () => void;
}

const views = [
  { key: 'day' as const, label: 'Día' },
  { key: 'week' as const, label: 'Semana' },
  { key: 'month' as const, label: 'Mes' },
];

export default function AgendaToolbar({
  view,
  selectedDate,
  onViewChange,
  onNavigate,
  onToday,
  onNewAppointment,
}: AgendaToolbarProps) {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  const getDateLabel = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (view === 'day') {
      return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    if (view === 'week') {
      const end = new Date(d);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + diff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const startStr = monday.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
      const endStr = sunday.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${startStr} – ${endStr}`;
    }
    return d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* Left */}
      <View style={styles.left}>
        {!isMobile && (
          <TouchableOpacity
            style={[styles.newButton, { backgroundColor: colors.primary }]}
            onPress={onNewAppointment}
            activeOpacity={0.7}
          >
            <Plus size={16} color="#FFF" />
            <Text style={styles.newButtonText}>Nueva Cita</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.todayButton, { borderColor: colors.border }]} onPress={onToday}>
          <Text style={[styles.todayText, { color: colors.text }]}>Hoy</Text>
        </TouchableOpacity>
      </View>

      {/* Center: navigation */}
      <View style={styles.center}>
        <TouchableOpacity onPress={() => onNavigate(-1)} style={styles.navBtn}>
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.dateRange}>
          <Calendar size={14} color={colors.textSecondary} />
          <Text style={[styles.dateLabel, { color: colors.text }]}>{getDateLabel()}</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate(1)} style={styles.navBtn}>
          <ChevronRight size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Right: view switcher */}
      <View style={styles.right}>
        <View style={[styles.viewSwitcher, { backgroundColor: colors.surfaceVariant }]}>
          {views.map((v) => (
            <TouchableOpacity
              key={v.key}
              style={[
                styles.viewBtn,
                view === v.key && { backgroundColor: colors.primary },
              ]}
              onPress={() => onViewChange(v.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.viewBtnText,
                  { color: view === v.key ? '#FFF' : colors.textSecondary },
                ]}
              >
                {v.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {!isMobile && (
          <TouchableOpacity style={[styles.filterButton, { borderColor: colors.border }]}>
            <Filter size={14} color={colors.textSecondary} />
            <Text style={[styles.filterText, { color: colors.textSecondary }]}>Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    gap: SPACING.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  newButtonText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  todayButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  todayText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  navBtn: {
    padding: SPACING.xs,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    minWidth: 140,
    textAlign: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  viewSwitcher: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 2,
  },
  viewBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm - 2,
  },
  viewBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
