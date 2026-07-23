import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

interface StatsChartProps {
  totalConsultas?: number;
  consultasChange?: number;
  pacientesNuevos?: number;
  pacientesChange?: number;
  vacunas?: number;
  vacunasChange?: number;
  hospitalizaciones?: number;
  hospitalizacionesChange?: number;
}

export default function StatsChart({
  totalConsultas = 24,
  consultasChange = 18,
  pacientesNuevos = 8,
  pacientesChange = 10,
  vacunas = 15,
  vacunasChange = 25,
  hospitalizaciones = 3,
  hospitalizacionesChange = -5,
}: StatsChartProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>📊</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Estadísticas</Text>
        </View>
        <View style={[styles.periodBadge, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.periodText, { color: colors.primary }]}>Este mes</Text>
        </View>
      </View>

      {/* Main stat */}
      <View style={styles.mainStat}>
        <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>Consultas</Text>
        <Text style={[styles.mainStatValue, { color: colors.text }]}>{totalConsultas}</Text>
        <View style={styles.changeRow}>
          <TrendingUp size={14} color={colors.success} />
          <Text style={[styles.changeText, { color: colors.success }]}>
            +{consultasChange}% vs mes anterior
          </Text>
        </View>
      </View>

      {/* Chart placeholder */}
      <View style={[styles.chartPlaceholder, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.chartLine}>
          {[40, 60, 45, 80, 65, 90, 70, 95].map((h, i) => (
            <View
              key={i}
              style={[
                styles.chartBar,
                {
                  height: `${h}%`,
                  backgroundColor: i === 7 ? colors.primary : colors.primaryContainer,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Sub stats */}
      <View style={[styles.subStats, { borderTopColor: colors.border }]}>
        <View style={styles.subStat}>
          <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Pacientes nuevos</Text>
          <Text style={[styles.subStatValue, { color: colors.text }]}>{pacientesNuevos}</Text>
          <View style={styles.subChange}>
            {pacientesChange >= 0 ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.error} />
            )}
            <Text style={[styles.subChangeText, {
              color: pacientesChange >= 0 ? colors.success : colors.error
            }]}>
              {pacientesChange >= 0 ? '+' : ''}{pacientesChange}%
            </Text>
          </View>
        </View>

        <View style={[styles.subStatDivider, { backgroundColor: colors.border }]} />

        <View style={styles.subStat}>
          <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Vacunas aplicadas</Text>
          <Text style={[styles.subStatValue, { color: colors.text }]}>{vacunas}</Text>
          <View style={styles.subChange}>
            {vacunasChange >= 0 ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.error} />
            )}
            <Text style={[styles.subChangeText, {
              color: vacunasChange >= 0 ? colors.success : colors.error
            }]}>
              +{vacunasChange}%
            </Text>
          </View>
        </View>

        <View style={[styles.subStatDivider, { backgroundColor: colors.border }]} />

        <View style={styles.subStat}>
          <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Hospitalizaciones</Text>
          <Text style={[styles.subStatValue, { color: colors.text }]}>{hospitalizaciones}</Text>
          <View style={styles.subChange}>
            {hospitalizacionesChange >= 0 ? (
              <TrendingUp size={12} color={colors.success} />
            ) : (
              <TrendingDown size={12} color={colors.error} />
            )}
            <Text style={[styles.subChangeText, {
              color: hospitalizacionesChange >= 0 ? colors.success : colors.error
            }]}>
              {hospitalizacionesChange >= 0 ? '+' : ''}{hospitalizacionesChange}%
            </Text>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  periodBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  periodText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  mainStat: {
    marginBottom: SPACING.xl,
  },
  mainStatLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  mainStatValue: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  changeText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  chartPlaceholder: {
    height: 80,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  chartLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  chartBar: {
    width: 24,
    borderRadius: RADIUS.sm,
  },
  subStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: SPACING.xl,
  },
  subStat: {
    flex: 1,
    alignItems: 'center',
  },
  subStatDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: SPACING.sm,
  },
  subStatLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
  },
  subStatValue: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.xs,
  },
  subChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: SPACING.xs,
  },
  subChangeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
