import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ClipboardCheck, Syringe, Phone, Package, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Appointment, ClinicalRecord, InventoryItem } from '../services/directus';
import { SPACING, RADIUS, TYPOGRAPHY } from '../constants/tokens';

interface TaskWidgetProps {
  appointments: Appointment[];
  clinicalRecords: ClinicalRecord[];
  lowStockItems?: InventoryItem[];
}

interface TaskItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export default function TaskWidget({ appointments, clinicalRecords, lowStockItems = [] }: TaskWidgetProps) {
  const { colors } = useTheme();

  const tasks = useMemo(() => {
    const items: TaskItem[] = [];
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    appointments
      .filter(a => {
        if (a.appointment_type !== 'vacuna') return false;
        const d = new Date(a.start_time);
        return d >= now && d <= weekEnd;
      })
      .forEach(a => {
        items.push({
          id: `vac-${a.id}`,
          label: `Vacuna: ${a.patient_name}`,
          icon: <Syringe size={16} color="#10B981" />,
          color: '#10B981',
          priority: 'high',
        });
      });

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    clinicalRecords
      .filter(r => r.record_type === 'consulta' && new Date(r.date) >= weekAgo)
      .slice(0, 3)
      .forEach(r => {
        items.push({
          id: `call-${r.id}`,
          label: `Llamar tutor follow-up`,
          icon: <Phone size={16} color={colors.info} />,
          color: colors.info,
          priority: 'medium',
        });
      });

    lowStockItems.slice(0, 3).forEach(item => {
      items.push({
        id: `stock-${item.id}`,
        label: `Renovar ${item.name} (quedan ${item.current_stock} ${item.unit})`,
        icon: <Package size={16} color={item.current_stock <= 0 ? colors.error : colors.warning} />,
        color: item.current_stock <= 0 ? colors.error : colors.warning,
        priority: item.current_stock <= 0 ? 'high' : 'medium',
      });
    });

    if (lowStockItems.length === 0) {
      items.push({
        id: 'supplies',
        label: 'Inventario al día',
        icon: <CheckCircle size={16} color={colors.success} />,
        color: colors.success,
        priority: 'low',
      });
    }

    return items.slice(0, 5);
  }, [appointments, clinicalRecords, lowStockItems, colors]);

  if (tasks.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <ClipboardCheck size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Panel de Tareas</Text>
      </View>
      {tasks.map((task) => (
        <View key={task.id} style={[styles.taskRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.taskIcon, { backgroundColor: task.color + '18' }]}>{task.icon}</View>
          <Text style={[styles.taskLabel, { color: colors.text }]} numberOfLines={1}>{task.label}</Text>
          <View style={[styles.priorityDot, { backgroundColor: task.priority === 'high' ? colors.error : task.priority === 'medium' ? colors.warning : colors.success }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 0.5, gap: SPACING.md },
  taskIcon: { width: 32, height: 32, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  taskLabel: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
});
