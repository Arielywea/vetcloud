import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BedDouble, Clock, Stethoscope, CheckCircle, Plus, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { useHospitalizations, usePets } from '../../hooks/useDirectus';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';
import VRefreshControl from '../../components/ui/VRefreshControl';
import { SkeletonList } from '../../components/ui/Skeleton';
import DisplayText from '../../components/ui/DisplayText';
import FormSheet from '../../components/ui/FormSheet';
import PetPicker from '../../components/pet/PetPicker';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/VToast';

const STATUS_LABELS: Record<string, string> = {
  internado: 'Internado',
  cirugia: 'Cirugía',
  recuperacion: 'Recuperación',
  discharged: 'Alta',
};
const SPECIES_LABELS: Record<string, string> = { dog: 'Canino', cat: 'Felino' };
const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'internado', label: 'Internados' },
  { key: 'cirugia', label: 'Cirugía' },
  { key: 'recuperacion', label: 'Recuperación' },
  { key: 'discharged', label: 'Dados de alta' },
];

export default function HospitalizacionScreen() {
  const { colors } = useTheme();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [filter, setFilter] = useState('todos');
  const { hospitalizations, loading, error, discharge, addHospitalization, updateHospitalization, refresh } = useHospitalizations(filter);
  const { pets } = usePets();
  const [refreshing, setRefreshing] = useState(false);

  // Admission form
  const [showForm, setShowForm] = useState(false);
  const [petId, setPetId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('internado');
  const [veterinarian, setVeterinarian] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'todos') return hospitalizations.filter(a => a.status !== 'discharged');
    return hospitalizations.filter(a => a.status === filter);
  }, [hospitalizations, filter]);

  const resetForm = () => {
    setPetId(null); setReason(''); setStatus('internado'); setVeterinarian(''); setNotes(''); setFormError(null);
  };

  const handleCreate = async () => {
    if (!petId) { setFormError('Elige el paciente a internar'); return; }
    if (!reason.trim()) { setFormError('El motivo es obligatorio'); return; }
    setSaving(true);
    setFormError(null);
    try {
      await addHospitalization({ pet_id: petId, reason: reason.trim(), status, veterinarian: veterinarian.trim() || null, notes: notes.trim() || null } as any);
      setShowForm(false);
      resetForm();
      toast.success('Paciente internado');
    } catch (e: any) {
      setFormError(e?.message || 'No se pudo registrar la hospitalización');
    } finally {
      setSaving(false);
    }
  };

  const handleDischarge = async (id: string, petName: string) => {
    const ok = await confirm({ title: 'Dar de alta', message: `¿Confirmas el alta de ${petName}?`, confirmLabel: 'Dar de alta' });
    if (!ok) return;
    try {
      await discharge(id);
      toast.success(`${petName} fue dado de alta`);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo dar de alta');
    }
  };

  const handleStatus = async (id: string, next: string) => {
    try {
      await updateHospitalization(id, { status: next } as any);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo actualizar el estado');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refresh(); } finally { setRefreshing(false); }
  };

  const statusColor = (s: string) =>
    s === 'internado' ? colors.info : s === 'cirugia' ? colors.error : s === 'recuperacion' ? colors.warning : colors.success;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<VRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <DisplayText style={[styles.title, { color: colors.text }]}>Hospitalización</DisplayText>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {loading ? ' ' : `${filtered.length} paciente${filtered.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <VButton onPress={() => { resetForm(); setShowForm(true); }} icon={<Plus size={18} color={colors.primary} />} variant="accent">
            Internar paciente
          </VButton>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
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

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: alpha(colors.error, 0.08), borderColor: alpha(colors.error, 0.3) }]}>
            <AlertTriangle size={16} color={colors.error} />
            <Text style={{ color: colors.text, flex: 1 }}>No se pudieron cargar las hospitalizaciones. {error}</Text>
            <VButton size="sm" variant="secondary" onPress={handleRefresh}>Reintentar</VButton>
          </View>
        ) : loading ? (
          <SkeletonList count={3} />
        ) : filtered.length === 0 ? (
          <VEmptyState
            icon={<BedDouble size={32} color={colors.textLight} />}
            title={filter === 'discharged' ? 'Sin altas registradas' : 'Sin pacientes internados'}
            description="Usa «Internar paciente» para registrar un ingreso."
            variant="medical"
          />
        ) : (
          filtered.map(admission => (
            <VCard key={admission.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.petInfo}>
                  <Text style={[styles.petName, { color: colors.text }]}>{admission.pet_name}</Text>
                  <Text style={[styles.petDetail, { color: colors.textSecondary }]}>
                    {[SPECIES_LABELS[admission.species as string] || admission.species, admission.breed].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <VBadge label={STATUS_LABELS[admission.status] || admission.status} variant="soft" color={statusColor(admission.status)} />
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaRow}>
                  <Stethoscope size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.text }]}>{admission.reason}</Text>
                </View>
                {admission.veterinarian ? (
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>Veterinario: {admission.veterinarian}</Text>
                ) : null}
                <View style={styles.metaRow}>
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    Ingreso: {new Date(admission.admission_date).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })}
                    {admission.discharge_date ? `  ·  Alta: ${new Date(admission.discharge_date).toLocaleDateString('es-CL')}` : ''}
                  </Text>
                </View>
                {admission.notes ? <Text style={[styles.metaText, { color: colors.textSecondary }]}>{admission.notes}</Text> : null}
              </View>

              {admission.status !== 'discharged' && (
                <View style={styles.actions}>
                  {(['internado', 'cirugia', 'recuperacion'] as const).filter(s => s !== admission.status).map(s => (
                    <VBadge key={s} label={`Pasar a ${STATUS_LABELS[s].toLowerCase()}`} variant="outlined" color={colors.textSecondary} onPress={() => handleStatus(admission.id, s)} />
                  ))}
                  <VButton
                    variant="secondary"
                    size="sm"
                    onPress={() => handleDischarge(admission.id, admission.pet_name || 'el paciente')}
                    icon={<CheckCircle size={16} color={colors.success} />}
                  >
                    Dar de alta
                  </VButton>
                </View>
              )}
            </VCard>
          ))
        )}
      </ScrollView>

      <FormSheet
        visible={showForm}
        title="Internar paciente"
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        submitLabel="Internar"
        submitting={saving}
        error={formError}
      >
        <PetPicker pets={pets} value={petId} onChange={setPetId} />
        <VInput label="Motivo *" placeholder="Ej: Gastroenteritis, observación postoperatoria" value={reason} onChangeText={setReason} />
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Estado inicial</Text>
        <View style={styles.chipRow}>
          {(['internado', 'cirugia', 'recuperacion'] as const).map(s => (
            <VBadge key={s} label={STATUS_LABELS[s]} variant={status === s ? 'filled' : 'outlined'} color={status === s ? colors.primary : colors.textSecondary} selected={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
        <VInput label="Veterinario a cargo" placeholder="Opcional" value={veterinarian} onChangeText={setVeterinarian} />
        <VInput label="Notas" placeholder="Indicaciones, fluidoterapia, dieta…" value={notes} onChangeText={setNotes} multiline />
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md, gap: SPACING.md },
  petInfo: { flex: 1 },
  petName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  petDetail: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  cardMeta: { gap: SPACING.sm, marginBottom: SPACING.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm, flexShrink: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: 10, borderWidth: 1 },
  fieldLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
});
