import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Heart, Clock, Stethoscope, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';

const MOCK_ADMISSIONS = [
  {
    id: '1',
    petName: 'Max',
    species: 'Canino',
    breed: 'Pastor Alemán',
    reason: 'Cirugía Ortopédica',
    vet: 'Dr. García',
    status: 'internado',
    admitDate: '2026-07-21',
    timeline: [
      { date: '21/07 10:00', event: 'Ingreso', type: 'info' },
      { date: '21/07 14:00', event: 'Post-operatorio', type: 'warning' },
      { date: '22/07 09:00', event: 'Control', type: 'success' },
    ],
  },
  {
    id: '2',
    petName: 'Luna',
    species: 'Felino',
    breed: 'Siamés',
    reason: 'Observación',
    vet: 'Dra. Pérez',
    status: 'recuperacion',
    admitDate: '2026-07-22',
    timeline: [
      { date: '22/07 08:00', event: 'Ingreso', type: 'info' },
      { date: '22/07 15:00', event: 'Estabilización', type: 'success' },
    ],
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  internado: { label: 'Internado', color: '#1565C0', bg: '#E3F2FD' },
  cirugia: { label: 'Cirugía', color: '#C62828', bg: '#FFEBEE' },
  recuperacion: { label: 'Recuperación', color: '#E65100', bg: '#FFF3E0' },
  alta: { label: 'Alta', color: '#2E7D32', bg: '#E8F5E9' },
};

const TIMELINE_COLORS: Record<string, string> = {
  info: '#3B82F6',
  warning: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
};

export default function HospitalizacionScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [filter, setFilter] = React.useState('todos');

  const filtered = filter === 'todos'
    ? MOCK_ADMISSIONS
    : MOCK_ADMISSIONS.filter(a => a.status === filter);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Hospitalización</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Pacientes internados y en recuperación
        </Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'internado', label: 'Internados' },
          { key: 'cirugia', label: 'Cirugía' },
          { key: 'recuperacion', label: 'Recuperación' },
        ].map(f => (
          <VBadge
            key={f.key}
            label={f.label}
            variant={filter === f.key ? 'filled' : 'outlined'}
            color={filter === f.key ? colors.primary : colors.textSecondary}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>

      {/* Admission cards */}
      {filtered.length === 0 ? (
        <VEmptyState
          icon="heart"
          title="Sin internamientos"
          description="No hay pacientes internados actualmente"
        />
      ) : (
        filtered.map(admission => {
          const statusCfg = STATUS_CONFIG[admission.status] || STATUS_CONFIG.internado;
          return (
            <VCard key={admission.id} style={styles.card}>
              {/* Card header */}
              <View style={styles.cardHeader}>
                <View style={styles.petInfo}>
                  <Text style={[styles.petName, { color: colors.text }]}>{admission.petName}</Text>
                  <Text style={[styles.petDetail, { color: colors.textSecondary }]}>
                    {admission.species} · {admission.breed}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                  <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              </View>

              {/* Reason + Vet */}
              <View style={styles.cardMeta}>
                <View style={styles.metaRow}>
                  <Stethoscope size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{admission.reason}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Heart size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{admission.vet}</Text>
                </View>
              </View>

              {/* Timeline */}
              {admission.timeline.length > 0 && (
                <View style={[styles.timeline, { borderTopColor: colors.border }]}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>Timeline</Text>
                  {admission.timeline.map((event, idx) => (
                    <View key={idx} style={styles.timelineItem}>
                      <View style={[styles.timelineDot, { backgroundColor: TIMELINE_COLORS[event.type] || colors.primary }]} />
                      <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>{event.date}</Text>
                      <Text style={[styles.timelineEvent, { color: colors.text }]}>{event.event}</Text>
                    </View>
                  ))}
                </View>
              )}
            </VCard>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.xs },
  filterRow: { marginBottom: SPACING.lg, gap: SPACING.sm },
  card: { marginBottom: SPACING.md },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  petInfo: { flex: 1 },
  petName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  petDetail: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  cardMeta: { gap: SPACING.xs, marginBottom: SPACING.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm },
  timeline: {
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  timelineTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  timelineDot: { width: 8, height: 8, borderRadius: 4 },
  timelineDate: { fontSize: TYPOGRAPHY.sizes.xs, width: 80 },
  timelineEvent: { fontSize: TYPOGRAPHY.sizes.sm, flex: 1 },
});
