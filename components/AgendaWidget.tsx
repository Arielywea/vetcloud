import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Appointment } from '../services/directus';

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
      <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text }]}>Agenda del Día</Text>
      <View style={styles.splitRow}>
        {/* Box Column */}
        <Card style={[styles.halfCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
          <Card.Content>
            <View style={styles.columnHeader}>
              <MaterialCommunityIcons name="hospital-box" size={18} color={colors.primary} />
              <Text style={[styles.columnTitle, { color: colors.text }]}>Box</Text>
            </View>
            {boxAppointments.length === 0 ? (
              <View style={styles.emptyCol}>
                <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
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
          </Card.Content>
        </Card>

        {/* Terreno Column */}
        <Card style={[styles.halfCard, { backgroundColor: colors.surface, borderLeftColor: '#8D6E63' }]}>
          <Card.Content>
            <View style={styles.columnHeader}>
              <MaterialCommunityIcons name="tractor" size={18} color="#8D6E63" />
              <Text style={[styles.columnTitle, { color: colors.text }]}>Terreno</Text>
            </View>
            {terrenoAppointments.length === 0 ? (
              <View style={styles.emptyCol}>
                <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
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
          </Card.Content>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 12, marginBottom: 10 },
  sectionTitle: { fontWeight: '700', marginBottom: 8 },
  splitRow: { flexDirection: 'row', gap: 8 },
  halfCard: { flex: 1, borderRadius: 12, borderLeftWidth: 3, elevation: 1 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  columnTitle: { fontWeight: '700', fontSize: 14 },
  emptyCol: { alignItems: 'center', paddingVertical: 12, gap: 4 },
  emptyText: { fontSize: 11 },
  apptItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, gap: 8 },
  apptTime: { fontSize: 12, fontWeight: '700', width: 48 },
  apptName: { flex: 1, fontSize: 13 },
});
