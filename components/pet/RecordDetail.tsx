import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { ClinicalRecord } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import DynamicIcon from '../ui/DynamicIcon';

interface RecordDetailProps {
  record: ClinicalRecord;
}

interface SoapSection {
  label: string;
  icon: string;
  color: string;
  content: string;
  fields?: { label: string; value: string }[];
}

export default function RecordDetail({ record }: RecordDetailProps) {
  const { colors } = useTheme();

  const d = record.details || {};
  const hasSoapData = d.subjective || d.objective || d.assessment || d.plan || d.treatment;
  const hasLegacyData = d.notes || d.anamnesis || d.hallazgos || d.motivo_consulta;

  const buildSoapSections = (): SoapSection[] => {
    if (hasSoapData) {
      return [
        {
          label: 'Subjetivo',
          icon: 'account-heart-outline',
          color: colors.primary,
          content: d.subjective || '',
          fields: d.motivo_consulta ? [{ label: 'Motivo', value: d.motivo_consulta }] : [],
        },
        {
          label: 'Objetivo',
          icon: 'stethoscope',
          color: colors.info,
          content: d.objective || '',
          fields: [
            d.vital_signs?.temp ? { label: 'Temp', value: `${d.vital_signs.temp} C` } : null,
            d.vital_signs?.fc ? { label: 'FC', value: `${d.vital_signs.fc} lpm` } : null,
            d.vital_signs?.fr ? { label: 'FR', value: `${d.vital_signs.fr} rpm` } : null,
            d.vital_signs?.pa ? { label: 'PA', value: d.vital_signs.pa } : null,
            d.vital_signs?.spo2 ? { label: 'SpO2', value: `${d.vital_signs.spo2}%` } : null,
          ].filter(Boolean) as { label: string; value: string }[],
        },
        {
          label: 'Evaluacion',
          icon: 'clipboard-text-search-outline',
          color: colors.warning,
          content: d.assessment || '',
          fields: d.diagnostico ? [{ label: 'Diagnostico', value: d.diagnostico }] : [],
        },
        {
          label: 'Plan',
          icon: 'clipboard-check-outline',
          color: colors.success,
          content: d.plan || '',
          fields: [],
        },
        ...(d.treatment ? [{
          label: 'Tratamiento',
          icon: 'pill',
          color: colors.primary,
          content: d.treatment || '',
          fields: [],
        }] : []),
      ];
    }

    if (hasLegacyData) {
      return [
        {
          label: 'Motivo de consulta',
          icon: 'comment-question-outline',
          color: colors.primary,
          content: d.motivo_consulta || '',
          fields: [],
        },
        {
          label: 'Anamnesis',
          icon: 'text-box-outline',
          color: colors.info,
          content: d.anamnesis || '',
          fields: [],
        },
        {
          label: 'Hallazgos',
          icon: 'magnify',
          color: colors.warning,
          content: d.hallazgos || '',
          fields: [],
        },
        {
          label: 'Notas',
          icon: 'note-text-outline',
          color: colors.success,
          content: d.notes || '',
          fields: [],
        },
      ];
    }

    return [];
  };

  const sections = buildSoapSections();
  const formatType = hasSoapData ? 'SOAP' : hasLegacyData ? 'Legacy' : null;

  return (
    <View style={styles.container}>
      {formatType && (
        <View style={[styles.formatBadge, { backgroundColor: (hasSoapData ? colors.primary : colors.textSecondary) + '20' }]}>
          <DynamicIcon name={hasSoapData ? 'medical-bag' : 'text'} size={14} color={hasSoapData ? colors.primary : colors.textSecondary} />
          <Text style={[styles.formatLabel, { color: hasSoapData ? colors.primary : colors.textSecondary }]}>
            Formato {formatType}
          </Text>
        </View>
      )}

      {sections.map((section, i) => (
        <View key={i} style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
              <DynamicIcon name={section.icon as any} size={16} color={section.color} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.label}</Text>
          </View>
          {section.fields && section.fields.length > 0 && (
            <View style={styles.fieldsRow}>
              {section.fields.map((f, fi) => (
                <View key={fi} style={[styles.fieldChip, { backgroundColor: colors.primaryContainer, borderColor: colors.border }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{f.label}:</Text>
                  <Text style={[styles.fieldValue, { color: colors.text }]}>{f.value}</Text>
                </View>
              ))}
            </View>
          )}
          {section.content ? (
            <Text style={[styles.sectionContent, { color: colors.text }]} numberOfLines={0}>
              {section.content}
            </Text>
          ) : (
            <Text style={[styles.sectionEmpty, { color: colors.textLight }]}>Sin datos</Text>
          )}
        </View>
      ))}

      {/* Cirugia: Procedimiento, Descripcion, Postoperatorio, Archivos */}
      {(d.procedimiento || d.descripcion || d.postoperatorio || d.files?.length > 0) && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.error + '20' }]}>
              <DynamicIcon name="scissors-cutting" size={16} color={colors.error} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Datos de Cirugia</Text>
          </View>
          {d.procedimiento && (
            <View style={styles.cirugiaField}>
              <Text style={[styles.cirugiaLabel, { color: colors.textSecondary }]}>Procedimiento</Text>
              <Text style={[styles.cirugiaValue, { color: colors.text }]}>{d.procedimiento}</Text>
            </View>
          )}
          {d.descripcion && (
            <View style={styles.cirugiaField}>
              <Text style={[styles.cirugiaLabel, { color: colors.textSecondary }]}>Descripcion</Text>
              <Text style={[styles.cirugiaContent, { color: colors.text }]}>{d.descripcion}</Text>
            </View>
          )}
          {d.postoperatorio && (
            <View style={styles.cirugiaField}>
              <Text style={[styles.cirugiaLabel, { color: colors.textSecondary }]}>Postoperatorio</Text>
              <Text style={[styles.cirugiaContent, { color: colors.text }]}>{d.postoperatorio}</Text>
            </View>
          )}
          {d.files?.length > 0 && (
            <View style={styles.cirugiaField}>
              <Text style={[styles.cirugiaLabel, { color: colors.textSecondary }]}>Archivos</Text>
              <View style={styles.filesRow}>
                {d.files.map((fileUrl: string, idx: number) => (
                  <TouchableOpacity key={idx} style={[styles.fileThumbContainer, { borderColor: colors.border }]} onPress={() => Linking.openURL(fileUrl)}>
                    {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <Image source={{ uri: fileUrl }} style={styles.fileThumb} />
                    ) : (
                      <View style={[styles.fileThumb, styles.fileThumbPdf, { backgroundColor: colors.errorContainer }]}>
                        <DynamicIcon name="file-pdf-box" size={24} color={colors.error} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING['2xs'],
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  formatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  section: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
  },
  fieldsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  fieldChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sectionContent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.sizes.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  sectionEmpty: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontStyle: 'italic',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cirugiaField: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cirugiaLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cirugiaValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cirugiaContent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.sizes.sm,
  },
  filesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  fileThumbContainer: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fileThumb: {
    width: 64,
    height: 64,
  },
  fileThumbPdf: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
