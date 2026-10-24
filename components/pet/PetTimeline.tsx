import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Stethoscope, Syringe, FileText, Scissors, RotateCcw, Bug } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ClinicalRecord, Prescription, Vaccination } from '../../services/directus';
import DisplayText from '../ui/DisplayText';
import Segmented from '../ui/Segmented';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { formatDay, PLAN_LABEL } from '../../utils/vaccinePlan';

interface PetTimelineProps {
  records: ClinicalRecord[];
  prescriptions: Prescription[];
  vaccinations: Vaccination[];
  onOpenRecord: (r: ClinicalRecord) => void;
  onOpenRx: (rx: Prescription) => void;
}

type Filter = 'todo' | 'consultas' | 'vacunas' | 'recetas' | 'cirugias';
const FILTERS = [
  { value: 'todo', label: 'Todo' }, { value: 'consultas', label: 'Consultas' }, { value: 'vacunas', label: 'Vacunas' },
  { value: 'recetas', label: 'Recetas' }, { value: 'cirugias', label: 'Cirugías' },
] as const;

interface Entry {
  key: string;
  at: string;
  kind: Filter;
  title: string;
  summary: string;
  Icon: any;
  onPress?: () => void;
}

const clip = (s: string, n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

// Everything that happened to the patient on one line of time: visits, doses and prescriptions.
export default function PetTimeline({ records, prescriptions, vaccinations, onOpenRecord, onOpenRx }: PetTimelineProps) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('todo');

  const entries = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    // Old vaccine visits were copied into vaccinations by migration 020: show the dose once
    const asDose = new Set(vaccinations.map((v) => v.clinical_record_id).filter(Boolean));
    for (const r of records) {
      if (r.record_type === 'vacuna' && asDose.has(r.id)) continue;
      const d = r.details || {};
      // Vaccine visits from before the vaccinations table are shown as visits; their dose lives in vaccinations
      const kind: Filter = r.record_type === 'cirugia' ? 'cirugias' : r.record_type === 'vacuna' ? 'vacunas' : 'consultas';
      const title = { consulta: r.is_initial ? 'Primera consulta' : 'Consulta', control: 'Control', cirugia: d.procedimiento ? `Cirugía: ${d.procedimiento}` : 'Cirugía', vacuna: 'Visita de vacunación' }[r.record_type] || 'Consulta';
      const kgv = Number(r.weight_kg ?? d.weight);
      const summary = [d.motivo_consulta, d.assessment || d.diagnostico, d.plan || d.treatment || d.notes, kgv > 0 ? `${String(kgv).replace('.', ',')} kg` : null]
        .filter(Boolean).map(String).join(' · ');
      out.push({ key: `r${r.id}`, at: r.date, kind, title, summary: clip(summary || 'Sin detalle'), Icon: r.record_type === 'cirugia' ? Scissors : r.record_type === 'control' ? RotateCcw : r.record_type === 'vacuna' ? Syringe : Stethoscope, onPress: () => onOpenRecord(r) });
    }
    for (const v of vaccinations) {
      const label = v.kind === 'vacuna' ? (v.plan_item && v.plan_item !== 'otra' ? PLAN_LABEL[v.plan_item] : v.product || 'Vacuna') : v.kind === 'desparasitacion_interna' ? 'Desparasitación interna' : 'Desparasitación externa';
      out.push({
        key: `v${v.id}`, at: String(v.applied_at), kind: 'vacunas', title: label,
        summary: [v.kind === 'vacuna' && v.plan_item && v.plan_item !== 'otra' ? v.product : v.kind !== 'vacuna' ? v.product : null, v.lot ? `lote ${v.lot}` : null, v.next_due_at ? `próxima ${formatDay(v.next_due_at)}` : null, v.notes].filter(Boolean).join(' · '),
        Icon: v.kind === 'vacuna' ? Syringe : Bug,
      });
    }
    for (const rx of prescriptions) {
      out.push({ key: `p${rx.id}`, at: rx.issued_at, kind: 'recetas', title: 'Receta', summary: clip(rx.prescription_body.replace(/\s+/g, ' ')), Icon: FileText, onPress: () => onOpenRx(rx) });
    }
    return out.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [records, prescriptions, vaccinations, onOpenRecord, onOpenRx]);

  const visible = filter === 'todo' ? entries : entries.filter((e) => e.kind === filter);

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <DisplayText style={[styles.title, { color: colors.text }]}>Historial</DisplayText>
        <Segmented label="Mostrar" options={FILTERS} value={filter} onChange={setFilter} size="sm" />
      </View>
      {visible.length ? visible.map((e) => {
        const body = (
          <>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{formatDay(e.at, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            <e.Icon size={18} color={colors.primary} strokeWidth={1.75} />
            <View style={styles.grow}>
              <Text style={[styles.entryTitle, { color: colors.text }]}>{e.title}</Text>
              {e.summary ? <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>{e.summary}</Text> : null}
            </View>
          </>
        );
        return e.onPress ? (
          <Pressable key={e.key} onPress={e.onPress} accessibilityRole="button" accessibilityLabel={`${e.title}, ${formatDay(e.at)}. Ver detalle`}
            style={({ pressed, hovered }: any) => [styles.entry, { backgroundColor: pressed || hovered ? colors.surfaceVariant : colors.surface }]}>
            {body}
          </Pressable>
        ) : <View key={e.key} style={[styles.entry, { backgroundColor: colors.surface }]}>{body}</View>;
      }) : (
        <View style={[styles.entry, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summary, { color: colors.textSecondary }]}>{filter === 'todo' ? 'Aún no hay atenciones registradas.' : 'Nada en esta categoría.'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm, marginBottom: SPACING.md },
  title: { fontSize: 26, lineHeight: 30, fontWeight: '600' },
  entry: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xs, minHeight: 56 },
  date: { width: 92, fontSize: TYPOGRAPHY.sizes.sm, paddingTop: 1, fontVariant: ['tabular-nums'] },
  grow: { flex: 1, minWidth: 0 },
  entryTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  summary: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19, marginTop: 2 },
});
