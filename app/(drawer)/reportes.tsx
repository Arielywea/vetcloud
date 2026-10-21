import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart3, PawPrint, Calendar, Package } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../../components/ui/PageHeader';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { TEXT_ON_PRIMARY, RECORD_TYPE_COLORS } from '../../constants/colors';
import VCard from '../../components/ui/Card';
import VStatCard from '../../components/ui/StatCard';
import VRefreshControl from '../../components/ui/VRefreshControl';
import { api } from '../../services/directus';
import { useRefreshOn } from '../../hooks/useDirectus';
import DisplayText from '../../components/ui/DisplayText';

interface DashboardStats {
  totalPets: number;
  todayAppointments: number;
  totalRecords: number;
  lowStockAlerts: number;
}

// /reports/summary: this month's book (revenue and visits were computed but never shown)
interface MonthSummary {
  patients: number;
  appointments: { total: number; completed: number };
  revenue: { total: number | string; count: number };
  records: number;
}

interface WeeklyData {
  day: string;
  count: number;
}

interface RecordTypeData {
  record_type: string;
  count: number;
}

export default function ReportesScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [recordTypes, setRecordTypes] = useState<RecordTypeData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [month, setMonth] = useState<MonthSummary | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [stats, weekly, records, summary] = await Promise.all([
        api.stats.dashboard(),
        api.stats.weekly(),
        api.stats.recordTypes(),
        api.reports.summary(),
      ]);
      setDashboardStats(stats);
      setMonth(summary as MonthSummary);
      setWeeklyData(weekly?.days || []);
      setRecordTypes(records || []);
      setLoadError(null);
    } catch (error: any) {
      setLoadError(error?.message || 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useRefreshOn(['appointments', 'clinical_records', 'pets', 'inventory'], loadData);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await loadData(); } finally { setRefreshing(false); }
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const revenue = Number(month?.revenue.total ?? 0);
  const ledger = [
    { label: `Ingresos (${month?.revenue.count ?? 0} cobros)`, value: revenue.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }) },
    { label: `Citas atendidas de ${month?.appointments.total ?? 0}`, value: String(month?.appointments.completed ?? 0) },
    { label: 'Fichas clínicas del mes', value: String(month?.records ?? 0) },
    { label: 'Pacientes en total', value: String(month?.patients ?? dashboardStats?.totalPets ?? 0) },
  ];
  const stats = [
    { label: 'Pacientes', value: String(dashboardStats?.totalPets ?? 0), icon: <PawPrint size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.info },
    { label: 'Citas (Hoy)', value: String(dashboardStats?.todayAppointments ?? 0), icon: <Calendar size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.success },
    { label: 'Fichas', value: String(dashboardStats?.totalRecords ?? 0), icon: <Package size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.warning },
    { label: 'Stock bajo', value: String(dashboardStats?.lowStockAlerts ?? 0), icon: <BarChart3 size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.error },
  ];

  // At least 1: an all-zero week must not divide by zero
  const maxWeekly = Math.max(1, ...weeklyData.map(d => d.count));
  const totalRecords = recordTypes.reduce((sum, r) => sum + r.count, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content} refreshControl={<VRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <PageHeader title="Reportes" subtitle="Resumen y estadísticas de la clínica" />

      {loadError && (
        <View accessibilityRole="alert" style={[styles.errorBanner, { borderColor: colors.error, backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, flex: 1 }}>{loadError}</Text>
          <Text onPress={handleRefresh} accessibilityRole="button" style={{ color: colors.primary, fontWeight: TYPOGRAPHY.weights.semibold }}>Reintentar</Text>
        </View>
      )}

      {/* The month's book: figures in Cormorant like the dashboard ledger, no icon tiles */}
      <View style={[styles.ledger, { backgroundColor: colors.surface }]}>
        <DisplayText style={[styles.cardTitleDisplay, { color: colors.text }]}>
          {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }).replace(/^./, (c) => c.toUpperCase())}
        </DisplayText>
        <View style={styles.ledgerRow}>
          {ledger.map((item) => (
            <View key={item.label} style={styles.ledgerItem}>
              <DisplayText accessibilityRole="text" style={[styles.ledgerValue, { color: colors.text }]}>{item.value}</DisplayText>
              <Text style={[styles.ledgerLabel, { color: colors.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <VCard style={styles.card}>
        <DisplayText style={[styles.cardTitleDisplay, { color: colors.text }]}>Actividad de la semana</DisplayText>
        {/* An all-zero week is a sentence, not seven empty bars */}
        {weeklyData.every((d) => d.count === 0) ? (
          <Text style={[styles.emptyWeek, { color: colors.textSecondary }]}>No se registraron fichas en los últimos 7 días.</Text>
        ) : (
        <View style={styles.chart}>
          {weeklyData.map((day, idx) => {
            const heightPct = (day.count / maxWeekly) * 120;
            return (
              <View key={idx} style={styles.barCol}>
                <Text style={[styles.barValue, { color: colors.textSecondary }]}>{day.count}</Text>
                <View style={[styles.bar, { height: heightPct, backgroundColor: colors.primary }]} />
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{day.day}</Text>
              </View>
            );
          })}
        </View>
        )}
      </VCard>

      <VCard style={styles.card}>
        <DisplayText style={[styles.cardTitleDisplay, { color: colors.text }]}>Tipos de fichas</DisplayText>
        {recordTypes.map(record => {
          const recordColor = RECORD_TYPE_COLORS[record.record_type.toLowerCase()] || colors.primary;
          const pct = totalRecords > 0 ? Math.round((record.count / totalRecords) * 100) : 0;
          return (
            <View key={record.record_type} style={styles.recordRow}>
              <View style={styles.recordInfo}>
                <View style={[styles.recordDot, { backgroundColor: recordColor }]} />
                <Text style={[styles.recordType, { color: colors.text }]}>{RECORD_TYPE_LABELS[record.record_type] || record.record_type}</Text>
              </View>
              <View style={styles.recordStats}>
                <Text style={[styles.recordCount, { color: colors.text }]}>{record.count}</Text>
                <View style={[styles.barBg, { backgroundColor: colors.surfaceVariant }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: recordColor }]} />
                </View>
                <Text style={[styles.recordPct, { color: colors.textSecondary }]}>{pct}%</Text>
              </View>
            </View>
          );
        })}
      </VCard>
    </ScrollView>
  );
}

const RECORD_TYPE_LABELS: Record<string, string> = { consulta: 'Consultas', vacuna: 'Vacunas', cirugia: 'Cirugías', control: 'Controles' };

const styles = StyleSheet.create({
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.lg },
  container: { flex: 1 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  subtitle: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.sm },
  ledger: { padding: SPACING.xl, marginBottom: SPACING.xl },
  ledgerRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING['3xl'], rowGap: SPACING.lg, marginTop: SPACING.md },
  ledgerItem: { minWidth: 160 },
  ledgerValue: { fontSize: 44, lineHeight: 48, fontWeight: '600' },
  ledgerLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  emptyWeek: { fontSize: TYPOGRAPHY.sizes.base, paddingVertical: SPACING.lg },
  cardTitleDisplay: { fontSize: 24, fontWeight: '600', marginBottom: SPACING.md },
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
