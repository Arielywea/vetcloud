import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, X, FileText, Syringe, CalendarPlus, Wallet, Search, AlertTriangle, Download, Mail } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useResponsive } from '../../hooks/useResponsive';
import { useDiseases } from '../../hooks/useDirectus';
import { api, Appointment, ClinicalRecord, DirectusPet, Medication } from '../../services/directus';
import { authHeaders, apiFetch } from '../../services/auth';
import { API_URL } from '../../config';
import DisplayText from '../../components/ui/DisplayText';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import Segmented from '../../components/ui/Segmented';
import Escutcheon from '../../components/icons/Escutcheon';
import VoiceNotes from '../../components/VoiceNotes';
import VaccinationSheet, { VaccinationDraft } from '../../components/pet/VaccinationSheet';
import { petAlerts } from '../../components/pet/ChartHeader';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/VToast';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { calculateAge } from '../../utils/age';
import { parseCLP, parseNumberInRange } from '../../utils/parseNumber';
import { formatDmy, parseDmy, parseLocalDateTime, toLocalDateTimeInput } from '../../utils/date';
import { speciesLabel } from '../../utils/identity';
import { formatDay, PLAN_LABEL } from '../../utils/vaccinePlan';
import { parseDose } from '../../utils/doseParser';

type RecordType = 'consulta' | 'control' | 'cirugia';
type Extra = 'receta' | 'vacuna' | 'control' | 'cobro';

const TYPES = [{ value: 'consulta', label: 'Consulta' }, { value: 'control', label: 'Control' }, { value: 'cirugia', label: 'Cirugía' }] as const;
const PAY_METHODS = [{ value: 'efectivo', label: 'Efectivo' }, { value: 'debito', label: 'Débito' }, { value: 'credito', label: 'Crédito' }, { value: 'transferencia', label: 'Transferencia' }] as const;
// Path an appointment walks through the server's allowed transitions
const STEPS: Record<string, string[]> = {
  programada: ['en_espera', 'en_consulta'], confirmada: ['en_espera', 'en_consulta'], pendiente: ['en_espera', 'en_consulta'],
  en_espera: ['en_consulta'], en_consulta: [],
};

const FIRST_VISIT_TEMPLATE = 'Alimentación: \nAmbiente y vivienda: \nConvive con otros animales: \nVacunas y desparasitación: \nEnfermedades y cirugías previas: \nMedicación actual: ';

interface Form {
  type: RecordType;
  date: string;
  vet: string;
  reason: string;
  anamnesis: string;
  weight: string;
  findings: string;
  diagnosisText: string;
  diagnoses: Array<{ id: string; name: string }>;
  plan: string;
  procedure: string;
  postop: string;
  rx: string;
  vaccines: VaccinationDraft[];
  controlDate: string;
  controlTime: string;
  payAmount: string;
  payMethod: string;
  payDescription: string;
  extras: Extra[];
}

interface Outcome { label: string; ok: boolean; detail?: string }

const draftKey = (petId: string) => `vetcloud:consulta:${petId}`;
function loadDraft(petId: string): Form | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(draftKey(petId)) : null;
    if (!raw) return null;
    const { savedAt, form } = JSON.parse(raw);
    return Date.now() - savedAt < 12 * 3600 * 1000 ? form : null;
  } catch { return null; }
}
function saveDraft(petId: string, form: Form | null) {
  try {
    if (typeof localStorage === 'undefined') return;
    if (form) localStorage.setItem(draftKey(petId), JSON.stringify({ savedAt: Date.now(), form }));
    else localStorage.removeItem(draftKey(petId));
  } catch { /* private mode: no draft, the form still works */ }
}

