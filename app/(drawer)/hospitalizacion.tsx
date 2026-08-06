import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Heart, Clock, Stethoscope, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { useHospitalizations } from '../../hooks/useDirectus';
import VCard from '../../components/ui/Card';
import VEmptyState from '../../components/ui/EmptyState';
import VBadge from '../../components/ui/Badge';

const STATUS_LABELS: Record<string, string> = {
  todos: 'Todos',
  internado: 'Internado',
  cirugia: 'Cirugía',
  recuperacion: 'Recuperación',
  discharged: 'Alta',
};

export default function HospitalizacionScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('todos');

  const { hospitalizations, loading, discharge } = useHospitalizations(filter);

  const filtered = useMemo(() => {
    if (filter === 'todos') return hospitalizations;
    return hospitalizations.filter(a => a.status === filter);
  }, [hospitalizations, filter]);

  const handleDischarge = (id: string, petName: string) => {
    Alert.alert(
      'Dar de alta',
      `¿Confirmar el alta de ${petName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => discharge(id) },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Hospitalización</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {loading ? 'Cargando...' : `${filtered.length} paciente${filtered.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <VEmptyState
          icon={<Heart size={32} color={colors.textLight} />}
          title="Sin internamientos"
          description="No hay pacientes internados actualmente"
        />
      ) : (
        filtered.map(admission => (
          <VCard key={admission.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.petInfo}>
                <Text style={[styles.petName, { color: colors.text }]}>{admission.pet_name}</Text>
                <Text style={[styles.petDetail, { color: colors.textSecondary }]}>
                  {admission.species} · {admission.breed}
                </Text>
              </View>
              <VBadge
                label={STATUS_LABELS[admission.status] || admission.status}
                variant="soft"
                color={
                  admission.status === 'internado' ? colors.info
                  : admission.status === 'cirugia' ? colors.error
                  : admission.status === 'recuperacion' ? colors.warning
                  : colors.success
                }
              />
            </View>

            <View style={styles.cardMeta}>
              <View style={styles.metaRow}>
                <Stethoscope size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{admission.reason}</Text>
              </View>
              {admission.veterinarian && (
                <View style={styles.metaRow}>
                  <Heart size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{admission.veterinarian}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Clock size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  Ingreso: {new Date(admission.admission_date).toLocaleDateString('es-CL')}
                </Text>
              </View>
            </View>

            {admission.status !== 'discharged' && (
              <Button
                mode="outlined"
                onPress={() => handleDischarge(admission.id, admission.pet_name)}
                style={[styles.dischargeButton, { borderColor: colors.success }]}
                textColor={colors.success}
                icon={() => <CheckCircle size={16} color={colors.success} />}
              >
                Dar de Alta
              </Button>
            )}
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
  loadingContainer: { paddingVertical: SPACING['4xl'], alignItems: 'center' },
  card: { marginBottom: SPACING.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  petInfo: { flex: 1 },
  petName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  petDetail: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  cardMeta: { gap: SPACING.sm, marginBottom: SPACING.lg },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm },
  dischargeButton: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
  },
});
