import React from 'react';
import { View, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VBadge from '../ui/Badge';
import { Medication } from '../../services/directus';
import { FAMILIA_COLORS } from '../../constants/medications';

interface MedicationDetailProps {
  medication: Medication | null;
  visible: boolean;
  onClose: () => void;
}

export default function MedicationDetail({ medication, visible, onClose }: MedicationDetailProps) {
  const { colors } = useTheme();
  if (!medication) return null;

  const familiaColor = FAMILIA_COLORS[medication.familia || ''] || colors.primary;

  const renderSection = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.sectionValue, { color: colors.text }]}>{value}</Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.nombre, { color: colors.text }]} numberOfLines={2}>
                {medication.nombre}
              </Text>
              {medication.marca_comercial && (
                <Text style={[styles.marca, { color: colors.textSecondary }]}>
                  {medication.marca_comercial}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.background }]}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Badges */}
            <View style={styles.badges}>
              <VBadge color={familiaColor}>{medication.familia || 'N/D'}</VBadge>
              <VBadge color={colors.primary}>{medication.presentacion || 'N/D'}</VBadge>
            </View>

            {/* Funcion */}
            {medication.funcion && (
              <View style={[styles.funcionCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.funcionLabel, { color: colors.textSecondary }]}>Funcion</Text>
                <Text style={[styles.funcionText, { color: colors.text }]}>{medication.funcion}</Text>
              </View>
            )}

            {/* Dosis */}
            <View style={styles.dosisContainer}>
              {medication.dosis_perro && (
                <View style={[styles.dosisCard, { backgroundColor: '#1565C010', borderColor: '#1565C030' }]}>
                  <Text style={[styles.dosisSpecies, { color: '#1565C0' }]}>Perro</Text>
                  <Text style={[styles.dosisValue, { color: colors.text }]}>{medication.dosis_perro}</Text>
                </View>
              )}
              {medication.dosis_gato && (
                <View style={[styles.dosisCard, { backgroundColor: '#7B1FA210', borderColor: '#7B1FA230' }]}>
                  <Text style={[styles.dosisSpecies, { color: '#7B1FA2' }]}>Gato</Text>
                  <Text style={[styles.dosisValue, { color: colors.text }]}>{medication.dosis_gato}</Text>
                </View>
              )}
            </View>

            {/* Sections */}
            {renderSection('Via de administracion', medication.via_administracion)}
            {renderSection('Efectos adversos', medication.efectos_adversos)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  nombre: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  marca: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: SPACING.xl,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  funcionCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  funcionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  funcionText: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 22,
  },
  dosisContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dosisCard: {
    flex: 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  dosisSpecies: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  dosisValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  sectionValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
});
