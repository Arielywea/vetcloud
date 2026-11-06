import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { DirectusPet, PetAlert, Vaccination, VaccinePlanItem } from '../../services/directus';
import VInput from '../ui/Input';
import VButton from '../ui/Button';
import Segmented from '../ui/Segmented';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { DEWORMING, doseStatus, formatDay, planFor } from '../../utils/vaccinePlan';
import { monthsAgoInput } from '../../utils/date';

// "The tutor does not remember": a month/year estimate, filled in one tap
const AGO = [{ label: '3 meses', months: 3 }, { label: '6 meses', months: 6 }, { label: '1 año', months: 12 }, { label: '2 años', months: 24 }];

// Remote anamnesis (antecedentes): what is asked once, at the first visit, and kept up to date afterwards.
// It lives on the pet (food, habitat, allergies…); each visit keeps a text copy of what it was then.

export interface RemoteForm {
  diet: string | null;
  dietDetail: string;
  feedings: string;
  housing: string | null;
  outdoor: string | null;
  companions: string;
  litter: string;
  chronic: string[];
  chronicOther: string;
  surgeries: string;
  medications: string;
  allergies: string;
  temperament: string[];
  lastHeat: string;
  vaccineDates: Record<string, string>;
  dewormIn: string;
  dewormOut: string;
  /** Where the patient came from (compra, adopción, rescate…) and how old it was; retroviral test (cats) */
  origin?: string | null;
  originAge?: string;
  retroviral?: string;
  water?: string | null;
}

const DIETS = [
  { value: 'Seco', label: 'Seco' }, { value: 'Húmedo', label: 'Húmedo' }, { value: 'Mixto', label: 'Mixto' },
  { value: 'Casero', label: 'Casero' }, { value: 'BARF', label: 'BARF' },
] as const;
const HOUSING = [
  { value: 'Casa', label: 'Casa' }, { value: 'Depto', label: 'Departamento' }, { value: 'Parcela', label: 'Parcela' }, { value: 'Exteriores', label: 'Exterior' },
] as const;
const OUTDOOR = [{ value: 'Solo interior', label: 'Solo interior' }, { value: 'Sale al exterior', label: 'Sale al exterior' }, { value: 'Libre en la calle', label: 'Libre en la calle' }] as const;
export const CHRONIC = ['Cardiopatía', 'Renal crónica', 'Diabetes', 'Epilepsia', 'Hipotiroidismo', 'Hipertiroidismo', 'Artrosis', 'Dermatitis atópica', 'Asma / bronquitis crónica', 'Obesidad'];
const ORIGINS = [
  { value: 'Comprado', label: 'Comprado' }, { value: 'Adoptado', label: 'Adoptado' }, { value: 'Rescatado', label: 'Rescatado' },
  { value: 'Regalado', label: 'Regalado' }, { value: 'Nacido en casa', label: 'Nacido en casa' },
] as const;
const WATER = [{ value: 'Normal', label: 'Normal' }, { value: 'Aumentado', label: 'Aumentado' }, { value: 'Disminuido', label: 'Disminuido' }] as const;
const TEMPERAMENTS = ['Dócil', 'Nervioso', 'Inquieto', 'Puede morder'];

const list = (text: string) => text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);

export function remoteFromPet(pet: DirectusPet): RemoteForm {
  const food = pet.food || '';
  const diet = DIETS.find((d) => food === d.value || food.startsWith(`${d.value} · `))?.value || null;
  const base: string[] = Array.isArray(pet.base_diseases) ? pet.base_diseases : [];
  return {
    diet,
    dietDetail: diet ? food.slice(diet.length).replace(/^ · /, '') : food,
    feedings: pet.food_frequency || '',
    housing: HOUSING.find((h) => h.value === pet.habitat)?.value || null,
    outdoor: OUTDOOR.find((o) => o.value === pet.entorno)?.value || null,
    companions: pet.lives_with_other_animals || '',
    litter: pet.areneros || '',
    chronic: base.filter((d) => CHRONIC.includes(d)),
    chronicOther: [...base.filter((d) => !CHRONIC.includes(d)), pet.other_diseases].filter(Boolean).join(', '),
    surgeries: pet.surgeries || '',
    medications: pet.medications || '',
    allergies: (Array.isArray(pet.allergies) ? pet.allergies : []).join(', '),
    temperament: Array.isArray(pet.temperament) ? pet.temperament : [],
    lastHeat: pet.last_heat || '',
    vaccineDates: {},
    dewormIn: '',
    dewormOut: '',
    origin: ORIGINS.find((o) => o.value === pet.procedencia)?.value || null,
    originAge: pet.procedencia_edad || '',
    retroviral: pet.retroviral_test || '',
    water: WATER.find((w) => w.value === pet.water_consumption)?.value || null,
  };
}

