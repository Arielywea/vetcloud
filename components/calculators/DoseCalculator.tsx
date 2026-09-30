import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, SegmentedButtons } from 'react-native-paper';
import { Search, Calculator, AlertTriangle, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useMedications } from '../../hooks/useDirectus';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { Medication } from '../../services/directus';
import { parseNumberInRange } from '../../utils/parseNumber';
import { parseDose, parseConcentration } from '../../utils/doseParser';
import DisplayText from '../ui/DisplayText';

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
  const dose = useMemo(() => parseDose(doseText), [doseText]);
  const concentration = useMemo(() => parseConcentration(selectedMed?.presentacion), [selectedMed]);

  const result = useMemo(() => {
    if (!dose || pesoNum === null || Number.isNaN(pesoNum)) return null;
    const min = dose.min * pesoNum;
    const max = dose.max * pesoNum;
    const volume = dose.unit === 'mg' && concentration ? { min: min / concentration, max: max / concentration } : null;
    return { min, max, volume };
  }, [dose, pesoNum, concentration]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <DisplayText style={[styles.title, { color: colors.text }]}>Calculadora de dosis</DisplayText>

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
          <SegmentedButtons
            value={especie}
            onValueChange={(v) => setEspecie(v as Species)}
            buttons={[
              { value: 'perro', label: 'Perro' },
              { value: 'gato', label: 'Gato' },
            ]}
          />
        </View>
      </View>

      {/* Result first, so it's visible without scrolling past the list */}
      {selectedMed && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.resultHeader}>
            <Calculator size={20} color={colors.primary} />
            <Text style={[styles.resultTitle, { color: colors.text }]}>{selectedMed.nombre}</Text>
          </View>

          {result && dose ? (
            <>
              <ResultRow label="Dosis" value={dose.min === dose.max ? `${fmt(result.min, 2)} ${dose.unit}` : `${fmt(result.min, 2)} – ${fmt(result.max, 2)} ${dose.unit}`} colors={colors} />
              {result.volume && (
                <ResultRow
                  label={`Volumen (${fmt(concentration!, 2)} mg/ml)`}
                  value={dose.min === dose.max ? `${fmt(result.volume.min, 2)} ml` : `${fmt(result.volume.min, 2)} – ${fmt(result.volume.max, 2)} ml`}
                  colors={colors}
                />
              )}
              {dose.everyHours && <ResultRow label="Frecuencia" value={`Cada ${dose.everyHours} h`} colors={colors} />}
              <ResultRow label="Base" value={`${fmt(dose.min, 3)}${dose.min !== dose.max ? `–${fmt(dose.max, 3)}` : ''} ${dose.unit}/kg × ${fmt(pesoNum as number, 2)} kg`} colors={colors} />
            </>
          ) : (
            <View style={[styles.alertCard, { backgroundColor: alpha(colors.warning, 0.1), borderColor: alpha(colors.warning, 0.35) }]}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={[styles.alertText, { color: colors.text }]}>
                {pesoNum === null
                  ? 'Ingresa el peso para calcular.'
                  : !doseText
                    ? `Sin dosis registrada para ${especie}.`
                    : 'No se puede calcular automáticamente esta dosis (por ejemplo, infusión continua o por superficie corporal). Usa la referencia.'}
              </Text>
            </View>
          )}

          {doseText ? (
            <View style={[styles.sourceBox, { borderTopColor: colors.border }]}>
              <BookOpen size={14} color={colors.textSecondary} />
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
                Referencia ({especie}): {doseText}
                {selectedMed.via_administracion ? ` · Vía: ${selectedMed.via_administracion}` : ''}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.disclaimer, { color: colors.textLight }]}>
            Cálculo a partir de la primera dosis por kg de la referencia. Verifica siempre la indicación y la presentación antes de administrar.
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
              accessibilityState={{ selected }}
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
  resultCard: { borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.xl },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  resultTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  alertCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  alertText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.md },
  resultLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  resultValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'right' },
  sourceBox: { flexDirection: 'row', gap: SPACING.sm, borderTopWidth: 1, marginTop: SPACING.md, paddingTop: SPACING.md },
  sourceText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  disclaimer: { fontSize: 12, marginTop: SPACING.sm, lineHeight: 17 },
});
