import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Line, Path, Polyline, Text as SvgText } from 'react-native-svg';
import { Weight, LineChart as LineChartIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DisplayText from '../ui/DisplayText';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, alpha } from '../../constants/tokens';
import { api, ClinicalRecord } from '../../services/directus';
import { useRefreshOn } from '../../hooks/useDirectus';
import { toLocalDateKey } from '../../utils/date';
import VBadge from '../ui/Badge';

interface WeightChartProps {
  records: ClinicalRecord[];
  /** Also plots weights saved with the "Signos" form (/vital-measurements) */
  petId?: string;
}

type WeightPoint = { date: Date; kg: number };

const CHART_HEIGHT = 160;
const PAD = { top: 12, right: 12, bottom: 24, left: 40 };

const formatKg = (n: number) => n.toLocaleString('es-CL', { maximumFractionDigits: 1 });
// "nov 2025", not "nov 25" (which reads as the 25th of November)
const formatDate = (d: Date) => d.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });

// Drawn with react-native-svg (already a dependency) instead of react-native-chart-kit:
// sized by onLayout so it fits its card next to the sidebar, straight segments (a bezier
// invents values between visits) and x positions proportional to the visit dates.
export default function WeightChart({ records, petId }: WeightChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [vitalWeights, setVitalWeights] = useState<WeightPoint[]>([]);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  const loadVitals = useCallback(() => {
    if (!petId) return;
    api.vitals.list(petId)
      .then((rows: any[]) => {
        if (!mountedRef.current) return;
        setVitalWeights((rows || [])
          .filter(r => r.weight != null && Number(r.weight) > 0 && r.recorded_at)
          .map(r => ({ date: new Date(r.recorded_at), kg: Number(r.weight) })));
      })
      .catch(() => { /* the chart still shows the weights from clinical records */ });
  }, [petId]);
  useEffect(() => { loadVitals(); }, [loadVitals]);
  useRefreshOn(['vital_measurements'], loadVitals);

  const weightData = useMemo(() => {
    // weight_kg is the visit's weight since migration 021; older records kept it in details.weight
    const fromRecords: WeightPoint[] = records
      .map(r => ({ date: new Date(r.date), kg: Number(r.weight_kg ?? r.details?.weight) }))
      .filter(p => p.kg > 0);
    // A visit often stores the same weight in the record and in Signos: keep one per day and value
    const seen = new Set<string>();
    const points = [...fromRecords, ...vitalWeights]
      .filter(p => !Number.isNaN(p.date.getTime()) && Number.isFinite(p.kg))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .filter(p => {
        const key = `${toLocalDateKey(p.date)}|${p.kg}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    if (points.length === 0) return null;

    const data = points.map(p => p.kg);
    const current = data[data.length - 1]!;
    const first = data[0]!;
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (data.length >= 2) {
      const diff = current - first;
      if (diff > 0.5) trend = 'up';
      else if (diff < -0.5) trend = 'down';
    }

    return { points, current, avg, min, max, trend, count: data.length };
  }, [records, vitalWeights]);

  const chart = useMemo(() => {
    if (!weightData || weightData.count < 2 || width <= 0) return null;
    const { points, min, max } = weightData;
    // Keep at least ±0.5 kg of headroom so a flat line doesn't sit on the frame
    const span = Math.max(max - min, 1);
    const yMin = Math.max(0, min - span * 0.15);
    const yMax = max + span * 0.15;
    const t0 = points[0]!.date.getTime();
    const t1 = points[points.length - 1]!.date.getTime();
    const innerW = width - PAD.left - PAD.right;
    const innerH = CHART_HEIGHT - PAD.top - PAD.bottom;
    const x = (p: { date: Date }, i: number) =>
      PAD.left + (t1 > t0 ? ((p.date.getTime() - t0) / (t1 - t0)) * innerW : (i / (points.length - 1)) * innerW);
    const y = (kg: number) => PAD.top + (1 - (kg - yMin) / (yMax - yMin)) * innerH;

    const xy = points.map((p, i) => ({ x: x(p, i), y: y(p.kg) }));
    const line = xy.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const baseY = PAD.top + innerH;
    const area = `M${xy[0]!.x},${baseY} ${xy.map(p => `L${p.x},${p.y}`).join(' ')} L${xy[xy.length - 1]!.x},${baseY} Z`;
    const ticks = [yMax, (yMax + yMin) / 2, yMin].map(v => ({ v, y: y(v) }));
    const xLabels = [
      { x: xy[0]!.x, label: formatDate(points[0]!.date), anchor: 'start' as const },
      { x: xy[xy.length - 1]!.x, label: formatDate(points[points.length - 1]!.date), anchor: 'end' as const },
    ];
    return { xy, line, area, ticks, xLabels, baseY };
  }, [weightData, width]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const header = (badge?: React.ReactNode) => (
    <View style={styles.header}>
      <DisplayText style={[styles.headerTitle, { color: colors.text }]}>Evolución del peso</DisplayText>
      {badge}
    </View>
  );

  if (!weightData || weightData.count < 2) {
    return (
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
        {header()}
        <View style={styles.emptyState}>
          <LineChartIcon size={32} color={colors.textLight} />
          {weightData ? (
            <Text style={[styles.emptyValue, { color: colors.text }]}>{formatKg(weightData.current)} kg</Text>
          ) : null}
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Registra al menos 2 visitas con peso para ver la tendencia
          </Text>
        </View>
      </View>
    );
  }

  const trend = {
    up: { Icon: TrendingUp, tone: 'warning' as const, label: 'Subiendo' },
    down: { Icon: TrendingDown, tone: 'info' as const, label: 'Bajando' },
    stable: { Icon: Minus, tone: 'success' as const, label: 'Estable' },
  }[weightData.trend];
  const firstDate = weightData.points[0]!.date;
  const lastDate = weightData.points[weightData.points.length - 1]!.date;
  const summary = `Peso de ${formatKg(weightData.points[0]!.kg)} a ${formatKg(weightData.current)} kg entre ${formatDate(firstDate)} y ${formatDate(lastDate)}, ${trend.label.toLowerCase()}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      {header(<VBadge variant={trend.tone}>{trend.label}</VBadge>)}

      {/* The key makes this a fresh mount: react-native-web only starts observing layout when a View
          mounts, and without it React reused the empty-state View and onLayout never fired */}
      <View key="chart" onLayout={onLayout} style={styles.chart} accessible accessibilityRole="image" accessibilityLabel={summary}>
        {chart ? (
          <Svg width={width} height={CHART_HEIGHT}>
            {chart.ticks.map((t, i) => (
              <React.Fragment key={i}>
                <Line x1={PAD.left} x2={width - PAD.right} y1={t.y} y2={t.y} stroke={colors.border} strokeWidth={1} strokeDasharray="4 4" />
                <SvgText x={PAD.left - 6} y={t.y + 4} fontSize={11} fontFamily={TYPOGRAPHY.fontFamily} fill={colors.textSecondary} textAnchor="end">{formatKg(t.v)}</SvgText>
              </React.Fragment>
            ))}
            <Path d={chart.area} fill={alpha(colors.primary, 0.08)} />
            <Polyline points={chart.line} fill="none" stroke={colors.primary} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {chart.xy.map((p, i) => {
              const last = i === chart.xy.length - 1;
              return <Circle key={i} cx={p.x} cy={p.y} r={last ? 4.5 : 3.5} fill={last ? colors.primary : colors.surface} stroke={colors.primary} strokeWidth={2} />;
            })}
            {chart.xLabels.map((l, i) => (
              <SvgText key={i} x={l.x} y={CHART_HEIGHT - 6} fontSize={11} fontFamily={TYPOGRAPHY.fontFamily} fill={colors.textSecondary} textAnchor={l.anchor}>{l.label}</SvgText>
            ))}
          </Svg>
        ) : (
          <View style={{ height: CHART_HEIGHT }} />
        )}
      </View>

      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatKg(weightData.current)} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Actual</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatKg(weightData.avg)} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Promedio</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.text }]}>{formatKg(weightData.min)}–{formatKg(weightData.max)} kg</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rango</Text>
        </View>
      </View>

      <Text style={[styles.visitCount, { color: colors.textSecondary }]}>
        Basado en {weightData.count} registros con peso
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
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  chart: {
    marginVertical: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
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
  emptyValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
});