/** The pet's fields as the form leaves them, alerts included (other alerts are kept) */
export function remoteToPetPatch(r: RemoteForm, pet: DirectusPet): Record<string, unknown> {
  const allergies = list(r.allergies);
  const chronic = [...r.chronic, ...list(r.chronicOther)];
  const kept = (pet.alerts || []).filter((a) => a.type === 'other');
  const alerts: PetAlert[] = [
    ...allergies.map((text) => ({ type: 'allergy' as const, text })),
    ...(r.temperament.includes('Puede morder') ? [{ type: 'bites' as const, text: 'Puede morder' }] : []),
    ...chronic.map((text) => ({ type: 'chronic' as const, text })),
    ...kept,
  ];
  return {
    food: [r.diet, r.dietDetail.trim()].filter(Boolean).join(' · ') || null,
    food_frequency: r.feedings.trim() || null,
    water_consumption: r.water || null,
    procedencia: r.origin || null,
    procedencia_edad: (r.originAge || '').trim() || null,
    retroviral_test: pet.species === 'cat' ? (r.retroviral || '').trim() || null : undefined,
    habitat: r.housing,
    entorno: r.outdoor,
    lives_with_other_animals: r.companions.trim() || null,
    areneros: pet.species === 'cat' ? r.litter.trim() || null : undefined,
    base_diseases: chronic,
    other_diseases: null,
    surgeries: r.surgeries.trim() || null,
    medications: r.medications.trim() || null,
    allergies,
    temperament: r.temperament,
    last_heat: r.lastHeat.trim() || null,
    alerts,
  };
}

/** One readable block, kept in the visit (and shown in the chart's history) */
export function remoteSummary(r: RemoteForm, species: DirectusPet['species']): string {
  const lines = [
    ['Procedencia', [r.origin, (r.originAge || '').trim() ? `llegó con ${(r.originAge || '').trim()}` : null].filter(Boolean).join(' · ')],
    ['Test VIF/ViLeF', species === 'cat' ? (r.retroviral || '').trim() : ''],
    ['Consumo de agua', r.water || ''],
    ['Alimentación', [r.diet, r.dietDetail.trim(), r.feedings.trim()].filter(Boolean).join(' · ')],
    ['Ambiente', [r.housing === 'Depto' ? 'Departamento' : r.housing, r.outdoor, species === 'cat' && r.litter.trim() ? `areneros: ${r.litter.trim()}` : null].filter(Boolean).join(' · ')],
    ['Convive con', r.companions.trim()],
    ['Enfermedades previas', [...r.chronic, ...list(r.chronicOther)].join(', ')],
    ['Cirugías previas', r.surgeries.trim()],
    ['Medicación actual', r.medications.trim()],
    ['Alergias', list(r.allergies).join(', ')],
    ['Comportamiento', r.temperament.join(', ')],
    ['Último celo', r.lastHeat.trim()],
  ];
  return lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
}

interface RemoteAnamnesisProps {
  pet: DirectusPet;
  value: RemoteForm;
  onChange: (next: RemoteForm) => void;
  /** Doses already recorded: those plan items show the last dose instead of asking for it */
  vaccinations: Vaccination[];
}

