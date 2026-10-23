import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import PageHeader from '../ui/PageHeader';
import VButton from '../ui/Button';
import DisplayText from '../ui/DisplayText';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { parseNumberInRange } from '../../utils/parseNumber';

type Species = 'perro' | 'gato';
type Age = 'adulto' | 'pediatrico';
type Losses = 'ninguna' | 'vomitos' | 'diarrea' | 'ambas';
type Infusion = 'microgota' | 'macrogota';
type Period = 12 | 24;

// 2024 AAHA Fluid Therapy Guidelines (Table 9): maintenance by allometric formula; pediatric patients
// need 3× (dog) or 2.5× (cat) the adult mL/kg/day rate; deficits are replaced over 12-24 h.
const MAINTENANCE = {
  perro: (kg: number) => 132 * Math.pow(kg, 0.75),
  gato: (kg: number) => 80 * Math.pow(kg, 0.75),
};
const PEDIATRIC_ML_KG_DAY: Record<Species, number> = { perro: 60 * 3, gato: 40 * 2.5 };
const BOLUS_ML_KG: Record<Species, [number, number]> = { perro: [15, 20], gato: [5, 10] };

// Rough daily estimates for when losses can't be measured; measuring them is always better
const LOSS_ML_KG_DAY: Record<Losses, number> = { ninguna: 0, vomitos: 20, diarrea: 30, ambas: 40 };
const DROPS_PER_ML: Record<Infusion, number> = { microgota: 60, macrogota: 20 };

interface Option<T> { value: T; label: string }
function Choice<T extends string | number>({ value, options, onChange, label }: { value: T; options: Option<T>[]; onChange: (v: T) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]} accessibilityRole="header">{label}</Text>
      <View style={styles.choiceRow} accessibilityRole="radiogroup">
        {options.map((o) => (
          <VButton
            key={String(o.value)}
            size="sm"
            variant={o.value === value ? 'filled' : 'secondary'}
            containerStyle={styles.choice}
            onPress={() => onChange(o.value)}
            accessibilityLabel={`${label}: ${o.label}`}
          >
            {o.label}
          </VButton>
        ))}
      </View>
    </View>
  );
}

const fmt = (n: number, d = 0) => n.toLocaleString('es-CL', { maximumFractionDigits: d, minimumFractionDigits: d });

