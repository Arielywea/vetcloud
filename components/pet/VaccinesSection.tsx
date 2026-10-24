import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DirectusPet, Vaccination, VaccinationKind, VaccinePlanItem } from '../../services/directus';
import DisplayText from '../ui/DisplayText';
import VButton from '../ui/Button';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { DEWORMING, doseStatus, DoseStatus, formatDay, planFor } from '../../utils/vaccinePlan';

interface VaccinesSectionProps {
  pet: DirectusPet;
  vaccinations: Vaccination[];
  /** Record a dose of this item (null = choose in the sheet) */
  onApply: (preset: { kind: VaccinationKind; plan_item?: VaccinePlanItem | null } | null) => void;
  readOnly?: boolean;
}

// The base plan as a ledger: one line per vaccine and deworming, last dose and when the next is due.
export default function VaccinesSection({ pet, vaccinations, onApply, readOnly }: VaccinesSectionProps) {
  const { colors } = useTheme();
  const plan = planFor(pet.species);

  const stateText = (s: DoseStatus) => {
    if (s.state === 'none') return { text: 'Sin dosis registrada', color: colors.textSecondary };
    if (s.state === 'overdue') return { text: `Vencida desde el ${formatDay(s.due)}`, color: colors.error };
    if (s.state === 'soon') return { text: `Toca el ${formatDay(s.due)}`, color: colors.warning };
    return { text: `Próxima ${formatDay(s.due)}`, color: colors.success };
  };

  const rows: Array<{ key: string; label: string; s: DoseStatus; preset: { kind: VaccinationKind; plan_item?: VaccinePlanItem | null } }> = [
    ...plan.map((p) => ({ key: p.item, label: p.label, s: doseStatus(vaccinations, (v) => v.kind === 'vacuna' && v.plan_item === p.item, p.months), preset: { kind: 'vacuna' as const, plan_item: p.item } })),
    ...DEWORMING.map((d) => ({ key: d.kind, label: d.label, s: doseStatus(vaccinations, (v) => v.kind === d.kind, d.months), preset: { kind: d.kind } })),
  ];
  const others = vaccinations
    .filter((v) => v.kind === 'vacuna' && (!v.plan_item || v.plan_item === 'otra' || !plan.some((p) => p.item === v.plan_item)))
    .sort((a, b) => String(b.applied_at).localeCompare(String(a.applied_at)));

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <DisplayText style={[styles.title, { color: colors.text }]}>Vacunas y prevención</DisplayText>
        {!readOnly ? <VButton size="sm" variant="secondary" onPress={() => onApply(null)} icon={<Plus size={15} color={colors.primary} />}>Registrar dosis</VButton> : null}
      </View>
      <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {rows.map((r, i) => {
          const st = stateText(r.s);
          return (
            <View key={r.key} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View style={styles.what}>
                <Text style={[styles.name, { color: colors.text }]}>{r.label}</Text>
                <Text style={[styles.stateText, { color: st.color }]}>{st.text}</Text>
                {r.s.last ? (
                  <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                    {[`Última ${formatDay(r.s.last.applied_at)}`, r.s.last.product, r.s.last.lot ? `lote ${r.s.last.lot}` : null].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}
              </View>
              {!readOnly ? <VButton size="sm" variant="ghost" onPress={() => onApply(r.preset)} accessibilityLabel={`Aplicar ${r.label}`}>Aplicar</VButton> : null}
            </View>
          );
        })}
      </View>
      {others.length ? (
        <View style={styles.others}>
          <Text style={[styles.meta, { color: colors.textSecondary, marginBottom: SPACING.xs }]}>Otras vacunas</Text>
          {others.map((v) => (
            <Text key={v.id} style={[styles.body, { color: colors.text }]}>
              {[formatDay(v.applied_at), v.product || 'Vacuna', v.lot ? `lote ${v.lot}` : null, v.next_due_at ? `próxima ${formatDay(v.next_due_at)}` : null].filter(Boolean).join(' · ')}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm, marginBottom: SPACING.md },
  title: { fontSize: 26, lineHeight: 30, fontWeight: '600' },
  table: { borderWidth: 1, borderRadius: RADIUS.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, minHeight: 60 },
  what: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 1 },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 22 },
  stateText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium, marginTop: 1 },
  others: { marginTop: SPACING.md },
});
