import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VetIconPng, { VetIconName } from '../icons/VetIconPng';

const ACTIONS = [
  { label: 'Nueva Consulta', iconName: 'agenda' as VetIconName, route: '/(drawer)/agenda', colorKey: 'info' as const },
  { label: 'Nueva Cita', iconName: 'agenda' as VetIconName, route: '/(drawer)/agenda', colorKey: 'success' as const },
  { label: 'Nuevo Paciente', iconName: 'pacientes' as VetIconName, route: '/(drawer)/add-paciente', colorKey: 'primary' as const },
  { label: 'Inventario', iconName: 'inventario' as VetIconName, route: '/(drawer)/inventario', colorKey: 'warning' as const },
  { label: 'Exám. Laboratorio', iconName: 'laboratorio' as VetIconName, route: '/(drawer)/laboratorio', colorKey: 'error' as const },
  { label: 'Reportes', iconName: 'reportes' as VetIconName, route: '/(drawer)/reportes', colorKey: 'primary' as const },
];

export default function QuickActions() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      {/* Header */}
      <View style={styles.header}>
        <VetIconPng name="dashboard" size={18} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Acciones Rápidas</Text>
      </View>

      {/* Actions grid */}
      <View style={styles.grid}>
        {ACTIONS.map((action) => {
          const actionColor = colors[action.colorKey];
          return (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionItem, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: actionColor + '18' }]}>
                <VetIconPng name={action.iconName} size={20} />
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
    fontSize: 18,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
