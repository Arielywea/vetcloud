import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Clock, CheckCircle, AlertTriangle, UserX, Stethoscope,
  TrendingUp, Timer, Coffee
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_STATUS_COLORS } from '../../constants/colors';

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

  const stats = [
    { icon: <Clock size={14} />, label: 'Total', value: summary.total.toString(), color: colors.primary },
    { icon: <CheckCircle size={14} />, label: 'Confirmadas', value: summary.confirmadas.toString(), color: APPOINTMENT_STATUS_COLORS.confirmada.color },
    { icon: <Stethoscope size={14} />, label: 'En consulta', value: summary.en_consulta.toString(), color: APPOINTMENT_STATUS_COLORS.en_consulta.color },
    { icon: <UserX size={14} />, label: 'Ausentes', value: summary.ausentes.toString(), color: APPOINTMENT_STATUS_COLORS.ausente.color },
    { icon: <AlertTriangle size={14} />, label: 'Retrasos', value: summary.retrasos.toString(), color: colors.warning },
  ];

  const occupation = summary.tiempoOcupado + summary.tiempoLibre > 0
    ? Math.round((summary.tiempoOcupado / (summary.tiempoOcupado + summary.tiempoLibre)) * 100)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderRadius: RADIUS.md }]}>
      <Text style={[styles.title, { color: colors.text }]}>Resumen del día</Text>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <View key={i} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '18' }]}>
              <View style={{ color: stat.color }}>{stat.icon}</View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Occupation bar */}
      <View style={[styles.occupationSection, { borderTopColor: colors.border }]}>
        <View style={styles.occupationHeader}>
          <View style={styles.occupationLabel}>
            <TrendingUp size={12} color={colors.primary} />
            <Text style={[styles.occupationTitle, { color: colors.text }]}>Ocupación</Text>
          </View>
          <Text style={[styles.occupationPercent, { color: colors.primary }]}>{occupation}%</Text>
        </View>
        <View style={[styles.occupationBar, { backgroundColor: colors.border }]}>
          <View style={[styles.occupationFill, { width: `${occupation}%`, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.timeDetails}>
          <View style={styles.timeItem}>
            <Timer size={10} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              Ocupado: {formatMinutes(summary.tiempoOcupado)}
            </Text>
          </View>
          <View style={styles.timeItem}>
            <Coffee size={10} color={colors.textSecondary} />
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              Libre: {formatMinutes(summary.tiempoLibre)}
            </Text>
          </View>
        </View>
      </View>

      {/* By type */}
      {Object.keys(summary.porTipo).length > 0 && (
        <View style={[styles.typeSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.typeTitle, { color: colors.textSecondary }]}>Por tipo</Text>
          {Object.entries(summary.porTipo).map(([type, count]) => (
            <View key={type} style={styles.typeRow}>
              <Text style={[styles.typeName, { color: colors.text }]}>{type}</Text>
              <Text style={[styles.typeCount, { color: colors.textSecondary }]}>{count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  statItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: 4,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  occupationSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  occupationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  occupationLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  occupationTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  occupationPercent: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  occupationBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupationFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  typeSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  typeTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  typeName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textTransform: 'capitalize',
  },
  typeCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
});
