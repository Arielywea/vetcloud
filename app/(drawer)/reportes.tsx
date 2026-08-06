import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart3, PawPrint, Calendar, Package } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { TEXT_ON_PRIMARY, RECORD_TYPE_COLORS } from '../../constants/colors';
import VCard from '../../components/ui/Card';
import VStatCard from '../../components/ui/StatCard';
import { api } from '../../services/directus';

interface DashboardStats {
  totalPets: number;
  todayAppointments: number;
  totalRecords: number;
  lowStockAlerts: number;
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
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [recordTypes, setRecordTypes] = useState<RecordTypeData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [stats, weekly, records] = await Promise.all([
        api.stats.dashboard(),
        api.stats.weekly(),
        api.stats.recordTypes(),
      ]);
      setDashboardStats(stats);
      setWeeklyData(weekly);
      setRecordTypes(records);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stats = [
    { label: 'Pacientes', value: String(dashboardStats?.totalPets ?? 0), icon: <PawPrint size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.info },
    { label: 'Citas (Hoy)', value: String(dashboardStats?.todayAppointments ?? 0), icon: <Calendar size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.success },
    { label: 'Fichas', value: String(dashboardStats?.totalRecords ?? 0), icon: <Package size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.warning },
    { label: 'Stock Bajo', value: String(dashboardStats?.lowStockAlerts ?? 0), icon: <BarChart3 size={20} color={TEXT_ON_PRIMARY.light.default} />, color: colors.error },
  ];

  const maxWeekly = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.count)) : 1;
  const totalRecords = recordTypes.reduce((sum, r) => sum + r.count, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Reportes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Resumen y estadísticas de la clínica
        </Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map(stat => (
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
      </VCard>

      <VCard style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tipos de Fichas</Text>
        {recordTypes.map(record => {
          const recordColor = RECORD_TYPE_COLORS[record.record_type.toLowerCase()] || colors.primary;
          const pct = totalRecords > 0 ? Math.round((record.count / totalRecords) * 100) : 0;
          return (
            <View key={record.record_type} style={styles.recordRow}>
              <View style={styles.recordInfo}>
                <View style={[styles.recordDot, { backgroundColor: recordColor }]} />
                <Text style={[styles.recordType, { color: colors.text }]}>{record.record_type}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
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
