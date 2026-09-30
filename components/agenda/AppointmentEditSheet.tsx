import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { api } from '../../services/directus';
import { toLocalDateKey, parseLocalDateTime } from '../../utils/date';
import FormSheet from '../ui/FormSheet';
import VInput from '../ui/Input';
import VBadge from '../ui/Badge';

export type EditMode = 'edit' | 'reschedule' | 'followup';

export interface EditableAppointment {
  id: string;
  patient_name: string;
  pet_id?: string | null;
  start_time: string;
  end_time?: string | null;
  appointment_type?: string | null;
  description?: string | null;
  veterinarian?: string | null;
  tutor_phone?: string | null;
}

const TYPES = [
  { key: 'consulta', label: 'Consulta' }, { key: 'control', label: 'Control' }, { key: 'vacuna', label: 'Vacuna' },
  { key: 'examenes', label: 'Exámenes' }, { key: 'cirugia', label: 'Cirugía' }, { key: 'hospitalizacion', label: 'Hospitalización' },
  { key: 'terreno', label: 'Terreno' },
];

const TITLES: Record<EditMode, string> = {
  edit: 'Editar cita',
  reschedule: 'Reprogramar cita',
  followup: 'Agendar control',
};

const pad = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

interface Props {
  visible: boolean;
  mode: EditMode;
  appointment: EditableAppointment | null;
  onClose: () => void;
  onSaved: () => void;
}

// One sheet for three agenda actions: edit details, move the slot, or book a follow-up control.
export default function AppointmentEditSheet({ visible, mode, appointment, onClose, onSaved }: Props) {
  const { colors } = useTheme();
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [type, setType] = useState('consulta');
  const [description, setDescription] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !appointment) return;
    const s = new Date(appointment.start_time);
    const e = appointment.end_time ? new Date(appointment.end_time) : new Date(s.getTime() + 30 * 60 * 1000);
    const base = mode === 'followup' ? new Date(s.getTime() + 7 * 24 * 60 * 60 * 1000) : s;
    const duration = e.getTime() - s.getTime();
    setDate(toLocalDateKey(base));
    setStart(hhmm(base));
    setEnd(hhmm(new Date(base.getTime() + duration)));
    setType(mode === 'followup' ? 'control' : appointment.appointment_type || 'consulta');
    setDescription(mode === 'followup' ? `Control de ${appointment.appointment_type || 'consulta'}` : appointment.description || '');
    setVeterinarian(appointment.veterinarian || '');
    setError(null);
  }, [visible, appointment, mode]);

  const handleSave = async () => {
    if (!appointment) return;
    const startDate = parseLocalDateTime(`${date} ${start}`);
    const endDate = parseLocalDateTime(`${date} ${end}`);
    if (!startDate || !endDate) { setError('Revisa la fecha (AAAA-MM-DD) y las horas (HH:MM)'); return; }
    if (endDate <= startDate) { setError('La hora de término debe ser posterior a la de inicio'); return; }
    setSaving(true);
    setError(null);
    try {
      if (mode === 'followup') {
        await api.appointments.create({
          patient_name: appointment.patient_name,
          pet_id: appointment.pet_id || undefined,
          tutor_phone: appointment.tutor_phone || null,
          follow_up_of: appointment.id,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          appointment_type: type,
          description: description.trim() || null,
          veterinarian: veterinarian.trim() || null,
        });
      } else {
        const patch: any = { start_time: startDate.toISOString(), end_time: endDate.toISOString() };
        if (mode === 'edit') {
          // Only when changed: an old appointment with a legacy type must stay editable
          if (type !== appointment.appointment_type) patch.appointment_type = type;
          patch.description = description.trim() || null;
          patch.veterinarian = veterinarian.trim() || null;
        }
        await api.appointments.update(appointment.id, patch);
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar la cita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet
      visible={visible}
      title={`${TITLES[mode]}${appointment ? ` · ${appointment.patient_name}` : ''}`}
      onClose={onClose}
      onSubmit={handleSave}
      submitLabel={mode === 'followup' ? 'Agendar control' : 'Guardar'}
      submitting={saving}
      error={error}
    >
      <View style={styles.row}>
        <View style={{ flex: 2, minWidth: 150 }}>
          <VInput label="Fecha" placeholder="AAAA-MM-DD" value={date} onChangeText={setDate} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <VInput label="Inicio" placeholder="HH:MM" value={start} onChangeText={setStart} />
        </View>
        <View style={{ flex: 1, minWidth: 90 }}>
          <VInput label="Término" placeholder="HH:MM" value={end} onChangeText={setEnd} />
        </View>
      </View>
      {mode !== 'reschedule' && (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de cita</Text>
          <View style={styles.chips}>
            {TYPES.map((t) => (
              <VBadge key={t.key} label={t.label} variant={type === t.key ? 'filled' : 'outlined'} color={type === t.key ? colors.primary : colors.textSecondary} selected={type === t.key} onPress={() => setType(t.key)} />
            ))}
          </View>
          <VInput label="Motivo / notas" value={description} onChangeText={setDescription} multiline />
          <VInput label="Veterinario" placeholder="Opcional" value={veterinarian} onChangeText={setVeterinarian} />
        </>
      )}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
});
