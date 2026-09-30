import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { FlaskConical, Plus, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY, alpha } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';
import VRefreshControl from '../../components/ui/VRefreshControl';
import { SkeletonList } from '../../components/ui/Skeleton';
import { api, DirectusLabExam } from '../../services/directus';
import { usePets, useRefreshOn } from '../../hooks/useDirectus';
import DisplayText from '../../components/ui/DisplayText';
import FormSheet from '../../components/ui/FormSheet';
import PetPicker from '../../components/pet/PetPicker';
import { useToast } from '../../components/ui/VToast';

const EXAM_TYPES = [
  { key: 'hemograma', label: 'Hemograma' },
  { key: 'bioquimica', label: 'Bioquímica' },
  { key: 'orina', label: 'Orina' },
  { key: 'coproparasitario', label: 'Coproparasitario' },
  { key: 'citologia', label: 'Citología' },
  { key: 'imagen', label: 'Imagen' },
  { key: 'otro', label: 'Otro' },
];
const EXAM_TYPE_LABELS = Object.fromEntries(EXAM_TYPES.map(t => [t.key, t.label]));
const SPECIES_LABELS: Record<string, string> = { dog: 'Canino', cat: 'Felino' };

export default function LaboratorioScreen() {
  const { colors } = useTheme();
  const toast = useToast();
  const { pets } = usePets();
  const [exams, setExams] = useState<DirectusLabExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('todos');

  // New exam
  const [showCreate, setShowCreate] = useState(false);
  const [petId, setPetId] = useState<string | null>(null);
  const [examName, setExamName] = useState('');
  const [examType, setExamType] = useState('hemograma');
  const [veterinarian, setVeterinarian] = useState('');
  // Complete exam
  const [completing, setCompleting] = useState<DirectusLabExam | null>(null);
  const [result, setResult] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchExams = useCallback(async (silent: boolean = false) => {
    setLoadError(null);
    try {
      if (!silent) setLoading(true);
      const params = filter === 'todos' ? undefined : { status: filter };
      setExams(await api.labExams.list(params));
    } catch (e: any) {
      setLoadError(e?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  useRefreshOn(['lab_exams'], fetchExams);

  const openCreate = () => {
    setPetId(null); setExamName(''); setExamType('hemograma'); setVeterinarian(''); setFormError(null); setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!petId) { setFormError('Elige el paciente'); return; }
    const name = examName.trim() || EXAM_TYPE_LABELS[examType];
    setSaving(true); setFormError(null);
    try {
      await api.labExams.create({ pet_id: petId, exam_name: name, exam_type: examType, status: 'pendiente', veterinarian: veterinarian.trim() || null });
      setShowCreate(false);
      toast.success('Examen solicitado');
    } catch (e: any) {
      setFormError(e?.message || 'No se pudo registrar el examen');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!completing) return;
    if (!result.trim()) { setFormError('Ingresa el resultado para completar el examen'); return; }
    setSaving(true); setFormError(null);
    try {
      await api.labExams.update(completing.id, { status: 'completado', result: result.trim() });
      setCompleting(null);
      toast.success('Resultado registrado');
    } catch (e: any) {
      setFormError(e?.message || 'No se pudo guardar el resultado');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await fetchExams(); } finally { setRefreshing(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<VRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <DisplayText style={[styles.title, { color: colors.text }]}>Laboratorio</DisplayText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Exámenes solicitados y sus resultados</Text>
          </View>
          <VButton variant="accent" onPress={openCreate} icon={<Plus size={18} color={colors.primary} />}>Solicitar examen</VButton>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
        </ScrollView>

        {loadError ? (
          <View style={[styles.errorBox, { backgroundColor: alpha(colors.error, 0.08), borderColor: alpha(colors.error, 0.3) }]}>
            <AlertTriangle size={16} color={colors.error} />
            <Text style={{ color: colors.text, flex: 1 }}>No se pudieron cargar los exámenes. {loadError}</Text>
            <VButton size="sm" variant="secondary" onPress={handleRefresh}>Reintentar</VButton>
          </View>
        ) : loading ? (
          <SkeletonList count={3} />
        ) : exams.length === 0 ? (
          <VEmptyState
            icon={<FlaskConical size={32} color={colors.textLight} />}
            title="Sin exámenes"
            description="Usa «Solicitar examen» para registrar uno."
          />
        ) : (
          exams.map(exam => (
            <VCard key={exam.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.examName, { color: colors.text }]}>{exam.exam_name}</Text>
                  <Text style={[styles.examPet, { color: colors.textSecondary }]}>
                    {[exam.pet_name, SPECIES_LABELS[exam.species as string], exam.breed].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <VBadge label={exam.status === 'pendiente' ? 'Pendiente' : 'Completado'} variant={exam.status === 'pendiente' ? 'warning' : 'success'} />
              </View>

              {exam.result ? (
                <Text style={[styles.examResult, { color: colors.text }]}>{exam.result}</Text>
              ) : null}

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.examDate, { color: colors.textSecondary }]}>
                  {new Date(exam.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {exam.exam_type ? `  ·  ${EXAM_TYPE_LABELS[exam.exam_type] || exam.exam_type}` : ''}
                  {exam.veterinarian ? `  ·  ${exam.veterinarian}` : ''}
                </Text>
                {exam.status === 'pendiente' && (
                  <VButton size="sm" variant="secondary" onPress={() => { setResult(''); setFormError(null); setCompleting(exam); }} icon={<CheckCircle size={16} color={colors.success} />}>
                    Registrar resultado
                  </VButton>
                )}
              </View>
            </VCard>
          ))
        )}
      </ScrollView>

      <FormSheet visible={showCreate} title="Solicitar examen" onClose={() => setShowCreate(false)} onSubmit={handleCreate} submitLabel="Solicitar" submitting={saving} error={formError}>
        <PetPicker pets={pets} value={petId} onChange={setPetId} />
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tipo de examen</Text>
        <View style={styles.chipRow}>
          {EXAM_TYPES.map(t => (
            <VBadge key={t.key} label={t.label} variant={examType === t.key ? 'filled' : 'outlined'} color={examType === t.key ? colors.primary : colors.textSecondary} selected={examType === t.key} onPress={() => setExamType(t.key)} />
          ))}
        </View>
        <VInput label="Nombre del examen" placeholder={`Ej: ${EXAM_TYPE_LABELS[examType]} completo`} value={examName} onChangeText={setExamName} hint="Si lo dejas vacío se usa el tipo de examen." />
        <VInput label="Veterinario solicitante" placeholder="Opcional" value={veterinarian} onChangeText={setVeterinarian} />
      </FormSheet>

      <FormSheet visible={!!completing} title={`Resultado: ${completing?.exam_name || ''}`} onClose={() => setCompleting(null)} onSubmit={handleComplete} submitLabel="Completar examen" submitting={saving} error={formError}>
        <Text style={[styles.examPet, { color: colors.textSecondary, marginBottom: SPACING.md }]}>{completing?.pet_name}</Text>
        <VInput label="Resultado *" placeholder="Valores, hallazgos e interpretación" value={result} onChangeText={setResult} multiline />
      </FormSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'] },
  header: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'] },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.xs },
  filterRow: { gap: SPACING.sm, marginBottom: SPACING.xl },
  card: { marginBottom: SPACING.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.md, marginBottom: SPACING.md },
  examName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  examPet: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  examResult: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 22, marginBottom: SPACING.md },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING.sm, paddingTop: SPACING.md, borderTopWidth: 1 },
  examDate: { fontSize: TYPOGRAPHY.sizes.sm, flexShrink: 1 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10, borderWidth: 1 },
  fieldLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
});