export default function FluidTherapyCalculator({ initialWeight, initialSpecies }: { initialWeight?: number; initialSpecies?: Species }) {
  const { colors } = useTheme();
  const [peso, setPeso] = useState(initialWeight?.toString() || '');
  const [especie, setEspecie] = useState<Species>(initialSpecies || 'perro');
  const [edad, setEdad] = useState<Age>('adulto');
  const [deshidratacion, setDeshidratacion] = useState('');
  const [periodo, setPeriodo] = useState<Period>(24);
  const [perdidas, setPerdidas] = useState<Losses>('ninguna');
  const [infusion, setInfusion] = useState<Infusion>('microgota');

  const result = useMemo(() => {
    // Decimal comma accepted: "4,5" kg must not become 4
    const kg = parseNumberInRange(peso, 0.05, 150);
    if (kg === null || Number.isNaN(kg)) return null;
    const dhParsed = parseNumberInRange(deshidratacion, 0, 15);
    const dh = dhParsed === null || Number.isNaN(dhParsed) ? 0 : dhParsed;

    const mantencion = edad === 'pediatrico' ? PEDIATRIC_ML_KG_DAY[especie] * kg : MAINTENANCE[especie](kg);
    const deficit = (dh / 100) * kg * 1000;
    const perdidasDia = LOSS_ML_KG_DAY[perdidas] * kg;

    const rehydrationRate = mantencion / 24 + deficit / periodo + perdidasDia / 24;
    const afterRate = (mantencion + perdidasDia) / 24;
    const drops = (mlH: number) => (mlH * DROPS_PER_ML[infusion]) / 60;
    const [bMin, bMax] = BOLUS_ML_KG[especie];

    return {
      kg, dh, mantencion, deficit, perdidasDia, rehydrationRate, afterRate,
      rehydrationDrops: drops(rehydrationRate),
      afterDrops: drops(afterRate),
      bolus: [bMin * kg, bMax * kg] as [number, number],
      // Cats tolerate overload worst; more than ~6 mL/kg/h (cat) or ~10 mL/kg/h (dog) deserves a closer look
      overloadRisk: rehydrationRate / kg > (especie === 'gato' ? 6 : 10),
    };
  }, [peso, especie, edad, deshidratacion, periodo, perdidas, infusion]);

  const everySeconds = (dropsPerMin: number) => (dropsPerMin > 0 && dropsPerMin < 60 ? Math.round(60 / dropsPerMin) : null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PageHeader title="Fluidoterapia" subtitle="Bolo de shock, déficit, mantención y pérdidas según AAHA 2024, en mL/h y gotas por minuto" />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Peso (kg)</Text>
        <TextInput value={peso} onChangeText={setPeso} keyboardType="decimal-pad" mode="outlined" placeholder="Ej: 4,5" style={styles.input} accessibilityLabel="Peso en kilos" />
      </View>

      <Choice label="Especie" value={especie} onChange={setEspecie} options={[{ value: 'perro', label: 'Perro' }, { value: 'gato', label: 'Gato' }]} />
      <Choice label="Edad" value={edad} onChange={setEdad} options={[{ value: 'adulto', label: 'Adulto' }, { value: 'pediatrico', label: especie === 'gato' ? 'Gatito' : 'Cachorro' }]} />

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Deshidratación (%)</Text>
        <TextInput value={deshidratacion} onChangeText={setDeshidratacion} keyboardType="decimal-pad" mode="outlined" placeholder="Ej: 6" style={styles.input} accessibilityLabel="Porcentaje de deshidratación" />
      </View>

      <Choice label="Corregir el déficit en" value={periodo} onChange={setPeriodo} options={[{ value: 12, label: '12 horas' }, { value: 24, label: '24 horas' }]} />
      <Choice label="Pérdidas estimadas" value={perdidas} onChange={setPerdidas} options={[
        { value: 'ninguna', label: 'Ninguna' }, { value: 'vomitos', label: 'Vómitos' }, { value: 'diarrea', label: 'Diarrea' }, { value: 'ambas', label: 'Ambas' },
      ]} />
      <Choice label="Equipo de infusión" value={infusion} onChange={setInfusion} options={[{ value: 'microgota', label: 'Microgotero (60)' }, { value: 'macrogota', label: 'Macrogotero (20)' }]} />

      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
          <DisplayText style={[styles.resultTitle, { color: colors.text }]}>Plan de fluidos</DisplayText>

          {result.dh >= 10 && (
            <View accessibilityRole="alert" style={[styles.alertCard, { backgroundColor: alpha(colors.warning, 0.1) }]}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={[styles.alertText, { color: colors.text }]}>
                Con 10 % o más de deshidratación suele haber hipovolemia: estabiliza primero con bolos y reevalúa antes de iniciar la rehidratación.
              </Text>
            </View>
          )}
          {result.overloadRisk && (
            <View accessibilityRole="alert" style={[styles.alertCard, { backgroundColor: alpha(colors.warning, 0.1) }]}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={[styles.alertText, { color: colors.text }]}>
                Tasa alta para {especie === 'gato' ? 'un gato' : 'un perro'}: considera 24 h para el déficit y vigila signos de sobrecarga (taquipnea, quemosis, secreción nasal serosa, aumento de peso).
              </Text>
            </View>
          )}

          <View style={styles.rates}>
            <View style={styles.rate}>
              <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>{result.deficit > 0 ? `Primeras ${periodo} h` : 'Tasa'}</Text>
              <DisplayText accessibilityRole="text" style={[styles.rateValue, { color: colors.text }]}>{fmt(result.rehydrationRate, 1)} mL/h</DisplayText>
              <Text style={[styles.rateSub, { color: colors.textSecondary }]}>
                {fmt(result.rehydrationDrops)} gotas/min{everySeconds(result.rehydrationDrops) ? ` · 1 gota cada ${everySeconds(result.rehydrationDrops)} s` : ''}
              </Text>
            </View>
            {result.deficit > 0 && (
              <View style={styles.rate}>
                <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Después</Text>
                <DisplayText accessibilityRole="text" style={[styles.rateValue, { color: colors.text }]}>{fmt(result.afterRate, 1)} mL/h</DisplayText>
                <Text style={[styles.rateSub, { color: colors.textSecondary }]}>
                  {fmt(result.afterDrops)} gotas/min{everySeconds(result.afterDrops) ? ` · 1 gota cada ${everySeconds(result.afterDrops)} s` : ''}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.breakdown}>
            {[
              ['Mantención', `${fmt(result.mantencion)} mL/día`, edad === 'pediatrico' ? `${PEDIATRIC_ML_KG_DAY[especie]} mL/kg/día (pediátrico)` : `${especie === 'gato' ? 80 : 132} × peso^0,75`],
              ['Déficit', `${fmt(result.deficit)} mL`, `peso × ${fmt(result.dh, 1)} % en ${periodo} h`],
              ['Pérdidas', `${fmt(result.perdidasDia)} mL/día`, 'estimación: mide las pérdidas reales y ajusta'],
              ['Bolo de shock', `${fmt(result.bolus[0])}-${fmt(result.bolus[1])} mL`, `${BOLUS_ML_KG[especie][0]}-${BOLUS_ML_KG[especie][1]} mL/kg en 15 min, reevaluar tras cada bolo`],
            ].map(([label, value, hint]) => (
              <View key={label} style={styles.breakdownRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>{label}</Text>
                  <Text style={[styles.breakdownHint, { color: colors.textSecondary }]}>{hint}</Text>
                </View>
                <Text style={[styles.breakdownValue, { color: colors.text }]}>{value}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.footnote, { color: colors.textSecondary }]}>
            Cristaloide isotónico tamponado (Ringer lactato, Plasma-Lyte). Reevalúa perfusión, peso, densidad urinaria y signos de sobrecarga al menos cada 4-6 h y recalcula. Referencia: 2024 AAHA Fluid Therapy Guidelines for Dogs and Cats.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xl * 2, maxWidth: 760, width: '100%', alignSelf: 'center' },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  input: { backgroundColor: 'transparent' },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  choice: { flexGrow: 1, flexBasis: 120 },
  resultCard: { borderRadius: RADIUS.sm, padding: SPACING.xl, marginTop: SPACING.lg },
  resultTitle: { fontSize: 24, fontWeight: '600', marginBottom: SPACING.lg },
  alertCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.sm, marginBottom: SPACING.md },
  alertText: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  rates: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING['3xl'], marginBottom: SPACING.xl },
  rate: { minWidth: 160 },
  rateLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  rateValue: { fontSize: 34, lineHeight: 38, fontWeight: '600' },
  rateSub: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  breakdown: { gap: SPACING.md },
  breakdownRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.lg },
  breakdownLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  breakdownHint: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  breakdownValue: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, fontVariant: ['tabular-nums'] },
  footnote: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19, marginTop: SPACING.xl },
});
