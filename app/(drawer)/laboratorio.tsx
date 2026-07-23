import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { FlaskConical, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';

const MOCK_EXAMS = [
  {
    id: '1',
    name: 'Hemograma Completo',
    petName: 'Max',
    species: 'Canino',
    date: '2026-07-22',
    status: 'pendiente',
    vet: 'Dr. García',
  },
  {
    id: '2',
    name: 'Perfil Bioquímico',
    petName: 'Luna',
    species: 'Felino',
    date: '2026-07-21',
    status: 'completado',
    vet: 'Dra. Pérez',
    result: 'Dentro de parámetros normales',
  },
  {
    id: '3',
    name: 'Análisis de Orina',
    petName: 'Max',
    species: 'Canino',
    date: '2026-07-20',
    status: 'completado',
    vet: 'Dr. García',
    result: 'Sin anomalías detectadas',
  },
  {
    id: '4',
    name: 'Radiografía',
    petName: 'Luna',
    species: 'Felino',
    date: '2026-07-19',
    status: 'pendiente',
    vet: 'Dra. Pérez',
  },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pendiente: <Clock size={16} color="#F59E0B" />,
  completado: <CheckCircle size={16} color="#10B981" />,
  erroneo: <AlertCircle size={16} color="#EF4444" />,
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  completado: 'Completado',
  erroneo: 'Con error',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: '#FFF3E0', text: '#E65100' },
  completado: { bg: '#E8F5E9', text: '#2E7D32' },
  erroneo: { bg: '#FFEBEE', text: '#C62828' },
};

export default function LaboratorioScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();
  const [filter, setFilter] = React.useState('todos');

  const filtered = filter === 'todos'
    ? MOCK_EXAMS
    : MOCK_EXAMS.filter(e => e.status === filter);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Laboratorio</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Exámenes y resultados de laboratorio
        </Text>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'pendiente', label: 'Pendientes' },
          { key: 'completado', label: 'Completados' },
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

      {/* Exam cards */}
      {filtered.length === 0 ? (
        <VEmptyState
          icon="flask"
          title="Sin exámenes"
          description="No hay exámenes registrados"
        />
      ) : (
        filtered.map(exam => {
          const statusColor = STATUS_COLORS[exam.status] || STATUS_COLORS.pendiente;
          return (
            <VCard key={exam.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.examInfo}>
                  <Text style={[styles.examName, { color: colors.text }]}>{exam.name}</Text>
                  <Text style={[styles.examPet, { color: colors.textSecondary }]}>
                    {exam.petName} ({exam.species}) · {exam.vet}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                  {STATUS_ICONS[exam.status]}
                  <Text style={[styles.statusText, { color: statusColor.text }]}>
                    {STATUS_LABELS[exam.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={[styles.examDate, { color: colors.textLight }]}>
                  {new Date(exam.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
                {exam.result && (
                  <Text style={[styles.examResult, { color: colors.textSecondary }]} numberOfLines={2}>
                    {exam.result}
                  </Text>
                )}
              </View>
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
  examInfo: { flex: 1 },
  examName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  examPet: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  statusText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: SPACING.sm,
  },
  examDate: { fontSize: TYPOGRAPHY.sizes.xs },
  examResult: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
});
