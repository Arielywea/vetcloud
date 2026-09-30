import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VetCloudIcon from '../icons/VetCloudIcon';

export interface WeeklyDay { date: string; day: string; count: number; consultas: number; vacunas: number }
export interface WeeklySummary {
  total: number; previousTotal: number;
  consultas: number; previousConsultas: number;
  vacunas: number; previousVacunas: number;
}

interface StatsChartProps {
  days: WeeklyDay[];
  summary: WeeklySummary | null;
  pacientesNuevos: number;
  hospitalizados: number;
  loading?: boolean;
}

// Real numbers only: last 7 days of clinical records vs the 7 before.
// No trend is shown when there is nothing to compare against.
function Trend({ current, previous }: { current: number; previous: number }) {
  const { colors } = useTheme();
  if (previous === 0 && current === 0) return <Text style={[styles.trendText, { color: colors.textSecondary }]}>Sin registros</Text>;
  if (previous === 0) return <Text style={[styles.trendText, { color: colors.textSecondary }]}>Sin datos de la semana anterior</Text>;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const color = diff > 0 ? colors.success : diff < 0 ? colors.warning : colors.textSecondary;
  return (
    <View style={styles.trendRow}>
      <Icon size={14} color={color} />
      <Text style={[styles.trendText, { color: colors.textSecondary }]}>
        <Text style={{ color, fontWeight: TYPOGRAPHY.weights.semibold }}>{diff > 0 ? '+' : ''}{pct}%</Text> vs semana anterior
      </Text>
    </View>
  );
}

export default function StatsChart({ days, summary, pacientesNuevos, hospitalizados, loading }: StatsChartProps) {
  const { colors } = useTheme();
  const max = Math.max(1, ...days.map((d) => d.count));
  const todayIdx = days.length - 1;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <VetCloudIcon name="reportes" size={18} color={colors.accent} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Actividad clínica</Text>
        </View>
        <Text style={[styles.periodText, { color: colors.textSecondary }]}>Últimos 7 días</Text>
      </View>

      <View style={styles.mainStat}>
        <Text style={[styles.mainStatLabel, { color: colors.textSecondary }]}>Fichas registradas</Text>
        <Text {...({ dataSet: { numeric: 'tabular' } } as any)} style={[styles.mainStatValue, { color: colors.text }]}>
          {loading ? '—' : summary?.total ?? 0}
        </Text>
        {!loading && summary && <Trend current={summary.total} previous={summary.previousTotal} />}
      </View>

      <View
        style={[styles.chart, { backgroundColor: colors.surfaceVariant }]}
        accessibilityRole="image"
        accessibilityLabel={`Fichas por día: ${days.map((d) => `${d.day} ${d.count}`).join(', ')}`}
      >
        {days.map((d, i) => (
          <View key={d.date} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max(d.count > 0 ? 8 : 2, (d.count / max) * 100)}%`,
                    backgroundColor: i === todayIdx ? colors.primary : colors.primaryContainer,
                  },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: i === todayIdx ? colors.text : colors.textSecondary }]}>{d.day}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.subStats, { borderTopColor: colors.border }]}>
        <SubStat label="Consultas" value={summary?.consultas ?? 0} loading={loading} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SubStat label="Vacunas" value={summary?.vacunas ?? 0} loading={loading} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SubStat label="Pacientes nuevos (mes)" value={pacientesNuevos} loading={loading} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SubStat label="Hospitalizados" value={hospitalizados} loading={loading} />
      </View>
    </View>
  );
}

function SubStat({ label, value, loading }: { label: string; value: number; loading?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.subStat}>
      <Text {...({ dataSet: { numeric: 'tabular' } } as any)} style={[styles.subStatValue, { color: colors.text }]}>{loading ? '—' : value}</Text>
      <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, padding: SPACING.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  periodText: { fontSize: 12 },
  mainStat: { marginBottom: SPACING.lg },
  mainStatLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  mainStatValue: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, marginTop: SPACING.xs },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.xs },
  trendText: { fontSize: TYPOGRAPHY.sizes.sm },
  chart: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.xs, height: 104, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, width: '100%', maxWidth: 22, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 12 },
  subStats: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, paddingTop: SPACING.lg, rowGap: SPACING.md },
  subStat: { flex: 1, minWidth: 72, alignItems: 'center' },
  divider: { width: 1, alignSelf: 'stretch', marginHorizontal: SPACING.xs },
  subStatValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold },
  subStatLabel: { fontSize: 12, textAlign: 'center', marginTop: 2 },
});