export default function RemoteAnamnesis({ pet, value: r, onChange, vaccinations }: RemoteAnamnesisProps) {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const set = <K extends keyof RemoteForm>(k: K, v: RemoteForm[K]) => onChange({ ...r, [k]: v });
  const toggle = (k: 'chronic' | 'temperament', item: string) => set(k, r[k].includes(item) ? r[k].filter((x) => x !== item) : [...r[k], item]);
  const plan = planFor(pet.species);
  const femaleIntact = pet.sex === 'hembra' && (!pet.reproductive_status || pet.reproductive_status === 'intacto' || pet.reproductive_status === 'gestante');

  const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.group, isMobile && styles.groupMobile]}>
      <Text style={[styles.groupTitle, { color: colors.text }, !isMobile && styles.groupTitleSide]}>{title}</Text>
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
  const Label = ({ children }: { children: string }) => <Text style={[styles.label, { color: colors.textSecondary }]}>{children}</Text>;

  return (
    <View>
      {Group({ title: 'Procedencia', children: (
        <>
          <Segmented label="Procedencia" options={ORIGINS} value={r.origin ?? null} onChange={(v) => set('origin', r.origin === v ? null : v)} size="sm" style={styles.seg} />
          <View style={styles.pair}>
            <VInput containerStyle={styles.narrow} value={r.originAge || ''} onChangeText={(v) => set('originAge', v)} placeholder="Edad al llegar (ej. 2 meses)" accessibilityLabel="Edad a la que llegó" />
            {pet.species === 'cat' ? <VInput containerStyle={styles.wide} value={r.retroviral || ''} onChangeText={(v) => set('retroviral', v)} placeholder="Test VIF/ViLeF (fecha y resultado)" accessibilityLabel="Test retroviral" /> : null}
          </View>
        </>
      ) })}

      {Group({ title: 'Alimentación', children: (
        <>
          <Segmented label="Tipo de alimento" options={DIETS} value={r.diet} onChange={(v) => set('diet', r.diet === v ? null : v)} size="sm" style={styles.seg} />
          <View style={styles.pair}>
            <VInput containerStyle={styles.wide} value={r.dietDetail} onChangeText={(v) => set('dietDetail', v)} placeholder="Marca y cantidad (ej. Royal Canin, 200 g)" accessibilityLabel="Marca y cantidad de alimento" />
            <VInput containerStyle={styles.narrow} value={r.feedings} onChangeText={(v) => set('feedings', v)} placeholder="Veces al día" accessibilityLabel="Frecuencia de alimentación" />
          </View>
          <Segmented label="Consumo de agua" options={WATER} value={r.water ?? null} onChange={(v) => set('water', r.water === v ? null : v)} size="sm" style={styles.seg} />
        </>
      ) })}

      {Group({ title: 'Ambiente', children: (
        <>
          <Segmented label="Vivienda" options={HOUSING} value={r.housing} onChange={(v) => set('housing', r.housing === v ? null : v)} size="sm" style={styles.segTight} />
          <Segmented label="Acceso al exterior" options={OUTDOOR} value={r.outdoor} onChange={(v) => set('outdoor', r.outdoor === v ? null : v)} size="sm" style={styles.seg} />
          <View style={styles.pair}>
            <VInput containerStyle={styles.wide} value={r.companions} onChangeText={(v) => set('companions', v)} placeholder="Convive con (otro perro, 2 gatos, niños…)" accessibilityLabel="Convive con" />
            {pet.species === 'cat' ? <VInput containerStyle={styles.narrow} value={r.litter} onChangeText={(v) => set('litter', v)} placeholder="Areneros (cuántos, arena)" accessibilityLabel="Areneros" /> : null}
          </View>
        </>
      ) })}

      {Group({ title: 'Antecedentes mórbidos', children: (
        <>
          <Label>Enfermedades previas o crónicas</Label>
          <View style={[styles.chips, { marginBottom: SPACING.sm }]}>
            {CHRONIC.map((c) => <VButton key={c} size="sm" variant={r.chronic.includes(c) ? 'filled' : 'secondary'} onPress={() => toggle('chronic', c)}>{c}</VButton>)}
          </View>
          <VInput value={r.chronicOther} onChangeText={(v) => set('chronicOther', v)} placeholder="Otras, separadas por coma" accessibilityLabel="Otras enfermedades previas" />
          <View style={styles.pair}>
            <VInput containerStyle={styles.half} label="Cirugías previas" value={r.surgeries} onChangeText={(v) => set('surgeries', v)} placeholder="Esterilización 2023…" />
            <VInput containerStyle={styles.half} label="Medicación actual" value={r.medications} onChangeText={(v) => set('medications', v)} placeholder="Fármaco, dosis y frecuencia" />
          </View>
          <VInput label="Alergias" value={r.allergies} onChangeText={(v) => set('allergies', v)} placeholder="Separadas por coma: penicilina, pollo…" hint="Quedan como alerta en la ficha" />
        </>
      ) })}

      {Group({ title: 'Vacunas y desparasitación', children: (
        <>
          <Text style={[styles.note, { color: colors.textSecondary }]}>Fecha de la última dosis (DD/MM/AAAA). Si el tutor no la sabe, escribe mes y año (MM/AAAA) o elige "hace": queda marcada como estimada. Las ya registradas en la clínica aparecen con su fecha.</Text>
          <View style={styles.pair}>
            {[...plan.map((p) => ({ key: p.item as string, label: p.label, s: doseStatus(vaccinations, (v) => v.kind === 'vacuna' && v.plan_item === p.item, p.months) })),
              ...DEWORMING.map((d) => ({ key: d.kind as string, label: d.label, s: doseStatus(vaccinations, (v) => v.kind === d.kind, d.months) }))].map((row) => (
              row.s.last ? (
                <View key={row.key} style={[styles.third, styles.recorded]}>
                  <Label>{row.label}</Label>
                  <Text style={[styles.body, { color: colors.text }]}>Última {formatDay(row.s.last.applied_at)}{row.s.last.date_estimated ? ' (aprox.)' : ''}</Text>
                </View>
              ) : (
                <View key={row.key} style={styles.third}>
                  <VInput label={row.label} placeholder="DD/MM/AAAA o MM/AAAA" keyboardType="numbers-and-punctuation"
                    value={row.key === 'desparasitacion_interna' ? r.dewormIn : row.key === 'desparasitacion_externa' ? r.dewormOut : r.vaccineDates[row.key] || ''}
                    onChangeText={(v: string) => row.key === 'desparasitacion_interna' ? set('dewormIn', v) : row.key === 'desparasitacion_externa' ? set('dewormOut', v) : set('vaccineDates', { ...r.vaccineDates, [row.key]: v })} />
                  <View style={styles.chips}>
                    <Text style={[styles.ago, { color: colors.textSecondary }]}>Hace</Text>
                    {AGO.map((a) => (
                      <VButton key={a.months} size="sm" variant="ghost" onPress={() => ((v: string) => row.key === 'desparasitacion_interna' ? set('dewormIn', v) : row.key === 'desparasitacion_externa' ? set('dewormOut', v) : set('vaccineDates', { ...r.vaccineDates, [row.key]: v }))(monthsAgoInput(a.months))} accessibilityLabel={`${row.label}: hace ${a.label}`}>{a.label}</VButton>
                    ))}
                  </View>
                </View>
              )
            ))}
          </View>
        </>
      ) })}

      {Group({ title: femaleIntact ? 'Comportamiento y reproducción' : 'Comportamiento', children: (
        <>
          <View style={[styles.chips, { marginBottom: SPACING.lg }]}>
            {TEMPERAMENTS.map((t) => <VButton key={t} size="sm" variant={r.temperament.includes(t) ? 'filled' : 'secondary'} onPress={() => toggle('temperament', t)}>{t}</VButton>)}
          </View>
          {femaleIntact ? <VInput label="Último celo" value={r.lastHeat} onChangeText={(v) => set('lastHeat', v)} placeholder="Mes y año, duración, partos previos" containerStyle={{ maxWidth: 420 }} /> : null}
        </>
      ) })}
    </View>
  );
}

