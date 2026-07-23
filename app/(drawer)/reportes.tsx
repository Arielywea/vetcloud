import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart3, PawPrint, Calendar, Package, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VStatCard from '../../components/ui/StatCard';

const MOCK_STATS = [
  { label: 'Pacientes', value: '127', change: '+12', positive: true, icon: 'paw', color: '#3B82F6' },
  { label: 'Citas (Mes)', value: '89', change: '+8', positive: true, icon: 'calendar', color: '#10B981' },
  { label: 'Inventario', value: '45', change: '-3', positive: false, icon: 'package', color: '#F59E0B' },
  { label: 'Internados', value: '5', change: '+2', positive: true, icon: 'heart', color: '#EF4444' },
];

const MOCK_WEEKLY = [
  { day: 'Lun', consultations: 8 },
  { day: 'Mar', consultations: 12 },
  { day: 'Mié', consultations: 6 },
  { day: 'Jue', consultations: 10 },
  { day: 'Vie', consultations: 9 },
  { day: 'Sáb', consultations: 4 },
];

const MOCK_TOP_RECORDS = [
  { type: 'Consulta', count: 45, pct: 38 },
  { type: 'Vacuna', count: 28, pct: 24 },
  { type: 'Cirugía', count: 12, pct: 10 },
  { type: 'Control', count: 35, pct: 30 },
];

const RECORD_COLORS: Record<string, string> = {
  Consulta: '#3B82F6',
  Vacuna: '#10B981',
  'Cirugía': '#EF4444',
  Control: '#F59E0B',
};

export default function ReportesScreen() {
  const { colors, spacing, radius, typography, shadows } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reportes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Resumen y estadísticas de la clínica
        </Text>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {MOCK_STATS.map(stat => (
          <View key={stat.label} style={styles.statWrapper}>
            <VStatCard
              label={stat.label}
              value={stat.value}
              icon={<View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                {stat.icon === 'paw' && <PawPrint size={18} color="#FFF" />}
                {stat.icon === 'calendar' && <Calendar size={18} color="#FFF" />}
                {stat.icon === 'package' && <Package size={18} color="#FFF" />}
                {stat.icon === 'heart' && <BarChart3 size={18} color="#FFF" />}
              </View>}
            />
          </View>
        ))}
      </View>

      {/* Weekly activity chart */}
      <VCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Actividad de la Semana</Text>
        <View style={styles.chart}>
          {MOCK_WEEKLY.map((day, idx) => {
            const maxVal = Math.max(...MOCK_WEEKLY.map(d => d.consultations));
            const heightPct = (day.consultations / maxVal) * 120;
            return (
              <View key={idx} style={styles.barCol}>
                <Text style={[styles.barValue, { color: colors.textSecondary }]}>{day.consultations}</Text>
                <View style={[styles.bar, { height: heightPct, backgroundColor: colors.primary }]} />
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{day.day}</Text>
              </View>
            );
          })}
        </View>
      </VCard>

      {/* Top record types */}
      <VCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tipos de Fichas</Text>
        {MOCK_TOP_RECORDS.map(record => (
          <View key={record.type} style={styles.recordRow}>
            <View style={styles.recordInfo}>
              <View style={[styles.recordDot, { backgroundColor: RECORD_COLORS[record.type] }]} />
              <Text style={[styles.recordType, { color: colors.text }]}>{record.type}</Text>
            </View>
            <View style={styles.recordStats}>
              <Text style={[styles.recordCount, { color: colors.text }]}>{record.count}</Text>
              <View style={[styles.barBg, { backgroundColor: colors.surfaceVariant }]}>
                <View style={[styles.barFill, { width: `${record.pct}%`, backgroundColor: RECORD_COLORS[record.type] }]} />
              </View>
              <Text style={[styles.recordPct, { color: colors.textSecondary }]}>{record.pct}%</Text>
            </View>
          </View>
        ))}
      </VCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.lg, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.xs },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statWrapper: { width: '47%' },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { marginBottom: SPACING.lg },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.lg },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: SPACING.lg,
  },
  barCol: { alignItems: 'center', flex: 1, gap: SPACING.xs },
  barValue: { fontSize: TYPOGRAPHY.sizes.xs },
  bar: {
    width: 24,
    borderRadius: RADIUS.sm,
    minHeight: 4,
  },
  barLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  recordInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  recordDot: { width: 10, height: 10, borderRadius: 5 },
  recordType: { fontSize: TYPOGRAPHY.sizes.md },
  recordStats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  recordCount: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, width: 30 },
  barBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  recordPct: { fontSize: TYPOGRAPHY.sizes.xs, width: 36, textAlign: 'right' },
});
