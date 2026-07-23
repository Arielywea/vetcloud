import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BellRing, Syringe, Bug, CalendarClock, Stethoscope, ClipboardCheck, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useReminders } from '../hooks/useDirectus';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/tokens';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'vacuna': return <Syringe size={16} color="#FF8F00" />;
    case 'desparasitacion': return <Bug size={16} color="#FF8F00" />;
    case 'cita': return <CalendarClock size={16} color="#FF8F00" />;
    case 'post_operatorio': return <Stethoscope size={16} color="#FF8F00" />;
    case 'control': return <ClipboardCheck size={16} color="#FF8F00" />;
    default: return <Bell size={16} color="#FF8F00" />;
  }
};

export default function ReminderWidget() {
  const { colors } = useTheme();
  const router = useRouter();
  const { reminders, loading, refresh } = useReminders({ upcoming: 'true' });

  useEffect(() => {
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const pending = reminders.filter(r => r.status === 'pending').slice(0, 3);

  if (loading || pending.length === 0) return null;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm]}
    >
      <View style={styles.header}>
        <BellRing size={18} color="#FF8F00" />
        <Text style={[styles.title, { color: colors.text }]}>Próximos Recordatorios</Text>
        <View style={[styles.countChip, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.countText}>{pending.length}</Text>
        </View>
      </View>
      {pending.map((r) => (
        <View key={r.id} style={[styles.row, { borderTopColor: colors.border }]}>
          {getTypeIcon(r.reminder_type)}
          <View style={styles.reminderInfo}>
            <Text style={[styles.reminderTitle, { color: colors.text }]} numberOfLines={1}>{r.title}</Text>
            <Text style={[styles.reminderDate, { color: colors.textSecondary }]}>
              {new Date(r.scheduled_for).toLocaleDateString('es-CL')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: '#F0F0F0' },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  title: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  countChip: { height: 22, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm },
  countText: { fontSize: TYPOGRAPHY.sizes.xs, color: '#FF8F00', fontWeight: TYPOGRAPHY.weights.bold },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 0.5 },
  reminderInfo: { flex: 1 },
  reminderTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  reminderDate: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: 2 },
});
