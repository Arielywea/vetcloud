import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import FormSheet from '../ui/FormSheet';
import VInput from '../ui/Input';
import Segmented from '../ui/Segmented';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { api, DirectusPet, PetStatus } from '../../services/directus';
import { formatDmy, parseDmy, toLocalDateKey } from '../../utils/date';

interface LifeStatusSheetProps {
  visible: boolean;
  pet: DirectusPet;
  onClose: () => void;
  onSaved: (pet: DirectusPet) => void;
}

const OPTIONS = [
  { value: 'alive', label: 'Activo' }, { value: 'deceased', label: 'Fallecido' },
  { value: 'transferred', label: 'Trasladado' }, { value: 'inactive', label: 'Inactivo' },
] as const;

const EFFECT: Record<PetStatus, string> = {
  alive: 'Vuelve a recibir recordatorios si el tutor tiene el contacto vigente.',
  deceased: 'Se cancelan los recordatorios pendientes y no se enviarán más avisos. La ficha se conserva.',
  transferred: 'Se atiende en otra clínica: se cancelan los recordatorios pendientes. La ficha se conserva.',
  inactive: 'Sin seguimiento por ahora: se cancelan los recordatorios pendientes. La ficha se conserva.',
};

export default function LifeStatusSheet({ visible, pet, onClose, onSaved }: LifeStatusSheetProps) {
  const { colors } = useTheme();
  const [status, setStatus] = useState<PetStatus>('alive');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStatus(pet.status || 'alive');
    setDate(formatDmy(pet.deceased_at || toLocalDateKey(new Date())));
    setError(null);
  }, [visible, pet]);

  const submit = async () => {
    const body: Record<string, unknown> = { status };
    if (status === 'deceased') {
      const d = parseDmy(date);
      if (!d) { setError('Fecha de fallecimiento inválida (DD/MM/AAAA, no futura)'); return; }
      body.deceased_at = `${d}T12:00:00-03:00`;
    }
    setSaving(true);
    setError(null);
    try {
      onSaved(await api.pets.update(pet.id, body));
    } catch (e: any) {
      setError(e?.message || 'No se pudo cambiar el estado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet visible={visible} title={`Estado de ${pet.name}`} onClose={onClose} onSubmit={submit} submitLabel="Guardar estado" submitting={saving} error={error}>
      <Segmented label="Estado" options={OPTIONS} value={status} onChange={setStatus} style={styles.segment} />
      {status === 'deceased' ? <VInput label="Fecha de fallecimiento" value={date} onChangeText={setDate} placeholder="DD/MM/AAAA" containerStyle={{ maxWidth: 220 }} /> : null}
      <Text style={[styles.effect, { color: colors.textSecondary }]}>{EFFECT[status]}</Text>
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  segment: { marginBottom: SPACING.lg },
  effect: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21 },
});