export default function ConsultaScreen() {
  const { petId, appointment_id: appointmentId } = useLocalSearchParams<{ petId: string; appointment_id?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const { colors, onAccentText, onPrimaryText } = useTheme();
  const { isMobile } = useResponsive();
  const { diseases } = useDiseases('all');

  const [pet, setPet] = useState<DirectusPet | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [restored, setRestored] = useState(false);
  const [dxQuery, setDxQuery] = useState('');
  const [medQuery, setMedQuery] = useState('');
  const [meds, setMeds] = useState<Medication[]>([]);
  const [vaccineOpen, setVaccineOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ outcomes: Outcome[]; rxId: string | null } | null>(null);
  const loaded = useRef(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  useEffect(() => {
    if (!petId) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, recs] = await Promise.all([api.pets.get(petId), api.clinicalRecords.list(petId)]);
        if (cancelled) return;
        setPet(p);
        const sorted = [...(recs as ClinicalRecord[])].sort((a, b) => String(b.date).localeCompare(String(a.date)));
        setRecords(sorted);
        let appt: Appointment | null = null;
        if (appointmentId) {
          appt = await api.appointments.get(appointmentId).catch(() => null);
          // Walk the appointment to "en consulta" (the server only allows one step at a time)
          let status = appt?.status;
          for (const next of (status && STEPS[status]) || []) {
            await api.appointments.update(appointmentId, { status: next }).catch(() => null);
            status = next as Appointment['status'];
          }
          if (appt && status) appt = { ...appt, status };
          if (!cancelled) setAppointment(appt);
        }
        const draft = loadDraft(petId);
        if (draft) { setForm(draft); setRestored(true); }
        else {
          const last = sorted.find((r) => r.details?.anamnesis);
          setForm({
            type: appt?.appointment_type === 'control' ? 'control' : appt?.appointment_type === 'cirugia' ? 'cirugia' : 'consulta',
            date: toLocalDateTimeInput(), vet: user?.name || '',
            reason: appt?.description || '',
            anamnesis: last?.details?.anamnesis || (sorted.length ? '' : FIRST_VISIT_TEMPLATE),
            weight: '', findings: '', diagnosisText: '', diagnoses: [], plan: '', procedure: '', postop: '',
            rx: '', vaccines: [], controlDate: '', controlTime: '10:00',
            payAmount: '', payMethod: 'efectivo', payDescription: '', extras: [],
          });
        }
        loaded.current = true;
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'No se pudo cargar el paciente');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId, appointmentId]);

  // Keep a local draft: an accidental "back" in the middle of a visit must not lose it
  useEffect(() => { if (loaded.current && form && petId && !done) saveDraft(petId, form); }, [form, petId, done]);

  useEffect(() => {
    const q = medQuery.trim();
    if (q.length < 2) { setMeds([]); return; }
    const t = setTimeout(() => { api.medications.list({ search: q }).then((m: Medication[]) => setMeds(m.slice(0, 6))).catch(() => setMeds([])); }, 250);
    return () => clearTimeout(t);
  }, [medQuery]);

  const lastWeight = pet?.current_weight_kg != null ? Number(pet.current_weight_kg) : null;
  const weightKg = useMemo(() => {
    const w = parseNumberInRange(form?.weight || '', 0.05, 150);
    return w !== null && !Number.isNaN(w) ? w : lastWeight;
  }, [form?.weight, lastWeight]);

  const dxMatches = useMemo(() => {
    const q = dxQuery.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (q.length < 2 || !form) return [];
    const fits = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q);
    return diseases
      .filter((d) => (d.species === 'both' || d.species === pet?.species) && !form.diagnoses.some((x) => x.id === d.id))
      .filter((d) => fits(d.name) || (d.english_name ? fits(d.english_name) : false))
      .slice(0, 6);
  }, [dxQuery, diseases, form, pet?.species]);

  if (loading) return <View style={[styles.flex, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg }} /></View>;
  if (!pet || !form) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textSecondary }}>{error || 'Paciente no encontrado'}</Text></View>;

  const alerts = petAlerts(pet).map((a) => (a.type === 'allergy' ? `Alergia: ${a.text}` : a.type === 'chronic' ? `Crónico: ${a.text}` : a.text));
  const toggleExtra = (e: Extra) => {
    if (e === 'vacuna' && !form.extras.includes('vacuna')) setVaccineOpen(true);
    set('extras', form.extras.includes(e) ? form.extras.filter((x) => x !== e) : [...form.extras, e]);
  };
  const has = (e: Extra) => form.extras.includes(e);

  // Per-kg dose for this species: the numeric columns when filled, else parsed from the formulary text
  const doseFor = (m: Medication) => {
    const text = pet.species === 'cat' ? m.dosis_gato : m.dosis_perro;
    if (m.dosis_min_mg_kg != null) {
      const lo = Number(m.dosis_min_mg_kg);
      return { lo, hi: m.dosis_max_mg_kg != null ? Number(m.dosis_max_mg_kg) : lo, unit: 'mg', every: m.frecuencia_horas, text };
    }
    const p = parseDose(text);
    return p ? { lo: p.min, hi: p.max, unit: p.unit, every: p.everyHours, text } : { lo: null, hi: null, unit: 'mg', every: null, text };
  };

  const addDoseLine = (m: Medication) => {
    const d = doseFor(m);
    const fmt = (n: number) => (n >= 10 ? Math.round(n) : Math.round(n * 100) / 100).toString().replace('.', ',');
    let dose = '';
    if (m.dosis_min_mg_kg != null && d.lo != null && d.hi != null) {
      const perKg = d.hi !== d.lo ? `${fmt(d.lo)}–${fmt(d.hi)} mg/kg` : `${fmt(d.lo)} mg/kg`;
      dose = weightKg ? `${perKg} (${d.hi !== d.lo ? `${fmt(d.lo * weightKg)}–${fmt(d.hi * weightKg)}` : fmt(d.lo * weightKg)} mg)` : perKg;
      if (d.every) dose += ` cada ${d.every} h`;
    } else if (d.text) {
      // The formulary text can hold several doses ("0,1 mg/kg día 1, luego 0,05 mg/kg cada 48 h"): annotate
      // each one with its amount for this weight instead of picking one and pairing it with the wrong interval
      dose = weightKg
        ? d.text.replace(/(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*(mg|mcg|µg|UI|ml)\s*\/\s*kg(?!\s*\/\s*(?:min|h))/gi,
            (all, a, b, unit) => `${all} (${fmt(Number(a.replace(',', '.')) * weightKg)}${b ? `–${fmt(Number(b.replace(',', '.')) * weightKg)}` : ''} ${unit})`)
        : d.text;
    }
    const parts = [m.nombre, m.presentacion, dose, m.via_administracion].filter(Boolean);
    set('rx', (form.rx ? form.rx.trimEnd() + '\n' : '') + parts.join(' · ') + ' por __ días.');
    setMedQuery('');
  };

  const close = async () => {
    const when = parseLocalDateTime(form.date);
    if (!when) { setError('Fecha y hora inválidas (AAAA-MM-DD HH:MM)'); return; }
    const w = parseNumberInRange(form.weight, 0.05, 150);
    if (w !== null && Number.isNaN(w)) { setError('El peso debe estar entre 0,05 y 150 kg (ej. 12,5)'); return; }
    if (!form.reason.trim() && !form.findings.trim() && !form.diagnosisText.trim() && !form.diagnoses.length && !form.plan.trim()) {
      setError('Escribe al menos el motivo, los hallazgos, el diagnóstico o el plan'); return;
    }
    let control: Date | null = null;
    if (has('control') && form.controlDate.trim()) {
      const d = parseDmy(form.controlDate, { allowFuture: true });
      const [hh, mm] = form.controlTime.split(':').map(Number);
      if (!d || !Number.isFinite(hh) || !Number.isFinite(mm)) { setError('Fecha u hora del control inválida (DD/MM/AAAA y HH:MM)'); return; }
      control = new Date(`${d}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`);
      if (control <= new Date()) { setError('El control debe quedar en el futuro'); return; }
    }
    const amount = has('cobro') && form.payAmount.trim() ? parseCLP(form.payAmount) : null;
    if (amount !== null && (Number.isNaN(amount) || amount <= 0)) { setError('Monto inválido (ej. 25.000)'); return; }

    setSaving(true);
    setError(null);
    const outcomes: Outcome[] = [];
    let rxId: string | null = null;
    try {
      const names = form.diagnoses.map((d) => d.name);
      const record = await api.clinicalRecords.create({
        pet_id: pet.id,
        record_type: form.type,
        date: when.toISOString(),
        veterinarian: form.vet.trim() || null,
        weight_kg: w,
        appointment_id: appointment?.id || null,
        is_initial: records.length === 0,
        details: {
          motivo_consulta: form.reason.trim() || undefined,
          anamnesis: form.anamnesis.trim() && form.anamnesis.trim() !== FIRST_VISIT_TEMPLATE.trim() ? form.anamnesis.trim() : undefined,
          hallazgos_examen_fisico: form.findings.trim() || undefined,
          assessment: [names.join(', '), form.diagnosisText.trim()].filter(Boolean).join('. ') || undefined,
          diagnoses: form.diagnoses.length ? form.diagnoses : undefined,
          plan: form.plan.trim() || undefined,
          treatment: has('receta') && form.rx.trim() ? form.rx.trim() : undefined,
          procedimiento: form.type === 'cirugia' ? form.procedure.trim() || undefined : undefined,
          postoperatorio: form.type === 'cirugia' ? form.postop.trim() || undefined : undefined,
        },
      });
      outcomes.push({ label: form.type === 'cirugia' ? 'Cirugía registrada' : form.type === 'control' ? 'Control registrado' : 'Consulta registrada', ok: true, detail: w ? `Peso ${String(w).replace('.', ',')} kg` : undefined });

      if (has('receta') && form.rx.trim()) {
        try {
          const rx = await api.prescriptions.create({
            pet_id: pet.id, user_id: user?.id || '', clinical_record_id: record.id, veterinarian_name: form.vet.trim() || null,
            prescription_body: form.rx.trim(), format: 'standard', status: 'active', issued_at: new Date().toISOString(),
          });
          rxId = rx?.id || null;
          outcomes.push({ label: 'Receta emitida', ok: true });
        } catch (e: any) { outcomes.push({ label: 'Receta', ok: false, detail: e?.message }); }
      }
      for (const v of form.vaccines) {
        const label = v.kind === 'vacuna' ? (v.plan_item && v.plan_item !== 'otra' ? PLAN_LABEL[v.plan_item] : v.product || 'Vacuna') : v.kind === 'desparasitacion_interna' ? 'Desparasitación interna' : 'Desparasitación externa';
        try {
          await api.vaccinations.create({ pet_id: pet.id, ...v, clinical_record_id: record.id });
          outcomes.push({ label: `${label} aplicada`, ok: true, detail: v.next_due_at ? `Próxima: ${formatDay(v.next_due_at)}` : undefined });
        } catch (e: any) { outcomes.push({ label, ok: false, detail: e?.message }); }
      }
      if (control) {
        try {
          await api.appointments.create({
            patient_name: pet.name, pet_id: pet.id, start_time: control.toISOString(), end_time: new Date(control.getTime() + 30 * 60000).toISOString(),
            appointment_type: 'control', status: 'programada', follow_up_of: appointment?.id || null, veterinarian: form.vet.trim() || null,
            description: `Control de ${names[0] || form.reason.trim() || 'consulta'}`.slice(0, 200),
          });
          outcomes.push({ label: 'Control agendado', ok: true, detail: control.toLocaleString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) });
        } catch (e: any) { outcomes.push({ label: 'Control', ok: false, detail: e?.message }); }
      }
      if (amount) {
        try {
          await api.payments.create({ pet_id: pet.id, appointment_id: appointment?.id || null, amount, method: form.payMethod, description: form.payDescription.trim() || 'Consulta' });
          outcomes.push({ label: 'Cobro registrado', ok: true, detail: `$${amount.toLocaleString('es-CL')}` });
        } catch (e: any) { outcomes.push({ label: 'Cobro', ok: false, detail: e?.message }); }
      }
      if (appointment && appointment.status === 'en_consulta') {
        await api.appointments.update(appointment.id, { status: 'completada', pet_id: pet.id }).then(
          () => outcomes.push({ label: 'Cita marcada como atendida', ok: true }),
          (e: any) => outcomes.push({ label: 'Cerrar la cita', ok: false, detail: e?.message }),
        );
      }
      saveDraft(pet.id, null);
      if (w) setPet({ ...pet, current_weight_kg: w, current_weight_at: when.toISOString() });
      setDone({ outcomes, rxId });
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar la consulta');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => { saveDraft(pet.id, null); router.canGoBack() ? router.back() : router.replace(`/pet/${pet.id}` as any); };

  const downloadRx = async (rxId: string) => {
    try {
      const res = await apiFetch(`${API_URL}/items/pets/${pet.id}/prescriptions/${rxId}/pdf`, { headers: await authHeaders() });
      if (!res.ok) throw new Error();
      const url = window.URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = `receta_${pet.name}.pdf`; document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch { toast.error('No se pudo generar el PDF de la receta'); }
  };

  const header = (
    <View style={[styles.patient, { backgroundColor: colors.surface }]}>
      <Escutcheon size={44} color={colors.primary} initial={pet.name.charAt(0).toUpperCase()} />
      <View style={styles.grow}>
        <DisplayText style={[styles.petName, { color: colors.text }]} numberOfLines={1}>{pet.name}</DisplayText>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>
          {[speciesLabel(pet), pet.breed, calculateAge(pet.birth_date) !== 'N/D' ? calculateAge(pet.birth_date) : null, pet.owner_name || pet.tutor_name,
            lastWeight ? `Último peso ${String(lastWeight).replace('.', ',')} kg` : null].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  );

  if (done) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page}>
        {header}
        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <DisplayText style={[styles.panelTitle, { color: colors.text }]}>Consulta cerrada</DisplayText>
          {done.outcomes.map((o, i) => (
            <View key={i} style={styles.outcome}>
              {o.ok ? <Check size={18} color={colors.success} /> : <X size={18} color={colors.error} />}
              <View style={styles.grow}>
                <Text style={[styles.body, { color: colors.text }]}>{o.ok ? o.label : `${o.label}: no se guardó`}</Text>
                {o.detail ? <Text style={[styles.meta, { color: o.ok ? colors.textSecondary : colors.error }]}>{o.detail}</Text> : null}
              </View>
            </View>
          ))}
          {done.outcomes.some((o) => !o.ok) ? <Text style={[styles.meta, { color: colors.textSecondary, marginTop: SPACING.sm }]}>Lo que no se guardó puedes agregarlo desde la ficha.</Text> : null}
          <View style={styles.doneActions}>
            <VButton onPress={() => router.replace(`/pet/${pet.id}` as any)}>Volver a la ficha</VButton>
            {done.rxId ? <VButton variant="secondary" onPress={() => downloadRx(done.rxId!)} icon={<Download size={16} color={colors.primary} />}>Receta en PDF</VButton> : null}
            {done.rxId && (pet.owner_email || pet.email) ? (
              <VButton variant="secondary" onPress={() => api.prescriptions.sendEmail(done.rxId!).then(() => toast.success(`Receta enviada a ${pet.owner_email || pet.email}`), (e: any) => toast.error(e?.message || 'No se pudo enviar'))}
                icon={<Mail size={16} color={colors.primary} />}>Enviar receta al tutor</VButton>
            ) : null}
          </View>
        </View>
      </ScrollView>
    );
  }

  const extraButton = (e: Extra, label: string, Icon: any) => (
    <VButton key={e} size="sm" variant={has(e) ? 'filled' : 'secondary'} onPress={() => toggleExtra(e)}
      icon={<Icon size={15} color={has(e) ? onPrimaryText.default : colors.primary} />} accessibilityLabel={`${label}${has(e) ? ', incluido' : ''}`}>{label}</VButton>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {header}
      {alerts.length ? (
        <View style={[styles.alerts, { backgroundColor: alpha(colors.error, 0.1) }]} accessibilityRole="alert">
          <AlertTriangle size={18} color={colors.error} />
          <Text style={[styles.body, { color: colors.text, flex: 1 }]}>{alerts.join(' · ')}</Text>
        </View>
      ) : null}
      {restored ? (
        <View style={[styles.note, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.body, { color: colors.text, flex: 1 }]}>Recuperamos el borrador que quedó sin cerrar en este equipo.</Text>
          <VButton size="sm" variant="ghost" onPress={() => { saveDraft(pet.id, null); setRestored(false); setForm({ ...form, reason: '', findings: '', diagnosisText: '', diagnoses: [], plan: '', rx: '', vaccines: [], extras: [], weight: '' }); }}>Empezar de cero</VButton>
        </View>
      ) : null}

      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <Segmented label="Tipo de atención" options={TYPES} value={form.type} onChange={(v) => set('type', v)} style={styles.segment} />
        <View style={styles.pair}>
          <VInput containerStyle={styles.half} label="Fecha y hora" value={form.date} onChangeText={(v) => set('date', v)} />
          <VInput containerStyle={styles.half} label="Veterinario" value={form.vet} onChangeText={(v) => set('vet', v)} />
        </View>
        <VInput label="Motivo de consulta" value={form.reason} onChangeText={(v) => set('reason', v)} placeholder="Qué trae al paciente hoy" />
        <VInput label={records.length ? 'Anamnesis' : 'Anamnesis inicial'} value={form.anamnesis} onChangeText={(v) => set('anamnesis', v)} multiline style={styles.area}
          hint={!records.length ? 'Primera consulta: completa la plantilla' : records.some((r) => r.details?.anamnesis) ? 'Copiada de la última consulta: actualízala con lo que cambió' : 'Lo que cuenta el tutor desde la última visita'} />
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <DisplayText style={[styles.panelTitle, { color: colors.text }]}>Examen</DisplayText>
        <VInput label="Peso (kg)" value={form.weight} onChangeText={(v) => set('weight', v)} placeholder="Ej. 12,5"
          keyboardType="decimal-pad" containerStyle={styles.narrow} hint={lastWeight ? `Anterior: ${String(lastWeight).replace('.', ',')} kg${pet.current_weight_at ? ` (${formatDay(pet.current_weight_at)})` : ''}` : 'Actualiza el peso de la ficha'} />
        <VInput label="Hallazgos del examen" value={form.findings} onChangeText={(v) => set('findings', v)} multiline style={styles.area}
          placeholder="Condición corporal, mucosas, hidratación, auscultación, palpación, lo que encuentres" />
        <VoiceNotes onTranscription={(t) => setForm((f) => (f ? { ...f, findings: f.findings ? `${f.findings} ${t}` : t } : f))} />
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <DisplayText style={[styles.panelTitle, { color: colors.text }]}>Diagnóstico y plan</DisplayText>
        {form.diagnoses.length ? (
          <View style={styles.chips}>
            {form.diagnoses.map((d) => (
              <VButton key={d.id} size="sm" variant="filled" onPress={() => set('diagnoses', form.diagnoses.filter((x) => x.id !== d.id))}
                icon={<X size={14} color={onPrimaryText.default} />} iconPosition="right" accessibilityLabel={`Quitar ${d.name}`}>{d.name}</VButton>
            ))}
          </View>
        ) : null}
        <View style={styles.searchWrap}>
          <VInput label="Buscar en el catálogo de enfermedades" value={dxQuery} onChangeText={setDxQuery} placeholder="Ej. otitis, enfermedad renal…"
            leftIcon={<Search size={18} color={colors.textLight} />} autoCorrect={false} containerStyle={{ marginBottom: dxMatches.length ? SPACING.xs : SPACING.lg }} />
          {dxMatches.map((d) => (
            <Pressable key={d.id} onPress={() => { set('diagnoses', [...form.diagnoses, { id: d.id, name: d.name }]); setDxQuery(''); }} accessibilityRole="button"
              style={({ pressed, hovered }: any) => [styles.option, { backgroundColor: pressed || hovered ? colors.surfaceVariant : 'transparent' }]}>
              <Text style={[styles.body, { color: colors.text }]}>{d.name}</Text>
            </Pressable>
          ))}
          {dxMatches.length ? <View style={{ height: SPACING.md }} /> : null}
        </View>
        <VInput label="Diagnóstico o impresión clínica" value={form.diagnosisText} onChangeText={(v) => set('diagnosisText', v)} multiline placeholder="Presuntivo, diferenciales, lo que no está en el catálogo" />
        {form.type === 'cirugia' ? (
          <>
            <VInput label="Procedimiento" value={form.procedure} onChangeText={(v) => set('procedure', v)} multiline placeholder="Técnica, hallazgos intraoperatorios" />
            <VInput label="Indicaciones postoperatorias" value={form.postop} onChangeText={(v) => set('postop', v)} multiline />
          </>
        ) : null}
        <VInput label="Plan e indicaciones" value={form.plan} onChangeText={(v) => set('plan', v)} multiline style={styles.area} placeholder="Exámenes, manejo, indicaciones al tutor" />
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <DisplayText style={[styles.panelTitle, { color: colors.text }]}>Desde esta consulta</DisplayText>
        <View style={[styles.chips, { marginBottom: SPACING.lg }]}>
          {extraButton('receta', 'Receta', FileText)}
          {extraButton('vacuna', 'Vacuna o desparasitación', Syringe)}
          {extraButton('control', 'Control', CalendarPlus)}
          {extraButton('cobro', 'Cobro', Wallet)}
        </View>

        {has('receta') ? (
          <View style={styles.extra}>
            <Text style={[styles.extraTitle, { color: colors.text }]}>Receta</Text>
            <View style={styles.searchWrap}>
              <VInput value={medQuery} onChangeText={setMedQuery} placeholder="Buscar fármaco en el vademécum" accessibilityLabel="Buscar fármaco"
                leftIcon={<Search size={18} color={colors.textLight} />} autoCorrect={false}
                hint={weightKg ? `Dosis calculada con ${String(weightKg).replace('.', ',')} kg` : 'Ingresa el peso para calcular la dosis'} />
              {meds.map((m) => (
                <Pressable key={m.id} onPress={() => addDoseLine(m)} accessibilityRole="button"
                  style={({ pressed, hovered }: any) => [styles.option, { backgroundColor: pressed || hovered ? colors.surfaceVariant : 'transparent' }]}>
                  <Text style={[styles.body, { color: colors.text }]}>{m.nombre}{m.presentacion ? ` · ${m.presentacion}` : ''}</Text>
                  {doseFor(m).text ? <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>{pet.species === 'cat' ? 'Gato' : 'Perro'}: {doseFor(m).text}</Text> : null}
                </Pressable>
              ))}
            </View>
            <VInput value={form.rx} onChangeText={(v) => set('rx', v)} multiline style={styles.rxArea} accessibilityLabel="Texto de la receta"
              placeholder="Fármaco, dosis, vía, frecuencia y duración. Revisa siempre la dosis calculada." />
          </View>
        ) : null}

        {has('vacuna') ? (
          <View style={styles.extra}>
            <Text style={[styles.extraTitle, { color: colors.text }]}>Vacunas y desparasitaciones</Text>
            {form.vaccines.map((v, i) => (
              <View key={i} style={styles.outcome}>
                <Syringe size={16} color={colors.primary} />
                <Text style={[styles.body, { color: colors.text, flex: 1 }]}>
                  {[v.kind === 'vacuna' ? (v.plan_item && v.plan_item !== 'otra' ? PLAN_LABEL[v.plan_item] : 'Vacuna') : v.kind === 'desparasitacion_interna' ? 'Desparasitación interna' : 'Desparasitación externa',
                    v.product, v.lot ? `lote ${v.lot}` : null, v.next_due_at ? `próxima ${formatDay(v.next_due_at)}` : null].filter(Boolean).join(' · ')}
                </Text>
                <VButton size="sm" variant="ghost" color={colors.error} onPress={() => set('vaccines', form.vaccines.filter((_, j) => j !== i))}>Quitar</VButton>
              </View>
            ))}
            <VButton size="sm" variant="secondary" onPress={() => setVaccineOpen(true)} style={{ alignSelf: 'flex-start' }}>{form.vaccines.length ? 'Agregar otra dosis' : 'Agregar dosis'}</VButton>
          </View>
        ) : null}

        {has('control') ? (
          <View style={styles.extra}>
            <Text style={[styles.extraTitle, { color: colors.text }]}>Control</Text>
            <View style={styles.chips}>
              {[7, 15, 30].map((days) => {
                const d = new Date(); d.setDate(d.getDate() + days);
                return <VButton key={days} size="sm" variant="secondary" onPress={() => set('controlDate', formatDmy(d.toISOString().slice(0, 10)))}>{`En ${days} días`}</VButton>;
              })}
            </View>
            <View style={[styles.pair, { marginTop: SPACING.md }]}>
              <VInput containerStyle={styles.half} label="Fecha" value={form.controlDate} onChangeText={(v) => set('controlDate', v)} placeholder="DD/MM/AAAA" />
              <VInput containerStyle={styles.half} label="Hora" value={form.controlTime} onChangeText={(v) => set('controlTime', v)} placeholder="10:00" />
            </View>
          </View>
        ) : null}

        {has('cobro') ? (
          <View style={styles.extra}>
            <Text style={[styles.extraTitle, { color: colors.text }]}>Cobro</Text>
            <View style={styles.pair}>
              <VInput containerStyle={styles.half} label="Monto ($)" value={form.payAmount} onChangeText={(v) => set('payAmount', v)} placeholder="25.000" keyboardType="number-pad" />
              <VInput containerStyle={styles.half} label="Detalle" value={form.payDescription} onChangeText={(v) => set('payDescription', v)} placeholder="Consulta, vacuna…" />
            </View>
            <Segmented label="Medio de pago" options={PAY_METHODS} value={form.payMethod} onChange={(v) => set('payMethod', v)} size="sm" />
          </View>
        ) : null}
        {!form.extras.length ? <Text style={[styles.meta, { color: colors.textSecondary }]}>Agrega lo que corresponda: todo se guarda junto al cerrar la consulta.</Text> : null}
      </View>

      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
      <View style={[styles.footer, isMobile && styles.footerMobile]}>
        <VButton variant="ghost" onPress={discard}>Descartar</VButton>
        <VButton size="lg" onPress={close} loading={saving} disabled={saving} icon={<Check size={18} color={onAccentText.default} />}>Cerrar consulta</VButton>
      </View>

      <VaccinationSheet visible={vaccineOpen} pet={pet} onClose={() => setVaccineOpen(false)}
        onDraft={(d) => { setVaccineOpen(false); setForm((f) => (f ? { ...f, vaccines: [...f.vaccines, d], extras: f.extras.includes('vacuna') ? f.extras : [...f.extras, 'vacuna'] } : f)); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { padding: SPACING.lg, paddingBottom: SPACING['6xl'], maxWidth: 920, width: '100%', alignSelf: 'center' },
  patient: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  grow: { flex: 1, minWidth: 0 },
  petName: { fontSize: 28, lineHeight: 32, fontWeight: '600' },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21 },
  alerts: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  note: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  panel: { padding: SPACING.xl, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  panelTitle: { fontSize: 24, lineHeight: 28, fontWeight: '600', marginBottom: SPACING.lg },
  segment: { marginBottom: SPACING.lg },
  pair: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.md },
  half: { flexGrow: 1, flexBasis: 200 },
  narrow: { maxWidth: 220 },
  area: { minHeight: 96, textAlignVertical: 'top' },
  rxArea: { minHeight: 140, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  searchWrap: {},
  option: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, minHeight: 40, justifyContent: 'center' },
  extra: { marginBottom: SPACING.xl },
  extraTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  outcome: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 36, marginBottom: SPACING.xs },
  doneActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xl },
  error: { fontSize: TYPOGRAPHY.sizes.md, marginBottom: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: SPACING.sm },
  footerMobile: { justifyContent: 'space-between' },
});
