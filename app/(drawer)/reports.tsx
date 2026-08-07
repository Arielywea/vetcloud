import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { TrendingUp, Users, Calendar, DollarSign, ClipboardList, Package, ChevronRight } from 'lucide-react-native';
import { directus } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

export default function ReportsScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [expiring, setExpiring] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [sumRes, expRes] = await Promise.all([
        directus.reports.summary(),
        directus.reports.expiringInventory(),
      ]);
      setSummary(sumRes.data);
      setExpiring(expRes.data || []);
    } catch { /* */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const StatCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.sm]}>
      <View style={[styles.statIcon, { backgroundColor: colors.primaryContainer }]}>
        <Icon size={20} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      {sub ? <Text style={[styles.statSub, { color: colors.textLight }]}>{sub}</Text> : null}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={[styles.title, { color: colors.text }]}>Reportes</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Resumen del mes actual</Text>

      <View style={styles.statsGrid}>
        <StatCard icon={Users} label="Pacientes" value={summary?.patients ?? 0} />
        <StatCard icon={Calendar} label="Citas" value={summary?.appointments?.total ?? 0} sub={`${summary?.appointments?.completed ?? 0} completadas`} />
        <StatCard icon={DollarSign} label="Ingresos" value={`$${Number(summary?.revenue?.total ?? 0).toLocaleString('es-CL')}`} sub={`${summary?.revenue?.count ?? 0} cobros`} />
        <StatCard icon={ClipboardList} label="Registros" value={summary?.records ?? 0} />
      </View>

      {expiring.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package size={18} color={colors.warning || colors.error} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Inventario por vencer (30 dias)</Text>
          </View>
          {expiring.slice(0, 5).map((item: any) => (
            <View key={item.id} style={[styles.expiryRow, { backgroundColor: colors.surface, borderLeftColor: colors.warning || colors.error }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.expiryName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.expiryDetail, { color: colors.textSecondary }]}>{item.category}</Text>
              </View>
              <Text style={[styles.expiryDate, { color: colors.warning || colors.error }]}>
                {new Date(item.expiration_date).toLocaleDateString('es-CL')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold, marginBottom: SPACING.xs },
  subtitle: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.xl },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  statCard: { width: '48%', padding: SPACING.lg, borderRadius: RADIUS.xl, alignItems: 'flex-start', gap: SPACING.xs },
  statIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  statValue: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  statLabel: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  statSub: { fontSize: TYPOGRAPHY.sizes.xs },
  section: { marginTop: SPACING.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  expiryRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderLeftWidth: 3 },
  expiryName: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  expiryDetail: { fontSize: TYPOGRAPHY.sizes.xs },
  expiryDate: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold },
});
