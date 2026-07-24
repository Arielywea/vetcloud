import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ClinicalRecord } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface RecentRecordProps {
  record: ClinicalRecord;
  onView: () => void;
  onGenerateRx: () => void;
}

const RECORD_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  consulta: { icon: 'stethoscope', color: '#3B82F6', label: 'Consulta' },
  vacuna: { icon: 'needle', color: '#10B981', label: 'Vacuna' },
  cirugia: { icon: 'scissors-cutting', color: '#EF4444', label: 'Cirugia' },
  control: { icon: 'clipboard-check', color: '#F59E0B', label: 'Control' },
};

export default function RecentRecord({ record, onView, onGenerateRx }: RecentRecordProps) {
  const { colors } = useTheme();
  const config = RECORD_CONFIG[record.record_type] || RECORD_CONFIG.consulta;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Ultima Consulta</Text>
        <Button compact mode="text" onPress={onView} labelStyle={{ color: colors.primary }}>
          Ver todo ->
        </Button>
      </View>

      {/* Type badge + date */}
      <View style={styles.metaRow}>
        <View style={[styles.typeBadge, { backgroundColor: config.color + '18' }]}>
          <MaterialCommunityIcons name={config.icon as any} size={12} color={config.color} />
          <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(record.date).toLocaleDateString('es-CL')}
        </Text>
      </View>

      {/* Fields */}
      <View style={styles.fields}>
        {record.veterinarian && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Veterinario:</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{record.veterinarian}</Text>
          </View>
        )}
        {record.details?.weight && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Peso:</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{record.details.weight} kg</Text>
          </View>
        )}
        {record.details?.motivo_consulta && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Motivo:</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]} numberOfLines={2}>{record.details.motivo_consulta}</Text>
          </View>
        )}
        {record.details?.vital_signs && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Constantes:</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]} numberOfLines={1}>
              {[
                record.details.vital_signs.temperature != null && `Temp: ${record.details.vital_signs.temperature}C`,
                record.details.vital_signs.heart_rate != null && `FC: ${record.details.vital_signs.heart_rate}`,
                record.details.vital_signs.respiratory_rate != null && `FR: ${record.details.vital_signs.respiratory_rate}`,
              ].filter(Boolean).join(' | ')}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button compact mode="outlined" onPress={onView} style={styles.actionBtn} labelStyle={styles.actionLabel}>
          Detalle
        </Button>
        <Button compact mode="outlined" onPress={onGenerateRx} style={styles.actionBtn} labelStyle={styles.actionLabel}>
          Generar Receta
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING['2xs'],
    borderRadius: RADIUS.full,
  },
  typeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  fields: {
    gap: SPACING.sm,
  },
  field: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    minWidth: 90,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: RADIUS.md,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
