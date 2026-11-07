import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import VButton from '../ui/Button';
import { Search, Calculator, AlertTriangle, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../ui/PageHeader';
import { useMedications } from '../../hooks/useDirectus';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { Medication } from '../../services/directus';
import { parseNumberInRange } from '../../utils/parseNumber';
import {
  parseDose, doseOptions, presentationOptions, parseDoseInput, convertAmount, tabletsText,
  DoseOption, DoseUnit, PresentationForm, PresentationOption, PresentationUnit,
} from '../../utils/doseParser';
import VInput from '../ui/Input';
import Segmented from '../ui/Segmented';

const DOSE_UNITS = [{ value: 'mg', label: 'mg/kg' }, { value: 'mcg', label: 'mcg/kg' }, { value: 'UI', label: 'UI/kg' }, { value: 'ml', label: 'ml/kg' }] as const;
const PRES_FORMS = [{ value: 'liquid', label: 'Líquido (por ml)' }, { value: 'tablet', label: 'Comprimido' }] as const;
const PRES_UNITS = [{ value: 'mg', label: 'mg' }, { value: 'mcg', label: 'mcg' }, { value: 'UI', label: 'UI' }] as const;

type Species = 'perro' | 'gato';

const MAX_RESULTS = 25;
const fmt = (n: number, digits = 1) => n.toLocaleString('es-CL', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export default function DoseCalculator({ initialWeight, initialSpecies }: { initialWeight?: number; initialSpecies?: Species }) {
  const { colors } = useTheme();
  const { medications, loading } = useMedications();
  const [peso, setPeso] = useState(initialWeight ? String(initialWeight).replace('.', ',') : '');
  const [especie, setEspecie] = useState<Species>(initialSpecies || 'perro');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  // Weight in kg, decimal comma accepted ("4,5"); 0.05–150 kg covers kittens to giant breeds
  const pesoNum = parseNumberInRange(peso, 0.05, 150);
  const pesoInvalid = peso.trim() !== '' && (pesoNum === null || Number.isNaN(pesoNum));

  const filteredMeds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = q
      ? medications.filter(m => m.nombre.toLowerCase().includes(q) || (m.familia || '').toLowerCase().includes(q))
      : medications;
    return list.slice(0, MAX_RESULTS);
  }, [medications, searchQuery]);

  const doseText = selectedMed ? (especie === 'perro' ? selectedMed.dosis_perro : selectedMed.dosis_gato) : null;
  const doseOpts = useMemo(() => doseOptions(doseText, { min: selectedMed?.dosis_min_mg_kg ?? null, max: selectedMed?.dosis_max_mg_kg ?? null }), [doseText, selectedMed]);
  const presOpts = useMemo(() => presentationOptions(selectedMed?.presentacion, selectedMed?.concentracion_mg_ml), [selectedMed]);
  const frequency = useMemo(() => parseDose(doseText)?.everyHours ?? selectedMed?.frecuencia_horas ?? null, [doseText, selectedMed]);

  // What the calculation uses: starts at the reference, and the vet can pick another option or type their own
  const [doseInput, setDoseInput] = useState('');
  const [doseUnit, setDoseUnit] = useState<DoseUnit>('mg');
  const [presForm, setPresForm] = useState<PresentationForm>('liquid');
  const [presAmount, setPresAmount] = useState('');
  const [presUnit, setPresUnit] = useState<PresentationUnit>('mg');

  const pickDose = (o: DoseOption) => { setDoseInput(o.min === o.max ? fmt(o.min, 3) : `${fmt(o.min, 3)}-${fmt(o.max, 3)}`); setDoseUnit(o.unit); };
  const pickPres = (o: PresentationOption | null) => {
    setPresForm(o?.form || 'liquid');
    setPresAmount(o ? fmt(o.amount, 3) : '');
    setPresUnit(o?.unit || 'mg');
  };
  useEffect(() => {
    if (doseOpts[0]) pickDose(doseOpts[0]); else { setDoseInput(''); setDoseUnit('mg'); }
  }, [doseOpts]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    pickPres(presOpts.find((o) => o.form === 'liquid') || presOpts[0] || null);
  }, [presOpts]); // eslint-disable-line react-hooks/exhaustive-deps

  const dose = parseDoseInput(doseInput);
  const doseInvalid = doseInput.trim() !== '' && !dose;
  const amount = parseNumberInRange(presAmount, 0.0001, 100000);
  const presentation = amount !== null && !Number.isNaN(amount) ? { form: presForm, amount, unit: presUnit } : null;
  const doseKey = (o: DoseOption) => dose && o.unit === doseUnit && Math.abs(o.min - dose.min) < 1e-9 && Math.abs(o.max - dose.max) < 1e-9;
  const presKey = (o: PresentationOption) => presentation && o.form === presentation.form && o.unit === presentation.unit && Math.abs(o.amount - presentation.amount) < 1e-9;

  const result = useMemo(() => {
    if (!dose || pesoNum === null || Number.isNaN(pesoNum)) return null;
    const min = dose.min * pesoNum;
    const max = dose.max * pesoNum;
    if (doseUnit === 'ml') return { min, max, volume: { min, max }, tablets: null, mismatch: false };
    if (!presentation) return { min, max, volume: null, tablets: null, mismatch: false };
    const a = convertAmount(min, doseUnit, presentation.unit);
    const b = convertAmount(max, doseUnit, presentation.unit);
    if (a === null || b === null) return { min, max, volume: null, tablets: null, mismatch: true };
    return presentation.form === 'liquid'
      ? { min, max, volume: { min: a / presentation.amount, max: b / presentation.amount }, tablets: null, mismatch: false }
      : { min, max, volume: null, tablets: { min: a / presentation.amount, max: b / presentation.amount }, mismatch: false };
  }, [dose, doseUnit, pesoNum, presentation?.form, presentation?.amount, presentation?.unit]); // eslint-disable-line react-hooks/exhaustive-deps
  const range = (a: number, b: number, unit: string, digits = 2) => (Math.abs(a - b) < 1e-9 ? `${fmt(a, digits)} ${unit}` : `${fmt(a, digits)} – ${fmt(b, digits)} ${unit}`);
  // A quarter tablet more or less than the dose: say how far the rounding lands
  const tabletNote = (() => {
    if (!result?.tablets || !presentation) return null;
    const n = (result.tablets.min + result.tablets.max) / 2;
    const q = Math.round(n * 4) / 4;
    if (q === 0) return 'La dosis es menor a ¼ de comprimido: usa otra presentación o un preparado magistral.';
    const off = Math.abs(q - n) / n;
    return off > 0.15 ? `Al redondear a ${tabletsText(n)} la dosis queda un ${Math.round(off * 100)} % ${q > n ? 'por encima' : 'por debajo'}: considera otra concentración.` : null;
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <PageHeader title="Calculadora de dosis" subtitle="Dosis por kilo según la especie, con el volumen a administrar" />

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Peso (kg)</Text>
          <TextInput
            value={peso}
            onChangeText={setPeso}
            keyboardType="decimal-pad"
            mode="outlined"
            placeholder="Ej: 4,5"
            error={pesoInvalid}
            accessibilityLabel="Peso en kilos"
            style={styles.input}
          />
          {pesoInvalid && <Text style={[styles.helper, { color: colors.error }]}>Ingresa un peso entre 0,05 y 150 kg</Text>}
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Especie</Text>
          <View style={styles.choiceRow} accessibilityRole="radiogroup">
            {(['perro', 'gato'] as const).map((sp) => (
              <VButton key={sp} size="sm" variant={especie === sp ? 'filled' : 'secondary'} containerStyle={{ flex: 1 }} onPress={() => setEspecie(sp)} accessibilityLabel={`Especie: ${sp === 'perro' ? 'Perro' : 'Gato'}`}>
                {sp === 'perro' ? 'Perro' : 'Gato'}
              </VButton>
            ))}
          </View>
        </View>
      </View>

      {/* Result first, so it's visible without scrolling past the list */}
      {selectedMed && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <View style={styles.resultHeader}>
            <Calculator size={20} color={colors.primary} />
            <Text style={[styles.resultTitle, { color: colors.text }]}>{selectedMed.nombre}</Text>
          </View>

          {/* Dose: the options of the reference, or the vet's own */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Dosis</Text>
          {doseOpts.length > 1 ? (
            <View style={styles.chips}>
              {doseOpts.map((o) => (
                <VButton key={o.key} size="sm" variant={doseKey(o) ? 'filled' : 'secondary'} onPress={() => pickDose(o)} accessibilityLabel={`Dosis ${o.label}${doseKey(o) ? ', seleccionada' : ''}`}>{o.label}</VButton>
              ))}
            </View>
          ) : null}
          <View style={styles.editRow}>
            <VInput containerStyle={styles.editNarrow} label="Por kg" value={doseInput} onChangeText={setDoseInput} keyboardType="numbers-and-punctuation"
              placeholder="Ej: 2 o 2-4" error={doseInvalid ? 'Escribe un número o un rango (2-4)' : undefined} />
            <Segmented label="Unidad de la dosis" options={DOSE_UNITS} value={doseUnit} onChange={setDoseUnit} size="sm" style={styles.editSeg} />
          </View>
          {dose && dose.min !== dose.max ? (
            <View style={[styles.chips, styles.chipsAfter]}>
              <Text style={[styles.hint, { color: colors.textSecondary }]}>Usar</Text>
              {([['Mínima', dose.min], ['Media', (dose.min + dose.max) / 2], ['Máxima', dose.max]] as const).map(([label, v]) => (
                <VButton key={label} size="sm" variant="ghost" onPress={() => setDoseInput(fmt(v, 3))} accessibilityLabel={`Usar dosis ${label.toLowerCase()}: ${fmt(v, 3)}`}>{`${label} ${fmt(v, 3)}`}</VButton>
              ))}
            </View>
          ) : null}

          {/* Presentation: what is in the vial or the box */}
          {doseUnit !== 'ml' ? (
            <>
              <Text style={[styles.label, styles.labelGap, { color: colors.textSecondary }]}>Presentación</Text>
              {presOpts.length ? (
                <View style={styles.chips}>
                  {presOpts.map((o) => (
                    <VButton key={o.key} size="sm" variant={presKey(o) ? 'filled' : 'secondary'} onPress={() => pickPres(o)} accessibilityLabel={`Presentación ${o.label}${presKey(o) ? ', seleccionada' : ''}`}>{o.label}</VButton>
                  ))}
                </View>
              ) : (
                <Text style={[styles.hint, styles.chipsAfter, { color: colors.textSecondary }]}>La ficha no indica concentración: escribe la del producto que usarás.</Text>
              )}
              <Segmented label="Forma" options={PRES_FORMS} value={presForm} onChange={setPresForm} size="sm" style={styles.editSeg} />
              <View style={styles.editRow}>
                <VInput containerStyle={styles.editNarrow} label={presForm === 'liquid' ? 'Concentración (por ml)' : 'Contenido por comprimido'} value={presAmount} onChangeText={setPresAmount}
                  keyboardType="decimal-pad" placeholder={presForm === 'liquid' ? 'Ej: 10' : 'Ej: 25'} />
                <Segmented label="Unidad de la presentación" options={PRES_UNITS} value={presUnit} onChange={setPresUnit} size="sm" style={styles.editSeg} />
              </View>
            </>
          ) : null}

          <View style={styles.resultBlock}>
            {result && dose ? (
              <>
                <ResultRow label="Dosis total" value={doseUnit === 'ml' ? range(result.min, result.max, 'ml') : range(result.min, result.max, doseUnit)} colors={colors} />
                {result.volume && doseUnit !== 'ml' && presentation ? (
                  <ResultRow label={`Volumen (${fmt(presentation.amount, 3)} ${presentation.unit}/ml)`} value={range(result.volume.min, result.volume.max, 'ml')} colors={colors} />
                ) : null}
                {result.tablets && presentation ? (
                  <ResultRow
                    label={`Comprimidos de ${fmt(presentation.amount, 3)} ${presentation.unit}`}
                    value={Math.abs(result.tablets.min - result.tablets.max) < 1e-9
                      ? `${tabletsText(result.tablets.min)} (${fmt(result.tablets.min, 2)})`
                      : `${tabletsText(result.tablets.min)} – ${tabletsText(result.tablets.max)} (${fmt(result.tablets.min, 2)}–${fmt(result.tablets.max, 2)})`}
                    colors={colors}
                  />
                ) : null}
                {frequency ? <ResultRow label="Frecuencia (referencia)" value={`Cada ${frequency} h`} colors={colors} /> : null}
                <ResultRow label="Base" value={`${range(dose.min, dose.max, `${doseUnit}/kg`, 3)} × ${fmt(pesoNum as number, 2)} kg`} colors={colors} />
                {result.mismatch ? <Text style={[styles.hint, { color: colors.error }]}>La dosis va en UI y la presentación en mg o mcg (o al revés): no se pueden convertir. Revisa las unidades.</Text> : null}
                {!result.mismatch && doseUnit !== 'ml' && !presentation ? <Text style={[styles.hint, { color: colors.textSecondary }]}>Indica la presentación para calcular el volumen o los comprimidos.</Text> : null}
                {tabletNote ? <Text style={[styles.hint, { color: colors.warning }]}>{tabletNote}</Text> : null}
              </>
            ) : (
              <View style={[styles.alertCard, { backgroundColor: alpha(colors.warning, 0.1), borderColor: alpha(colors.warning, 0.35) }]}>
                <AlertTriangle size={16} color={colors.warning} />
                <Text style={[styles.alertText, { color: colors.text }]}>
                  {pesoNum === null
                    ? 'Ingresa el peso para calcular.'
                    : doseInvalid
                      ? 'Revisa la dosis por kg.'
                      : doseOpts.length
                        ? 'Escribe la dosis por kg para calcular.'
                        : !doseText
                          ? `Sin dosis registrada para ${especie}: escribe la dosis por kg que quieres usar.`
                          : 'La referencia no trae una dosis por kg (por ejemplo, infusión continua o por superficie corporal). Escribe la dosis por kg o usa la referencia.'}
                </Text>
              </View>
            )}
          </View>

          {doseText ? (
            <View style={styles.sourceBox}>
              <BookOpen size={14} color={colors.textSecondary} />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                Referencia ({especie}): {doseText}
                {selectedMed.via_administracion ? ` · Vía: ${selectedMed.via_administracion}` : ''}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.disclaimer, { color: colors.textLight }]}>
            Cálculo con la dosis y la presentación elegidas arriba; parten de la referencia y puedes cambiarlas. Verifica siempre la indicación y el producto antes de administrar.
          </Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Medicamento</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textLight} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre o familia..."
            placeholderTextColor={colors.textLight}
            accessibilityLabel="Buscar medicamento"
            style={styles.searchInput}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
        </View>
      </View>

      {filteredMeds.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {loading ? 'Cargando vademécum…' : 'No hay medicamentos que coincidan con la búsqueda.'}
        </Text>
      ) : (
        filteredMeds.map((item) => {
          const selected = selectedMed?.id === item.id;
          const itemDose = parseDose(especie === 'perro' ? item.dosis_perro : item.dosis_gato);
          return (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.medCard,
                { backgroundColor: colors.surface, borderColor: selected ? colors.primary : colors.border },
                selected && { backgroundColor: colors.primaryContainer },
              ]}
              onPress={() => setSelectedMed(item)}
              accessibilityRole="button"
              aria-selected={selected}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.medName, { color: colors.text }]}>{item.nombre}</Text>
                {item.familia ? <Text style={[styles.medFamilia, { color: colors.textSecondary }]}>{item.familia}</Text> : null}
              </View>
              <Text style={[styles.medDose, { color: itemDose ? colors.textSecondary : colors.textLight }]}>
                {itemDose ? `${fmt(itemDose.min, 3)}${itemDose.min !== itemDose.max ? `–${fmt(itemDose.max, 3)}` : ''} ${itemDose.unit}/kg` : 'Ver referencia'}
              </Text>
            </TouchableOpacity>
          );
        })
      )}
      {!searchQuery.trim() && medications.length > MAX_RESULTS && (
        <Text style={[styles.emptyText, { color: colors.textLight }]}>
          Mostrando {MAX_RESULTS} de {medications.length}. Busca para ver el resto.
        </Text>
      )}
    </ScrollView>
  );
}

function ResultRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.resultRow}>
      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text {...({ dataSet: { numeric: 'tabular' } } as any)} style={[styles.resultValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xl * 2, maxWidth: 760, width: '100%', alignSelf: 'center' },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], marginBottom: SPACING.xl },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.lg },
  choiceRow: { flexDirection: 'row', gap: SPACING.sm, minHeight: 40 },
  inputGroup: { marginBottom: SPACING.lg, minWidth: 220 },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  helper: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  input: { backgroundColor: 'transparent' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, borderRadius: RADIUS.md, borderWidth: 1, height: 44 },
  searchInput: { flex: 1, marginLeft: SPACING.sm, backgroundColor: 'transparent', height: 42 },
  medCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, marginBottom: SPACING.sm, minHeight: 48 },
  medName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  medFamilia: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  medDose: { fontSize: TYPOGRAPHY.sizes.sm },
  emptyText: { textAlign: 'center', padding: SPACING.lg, fontSize: TYPOGRAPHY.sizes.sm },
  resultCard: { borderRadius: RADIUS.sm, padding: SPACING.lg, marginBottom: SPACING.xl },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  resultTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  alertText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  resultLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  resultValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'right' },
  sourceBox: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.lg },
  sourceText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  disclaimer: { fontSize: 12, marginTop: SPACING.sm, lineHeight: 17 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.sm },
  chipsAfter: { marginTop: -SPACING.xs },
  editRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: SPACING.md },
  editNarrow: { flexGrow: 1, flexBasis: 160, maxWidth: 260 },
  editSeg: { marginBottom: SPACING.md, paddingTop: SPACING.xs },
  hint: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  labelGap: { marginTop: SPACING.md },
  resultBlock: { marginTop: SPACING.md },
});
