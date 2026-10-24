import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { Appointment, ClinicalRecord, DirectusPet, Vaccination } from '../../services/directus';
import DisplayText from '../ui/DisplayText';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { DEWORMING, doseStatus, DoseStatus, formatDay, planFor } from '../../utils/vaccinePlan';

interface StatusStripProps {
  pet: DirectusPet;
  records: ClinicalRecord[];
  vaccinations: Vaccination[];
  nextAppointment: Appointment | null;
}

const kg = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

// Four facts the vet checks before anything else: weight, vaccines, deworming and the next visit.
export default function StatusStrip({ pet, records, vaccinations, nextAppointment }: StatusStripProps) {
  const { colors } = useTheme();

  const weight = useMemo(() => {
    const points = records
      .map((r) => ({ at: r.date, kg: Number(r.weight_kg ?? r.details?.weight) }))
      .filter((p) => p.kg > 0)
      .sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const current = pet.current_weight_kg != null ? Number(pet.current_weight_kg) : points[0]?.kg ?? null;
    const at = pet.current_weight_at || points[0]?.at || null;
    // Change against the visit before the latest one
    const delta = points.length > 1 ? points[0].kg - points[1].kg : null;
    return { current, at, delta: delta != null && Math.abs(delta) >= 0.05 ? delta : null };
  }, [pet, records]);

  const vaccine = useMemo(() => {
    const plan = planFor(pet.species);
    const statuses = plan.map((p) => ({ p, s: doseStatus(vaccinations, (v) => v.kind === 'vacuna' && v.plan_item === p.item, p.months) }));
    const others = vaccinations.filter((v) => v.kind === 'vacuna');
    const overdue = statuses.filter((x) => x.s.state === 'overdue');
    const soon = statuses.filter((x) => x.s.state === 'soon').sort((a, b) => String(a.s.due).localeCompare(String(b.s.due)));
    const ok = statuses.filter((x) => x.s.state === 'ok').sort((a, b) => String(a.s.due).localeCompare(String(b.s.due)));
    // The value stays short (it is set large); the vaccine names go in the line below
    if (overdue.length) return { tone: colors.error, value: overdue.length === 1 ? 'Vencida' : `${overdue.length} vencidas`, sub: `${overdue.map((x) => x.p.label).join(', ')} desde el ${formatDay(overdue[0].s.due)}` };
    if (soon.length) return { tone: colors.warning, value: 'Pronto', sub: `${soon[0].p.label} el ${formatDay(soon[0].s.due)}` };
    if (ok.length) return { tone: colors.success, value: 'Al día', sub: `próxima ${formatDay(ok[0].s.due)} (${ok[0].p.label})` };
    if (others.length) return { tone: colors.textSecondary, value: 'Solo otras vacunas', sub: 'sin dosis del plan base' };
    return { tone: colors.textSecondary, value: 'Sin registro', sub: plan.length ? 'ninguna dosis del plan' : 'sin plan para esta especie' };
  }, [pet.species, vaccinations, colors]);

  const deworm = useMemo(() => {
    const st: Array<{ label: string; s: DoseStatus }> = DEWORMING.map((d) => ({ label: d.label.replace('Desparasitación ', ''), s: doseStatus(vaccinations, (v) => v.kind === d.kind, d.months) }));
    const known = st.filter((x) => x.s.last);
    if (!known.length) return { tone: colors.textSecondary, value: 'Sin registro', sub: 'interna ni externa' };
    const overdue = known.find((x) => x.s.state === 'overdue');
    if (overdue) return { tone: colors.error, value: `${overdue.label[0].toUpperCase()}${overdue.label.slice(1)} vencida`, sub: `desde ${formatDay(overdue.s.due)}` };
    const next = [...known].sort((a, b) => String(a.s.due).localeCompare(String(b.s.due)))[0];
    return { tone: next.s.state === 'soon' ? colors.warning : colors.success, value: next.s.state === 'soon' ? 'Pronto' : 'Al día', sub: `${next.label}: ${formatDay(next.s.due)}` };
  }, [vaccinations, colors]);

  const cells = [
    {
      label: 'Peso',
      value: weight.current != null ? `${kg(weight.current)} kg` : 'Sin peso',
      sub: weight.current != null
        ? [weight.at ? formatDay(weight.at) : null, weight.delta != null ? `${weight.delta > 0 ? '+' : '−'}${kg(Math.abs(weight.delta))} kg desde la anterior` : null].filter(Boolean).join(' · ')
        : 'se registra en la consulta',
      tone: colors.text,
    },
    { label: 'Vacunas', ...vaccine },
    { label: 'Desparasitación', ...deworm },
    {
      label: 'Próxima cita',
      value: nextAppointment ? new Date(nextAppointment.start_time).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Ninguna',
      sub: nextAppointment ? `${new Date(nextAppointment.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })} · ${nextAppointment.appointment_type}` : 'sin citas agendadas',
      tone: colors.text,
    },
  ];

  return (
    <View style={styles.strip}>
      {cells.map((c) => (
        <View key={c.label} style={[styles.cell, { backgroundColor: colors.surface }]} accessible accessibilityLabel={`${c.label}: ${c.value}. ${c.sub}`}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{c.label}</Text>
          <DisplayText style={[styles.value, { color: c.tone }]} numberOfLines={1}>{c.value}</DisplayText>
          <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>{c.sub}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  cell: { flexGrow: 1, flexBasis: 150, padding: SPACING.lg, borderRadius: RADIUS.md },
  label: { fontSize: TYPOGRAPHY.sizes.sm },
  value: { fontSize: 26, lineHeight: 30, fontWeight: '600', marginTop: 2 },
  sub: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2, lineHeight: 18 },
});
