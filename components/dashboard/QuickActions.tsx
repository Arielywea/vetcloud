import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VetCloudIcon, { VetCloudIconName } from '../icons/VetCloudIcon';

const ACTIONS: { label: string; iconName: VetCloudIconName; route: string }[] = [
  { label: 'Nueva Consulta', iconName: 'consulta', route: '/(drawer)/agenda' },
  { label: 'Nueva Cita', iconName: 'agenda', route: '/(drawer)/agenda' },
  { label: 'Nuevo Paciente', iconName: 'pacientes', route: '/(drawer)/add-paciente' },
  { label: 'Inventario', iconName: 'inventario', route: '/(drawer)/inventario' },
  { label: 'Exám. Laboratorio', iconName: 'laboratorio', route: '/(drawer)/laboratorio' },
  { label: 'Reportes', iconName: 'reportes', route: '/(drawer)/reportes' },
];

export default function QuickActions() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      {/* Header */}
      <View style={styles.header}>
        <VetCloudIcon name="dashboard" size={18} color={colors.accent} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Acciones Rápidas</Text>
      </View>

      {/* Actions grid */}
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const actionColor = isDark ? colors.accent : colors.primary;
          return (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionItem, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primaryContainer }]}>
                <VetCloudIcon name={action.iconName} size={20} color={actionColor} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]} numberOfLines={1}>
                {action.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  headerEmoji: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  actionItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.regular,
    flex: 1,
  },
});
