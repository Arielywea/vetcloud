import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Appointment, ClinicalRecord, InventoryItem } from '../services/directus';

interface TaskWidgetProps {
  appointments: Appointment[];
  clinicalRecords: ClinicalRecord[];
  lowStockItems?: InventoryItem[];
}

interface TaskItem {
  id: string;
  label: string;
  icon: string;
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

    // Vaccination reminders for this week
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
          icon: 'needle',
          color: '#43A047',
          priority: 'high',
        });
      });

    // Follow-up calls from recent consultations (last 7 days)
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    clinicalRecords
      .filter(r => r.record_type === 'consulta' && new Date(r.date) >= weekAgo)
      .slice(0, 3)
      .forEach(r => {
        items.push({
          id: `call-${r.id}`,
          label: `Llamar tutor follow-up`,
          icon: 'phone',
          color: colors.info,
          priority: 'medium',
        });
      });

    // Dynamic low-stock inventory items
    lowStockItems.slice(0, 3).forEach(item => {
      items.push({
        id: `stock-${item.id}`,
        label: `Renovar ${item.name} (quedan ${item.current_stock} ${item.unit})`,
        icon: 'package-variant',
        color: item.current_stock <= 0 ? colors.error : colors.warning,
        priority: item.current_stock <= 0 ? 'high' : 'medium',
      });
    });

    // Static fallback if no low stock items
    if (lowStockItems.length === 0) {
      items.push({
        id: 'supplies',
        label: 'Inventario al día',
        icon: 'check-circle',
        color: colors.success,
        priority: 'low',
      });
    }

    return items.slice(0, 5);
  }, [appointments, clinicalRecords, lowStockItems, colors]);

  if (tasks.length === 0) return null;

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="clipboard-check" size={20} color={colors.primary} />
          <Text variant="titleSmall" style={[styles.title, { color: colors.text }]}>Panel de Tareas</Text>
        </View>
        {tasks.map((task) => (
          <View key={task.id} style={[styles.taskRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.taskIcon, { backgroundColor: task.color + '20' }]}>
              <MaterialCommunityIcons name={task.icon as any} size={16} color={task.color} />
            </View>
            <Text style={[styles.taskLabel, { color: colors.text }]} numberOfLines={1}>{task.label}</Text>
            <View style={[styles.priorityDot, { backgroundColor: task.priority === 'high' ? colors.error : task.priority === 'medium' ? colors.warning : colors.success }]} />
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 12, marginBottom: 10, borderRadius: 12, elevation: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { fontWeight: '700', flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, gap: 10 },
  taskIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  taskLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
});
