import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import FormSheet from '../ui/FormSheet';
import VInput from '../ui/Input';
import Segmented from '../ui/Segmented';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { api, DirectusPet, Vaccination, VaccinationKind, VaccinePlanItem } from '../../services/directus';
import { formatDmy, parseDmy, toLocalDateKey } from '../../utils/date';
import { planFor, proposeNextDue } from '../../utils/vaccinePlan';

export interface VaccinationDraft {
  kind: VaccinationKind;
  plan_item: VaccinePlanItem | null;
  product: string | null;
  lot: string | null;
  applied_at: string;
  next_due_at: string | null;
  veterinarian: string | null;
}

interface VaccinationSheetProps {
  visible: boolean;
  pet: Pick<DirectusPet, 'id' | 'name' | 'species'>;
  /** Preselect a plan item or a deworming kind */
  preset?: { kind: VaccinationKind; plan_item?: VaccinePlanItem | null } | null;
  onClose: () => void;
  /** Saved on the server; when `onDraft` is given nothing is saved and the draft is handed back instead */
  onSaved?: (v: Vaccination) => void;
  onDraft?: (d: VaccinationDraft) => void;
}

const KINDS = [
  { value: 'vacuna', label: 'Vacuna' },
  { value: 'desparasitacion_interna', label: 'Desp. interna' },
  { value: 'desparasitacion_externa', label: 'Desp. externa' },
] as const;

