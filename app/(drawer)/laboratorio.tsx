import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { FlaskConical, CheckCircle, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';
import VRefreshControl from '../../components/ui/VRefreshControl';
import { api, DirectusLabExam } from '../../services/directus';

export default function LaboratorioScreen() {
  const { colors } = useTheme();
  const [exams, setExams] = useState<DirectusLabExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('todos');

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter === 'todos' ? undefined : { status: filter };
      const data = await api.labExams.list(params);
      setExams(data);
    } catch (error) {
      console.error('Error fetching lab exams:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleComplete = async (id: string) => {
    try {
      await api.labExams.update(id, { status: 'completado' });
      setExams(prev => prev.map(exam =>
        exam.id === id ? { ...exam, status: 'completado' } : exam
      ));
    } catch (error) {
      console.error('Error completing exam:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await fetchExams(); } finally { setRefreshing(false); }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<VRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : exams.length === 0 ? (
        <VEmptyState
          icon={<FlaskConical size={32} color={colors.textLight} />}
          title="Sin exámenes"
          description="No hay exámenes registrados"
        />
      ) : (
        exams.map(exam => (
          <VCard key={exam.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.examInfo}>
                <Text style={[styles.examName, { color: colors.text }]}>{exam.exam_name}</Text>
                <Text style={[styles.examPet, { color: colors.textSecondary }]}>
                  {exam.pet_name} ({exam.species}) · {exam.breed}
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
              {exam.status === 'pendiente' && (
                <VBadge
                  label="Completar"
                  variant="filled"
                  color={colors.primary}
                  onPress={() => handleComplete(exam.id)}
                  style={styles.completeButton}
                />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: SPACING['4xl'] },
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
  completeButton: { marginTop: SPACING.sm, alignSelf: 'flex-start' },
});
