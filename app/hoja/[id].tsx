import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Minus, Plus, FileText } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { api, HospitalSheet, HospitalTask, HospitalTreatment, HospitalTreatmentKind } from '../../services/directus';
import DisplayText from '../../components/ui/DisplayText';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import IconButton from '../../components/ui/IconButton';
import Segmented from '../../components/ui/Segmented';
import FormSheet from '../../components/ui/FormSheet';
import Escutcheon from '../../components/icons/Escutcheon';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/VToast';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { petAlerts } from '../../components/pet/ChartHeader';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { calculateAge } from '../../utils/age';
import { speciesLabel } from '../../utils/identity';
import { Slot, SlotState, KIND_LABEL, buildSlots, floorToHour, frequencyLabel, hourLabel, sortTreatments, startOfDay } from '../../utils/hospitalSheet';

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const CELL = 46;
const DAY_MS = 86400000;

const KINDS = [
  { value: 'medicacion', label: 'Medicación' }, { value: 'fluidos', label: 'Fluidos' }, { value: 'constante', label: 'Constante' },
  { value: 'alimentacion', label: 'Alimentación' }, { value: 'cuidado', label: 'Cuidado' },
] as const;
const FREQUENCIES = [
  { value: 'once', label: 'Una vez' }, { value: '1', label: '1 h' }, { value: '2', label: '2 h' }, { value: '4', label: '4 h' },
  { value: '6', label: '6 h' }, { value: '8', label: '8 h' }, { value: '12', label: '12 h' }, { value: '24', label: '24 h' },
  { value: 'hours', label: 'Horas fijas' },
] as const;
type Frequency = (typeof FREQUENCIES)[number]['value'];
// Vitals repeat: an interval, or the hours the clinic actually does its rounds
const VITALS_SCHEDULES = FREQUENCIES.filter((f) => f.value !== 'once' && f.value !== '24');
const DEFAULT_HOURS = [8, 14, 20];
const STARTS = [{ value: 'now', label: 'Esta hora' }, { value: 'next', label: 'La próxima hora' }] as const;
// The usual monitoring set, added in one tap
const VITALS = [
  { name: 'Temperatura', unit: '°C' }, { name: 'Frecuencia cardíaca', unit: 'lpm' }, { name: 'Frecuencia respiratoria', unit: 'rpm' },
];
const NAME_PLACEHOLDER: Record<HospitalTreatmentKind, string> = {
  medicacion: 'Ej.: Metronidazol 15 mg/kg EV', fluidos: 'Ej.: Ringer lactato 45 mL/h', constante: 'Ej.: Temperatura',
  alimentacion: 'Ej.: Dieta gastrointestinal húmeda', cuidado: 'Ej.: Paseo, cambio de vendaje',
};
const STATE_LABEL: Record<SlotState, string> = { pending: 'programado', due: 'toca ahora', late: 'atrasado', done: 'hecho', skipped: 'omitido' };

