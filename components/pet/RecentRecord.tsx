import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import VButton from '../ui/Button';
import { ClinicalRecord } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import DisplayText from '../ui/DisplayText';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { RECORD_TYPE_CONFIG } from '../../constants/icons';

interface RecentRecordProps {
  record: ClinicalRecord;
  onView: () => void;
  onGenerateRx: () => void;
}

export default function RecentRecord({ record, onView, onGenerateRx }: RecentRecordProps) {
  const { colors } = useTheme();
  const config = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.consulta;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <DisplayText style={[styles.title, { color: colors.text }]}>Última consulta</DisplayText>
        {/* "Ver todo" and "Detalle" opened the same thing; two quiet text actions instead of three buttons */}
        <View style={styles.headerActions}>
          <VButton size="sm" variant="ghost" onPress={onGenerateRx}>Generar receta</VButton>
          <VButton size="sm" variant="ghost" onPress={onView}>Ver detalle</VButton>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.typeMark}>
          <View style={[styles.lozenge, { backgroundColor: config.color }]} />
          <Text style={[styles.typeText, { color: colors.text }]}>{config.label}</Text>
        </View>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {new Date(record.date).toLocaleDateString('es-CL')}
        </Text>
      </View>

      <View style={styles.fields}>
        {record.veterinarian && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Veterinario</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{record.veterinarian}</Text>
          </View>
        )}
        {record.details?.weight && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Peso</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>{record.details.weight} kg</Text>
          </View>
        )}
        {record.details?.motivo_consulta && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Motivo</Text>
            <Text style={[styles.fieldValue, { color: colors.text }]} numberOfLines={2}>{record.details.motivo_consulta}</Text>
          </View>
        )}
        {record.details?.vital_signs && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Constantes</Text>
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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
  typeMark: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  lozenge: { width: 7, height: 7, transform: [{ rotate: '45deg' }] },
  typeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
    fontSize: TYPOGRAPHY.sizes.sm,
    minWidth: 90,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});