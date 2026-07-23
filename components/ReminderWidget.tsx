import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useReminders } from '../hooks/useDirectus';
import { useTheme } from '../contexts/ThemeContext';

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacuna': return 'needle';
      case 'desparasitacion': return 'bug';
      case 'cita': return 'calendar-clock';
      case 'post_operatorio': return 'medical-bag';
      case 'control': return 'clipboard-check';
      default: return 'bell';
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push('/(drawer)/reminders')}>
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name="bell-ring" size={18} color="#FF8F00" />
          <Text style={[styles.title, { color: colors.text }]}>Próximos Recordatorios</Text>
          <Chip compact style={styles.countChip} textStyle={styles.countText}>{pending.length}</Chip>
        </View>
        {pending.map((r) => (
          <View key={r.id} style={styles.row}>
            <MaterialCommunityIcons name={getTypeIcon(r.reminder_type) as any} size={16} color="#FF8F00" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.reminderTitle, { color: colors.text }]} numberOfLines={1}>{r.title}</Text>
              <Text style={[styles.reminderDate, { color: colors.textSecondary }]}>
                {new Date(r.scheduled_for).toLocaleDateString('es-CL')}
              </Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', flex: 1 },
  countChip: { height: 22, backgroundColor: '#FFF3E0' },
  countText: { fontSize: 11, color: '#FF8F00', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  reminderTitle: { fontSize: 13, fontWeight: '500' },
  reminderDate: { fontSize: 11, marginTop: 2 },
});
