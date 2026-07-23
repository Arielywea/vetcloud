import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { PawPrint } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface PatientEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

export default function PatientEmptyState({ hasFilters, onClearFilters }: PatientEmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
        <PawPrint size={32} color={colors.textLight} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {hasFilters
          ? 'No se encontraron pacientes'
          : 'No hay pacientes registrados'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {hasFilters
          ? 'Prueba a cambiar los filtros de búsqueda'
          : 'Registra tu primer paciente para comenzar'}
      </Text>
      {hasFilters && onClearFilters && (
        <Text
          style={[styles.clearLink, { color: colors.primary }]}
          onPress={onClearFilters}
        >
          Limpiar filtros
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING['2xl'],
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  clearLink: {
    marginTop: SPACING.lg,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
