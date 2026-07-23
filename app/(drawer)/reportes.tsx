import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart3, PawPrint, Calendar, Package } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { RECORD_TYPE_COLORS } from '../../constants/colors';
import VCard from '../../components/ui/Card';
import VStatCard from '../../components/ui/StatCard';

const MOCK_STATS = [
  { label: 'Pacientes', value: '127', icon: <PawPrint size={20} color="#FFF" />, color: '#3B82F6' },
  { label: 'Citas (Mes)', value: '89', icon: <Calendar size={20} color="#FFF" />, color: '#10B981' },
  { label: 'Inventario', value: '45', icon: <Package size={20} color="#FFF" />, color: '#F59E0B' },
  { label: 'Internados', value: '5', icon: <BarChart3 size={20} color="#FFF" />, color: '#EF4444' },
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

export default function ReportesScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reportes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Resumen y estadísticas de la clínica
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {MOCK_STATS.map(stat => (
          <View key={stat.label} style={styles.statWrapper}>
            <VStatCard
              label={stat.label}
              value={stat.value}
              icon={<View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                {stat.icon}
              </View>}
              color={stat.color}
            />
          </View>
        ))}
      </View>

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

      <VCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tipos de Fichas</Text>
        {MOCK_TOP_RECORDS.map(record => {
          const recordColor = RECORD_TYPE_COLORS[record.type.toLowerCase()] || colors.primary;
          return (
            <View key={record.type} style={styles.recordRow}>
              <View style={styles.recordInfo}>
                <View style={[styles.recordDot, { backgroundColor: recordColor }]} />
                <Text style={[styles.recordType, { color: colors.text }]}>{record.type}</Text>
              </View>
              <View style={styles.recordStats}>
                <Text style={[styles.recordCount, { color: colors.text }]}>{record.count}</Text>
                <View style={[styles.barBg, { backgroundColor: colors.surfaceVariant }]}>
                  <View style={[styles.barFill, { width: `${record.pct}%`, backgroundColor: recordColor }]} />
                </View>
                <Text style={[styles.recordPct, { color: colors.textSecondary }]}>{record.pct}%</Text>
              </View>
            </View>
          );
        })}
      </VCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.sm },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statWrapper: { width: '47%' },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { marginBottom: SPACING.xl },
  cardTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xl },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: SPACING.xl,
  },
  barCol: { alignItems: 'center', flex: 1, gap: SPACING.xs },
  barValue: { fontSize: TYPOGRAPHY.sizes.xs },
  bar: {
    width: 32,
    borderRadius: RADIUS.md,
    minHeight: 4,
  },
  barLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  recordInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  recordDot: { width: 12, height: 12, borderRadius: 6 },
  recordType: { fontSize: TYPOGRAPHY.sizes.md },
  recordStats: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  recordCount: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, width: 30 },
  barBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  recordPct: { fontSize: TYPOGRAPHY.sizes.xs, width: 36, textAlign: 'right' },
});
