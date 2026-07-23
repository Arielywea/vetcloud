import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { FlaskConical, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';

const MOCK_EXAMS = [
  { id: '1', name: 'Hemograma Completo', petName: 'Max', species: 'Canino', date: '2026-07-22', status: 'pendiente', vet: 'Dr. García' },
  { id: '2', name: 'Perfil Bioquímico', petName: 'Luna', species: 'Felino', date: '2026-07-21', status: 'completado', vet: 'Dra. Pérez', result: 'Dentro de parámetros normales' },
  { id: '3', name: 'Análisis de Orina', petName: 'Max', species: 'Canino', date: '2026-07-20', status: 'completado', vet: 'Dr. García', result: 'Sin anomalías detectadas' },
  { id: '4', name: 'Radiografía', petName: 'Luna', species: 'Felino', date: '2026-07-19', status: 'pendiente', vet: 'Dra. Pérez' },
];

export default function LaboratorioScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = React.useState('todos');

  const filtered = filter === 'todos'
    ? MOCK_EXAMS
    : MOCK_EXAMS.filter(e => e.status === filter);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Laboratorio</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Exámenes y resultados de laboratorio
        </Text>
      </View>

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

      {filtered.length === 0 ? (
        <VEmptyState
          icon={<FlaskConical size={32} color={colors.textLight} />}
          title="Sin exámenes"
          description="No hay exámenes registrados"
        />
      ) : (
        filtered.map(exam => (
          <VCard key={exam.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.examInfo}>
                <Text style={[styles.examName, { color: colors.text }]}>{exam.name}</Text>
                <Text style={[styles.examPet, { color: colors.textSecondary }]}>
                  {exam.petName} ({exam.species}) · {exam.vet}
                </Text>
              </View>
              <VBadge
                label={exam.status === 'pendiente' ? 'Pendiente' : 'Completado'}
                variant="soft"
                color={exam.status === 'pendiente' ? colors.warning : colors.success}
              />
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
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
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.sm },
  filterRow: { marginBottom: SPACING.xl, gap: SPACING.sm },
  card: { marginBottom: SPACING.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  examInfo: { flex: 1 },
  examName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  examPet: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: SPACING.lg,
  },
  examDate: { fontSize: TYPOGRAPHY.sizes.xs },
  examResult: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.sm },
});
