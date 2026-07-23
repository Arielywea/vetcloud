import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { PawPrint, Calendar, StickyNote, Heart, Syringe, Stethoscope, Scissors, ClipboardCheck, Plus, Package, ArrowRight, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePets, useAppointments, useNotes, useFavorites, useClinicalRecords, useInventory } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import { RECORD_TYPE_COLORS, TEXT_ON_PRIMARY } from '../../constants/colors';
import VCard from '../../components/ui/Card';
import VSectionHeader from '../../components/ui/SectionHeader';
import TaskWidget from '../../components/TaskWidget';
import AgendaWidget from '../../components/AgendaWidget';
import ReminderWidget from '../../components/ReminderWidget';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, radius, shadows, spacing } = useTheme();
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
    { label: 'Pacientes', value: pets.length, icon: <PawPrint size={22} color={TEXT_ON_PRIMARY.light.default} />, color: colors.primary, route: '/(drawer)/pacientes' },
    { label: 'Citas Hoy', value: appointments.filter(a => a.start_time.slice(0, 10) === new Date().toISOString().slice(0, 10)).length, icon: <Calendar size={22} color={TEXT_ON_PRIMARY.light.default} />, color: colors.info, route: '/(drawer)/agenda' },
    { label: 'Notas', value: notes.length, icon: <StickyNote size={22} color={TEXT_ON_PRIMARY.light.default} />, color: colors.accent, route: '/(drawer)/notes' },
    { label: 'Favoritas', value: favorites.length, icon: <Heart size={22} color={TEXT_ON_PRIMARY.light.default} />, color: colors.error, route: undefined },
  ];

  const QUICK_ACTIONS = [
    { label: 'Nuevo Paciente', icon: <Plus size={26} color={colors.primary} />, color: colors.primaryContainer, route: '/(drawer)/add-paciente' },
    { label: 'Enfermedades', icon: <Stethoscope size={26} color={colors.info} />, color: colors.info + '18', route: '/(drawer)/diseases' },
    { label: 'Agenda', icon: <Clock size={26} color={colors.accent} />, color: colors.accent + '18', route: '/(drawer)/agenda' },
    { label: 'Inventario', icon: <Package size={26} color={colors.success} />, color: colors.success + '18', route: '/(drawer)/inventario' },
  ];

  const RECORD_ICONS: Record<string, React.ReactNode> = {
    consulta: <Stethoscope size={18} color={RECORD_TYPE_COLORS.consulta} />,
    vacuna: <Syringe size={18} color={RECORD_TYPE_COLORS.vacuna} />,
    cirugia: <Scissors size={18} color={RECORD_TYPE_COLORS.cirugia} />,
    control: <ClipboardCheck size={18} color={RECORD_TYPE_COLORS.control} />,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Hero Greeting */}
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroEmoji}>🐶</Text>
          <Text style={[styles.heroName, { color: TEXT_ON_PRIMARY.light.default }]}>
            Hola, {user?.name?.split(' ')[0] || 'Usuario'}
          </Text>
          <Text style={[styles.heroDate, { color: TEXT_ON_PRIMARY.light.muted }]}>{todayStr}</Text>
          <Text style={[styles.heroSubtitle, { color: TEXT_ON_PRIMARY.light.subtle }]}>
            ¿Cómo podemos ayudar hoy?
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <TouchableOpacity
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.xs]}
            onPress={() => stat.route && router.push(stat.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>{stat.icon}</View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task Widget */}
      <TaskWidget appointments={appointments} clinicalRecords={clinicalRecords} lowStockItems={lowStockItems} />

      {/* Agenda Widget */}
      <AgendaWidget appointments={appointments} />

      {/* Reminder Widget */}
      <ReminderWidget />

      {/* Recent Records */}
      {recentRecords.length > 0 && (
        <View style={styles.section}>
          <VSectionHeader
            title="Fichas Recientes"
            icon={<ClipboardCheck size={20} color={colors.primary} />}
          />
          {recentRecords.map((record) => {
            const configColor = RECORD_TYPE_COLORS[record.record_type] || RECORD_TYPE_COLORS.consulta;
            const configIcon = RECORD_ICONS[record.record_type] || RECORD_ICONS.consulta;
            return (
              <TouchableOpacity
                key={record.id}
                style={[styles.recordCard, { backgroundColor: colors.surface }, SHADOWS.xs]}
                onPress={() => router.push(`/pet/${record.pet_id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.recordIcon, { backgroundColor: configColor + '18' }]}>{configIcon}</View>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordType, { color: colors.text }]}>
                    {record.record_type.charAt(0).toUpperCase() + record.record_type.slice(1)}
                  </Text>
                  <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                    {new Date(record.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <ArrowRight size={18} color={colors.textLight} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <VSectionHeader
          title="Accesos Rápidos"
          icon={<Plus size={20} color={colors.primary} />}
        />
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickCard, { backgroundColor: colors.surface }, SHADOWS.xs]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.color }]}>{action.icon}</View>
              <Text style={[styles.quickLabel, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: SPACING['4xl'] },
  hero: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    paddingBottom: SPACING['3xl'],
  },
  heroContent: { gap: SPACING.sm },
  heroEmoji: { fontSize: 32, marginBottom: SPACING.xs },
  heroName: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  heroDate: { fontSize: TYPOGRAPHY.sizes.sm, textTransform: 'capitalize', marginTop: SPACING.xs },
  heroSubtitle: { fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.sm },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: '47%',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  statValue: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  statLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.sm, fontWeight: TYPOGRAPHY.weights.regular },
  section: { marginHorizontal: SPACING.xl, marginBottom: SPACING.xl },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordInfo: { flex: 1 },
  recordType: { fontWeight: TYPOGRAPHY.weights.semibold, fontSize: TYPOGRAPHY.sizes.md },
  recordDate: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    justifyContent: 'space-between',
  },
  quickCard: {
    width: '47%',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
});
