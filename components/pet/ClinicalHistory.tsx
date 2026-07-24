import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import RoundTableIcon from '../icons/RoundTableIcon';

interface ClinicalHistoryProps {
  pet: DirectusPet;
  fieldCount: number;
}

export default function ClinicalHistory({ pet, fieldCount }: ClinicalHistoryProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [historialExpanded, setHistorialExpanded] = useState(false);
  const [anamnesisExpanded, setAnamnesisExpanded] = useState(false);
  const [constantExpanded, setConstantExpanded] = useState(false);

  const renderField = (icon: string, label: string, value: string, iconColor?: string) => (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldHeader}>
        <MaterialCommunityIcons name={icon as any} size={14} color={iconColor || colors.primary} />
        <Text style={[styles.fieldLabel, { color: iconColor || colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.fieldValue, { color: colors.text }]}>{value}</Text>
    </View>
  );

  const renderSubSection = (
    title: string,
    icon: string,
    iconColor: string,
    isExpanded: boolean,
    onToggle: () => void,
    children: React.ReactNode
  ) => (
    <>
      <TouchableOpacity onPress={onToggle} style={styles.subSectionHeader}>
        <View style={styles.subSectionTitleRow}>
          <MaterialCommunityIcons name={icon as any} size={14} color={iconColor} />
          <Text style={[styles.subSectionLabel, { color: iconColor }]}>{title}</Text>
        </View>
        <MaterialCommunityIcons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {isExpanded && <View style={styles.subSectionContent}>{children}</View>}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Section header */}
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historia Clinica Inicial</Text>
          {fieldCount > 0 && (
            <View style={[styles.countBadge, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>{fieldCount}</Text>
            </View>
          )}
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {pet.motivo_consulta && renderField('comment-alert-outline', 'Motivo de consulta', pet.motivo_consulta)}
          {pet.habitat && renderField('home', 'Habitat', `${pet.habitat}${pet.habitat_other ? ` — ${pet.habitat_other}` : ''}`)}
          {(pet.food || pet.food_frequency) && (
            <View style={styles.fieldBlock}>
              <View style={styles.fieldHeader}>
                <MaterialCommunityIcons name="food" size={14} color={colors.primary} />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Alimentacion</Text>
              </View>
              {pet.food && <Text style={[styles.fieldValue, { color: colors.text }]}>Tipo: {pet.food}</Text>}
              {pet.food_frequency && <Text style={[styles.fieldValue, { color: colors.text }]}>Frecuencia: {pet.food_frequency}</Text>}
            </View>
          )}
          {pet.water_consumption && renderField('cup-water', 'Consumo de agua', pet.water_consumption, colors.info)}
          {pet.urination && renderField('water-opacity', 'Miccion', pet.urination, colors.info)}
          {pet.lives_with_other_animals && renderField('paw', 'Vive con otros animales', pet.lives_with_other_animals)}
          {pet.species === 'cat' && pet.entorno && renderField('home-outline', 'Entorno', pet.entorno)}
          {pet.species === 'cat' && pet.areneros && renderField('inbox-outline', 'Areneros', pet.areneros)}

          {/* Historial sanitario */}
          {renderSubSection('Historial sanitario', 'shield-check-outline', colors.success, historialExpanded, () => setHistorialExpanded(!historialExpanded), (
            <>
              {pet.vaccines && renderField('needle', 'Vacunas', pet.vaccines, colors.success)}
              {pet.deworming && renderField('bug', 'Desparasitacion', pet.deworming, colors.warning)}
              {pet.flea_treatment && renderField('shield-bug', 'Antipulgas', pet.flea_treatment, colors.warning)}
              {pet.last_heat && renderField('calendar-heart', 'Ultimo celo', pet.last_heat)}
              {pet.other_diseases && renderField('hospital-box-outline', 'Enfermedades previas', pet.other_diseases, colors.warning)}
              {pet.surgeries && renderField('scissors-cutting', 'Cirugias previas', pet.surgeries, colors.error)}
              {pet.medications && renderField('pill', 'Medicamentos actuales', pet.medications, colors.info)}
              {pet.allergies && pet.allergies.length > 0 && (
                <View style={styles.fieldBlock}>
                  <View style={styles.fieldHeader}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={[styles.fieldLabel, { color: colors.error }]}>Alergias</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {pet.allergies.map((a: string, i: number) => (
                      <View key={i} style={[styles.chip, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
                        <Text style={[styles.chipText, { color: colors.error }]}>{a}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ))}

          {/* Anamnesis */}
          {pet.anamnesis && renderSubSection('Anamnesis', 'stethoscope', colors.primary, anamnesisExpanded, () => setAnamnesisExpanded(!anamnesisExpanded), (
            <Text style={[styles.fieldValue, { color: colors.text }]}>{pet.anamnesis}</Text>
          ))}

          {/* Constantes fisiologicas */}
          {pet.vital_signs && renderSubSection('Constantes fisiologicas', 'heart-pulse', colors.error, constantExpanded, () => setConstantExpanded(!constantExpanded), (
            <View style={styles.vitalGrid}>
              {pet.vital_signs.temperature != null && (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Temp</Text>
                  <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.temperature}°C</Text>
                </View>
              )}
              {pet.vital_signs.heart_rate != null && (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>FC</Text>
                  <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.heart_rate} lpm</Text>
                </View>
              )}
              {pet.vital_signs.respiratory_rate != null && (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>FR</Text>
                  <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.respiratory_rate} rpm</Text>
                </View>
              )}
              {pet.vital_signs.blood_pressure && (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>PA</Text>
                  <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.blood_pressure}</Text>
                </View>
              )}
              {pet.vital_signs.spo2 != null && (
                <View style={styles.vitalItem}>
                  <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>SpO2</Text>
                  <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.spo2}%</Text>
                </View>
              )}
            </View>
          ))}

          {/* Hallazgos */}
          {pet.hallazgos_examen_fisico && renderField('magnify', 'Hallazgos examen fisico', pet.hallazgos_examen_fisico, colors.warning)}

          {/* Notas */}
          {pet.notes && renderField('note-text-outline', 'Notas', pet.notes, colors.textSecondary)}

          {/* Empty state */}
          {!pet.motivo_consulta && !pet.anamnesis && (!pet.allergies || pet.allergies.length === 0) && !pet.habitat && !pet.food && !pet.vaccines && !pet.surgeries && !pet.medications && !pet.notes && !pet.vital_signs && !pet.hallazgos_examen_fisico && (
            <View style={styles.emptyState}>
              <RoundTableIcon size={48} color={colors.textLight} accentColor="#C9A22740" />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin datos clinicos iniciales registrados</Text>
              <Text style={[styles.emptyHint, { color: colors.textLight }]}>Edita el paciente para completar la historia clinica</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  countBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING['2xs'],
  },
  countText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  content: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  fieldBlock: {
    marginBottom: SPACING.sm,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginLeft: SPACING.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginLeft: SPACING.lg,
  },
  chip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING['2xs'],
    borderWidth: 1,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
  },
  subSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  subSectionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  subSectionContent: {
    paddingBottom: SPACING.sm,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  vitalItem: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 80,
  },
  vitalLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  vitalValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING['2xs'],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
});
