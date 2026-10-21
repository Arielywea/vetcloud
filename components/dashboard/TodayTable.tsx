import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY, BREAKPOINTS, alpha } from '../../constants/tokens';
import { APPOINTMENT_TYPE_LABELS } from '../../constants/colors';
import DisplayText from '../ui/DisplayText';
import VBadge from '../ui/Badge';
import VButton from '../ui/Button';
import RoundTable, { seatState, SeatState, TableSeat } from './RoundTable';

export interface TodayAppointment extends TableSeat {
  pet_id?: string | null;
  appointment_type?: string | null;
}

const STATE_SEAL: Record<SeatState, { label: string; tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral' }> = {
  done: { label: 'Atendida', tone: 'success' },
  late: { label: 'Atrasada', tone: 'danger' },
  here: { label: 'En la clínica', tone: 'warning' },
  upcoming: { label: 'Por llegar', tone: 'info' },
  off: { label: 'Cancelada', tone: 'neutral' },
};

const time = (iso: string) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

// "La mesa de hoy": the day's appointments as seats at the Round Table, beside the list a front
// desk reads. Choosing a row lights its seat and a seat lights its row; the row opens the chart.
export default function TodayTable({ appointments }: { appointments: TodayAppointment[] }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const stacked = width < BREAKPOINTS.md;
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [appointments],
  );
  const lateCount = rows.filter((a) => seatState(a) === 'late').length;

  const open = (a: TodayAppointment) => router.push((a.pet_id ? `/pet/${a.pet_id}` : '/(drawer)/agenda') as any);

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <DisplayText style={[styles.title, { color: colors.text }]}>La mesa de hoy</DisplayText>
        {lateCount ? (
          <Text style={[styles.lateNote, { color: colors.error }]} accessibilityRole="alert">
            {lateCount === 1 ? '1 cita atrasada sin atender' : `${lateCount} citas atrasadas sin atender`}
          </Text>
        ) : null}
      </View>

      <View style={[styles.body, stacked && styles.bodyStacked]}>
        <View style={stacked ? styles.dialStacked : undefined}>
          <RoundTable seats={rows} size={stacked ? 236 : 260} selectedId={selected} onSelect={setSelected} />
        </View>

        <View style={styles.list}>
          {rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Mesa libre: no hay citas para hoy.</Text>
              <VButton variant="secondary" onPress={() => router.push('/(drawer)/agenda')}>Programar cita</VButton>
            </View>
          ) : (
            rows.map((a) => {
              const state = seatState(a);
              const seal = STATE_SEAL[state];
              const isSel = a.id === selected;
              return (
                <Pressable
                  key={a.id}
                  onPress={() => open(a)}
                  onHoverIn={() => setSelected(a.id)}
                  onFocus={() => setSelected(a.id)}
                  accessibilityRole="link"
                  accessibilityLabel={`${time(a.start_time)}, ${a.patient_name || 'Sin nombre'}, ${seal.label}`}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: isSel || pressed ? alpha(colors.primary, 0.06) : 'transparent', opacity: state === 'off' ? 0.6 : 1 },
                  ]}
                >
                  <Text style={[styles.time, { color: state === 'late' ? colors.error : colors.text }]} {...({ dataSet: { numeric: 'tabular' } } as any)}>
                    {time(a.start_time)}
                  </Text>
                  <View style={styles.who}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{a.patient_name || 'Sin nombre'}</Text>
                    <Text style={[styles.type, { color: colors.textSecondary }]} numberOfLines={1}>
                      {APPOINTMENT_TYPE_LABELS[a.appointment_type as string] || 'Consulta'}{a.pet_id ? '' : ' · sin ficha'}
                    </Text>
                  </View>
                  <VBadge variant={seal.tone} size="sm">{seal.label}</VBadge>
                </Pressable>
              );
            })
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: SPACING.xl },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  title: { fontSize: 26, fontWeight: '600' },
  lateNote: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  body: { flexDirection: 'row', gap: SPACING['2xl'], alignItems: 'flex-start' },
  bodyStacked: { flexDirection: 'column', alignItems: 'stretch', gap: SPACING.lg },
  dialStacked: { alignItems: 'center' },
  // Capped so a row's seal stays near the name it belongs to
  list: { flex: 1, minWidth: 0, maxWidth: 680 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, minHeight: 56 },
  time: { width: 52, fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  who: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  type: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  empty: { alignItems: 'flex-start', gap: SPACING.md, paddingVertical: SPACING.lg },
  emptyText: { fontSize: TYPOGRAPHY.sizes.base },
});
