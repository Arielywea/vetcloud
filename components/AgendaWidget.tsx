import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Building2, Tractor, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Appointment } from '../services/directus';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/tokens';

interface AgendaWidgetProps {
  appointments: Appointment[];
}

const BOX_TYPES = ['consulta', 'control', 'cirugia'];

export default function AgendaWidget({ appointments }: AgendaWidgetProps) {
  const { colors } = useTheme();

  const today = new Date().toISOString().slice(0, 10);

  const { boxAppointments, terrenoAppointments } = useMemo(() => {
    const todayAppts = appointments.filter(a => a.start_time.slice(0, 10) === today);
    return {
      boxAppointments: todayAppts.filter(a => BOX_TYPES.includes(a.appointment_type)),
      terrenoAppointments: todayAppts.filter(a => a.appointment_type === 'terreno'),
    };
  }, [appointments, today]);

  const formatTime = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Building2 size={20} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Agenda del Día</Text>
      </View>
      <View style={styles.splitRow}>
        {/* Box Column */}
        <View style={[styles.halfCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }, SHADOWS.sm]}>
          <View style={styles.columnHeader}>
            <Building2 size={18} color={colors.primary} />
            <Text style={[styles.columnTitle, { color: colors.text }]}>Box</Text>
          </View>
          {boxAppointments.length === 0 ? (
            <View style={styles.emptyCol}>
              <CheckCircle size={22} color={colors.success} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin citas en box</Text>
            </View>
          ) : (
            boxAppointments.slice(0, 3).map(a => (
              <View key={a.id} style={[styles.apptItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.apptTime, { color: colors.primary }]}>{formatTime(a.start_time)}</Text>
                <Text style={[styles.apptName, { color: colors.text }]} numberOfLines={1}>{a.patient_name}</Text>
              </View>
            ))
          )}
        </View>

        {/* Terreno Column */}
        <View style={[styles.halfCard, { backgroundColor: colors.surface, borderLeftColor: '#8D6E63' }, SHADOWS.sm]}>
          <View style={styles.columnHeader}>
            <Tractor size={18} color="#8D6E63" />
            <Text style={[styles.columnTitle, { color: colors.text }]}>Terreno</Text>
          </View>
          {terrenoAppointments.length === 0 ? (
            <View style={styles.emptyCol}>
              <CheckCircle size={22} color={colors.success} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin agenda de terreno</Text>
            </View>
          ) : (
            terrenoAppointments.slice(0, 3).map(a => (
              <View key={a.id} style={[styles.apptItem, { borderBottomColor: colors.border }]}>
                <Text style={[styles.apptTime, { color: '#8D6E63' }]}>{formatTime(a.start_time)}</Text>
                <Text style={[styles.apptName, { color: colors.text }]} numberOfLines={1}>{a.patient_name}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold },
  splitRow: { flexDirection: 'row', gap: SPACING.md },
  halfCard: { flex: 1, borderRadius: RADIUS.lg, padding: SPACING.md, borderLeftWidth: 3 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  columnTitle: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.md },
  emptyCol: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.xs },
  emptyText: { fontSize: TYPOGRAPHY.sizes.xs },
  apptItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 0.5, gap: SPACING.sm },
  apptTime: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, width: 48 },
  apptName: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm },
});
