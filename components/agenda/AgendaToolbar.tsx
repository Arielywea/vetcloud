import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import {
  Plus, UserPlus, ChevronLeft, ChevronRight, CalendarDays,
  Printer, Download, LayoutGrid, List, Calendar
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

type ViewMode = 'week' | 'day' | 'month';

interface AgendaToolbarProps {
  selectedDate: Date;
  viewMode: ViewMode;
  onDateChange: (date: Date) => void;
  onViewChange: (mode: ViewMode) => void;
  onNewAppointment?: () => void;
  onNewPatient?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const VIEW_ICONS: Record<ViewMode, React.ReactNode> = {
  week: <LayoutGrid size={14} />,
  day: <List size={14} />,
  month: <Calendar size={14} />,
};

const VIEW_LABELS: Record<ViewMode, string> = {
  week: 'Semana',
  day: 'Día',
  month: 'Mes',
};

export default function AgendaToolbar({
  selectedDate,
  viewMode,
  onDateChange,
  onViewChange,
  onNewAppointment,
  onNewPatient,
  onPrint,
  onExport,
}: AgendaToolbarProps) {
  const { colors } = useTheme();

  const navigateDate = (direction: -1 | 1) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    else if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
    else newDate.setMonth(newDate.getMonth() + direction);
    onDateChange(newDate);
  };

  const goToToday = () => onDateChange(new Date());

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Left: Navigation */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={onNewAppointment}
        >
          <Plus size={16} color="#FFF" />
          <Text style={styles.primaryBtnText}>Nueva Cita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={onNewPatient}
        >
          <UserPlus size={14} color={colors.text} />
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Paciente</Text>
        </TouchableOpacity>
      </View>

      {/* Center: Date navigation */}
      <View style={styles.centerSection}>
        <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.navBtn}>
          <ChevronLeft size={18} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday} style={styles.dateBtn}>
          <CalendarDays size={14} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDate(1)} style={styles.navBtn}>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Right: View switcher + actions */}
      <View style={styles.section}>
        <View style={[styles.viewSwitcher, { backgroundColor: colors.background, borderRadius: RADIUS.sm }]}>
          {(['week', 'day', 'month'] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewBtn,
                viewMode === mode && { backgroundColor: colors.primary },
              ]}
              onPress={() => onViewChange(mode)}
            >
              <View style={{ color: viewMode === mode ? '#FFF' : colors.textSecondary }}>
                {VIEW_ICONS[mode]}
              </View>
              <Text
                style={[
                  styles.viewBtnText,
                  { color: viewMode === mode ? '#FFF' : colors.textSecondary },
                ]}
              >
                {VIEW_LABELS[mode]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={onPrint} style={[styles.iconBtn, { backgroundColor: colors.background }]}>
          <Printer size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onExport} style={[styles.iconBtn, { backgroundColor: colors.background }]}>
          <Download size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  centerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  primaryBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 4,
  },
  secondaryBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
  navBtn: {
    padding: 4,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
  },
  viewSwitcher: {
    flexDirection: 'row',
    padding: 2,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm - 2,
    gap: 4,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
