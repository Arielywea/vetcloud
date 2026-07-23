import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useNotes, useClinicalRecords, useInventory } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import { TEXT_ON_PRIMARY } from '../../constants/colors';
import NextAppointmentCard from '../../components/dashboard/NextAppointmentCard';
import PatientList from '../../components/dashboard/PatientList';
import StatsChart from '../../components/dashboard/StatsChart';
import QuickActions from '../../components/dashboard/QuickActions';
import InventoryBar from '../../components/dashboard/InventoryBar';
import ActivityFeed from '../../components/dashboard/ActivityFeed';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { colors, radius, shadows, spacing } = useTheme();
  const { pets } = usePets();
  const { appointments } = useAppointments();
  const { notes } = useNotes();
  const { records: clinicalRecords } = useClinicalRecords();
  const { lowStockItems } = useInventory();

  const todayStr = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  const recentPatients = useMemo(() => {
    return [...pets]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 4)
      .map(p => ({
        id: p.id,
        name: p.name,
        species: p.species || 'Canino',
        breed: p.breed || 'Mestizo',
        lastVisit: p.created_at
          ? new Date(p.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
          : '--',
      }));
  }, [pets]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter(a => a.start_time?.slice(0, 10) === today);
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    if (todayAppointments.length > 0) {
      const apt = todayAppointments[0];
      return {
        petName: apt.pet_name || 'Sin nombre',
        petBreed: apt.pet_breed || 'Mestizo',
        time: apt.start_time ? new Date(apt.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '--:--',
        type: apt.type || 'Consulta general',
      };
    }
    return { petName: 'Max', petBreed: 'Golden Retriever', time: '11:30 AM', type: 'Consulta general' };
  }, [todayAppointments]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Row 1: Hero + Próxima Cita */}
      <View style={styles.topRow}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Text style={[styles.heroName, { color: TEXT_ON_PRIMARY.light.default }]}>
            Bienvenido/a {user?.name?.split(' ')[0] || 'Usuario'}
          </Text>
          <Text style={[styles.heroDate, { color: TEXT_ON_PRIMARY.light.muted }]}>{todayStr}</Text>
          <Text style={[styles.heroSubtitle, { color: TEXT_ON_PRIMARY.light.subtle }]}>
            ¿Cómo podemos ayudar hoy?
          </Text>
        </View>
        <NextAppointmentCard {...nextAppointment} />
      </View>

      {/* Row 2: Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs]}>
          <View style={[styles.statIcon, { backgroundColor: colors.primaryContainer }]}>
            <Text style={styles.statEmoji}>👥</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{pets.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pacientes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs]}>
          <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statEmoji}>📋</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{todayAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Citas Hoy</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs]}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.statEmoji}>📝</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{clinicalRecords.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fichas Clínicas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs]}>
          <View style={[styles.statIcon, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.statEmoji}>💊</Text>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{lowStockItems.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Alertas Stock</Text>
        </View>
      </View>

      {/* Row 3: Pacientes + Estadísticas + Acciones */}
      <View style={styles.threeColRow}>
        <View style={styles.colLeft}>
          <PatientList patients={recentPatients} />
        </View>
        <View style={styles.colCenter}>
          <StatsChart />
        </View>
        <View style={styles.colRight}>
          <QuickActions />
        </View>
      </View>

      {/* Row 4: Inventario + Actividad */}
      <View style={styles.twoColRow}>
        <View style={styles.colHalf}>
          <InventoryBar />
        </View>
        <View style={styles.colHalf}>
          <ActivityFeed />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: SPACING['4xl'] },

  topRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  hero: {
    flex: 1.5,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  heroName: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  heroDate: { fontSize: TYPOGRAPHY.sizes.sm, textTransform: 'capitalize' },
  heroSubtitle: { fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.sm },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xs, fontWeight: TYPOGRAPHY.weights.medium },

  threeColRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  colLeft: { flex: 1 },
  colCenter: { flex: 1 },
  colRight: { flex: 1 },

  twoColRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    gap: SPACING.lg,
  },
  colHalf: { flex: 1 },
});