/** Plan items whose declared last dose should be created as a vaccination record */
export function declaredDoses(r: RemoteForm): Array<{ kind: 'vacuna' | 'desparasitacion_interna' | 'desparasitacion_externa'; plan_item: VaccinePlanItem | null; raw: string }> {
  return [
    ...Object.entries(r.vaccineDates).filter(([, v]) => v.trim()).map(([item, raw]) => ({ kind: 'vacuna' as const, plan_item: item as VaccinePlanItem, raw })),
    ...(r.dewormIn.trim() ? [{ kind: 'desparasitacion_interna' as const, plan_item: null, raw: r.dewormIn }] : []),
    ...(r.dewormOut.trim() ? [{ kind: 'desparasitacion_externa' as const, plan_item: null, raw: r.dewormOut }] : []),
  ];
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', gap: SPACING.xl, paddingVertical: SPACING.md },
  groupMobile: { flexDirection: 'column', gap: SPACING.sm },
  groupTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  groupTitleSide: { width: 168, paddingTop: SPACING.xs },
  groupBody: { flex: 1, minWidth: 0 },
  label: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm },
  note: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19, marginBottom: SPACING.md },
  ago: { fontSize: TYPOGRAPHY.sizes.sm, alignSelf: 'center' },
  body: { fontSize: TYPOGRAPHY.sizes.md },
  seg: { marginBottom: SPACING.md },
  segTight: { marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  pair: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.md },
  wide: { flexGrow: 2, flexBasis: 260 },
  narrow: { flexGrow: 1, flexBasis: 150 },
  half: { flexGrow: 1, flexBasis: 220 },
  third: { flexGrow: 1, flexBasis: 170 },
  recorded: { marginBottom: SPACING.lg, minHeight: 64 },
});
