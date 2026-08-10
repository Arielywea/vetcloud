import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VCard from '../ui/Card';
import VBadge from '../ui/Badge';
import { Medication } from '../../services/directus';
import { FAMILIA_COLORS } from '../../constants/medications';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
  index?: number;
}

export default function MedicationCard({ medication, onPress, index = 0 }: MedicationCardProps) {
  const { colors } = useTheme();
  const familiaColor = FAMILIA_COLORS[medication.familia || ''] || colors.primary;

  return (
    <VCard onPress={onPress} entrance style={{ marginBottom: SPACING.md }}>
      <View style={styles.header}>
        <Text style={[styles.nombre, { color: colors.text }]} numberOfLines={1}>
          {medication.nombre}
        </Text>
        <VBadge color={familiaColor} size="sm">
          {medication.familia || 'N/D'}
        </VBadge>
      </View>

      {medication.marca_comercial && (
        <Text style={[styles.marca, { color: colors.textSecondary }]} numberOfLines={1}>
          {medication.marca_comercial}
        </Text>
      )}

      <View style={styles.infoRow}>
        {medication.presentacion && (
          <Text style={[styles.info, { color: colors.textSecondary }]} numberOfLines={1}>
            {medication.presentacion}
          </Text>
        )}
      </View>

      {medication.funcion && (
        <Text style={[styles.funcion, { color: colors.text }]} numberOfLines={2}>
          {medication.funcion}
        </Text>
      )}

      <View style={styles.dosisRow}>
        {medication.dosis_perro && (
          <View style={[styles.dosisBadge, { backgroundColor: '#1565C015', borderColor: '#1565C030' }]}>
            <Text style={[styles.dosisLabel, { color: '#1565C0' }]}>Perro</Text>
            <Text style={[styles.dosisValue, { color: colors.text }]} numberOfLines={1}>
              {medication.dosis_perro}
            </Text>
          </View>
        )}
        {medication.dosis_gato && (
          <View style={[styles.dosisBadge, { backgroundColor: '#7B1FA215', borderColor: '#7B1FA230' }]}>
            <Text style={[styles.dosisLabel, { color: '#7B1FA2' }]}>Gato</Text>
            <Text style={[styles.dosisValue, { color: colors.text }]} numberOfLines={1}>
              {medication.dosis_gato}
            </Text>
          </View>
        )}
      </View>

      {medication.via_administracion && (
        <View style={styles.viaRow}>
          <Text style={[styles.viaLabel, { color: colors.textSecondary }]}>Via:</Text>
          <Text style={[styles.viaValue, { color: colors.text }]} numberOfLines={1}>
            {medication.via_administracion}
          </Text>
        </View>
      )}
    </VCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  nombre: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    flex: 1,
    marginRight: SPACING.sm,
  },
  marca: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING.xs,
  },
  infoRow: {
    marginBottom: SPACING.xs,
  },
  info: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  funcion: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  dosisRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dosisBadge: {
    flex: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  dosisLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dosisValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  viaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viaLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  viaValue: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
});
