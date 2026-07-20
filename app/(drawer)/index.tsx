import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useNotes, useFavorites } from '../../hooks/useDirectus';
import { APP_COLORS } from '../../constants/colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pets } = usePets();
  const { appointments } = useAppointments();
  const { notes } = useNotes();
  const { favorites } = useFavorites();

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(a => new Date(a.start_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 3);
  }, [appointments]);

  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const TYPE_COLORS: Record<string, string> = {
    consulta: '#DBEAFE',
    vacuna: '#D1FAE5',
    cirugia: '#FCE7F3',
    control: '#FEF3C7',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        <Text variant="headlineSmall" style={styles.greetingText}>
          Hola, {user?.name || 'Usuario'} 👋
        </Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard} onPress={() => router.push('/(drawer)/pacientes')}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
              <MaterialCommunityIcons name="dog" size={24} color={APP_COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{pets.length}</Text>
            <Text style={styles.statLabel}>Pacientes</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} onPress={() => router.push('/(drawer)/agenda')}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#1976D2" />
            </View>
            <Text style={styles.statNumber}>{appointments.length}</Text>
            <Text style={styles.statLabel}>Citas</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} onPress={() => router.push('/(drawer)/notes')}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="note-text" size={24} color="#F57C00" />
            </View>
            <Text style={styles.statNumber}>{notes.length}</Text>
            <Text style={styles.statLabel}>Notas</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
              <MaterialCommunityIcons name="heart" size={24} color="#E53935" />
            </View>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoritas</Text>
          </Card.Content>
        </Card>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Accesos Rápidos</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(drawer)/diseases')}>
          <MaterialCommunityIcons name="medical-bag" size={28} color={APP_COLORS.primary} />
          <Text style={styles.quickLabel}>Enfermedades</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(drawer)/agenda')}>
          <MaterialCommunityIcons name="calendar-clock" size={28} color="#1976D2" />
          <Text style={styles.quickLabel}>Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(drawer)/add-paciente')}>
          <MaterialCommunityIcons name="plus-circle" size={28} color="#43A047" />
          <Text style={styles.quickLabel}>Nueva Mascota</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(drawer)/notes')}>
          <MaterialCommunityIcons name="note-text" size={28} color="#F57C00" />
          <Text style={styles.quickLabel}>Notas</Text>
        </TouchableOpacity>
      </View>

      {upcomingAppointments.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>Próximas Citas</Text>
          {upcomingAppointments.map((appt) => (
            <Card key={appt.id} style={styles.appointmentCard}>
              <Card.Content>
                <View style={styles.appointmentRow}>
                  <View style={[styles.appointmentDot, { backgroundColor: TYPE_COLORS[appt.appointment_type] || '#E8EDF2' }]} />
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentName}>{appt.patient_name}</Text>
                    <Text style={styles.appointmentTime}>
                      {new Date(appt.start_time).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · {new Date(appt.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.appointmentType}>{appt.appointment_type}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { paddingBottom: 32 },
  greeting: { padding: 20, paddingBottom: 8 },
  greetingText: { fontWeight: '800', color: APP_COLORS.text },
  dateText: { color: APP_COLORS.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    borderRadius: 14,
    backgroundColor: APP_COLORS.surface,
    elevation: 1,
  },
  statContent: { alignItems: 'center', paddingVertical: 12 },
  statIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: '800', color: APP_COLORS.text },
  statLabel: { fontSize: 12, color: APP_COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontWeight: '700', color: APP_COLORS.text, paddingHorizontal: 16, marginBottom: 12, marginTop: 4 },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickCard: {
    width: '47%',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 1,
    gap: 8,
  },
  quickLabel: { fontSize: 13, fontWeight: '600', color: APP_COLORS.text, textAlign: 'center' },
  appointmentCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
  },
  appointmentRow: { flexDirection: 'row', alignItems: 'center' },
  appointmentDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  appointmentInfo: { flex: 1 },
  appointmentName: { fontWeight: '700', color: APP_COLORS.text, fontSize: 14 },
  appointmentTime: { fontSize: 12, color: APP_COLORS.textSecondary, marginTop: 2 },
  appointmentType: { fontSize: 11, color: APP_COLORS.textSecondary, textTransform: 'capitalize' },
});
