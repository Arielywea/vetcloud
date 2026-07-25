import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  Clock, CheckCircle, AlertTriangle, UserX, Stethoscope,
  TrendingUp, Timer, Coffee
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface DaySummaryData {
  total: number;
  porEstado: {
    programadas: number;
    confirmadas: number;
    enEspera: number;
    enConsulta: number;
    completadas: number;
    pendientes: number;
    canceladas: number;
    ausentes: number;
  };
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
    { icon: <CheckCircle size={14} />, label: 'Confirmadas', value: summary.porEstado.confirmadas.toString(), color: '#10B981' },
    { icon: <Stethoscope size={14} />, label: 'En consulta', value: summary.porEstado.enConsulta.toString(), color: '#3B82F6' },
    { icon: <UserX size={14} />, label: 'Ausentes', value: summary.porEstado.ausentes.toString(), color: '#9CA3AF' },
    { icon: <AlertTriangle size={14} />, label: 'Retrasos', value: summary.retrasos.toString(), color: '#F59E0B' },
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
    fontSize: 11,
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
    fontSize: 12,
    fontWeight: '600',
  },
  occupationPercent: {
    fontSize: 14,
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
    fontSize: 11,
  },
  typeSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  typeTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  typeName: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  typeCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
