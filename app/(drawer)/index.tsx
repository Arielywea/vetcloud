import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useNotes, useFavorites, useClinicalRecords, useInventory } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import TaskWidget from '../../components/TaskWidget';
import AgendaWidget from '../../components/AgendaWidget';
import ReminderWidget from '../../components/ReminderWidget';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { pets } = usePets();
  const { appointments } = useAppointments();
  const { notes } = useNotes();
  const { favorites } = useFavorites();
  const { records: clinicalRecords } = useClinicalRecords();
  const { lowStockItems } = useInventory();

  const recentRecords = useMemo(() => {
    return [...clinicalRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [clinicalRecords]);

  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  const STATS = [
    { label: 'Pacientes', value: pets.length, icon: 'dog', color: colors.primary, route: '/(drawer)/pacientes' },
    { label: 'Citas Hoy', value: appointments.filter(a => a.start_time.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, icon: 'calendar-clock', color: colors.info, route: '/(drawer)/agenda' },
    { label: 'Notas', value: notes.length, icon: 'note-text', color: colors.warning, route: '/(drawer)/notes' },
    { label: 'Favoritas', value: favorites.length, icon: 'heart', color: colors.error, route: undefined },
  ];

  const QUICK_ACTIONS = [
    { label: 'Enfermedades', icon: 'medical-bag', color: colors.primary, route: '/(drawer)/diseases' },
    { label: 'Agenda', icon: 'calendar-clock', color: colors.info, route: '/(drawer)/agenda' },
    { label: 'Nuevo Paciente', icon: 'plus-circle', color: colors.success, route: '/(drawer)/add-paciente' },
    { label: 'Notas', icon: 'note-text', color: colors.warning, route: '/(drawer)/notes' },
    { label: 'Inventario', icon: 'package-variant', color: colors.info, route: '/(drawer)/inventario' },
  ];

  const RECORD_TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
    consulta: { icon: 'stethoscope', color: colors.info },
    vacuna: { icon: 'needle', color: colors.success },
    cirugia: { icon: 'scissors-cutting', color: colors.error },
    control: { icon: 'clipboard-check', color: colors.warning },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Greeting Card */}
      <Card style={[styles.greetingCard, { backgroundColor: isDark ? colors.surfaceVariant : colors.primary }]}>
        <Card.Content>
          <Text style={styles.greetingEmoji}>🐶</Text>
          <Text variant="headlineSmall" style={[styles.greetingText, { color: isDark ? colors.primary : '#FFFFFF' }]}>
            Hola, {user?.name || 'Usuario'}
          </Text>
          <Text style={[styles.dateText, { color: isDark ? colors.textSecondary : '#FFFFFFBB' }]}>{todayStr}</Text>
          <Text style={[styles.subtitleText, { color: isDark ? colors.textSecondary : '#FFFFFF99' }]}>
            ¿Cómo podemos ayudar hoy?
          </Text>
        </Card.Content>
      </Card>

      {/* Stats Row */}
      <View style={styles.statsGrid}>
        {STATS.map((stat) => (
          <Card key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface }]} onPress={() => stat.route && router.push(stat.route as any)}>
            <Card.Content style={styles.statContent}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={22} color={stat.color} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Task Widget */}
      <TaskWidget appointments={appointments} clinicalRecords={clinicalRecords} lowStockItems={lowStockItems} />

      {/* Agenda Widget */}
      <AgendaWidget appointments={appointments} />

      {/* Reminder Widget */}
      <ReminderWidget />

      {/* Fichas Clínicas Recientes */}
      {recentRecords.length > 0 && (
        <View style={styles.section}>
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text }]}>Fichas Clínicas Recientes</Text>
          {recentRecords.map((record) => {
            const config = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.consulta;
            return (
              <Card key={record.id} style={[styles.recordCard, { backgroundColor: colors.surface }]} onPress={() => router.push(`/pet/${record.pet_id}`)}>
                <Card.Content style={styles.recordRow}>
                  <View style={[styles.recordIcon, { backgroundColor: config.color + '20' }]}>
                    <MaterialCommunityIcons name={config.icon as any} size={18} color={config.color} />
                  </View>
                  <View style={styles.recordInfo}>
                    <Text style={[styles.recordType, { color: colors.text }]}>{record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1)}</Text>
                    <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                      {new Date(record.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textLight} />
                </Card.Content>
              </Card>
            );
          })}
        </View>
      )}

      {/* Accesos Rápidos */}
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 12 }]}>Accesos Rápidos</Text>
      <View style={styles.quickGrid}>
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity key={action.label} style={[styles.quickCard, { backgroundColor: colors.surface }]} onPress={() => router.push(action.route as any)}>
            <MaterialCommunityIcons name={action.icon as any} size={26} color={action.color} />
            <Text style={[styles.quickLabel, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  greetingCard: { margin: 12, borderRadius: 16, elevation: 2 },
  greetingEmoji: { fontSize: 28, marginBottom: 4 },
  greetingText: { fontWeight: '800' },
  dateText: { marginTop: 4, textTransform: 'capitalize', fontSize: 13 },
  subtitleText: { marginTop: 6, fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, marginBottom: 10, justifyContent: 'space-between' },
  statCard: { width: '47%', borderRadius: 12, elevation: 1 },
  statContent: { alignItems: 'center', paddingVertical: 10 },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statNumber: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },
  section: { marginHorizontal: 12, marginBottom: 10 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  recordCard: { marginBottom: 6, borderRadius: 10, elevation: 1 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recordIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1 },
  recordType: { fontWeight: '600', fontSize: 13 },
  recordDate: { fontSize: 11, marginTop: 2 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, justifyContent: 'space-between' },
  quickCard: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 1, gap: 6 },
  quickLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
