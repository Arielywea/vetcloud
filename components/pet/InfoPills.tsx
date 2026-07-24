import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import AnimatedIcon from '../ui/AnimatedIcon';

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
    if (years > 0) return `${years} year`;
    const months = Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} month`;
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
        <AnimatedIcon key={i} delay={i * 60} animate="fadeScale">
          <View style={[styles.pill, { backgroundColor: colors.primaryContainer }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#C9A22720' }]}>
              <MaterialCommunityIcons name={pill.icon as any} size={13} color="#C9A227" />
            </View>
            <Text style={[styles.pillLabel, { color: colors.textSecondary }]}>{pill.label}:</Text>
            <Text style={[styles.pillValue, { color: colors.primary }]}>{pill.value}</Text>
          </View>
        </AnimatedIcon>
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
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  pillValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});