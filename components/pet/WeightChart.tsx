import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { ClinicalRecord } from '../../services/directus';
import DynamicIcon from '../ui/DynamicIcon';

interface WeightChartProps {
  records: ClinicalRecord[];
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function WeightChart({ records }: WeightChartProps) {
  const { colors } = useTheme();

  const weightData = useMemo(() => {
    const withWeight = records
      .filter(r => r.details?.weight && r.details.weight > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (withWeight.length === 0) return null;

    const labels = withWeight.map(r => {
      const d = new Date(r.date);
      return MONTH_NAMES[d.getMonth()];
    });

    const data = withWeight.map(r => r.details.weight as number);

    const current = data[data.length - 1]!;
    const first = data[0]!;
    const avg = data.reduce((a: number, b: number) => a + b, 0) / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (data.length >= 2) {
      const diff = current - first;
      if (diff > 0.5) trend = 'up';
      else if (diff < -0.5) trend = 'down';
    }

    return { labels, data, current, avg, min, max, trend, count: data.length };
  }, [records]);

  if (!weightData) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
        <View style={styles.header}>
          <DynamicIcon name="weight" size={18} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evolucion de Peso</Text>
        </View>
        <View style={styles.emptyState}>
          <DynamicIcon name="chart-line-variant" size={32} color={colors.textLight} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Registra al menos 2 visitas con peso para ver la tendencia
          </Text>
        </View>
      </View>
    );
  }

  const trendIcon = weightData.trend === 'up' ? 'trending-up' : weightData.trend === 'down' ? 'trending-down' : 'trending-neutral';
  const trendColor = weightData.trend === 'up' ? colors.warning : weightData.trend === 'down' ? colors.info : colors.success;
  const trendLabel = weightData.trend === 'up' ? 'Subiendo' : weightData.trend === 'down' ? 'Bajando' : 'Estable';

  const screenWidth = Dimensions.get('window').width - 80;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      <View style={styles.header}>
        <DynamicIcon name="weight" size={18} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Evolucion de Peso</Text>
        <View style={[styles.trendBadge, { backgroundColor: trendColor + '20' }]}>
          <DynamicIcon name={trendIcon} size={14} color={trendColor} />
          <Text style={[styles.trendLabel, { color: trendColor }]}>{trendLabel}</Text>
        </View>
      </View>

      <LineChart
        data={{
          labels: weightData.labels,
          datasets: [{ data: weightData.data as number[] }],
        }}
        width={screenWidth}
        height={180}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: () => colors.textSecondary,
          style: { borderRadius: RADIUS.md },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '4',
            stroke: colors.border,
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
        formatYLabel={(v) => `${parseFloat(v).toFixed(1)}`}
      />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{weightData.current} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Actual</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{weightData.avg.toFixed(1)} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Promedio</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{weightData.min} - {weightData.max} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rango</Text>
        </View>
      </View>

      <Text style={[styles.visitCount, { color: colors.textLight }]}>
        Basado en {weightData.count} {weightData.count === 1 ? 'registro' : 'registros'} con peso
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING['2xs'],
    borderRadius: RADIUS.full,
  },
  trendLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  visitCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});
