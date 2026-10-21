import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_LABELS } from '../../constants/colors';
import DisplayText from '../ui/DisplayText';

interface DaySummaryData {
  total: number;
  programadas: number;
  confirmadas: number;
  en_espera: number;
  en_consulta: number;
  completadas: number;
  pendientes: number;
  canceladas: number;
  ausentes: number;
  porTipo: Record<string, number>;
  tiempoOcupado: number;
  tiempoLibre: number;
  retrasos: number;
}

interface DaySummaryProps {
  summary: DaySummaryData;
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export default function DaySummary({ summary }: DaySummaryProps) {
  const { colors } = useTheme();

  // Figures over labels, like the dashboard ledger; warnings only colour the number when non-zero
  const stats = [
    { label: 'Citas', value: summary.total, alert: false },
    { label: 'Confirmadas', value: summary.confirmadas, alert: false },
    { label: 'En consulta', value: summary.en_consulta, alert: false },
    { label: 'Ausentes', value: summary.ausentes, alert: summary.ausentes > 0 },
    { label: 'Retrasos', value: summary.retrasos, alert: summary.retrasos > 0 },
  ];

  const occupation = summary.tiempoOcupado + summary.tiempoLibre > 0
    ? Math.round((summary.tiempoOcupado / (summary.tiempoOcupado + summary.tiempoLibre)) * 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <DisplayText style={[styles.title, { color: colors.text }]}>Resumen del día</DisplayText>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <DisplayText style={[styles.statValue, { color: stat.alert ? colors.warning : colors.text }]}>{stat.value}</DisplayText>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.occupationHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ocupación</Text>
          <Text style={[styles.occupationPercent, { color: colors.text }]}>{occupation}%</Text>
        </View>
        <View style={[styles.occupationBar, { backgroundColor: colors.surfaceVariant }]}>
          <View style={[styles.occupationFill, { width: `${occupation}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {formatMinutes(summary.tiempoOcupado)} ocupado · {formatMinutes(summary.tiempoLibre)} libre
        </Text>
      </View>

      {Object.keys(summary.porTipo).length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Por tipo</Text>
          {Object.entries(summary.porTipo).map(([type, count]) => (
            <View key={type} style={styles.typeRow}>
              <Text style={[styles.typeName, { color: colors.text }]}>{APPOINTMENT_TYPE_LABELS[type] || type}</Text>
              <Text style={[styles.typeCount, { color: colors.text }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, paddingBottom: SPACING['3xl'] },
  title: { fontSize: 22, fontWeight: '600', marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: SPACING.md },
  statItem: { width: '50%' },
  statValue: { fontSize: 28, lineHeight: 30, fontWeight: '600' },
  statLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  section: { marginTop: SPACING.xl },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs },
  occupationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  occupationPercent: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  occupationBar: { height: 6, borderRadius: RADIUS.sm, overflow: 'hidden' },
  occupationFill: { height: '100%' },
  timeText: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  typeName: { fontSize: TYPOGRAPHY.sizes.sm },
  typeCount: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
});
