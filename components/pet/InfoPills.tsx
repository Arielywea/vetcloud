import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

interface InfoPillsProps {
  pet: DirectusPet;
}

// Facts the header doesn't already show (breed, age and sex live there):
// label over value, no pills, icons or shadows.
export default function InfoPills({ pet }: InfoPillsProps) {
  const { colors } = useTheme();

  const facts = [
    { label: 'Especie', value: pet.species === 'dog' ? 'Canino' : 'Felino' },
    ...((pet.weight ?? 0) > 0 ? [{ label: 'Peso', value: `${pet.weight} kg` }] : []),
    ...(pet.color ? [{ label: 'Color', value: pet.color }] : []),
    ...(pet.id_number ? [{ label: 'Microchip', value: pet.id_number }] : []),
  ];

  return (
    <View style={styles.container}>
      {facts.map((fact) => (
        <View key={fact.label} style={styles.fact}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{fact.label}</Text>
          <Text style={[styles.value, { color: colors.text }]}>{fact.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: SPACING['2xl'],
    rowGap: SPACING.md,
    marginTop: SPACING.lg,
  },
  fact: { minWidth: 96 },
  label: { fontSize: TYPOGRAPHY.sizes.sm },
  value: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginTop: 2 },
});
