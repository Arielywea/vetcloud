import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface InfoPillsProps {
  pet: DirectusPet;
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return 'N/D';
  try {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const years = Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
    if (years > 0) return `${years} año`;
    const months = Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} mes`;
  } catch {
    return 'N/D';
  }
}

export default function InfoPills({ pet }: InfoPillsProps) {
  const { colors } = useTheme();

  const pills = [
    { icon: 'paw', label: 'Especie', value: pet.species === 'dog' ? 'Canino' : 'Felino' },
    { icon: 'shape', label: 'Raza', value: pet.breed || 'N/D' },
    ...(pet.sex ? [{ icon: pet.sex === 'macho' ? 'gender-male' : 'gender-female', label: 'Sexo', value: pet.sex === 'macho' ? 'Macho' : 'Hembra' }] : []),
    { icon: 'palette', label: 'Color', value: pet.color || 'N/D' },
    ...(pet.weight > 0 ? [{ icon: 'weight', label: 'Peso', value: `${pet.weight} kg` }] : []),
    { icon: 'calendar', label: 'Edad', value: calculateAge(pet.birth_date) },
    ...(pet.id_number ? [{ icon: 'barcode', label: 'Microchip', value: pet.id_number }] : []),
  ];

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      {pills.map((pill, i) => (
        <View key={i} style={[styles.pill, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name={pill.icon as any} size={14} color={colors.primary} />
          <Text style={[styles.pillLabel, { color: colors.textSecondary }]}>{pill.label}:</Text>
          <Text style={[styles.pillValue, { color: colors.primary }]}>{pill.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  pillLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  pillValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