export default function HospitalSheetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();
  const { colors, onAccentText } = useTheme();
  const { isMobile } = useResponsive();

  const [sheet, setSheet] = useState<HospitalSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [day, setDay] = useState(() => startOfDay(new Date()));
  const [now, setNow] = useState(() => new Date());
  const [busy, setBusy] = useState<string | null>(null);

  // New treatment
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<HospitalTreatmentKind>('medicacion');
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [unit, setUnit] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('8');
  const [startAt, setStartAt] = useState<'now' | 'next'>('now');
  const [hours, setHours] = useState<number[]>(DEFAULT_HOURS);
  // Vitals set: asks when to take them before adding the three rows
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [vitalsSchedule, setVitalsSchedule] = useState<Frequency>('4');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // One scheduled time, opened to record a value, a note, skip it or undo it
  const [open, setOpen] = useState<Slot | null>(null);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [slotError, setSlotError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      setSheet(await api.hospitalizations.sheet(id));
      setLoadError(null);
    } catch (e: any) {
      setLoadError(e?.message || 'No se pudo cargar la hoja');
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  // "Toca ahora" and "atrasado" depend on the clock: re-evaluate every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const hosp = sheet?.hospitalization;
  const closed = hosp?.status === 'discharged';
  const sheetEnd = hosp?.discharge_date ? new Date(hosp.discharge_date) : null;
  const today = startOfDay(now);
  const isToday = day.getTime() === today.getTime();
  const firstDay = hosp ? startOfDay(new Date(hosp.admission_date)) : today;

  const treatments = useMemo(() => sortTreatments(sheet?.treatments || []), [sheet?.treatments]);
  const slots = useMemo(
    () => buildSlots(treatments, sheet?.tasks || [], day, new Date(day.getTime() + DAY_MS), sheetEnd, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [treatments, sheet?.tasks, day, hosp?.discharge_date, now],
  );
  const cells = useMemo(() => {
    const map = new Map<string, Slot[]>();
    slots.forEach((s) => { const k = `${s.treatment.id}:${s.at.getHours()}`; map.set(k, [...(map.get(k) || []), s]); });
    return map;
  }, [slots]);
  // What needs attention, counted over the whole stay so far (not only the day on screen)
  const attention = useMemo(() => {
    if (!hosp || closed) return { late: 0, due: 0 };
    const all = buildSlots(treatments, sheet?.tasks || [], new Date(hosp.admission_date), new Date(now.getTime() + DAY_MS), sheetEnd, now);
    return { late: all.filter((s) => s.state === 'late').length, due: all.filter((s) => s.state === 'due').length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treatments, sheet?.tasks, hosp?.admission_date, hosp?.discharge_date, closed, now]);

  // Open on the current hour instead of midnight
  const grid = useRef<ScrollView>(null);
  useEffect(() => {
    if (!loading && isToday) setTimeout(() => grid.current?.scrollTo({ x: Math.max(0, (now.getHours() - 2) * CELL), animated: false }), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isToday]);

  const applyTask = (task: HospitalTask) => setSheet((s) => (s ? { ...s, tasks: [...s.tasks.filter((t) => t.id !== task.id), task] } : s));

  const record = async (slot: Slot, status: HospitalTask['status'], v?: string, n?: string) => {
    const key = `${slot.treatment.id}:${slot.at.getTime()}`;
    setBusy(key);
    try {
      applyTask(await api.hospitalizations.saveTask(slot.treatment.id, { scheduled_for: slot.at.toISOString(), status, value: v || null, notes: n || null }));
      return true;
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo guardar');
      return false;
    } finally {
      setBusy(null);
    }
  };

  const openSlot = (slot: Slot) => {
    setValue(slot.task?.value || ''); setNotes(slot.task?.notes || ''); setSlotError(null); setOpen(slot);
  };
  // One tap marks it done; a measurement needs its value first, and what is already recorded opens for review
  const pressSlot = (slot: Slot) => {
    if (closed || slot.task || slot.treatment.kind === 'constante') openSlot(slot);
    else record(slot, 'done');
  };

  const saveOpen = async (status: HospitalTask['status']) => {
    if (!open) return;
    if (status === 'done' && open.treatment.kind === 'constante' && !value.trim()) { setSlotError('Escribe el valor medido'); return; }
    if (status === 'skipped' && !notes.trim()) { setSlotError('Anota por qué se omite'); return; }
    if (await record(open, status, value.trim(), notes.trim())) setOpen(null);
  };
  const undoOpen = async () => {
    if (!open?.task) return;
    try {
      await api.hospitalizations.deleteTask(open.task.id);
      const removed = open.task.id;
      setSheet((s) => (s ? { ...s, tasks: s.tasks.filter((t) => t.id !== removed) } : s));
      setOpen(null);
    } catch (e: any) { setSlotError(e?.message || 'No se pudo deshacer'); }
  };

  const resetForm = () => { setKind('medicacion'); setName(''); setInstructions(''); setUnit(''); setFrequency('8'); setStartAt('now'); setHours(DEFAULT_HOURS); setFormError(null); };
  const toggleHour = (h: number) => setHours((v) => (v.includes(h) ? v.filter((x) => x !== h) : [...v, h].sort((a, b) => a - b)));
  // What a chosen schedule sends: an interval, fixed hours, or neither (once)
  const scheduleOf = (f: Frequency) => ({ frequency_hours: f === 'once' || f === 'hours' ? null : Number(f), day_hours: f === 'hours' ? hours : null });
  const startDate = (which: 'now' | 'next') => new Date(floorToHour(new Date()).getTime() + (which === 'next' ? 3600000 : 0));

  const addTreatment = async () => {
    if (!id) return;
    if (!name.trim()) { setFormError('Escribe el nombre del tratamiento'); return; }
    if (frequency === 'hours' && !hours.length) { setFormError('Elige al menos una hora'); return; }
    setSaving(true); setFormError(null);
    try {
      const created = await api.hospitalizations.addTreatment(id, {
        kind, name: name.trim(), instructions: instructions.trim() || null, unit: kind === 'constante' ? unit.trim() || null : null,
        ...scheduleOf(frequency), start_at: startDate(frequency === 'hours' ? 'now' : startAt).toISOString(),
      });
      setSheet((s) => (s ? { ...s, treatments: [...s.treatments, created] } : s));
      setAdding(false); resetForm();
    } catch (e: any) {
      setFormError(e?.message || 'No se pudo agregar el tratamiento');
    } finally {
      setSaving(false);
    }
  };

  const addVitals = async () => {
    if (!id) return;
    if (vitalsSchedule === 'hours' && !hours.length) { setFormError('Elige al menos una hora'); return; }
    setFormError(null);
    setBusy('vitals');
    try {
      const start = startDate('now').toISOString();
      const created: HospitalTreatment[] = [];
      for (const v of VITALS) created.push(await api.hospitalizations.addTreatment(id, { kind: 'constante', name: v.name, unit: v.unit, ...scheduleOf(vitalsSchedule), start_at: start }));
      setSheet((s) => (s ? { ...s, treatments: [...s.treatments, ...created] } : s));
      setVitalsOpen(false);
      toast.success(`Constantes agregadas ${frequencyLabel(scheduleOf(vitalsSchedule))}`);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron agregar las constantes');
      load(true);
    } finally {
      setBusy(null);
    }
  };

  const discontinue = async (t: HospitalTreatment) => {
    const ok = await confirm({ title: 'Suspender tratamiento', message: `"${t.name}" deja de programarse desde ahora. Lo ya registrado se conserva en la hoja.`, confirmLabel: 'Suspender', destructive: true });
    if (!ok) return;
    try {
      const updated = await api.hospitalizations.updateTreatment(t.id, { discontinued_at: new Date().toISOString() });
      setSheet((s) => (s ? { ...s, treatments: s.treatments.map((x) => (x.id === t.id ? updated : x)) } : s));
    } catch (e: any) { toast.error(e?.message || 'No se pudo suspender'); }
  };

  if (loading) return <View style={[styles.flex, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg }} /></View>;
  if (!sheet || !hosp) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{loadError || 'No se encontró la hospitalización'}</Text>
        <VButton variant="secondary" onPress={() => load()} style={{ marginTop: SPACING.md }}>Reintentar</VButton>
      </View>
    );
  }

  const alerts = petAlerts(hosp as any).map((a) => (a.type === 'allergy' ? `Alergia: ${a.text}` : a.text));
  const age = calculateAge(hosp.birth_date);
  const weight = hosp.current_weight_kg != null ? `${String(hosp.current_weight_kg).replace('.', ',')} kg` : null;
  const stayDay = Math.floor((today.getTime() - firstDay.getTime()) / DAY_MS) + 1;
  const labelWidth = isMobile ? 148 : 260;
  const dayLabel = day.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (c) => c.toUpperCase());

  // The 24 hours as toggles: the chosen ones filled, like every other selector
  const hourPicker = (
    <View style={styles.hourPicker} accessibilityLabel="Horas del día">
      {HOURS.map((h) => (
        <VButton key={h} size="sm" variant={hours.includes(h) ? 'filled' : 'secondary'} onPress={() => toggleHour(h)} style={styles.hourBtn}
          accessibilityLabel={`${String(h).padStart(2, '0')}:00${hours.includes(h) ? ', elegida' : ''}`}>{String(h).padStart(2, '0')}</VButton>
      ))}
    </View>
  );
  const hoursSummary = hours.length
    ? `Todos los días a las ${hours.map((h) => `${String(h).padStart(2, '0')}:00`).join(', ')}, desde ahora hasta suspender o dar el alta.`
    : 'Elige las horas en que toca.';

  const cellMark = (slot: Slot) => {
    const key = `${slot.treatment.id}:${slot.at.getTime()}`;
    const tone = { pending: colors.border, due: colors.info, late: colors.error, done: colors.success, skipped: colors.textLight }[slot.state];
    const filled = slot.state === 'done';
    const text = slot.task?.value;
    return (
      <Pressable
        key={key}
        onPress={() => pressSlot(slot)}
        onLongPress={() => openSlot(slot)}
        disabled={busy === key}
        accessibilityRole="button"
        accessibilityLabel={`${slot.treatment.name}, ${hourLabel(slot.at)}, ${STATE_LABEL[slot.state]}${text ? `, ${text}` : ''}`}
        style={({ pressed }) => [styles.mark, {
          borderColor: tone, backgroundColor: filled ? alpha(colors.success, 0.16) : slot.state === 'late' ? alpha(colors.error, 0.1) : 'transparent',
          borderWidth: slot.state === 'pending' || slot.state === 'skipped' ? 1 : 2, opacity: busy === key ? 0.5 : pressed ? 0.7 : 1,
        }]}
      >
        {text ? <Text numberOfLines={1} style={[styles.markValue, { color: colors.text }]}>{text}</Text>
          : slot.state === 'done' ? <Check size={16} color={colors.success} />
          : slot.state === 'skipped' ? <Minus size={14} color={colors.textLight} />
          : slot.state === 'late' ? <AlertTriangle size={14} color={colors.error} />
          : slot.state === 'due' ? <View style={[styles.dueDot, { backgroundColor: colors.info }]} /> : null}
      </Pressable>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page}>
      {/* Who is in the cage and what must not be missed */}
      <View style={[styles.patient, { backgroundColor: colors.surface }]}>
        <Escutcheon size={44} color={colors.primary} initial={(hosp.pet_name || '?').charAt(0).toUpperCase()} />
        <View style={styles.grow}>
          <DisplayText style={[styles.petName, { color: colors.text }]} numberOfLines={1}>{hosp.pet_name}</DisplayText>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {[speciesLabel(hosp), hosp.breed, age !== 'N/D' ? age : null, weight].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.body, { color: colors.text, marginTop: SPACING.xs }]}>{hosp.reason}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {closed ? `Alta el ${new Date(hosp.discharge_date as string).toLocaleDateString('es-CL')}` : `Día ${stayDay} de hospitalización`}
            {hosp.veterinarian ? ` · ${hosp.veterinarian}` : ''}
          </Text>
        </View>
        <VButton variant="ghost" size="sm" onPress={() => router.push(`/pet/${hosp.pet_id}` as any)} icon={<FileText size={15} color={colors.primary} />}>Ficha</VButton>
      </View>

      {alerts.length ? (
        <View style={[styles.banner, { backgroundColor: alpha(colors.error, 0.1) }]} accessibilityRole="alert">
          <AlertTriangle size={18} color={colors.error} />
          <Text style={[styles.body, { color: colors.text, flex: 1 }]}>{alerts.join(' · ')}</Text>
        </View>
      ) : null}
      {!weight && !closed ? (
        <View style={[styles.banner, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.body, { color: colors.text, flex: 1 }]}>Sin peso registrado: pésalo en una consulta antes de calcular dosis o fluidos.</Text>
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <View style={styles.dayNav}>
          <IconButton icon={<ChevronLeft size={20} color={day > firstDay ? colors.text : colors.disabled} />} label="Día anterior" disabled={day <= firstDay} onPress={() => setDay(new Date(day.getTime() - DAY_MS))} />
          <Text style={[styles.dayLabel, { color: colors.text }]}>{dayLabel}</Text>
          <IconButton icon={<ChevronRight size={20} color={colors.text} />} label="Día siguiente" onPress={() => setDay(new Date(day.getTime() + DAY_MS))} />
          {!isToday ? <VButton size="sm" variant="ghost" onPress={() => setDay(today)}>Hoy</VButton> : null}
        </View>
        {!closed ? (
          <View style={styles.actions}>
            <VButton size="sm" variant="secondary" onPress={() => { setHours(DEFAULT_HOURS); setVitalsSchedule('4'); setFormError(null); setVitalsOpen(true); }}>Agregar constantes</VButton>
            <VButton onPress={() => { resetForm(); setAdding(true); }} icon={<Plus size={16} color={onAccentText.default} />}>Agregar tratamiento</VButton>
          </View>
        ) : null}
      </View>

      {!closed && (attention.late || attention.due) ? (
        <Text style={[styles.body, { color: attention.late ? colors.error : colors.text, marginBottom: SPACING.md }]} accessibilityLiveRegion="polite">
          {[attention.late ? `${attention.late} ${attention.late === 1 ? 'atrasado' : 'atrasados'}` : null, attention.due ? `${attention.due} para esta hora` : null].filter(Boolean).join(' · ')}
        </Text>
      ) : null}

      {treatments.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surface }]}>
          <DisplayText style={[styles.emptyTitle, { color: colors.text }]}>La hoja está vacía</DisplayText>
          <Text style={[styles.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            {closed ? 'No se registraron tratamientos en esta hospitalización.' : 'Agrega la medicación, los fluidos y las constantes; cada uno aparece en las horas que le tocan.'}
          </Text>
        </View>
      ) : (
        <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Treatment names stay put while the hours scroll */}
          <View style={{ width: labelWidth }}>
            <View style={[styles.headCell, { borderColor: colors.border }]}><Text style={[styles.meta, { color: colors.textSecondary }]}>Tratamiento</Text></View>
            {treatments.map((t, i) => {
              const off = !!t.discontinued_at;
              const firstOfKind = i === 0 || treatments[i - 1].kind !== t.kind;
              return (
                <Pressable key={t.id} onPress={() => (off || closed ? undefined : discontinue(t))} disabled={off || closed} accessibilityRole="button"
                  accessibilityLabel={`${t.name}, ${frequencyLabel(t)}${off ? ', suspendido' : '. Pulsa para suspender'}`}
                  style={({ hovered }: any) => [styles.labelCell, { borderColor: colors.border, backgroundColor: hovered && !off && !closed ? colors.surfaceVariant : 'transparent' }]}>
                  {firstOfKind ? <Text style={[styles.kind, { color: colors.textSecondary }]}>{KIND_LABEL[t.kind]}</Text> : null}
                  <Text numberOfLines={1} style={[styles.rowName, { color: off ? colors.textLight : colors.text }, off && styles.struck]}>{t.name}</Text>
                  <Text numberOfLines={1} style={[styles.meta, { color: colors.textSecondary }]}>
                    {[off ? 'Suspendido' : frequencyLabel(t), t.unit, t.instructions].filter(Boolean).join(' · ')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <ScrollView ref={grid} horizontal style={styles.grow} showsHorizontalScrollIndicator>
            <View>
              <View style={styles.row}>
                {HOURS.map((h) => (
                  <View key={h} style={[styles.headCell, styles.hourCell, { borderColor: colors.border, backgroundColor: isToday && h === now.getHours() ? colors.primaryContainer : 'transparent' }]}>
                    <Text style={[styles.hour, { color: isToday && h === now.getHours() ? colors.text : colors.textSecondary }]}>{String(h).padStart(2, '0')}</Text>
                  </View>
                ))}
              </View>
              {treatments.map((t) => (
                <View key={t.id} style={styles.row}>
                  {HOURS.map((h) => (
                    <View key={h} style={[styles.cell, { borderColor: colors.border, backgroundColor: isToday && h === now.getHours() ? alpha(colors.primary, 0.05) : 'transparent' }]}>
                      {(cells.get(`${t.id}:${h}`) || []).map(cellMark)}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {treatments.length ? (
        <View style={styles.legend}>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            Borde fino: programado · Punto azul: toca ahora · Triángulo rojo: atrasado · Marca verde o valor: hecho · Guion: omitido
          </Text>
          {!closed ? <Text style={[styles.meta, { color: colors.textSecondary }]}>Un toque marca hecho; mantén pulsado para anotar u omitir. Pulsa el nombre de un tratamiento para suspenderlo.</Text> : null}
        </View>
      ) : null}

      <FormSheet visible={adding} title="Agregar tratamiento" onClose={() => setAdding(false)} onSubmit={addTreatment} submitLabel="Agregar" submitting={saving} error={formError}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tipo</Text>
        <Segmented label="Tipo" size="sm" options={KINDS} value={kind} onChange={setKind} style={styles.segment} />
        <VInput label="Nombre" value={name} onChangeText={setName} placeholder={NAME_PLACEHOLDER[kind]} autoFocus />
        {kind === 'constante' ? <VInput label="Unidad" value={unit} onChangeText={setUnit} placeholder="°C, lpm, rpm, mmHg…" containerStyle={styles.narrow} /> : null}
        <VInput label="Indicaciones" value={instructions} onChangeText={setInstructions} placeholder="Vía, dilución, cuidados al administrar" multiline />
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Frecuencia</Text>
        <Segmented label="Frecuencia" size="sm" options={FREQUENCIES} value={frequency} onChange={setFrequency} style={styles.segment} />
        {frequency === 'hours' ? hourPicker : (
          <>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Primera vez</Text>
            <Segmented label="Primera vez" size="sm" options={STARTS} value={startAt} onChange={setStartAt} style={styles.segment} />
          </>
        )}
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {frequency === 'hours' ? hoursSummary : frequency === 'once' ? `Se programa a las ${hourLabel(startDate(startAt))}.` : `Desde las ${hourLabel(startDate(startAt))}, cada ${frequency} h, hasta suspenderlo o dar el alta.`}
        </Text>
      </FormSheet>

      <FormSheet visible={vitalsOpen} title="Agregar constantes" onClose={() => setVitalsOpen(false)} onSubmit={addVitals} submitLabel="Agregar" submitting={busy === 'vitals'} error={formError}>
        <Text style={[styles.body, { color: colors.text, marginBottom: SPACING.md }]}>Temperatura, frecuencia cardíaca y frecuencia respiratoria, cada una en su fila.</Text>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Cuándo tomarlas</Text>
        <Segmented label="Cuándo tomarlas" size="sm" options={VITALS_SCHEDULES} value={vitalsSchedule} onChange={setVitalsSchedule} style={styles.segment} />
        {vitalsSchedule === 'hours' ? hourPicker : null}
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {vitalsSchedule === 'hours' ? hoursSummary : `Desde las ${hourLabel(startDate('now'))}, cada ${vitalsSchedule} h, hasta suspender o dar el alta.`}
        </Text>
      </FormSheet>

      <FormSheet visible={!!open} title={open ? `${open.treatment.name} · ${hourLabel(open.at)}` : ''} onClose={() => setOpen(null)}
        onSubmit={closed ? undefined : () => saveOpen('done')} submitLabel={open?.task?.status === 'done' ? 'Guardar' : 'Marcar hecho'} submitting={!!busy} error={slotError}>
        {open ? (
          <>
            <Text style={[styles.meta, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
              {[KIND_LABEL[open.treatment.kind], frequencyLabel(open.treatment), open.treatment.instructions].filter(Boolean).join(' · ')}
            </Text>
            {open.task ? (
              <Text style={[styles.body, { color: colors.text, marginBottom: SPACING.md }]}>
                {open.task.status === 'done' ? 'Hecho' : 'Omitido'} a las {hourLabel(new Date(open.task.done_at))}{open.task.done_by ? ` por ${open.task.done_by}` : ''}.
              </Text>
            ) : null}
            {open.treatment.kind === 'constante' ? (
              <VInput label={`Valor${open.treatment.unit ? ` (${open.treatment.unit})` : ''}`} value={value} onChangeText={setValue} editable={!closed} keyboardType="decimal-pad" autoFocus={!open.task} containerStyle={styles.narrow} />
            ) : null}
            <VInput label="Observación" value={notes} onChangeText={setNotes} editable={!closed} multiline placeholder="Cómo lo toleró, por qué se omite, cualquier novedad" />
            {!closed ? (
              <View style={styles.actions}>
                {open.task?.status !== 'skipped' ? <VButton size="sm" variant="secondary" onPress={() => saveOpen('skipped')}>Omitir este horario</VButton> : null}
                {open.task ? <VButton size="sm" variant="ghost" color={colors.error} onPress={undoOpen}>Deshacer registro</VButton> : null}
              </View>
            ) : null}
          </>
        ) : null}
      </FormSheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  page: { padding: SPACING.lg, paddingBottom: SPACING['5xl'], maxWidth: 1400, width: '100%', alignSelf: 'center' },
  grow: { flex: 1, minWidth: 0 },
  patient: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  petName: { fontSize: 28, lineHeight: 32, fontWeight: '600' },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.md, marginBottom: SPACING.md },
  dayNav: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  dayLabel: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, minWidth: 170, textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm },
  empty: { padding: SPACING['3xl'], borderRadius: RADIUS.md, alignItems: 'center', gap: SPACING.sm },
  emptyTitle: { fontSize: 24, lineHeight: 28, fontWeight: '600' },
  table: { flexDirection: 'row', borderWidth: 1, borderRadius: RADIUS.md, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  headCell: { height: 36, justifyContent: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1 },
  hourCell: { width: CELL, paddingHorizontal: 0, alignItems: 'center', borderLeftWidth: 1 },
  hour: { fontSize: TYPOGRAPHY.sizes.sm, fontVariant: ['tabular-nums'] },
  labelCell: { height: 68, justifyContent: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1 },
  kind: { fontSize: TYPOGRAPHY.sizes.xs, lineHeight: 15 },
  rowName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  struck: { textDecorationLine: 'line-through' },
  cell: { width: CELL, height: 68, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderBottomWidth: 1 },
  mark: { width: 34, height: 34, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  markValue: { fontSize: 11, fontWeight: TYPOGRAPHY.weights.semibold, fontVariant: ['tabular-nums'] },
  dueDot: { width: 10, height: 10, borderRadius: RADIUS.full },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.lg, rowGap: SPACING.xs, marginTop: SPACING.md },
  fieldLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm },
  segment: { marginBottom: SPACING.lg },
  narrow: { maxWidth: 220 },
  hourPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  hourBtn: { minWidth: 44 },
});