export default function VaccinationSheet({ visible, pet, preset, onClose, onSaved, onDraft }: VaccinationSheetProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const plan = planFor(pet.species);

  const [kind, setKind] = useState<VaccinationKind>('vacuna');
  const [item, setItem] = useState<VaccinePlanItem | null>(null);
  const [product, setProduct] = useState('');
  const [lot, setLot] = useState('');
  const [applied, setApplied] = useState('');
  const [nextDue, setNextDue] = useState('');
  const [nextTouched, setNextTouched] = useState(false);
  const [vet, setVet] = useState('');
  const [products, setProducts] = useState<Array<{ plan_item: VaccinePlanItem | null; product: string }>>([]);
  const [productFocused, setProductFocused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setKind(preset?.kind || 'vacuna');
    setItem(preset?.plan_item ?? (preset?.kind && preset.kind !== 'vacuna' ? null : plan[0]?.item ?? 'otra'));
    setProduct(''); setLot(''); setApplied(formatDmy(toLocalDateKey(new Date()))); setNextTouched(false);
    setVet(user?.name || ''); setError(null);
    api.vaccinations.products().then(setProducts).catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // The next date follows the plan until the vet edits it
  useEffect(() => {
    if (nextTouched) return;
    const a = parseDmy(applied);
    setNextDue(a ? formatDmy(proposeNextDue(kind, kind === 'vacuna' ? item : null, a, pet.species)) : '');
  }, [applied, kind, item, nextTouched, pet.species]);

  const suggestions = useMemo(() => {
    if (!productFocused) return [];
    const q = product.trim().toLowerCase();
    const same = products.filter((p) => kind !== 'vacuna' || !item || item === 'otra' || p.plan_item === item || !p.plan_item);
    return same.filter((p) => !q || p.product.toLowerCase().includes(q)).filter((p) => p.product !== product).slice(0, 6);
  }, [products, product, productFocused, kind, item]);

  const submit = async () => {
    const a = parseDmy(applied);
    if (!a) { setError('Fecha de aplicación inválida (DD/MM/AAAA, no futura)'); return; }
    const n = parseDmy(nextDue, { allowFuture: true });
    if (n === undefined) { setError('Próxima dosis inválida (DD/MM/AAAA)'); return; }
    if (n && n <= a) { setError('La próxima dosis debe ser posterior a la aplicación'); return; }
    if (kind === 'vacuna' && item === 'otra' && !product.trim()) { setError('Indica qué vacuna se aplicó'); return; }
    const draft: VaccinationDraft = {
      kind, plan_item: kind === 'vacuna' ? item : null, product: product.trim() || null, lot: lot.trim() || null,
      applied_at: a, next_due_at: n, veterinarian: vet.trim() || null,
    };
    if (onDraft) { onDraft(draft); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = await api.vaccinations.create({ pet_id: pet.id, ...draft });
      onSaved?.(saved);
    } catch (e: any) {
      setError(e?.message || 'No se pudo registrar la dosis');
    } finally {
      setSaving(false);
    }
  };

  const itemOptions = [...plan.map((p) => ({ value: p.item, label: p.label })), { value: 'otra' as VaccinePlanItem, label: 'Otra' }];
  const note = plan.find((p) => p.item === item)?.note;

  return (
    <FormSheet visible={visible} title={`Registrar dosis · ${pet.name}`} onClose={onClose} onSubmit={submit}
      submitLabel={onDraft ? 'Agregar a la consulta' : 'Registrar dosis'} submitting={saving} error={error}>
      <Segmented label="Tipo" options={KINDS} value={kind} onChange={(v) => { setKind(v); setNextTouched(false); }} size="sm" style={styles.segment} />
      {kind === 'vacuna' ? (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Vacuna</Text>
          <Segmented label="Vacuna" options={itemOptions} value={item} onChange={(v) => { setItem(v); setNextTouched(false); }} size="sm" style={styles.segmentTight} />
          {note ? <Text style={[styles.note, { color: colors.textSecondary }]}>{note}</Text> : null}
        </>
      ) : null}
      <View style={styles.productWrap}>
        <VInput label={kind === 'vacuna' ? 'Producto' : 'Producto (antiparasitario)'} value={product} onChangeText={setProduct}
          onFocus={() => setProductFocused(true)} onBlur={() => setTimeout(() => setProductFocused(false), 150)}
          placeholder={kind === 'vacuna' ? 'Marca comercial' : 'Ej. Drontal, Bravecto'} />
        {suggestions.length ? (
          <View style={[styles.suggestions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {suggestions.map((s) => (
              <Pressable key={`${s.plan_item}-${s.product}`} onPress={() => { setProduct(s.product); setProductFocused(false); }} accessibilityRole="button"
                style={({ pressed, hovered }: any) => [styles.suggestion, { backgroundColor: pressed || hovered ? colors.surfaceVariant : 'transparent' }]}>
                <Text style={[styles.body, { color: colors.text }]}>{s.product}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.pair}>
        <VInput containerStyle={styles.half} label="Lote" value={lot} onChangeText={setLot} placeholder="Opcional" autoCapitalize="characters" />
        <VInput containerStyle={styles.half} label="Veterinario" value={vet} onChangeText={setVet} />
      </View>
      <View style={styles.pair}>
        <VInput containerStyle={styles.half} label="Aplicada el" value={applied} onChangeText={setApplied} placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" />
        <VInput containerStyle={styles.half} label="Próxima dosis" value={nextDue} onChangeText={(v) => { setNextTouched(true); setNextDue(v); }}
          placeholder="DD/MM/AAAA" keyboardType="numbers-and-punctuation" hint={nextTouched ? 'Fecha ajustada a mano' : 'Propuesta por el plan; puedes cambiarla'} />
      </View>
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  segment: { marginBottom: SPACING.lg },
  segmentTight: { marginBottom: SPACING.sm },
  label: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm },
  note: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19, marginBottom: SPACING.lg },
  productWrap: { zIndex: 20 },
  suggestions: { position: 'absolute', top: 78, left: 0, right: 0, borderWidth: 1, borderRadius: RADIUS.md, paddingVertical: SPACING.xs, zIndex: 10, elevation: 6 },
  suggestion: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, minHeight: 40, justifyContent: 'center' },
  body: { fontSize: TYPOGRAPHY.sizes.md },
  pair: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.md },
  half: { flexGrow: 1, flexBasis: 200 },
});
