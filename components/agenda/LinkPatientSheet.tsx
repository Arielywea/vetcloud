import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Search } from 'lucide-react-native';
import FormSheet from '../ui/FormSheet';
import VInput from '../ui/Input';
import VButton from '../ui/Button';
import Segmented from '../ui/Segmented';
import Escutcheon from '../icons/Escutcheon';
import OwnerPicker from '../owners/OwnerPicker';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../hooks/useDirectus';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { api, Owner, PetSpecies } from '../../services/directus';
import { formatRut, petMatches, speciesLabel } from '../../utils/identity';

interface LinkPatientSheetProps {
  visible: boolean;
  /** Name typed when the appointment was booked by phone */
  patientName?: string | null;
  /** The status the appointment moves to once linked ("en espera"), or null to only link it */
  nextStatusLabel?: string | null;
  onClose: () => void;
  /** The pet chosen or just registered; the caller links it to the appointment */
  onLinked: (petId: string) => Promise<void> | void;
}

const SPECIES = [{ value: 'dog', label: 'Perro' }, { value: 'cat', label: 'Gato' }, { value: 'other', label: 'Otra' }] as const;

// Check-in for an appointment booked without a chart: pick the patient if it exists, otherwise a
// quick registration (tutor by RUT, pet name and species). The rest is filled in later.
export default function LinkPatientSheet({ visible, patientName, nextStatusLabel, onClose, onLinked }: LinkPatientSheetProps) {
  const { colors } = useTheme();
  const { pets } = usePets();
  const [mode, setMode] = useState<'find' | 'new'>('find');
  const [query, setQuery] = useState('');
  const [owner, setOwner] = useState<Owner | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [speciesOther, setSpeciesOther] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setMode('find'); setQuery(patientName || ''); setOwner(null); setName(patientName || '');
    setSpecies('dog'); setSpeciesOther(''); setError(null);
  }, [visible, patientName]);

  const matches = useMemo(() => (query.trim() ? pets.filter((p) => (p.status || 'alive') === 'alive' && petMatches(p, query)).slice(0, 6) : []), [pets, query]);

  const link = async (petId: string) => {
    setSaving(true);
    setError(null);
    try { await onLinked(petId); }
    catch (e: any) { setError(e?.message || 'No se pudo vincular la cita'); }
    finally { setSaving(false); }
  };

  const register = async () => {
    if (!owner) { setError('Elige o registra al tutor'); return; }
    if (!name.trim()) { setError('Escribe el nombre de la mascota'); return; }
    if (species === 'other' && !speciesOther.trim()) { setError('Indica la especie'); return; }
    setSaving(true);
    setError(null);
    try {
      const pet = await api.pets.create({ owner_id: owner.id, name: name.trim(), species, species_other: species === 'other' ? speciesOther.trim() : null });
      await onLinked(pet.id);
    } catch (e: any) {
      setError(e?.message || 'No se pudo registrar la mascota');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet
      visible={visible}
      title="Vincular la cita a un paciente"
      onClose={onClose}
      onSubmit={mode === 'new' ? register : undefined}
      submitLabel={nextStatusLabel ? `Registrar y pasar a ${nextStatusLabel}` : 'Registrar y vincular'}
      submitting={saving}
      error={error}
    >
      <Text style={[styles.lead, { color: colors.textSecondary }]}>
        {nextStatusLabel ? `Para pasar a «${nextStatusLabel}», la cita necesita la ficha del paciente. ` : ''}Busca su ficha o regístralo con lo mínimo; el resto se completa después.
      </Text>
      <Segmented label="Paciente" options={[{ value: 'find', label: 'Ya tiene ficha' }, { value: 'new', label: 'Paciente nuevo' }]} value={mode} onChange={setMode} style={styles.segment} />

      {mode === 'find' ? (
        <View>
          <VInput value={query} onChangeText={setQuery} placeholder="Mascota, tutor, RUT o teléfono" accessibilityLabel="Buscar paciente"
            leftIcon={<Search size={18} color={colors.textLight} />} autoFocus autoCorrect={false} containerStyle={{ marginBottom: SPACING.sm }} />
          {matches.map((p) => (
            <Pressable key={p.id} onPress={() => link(p.id)} disabled={saving} accessibilityRole="button" accessibilityLabel={`Vincular a ${p.name}`}
              style={({ pressed, hovered }: any) => [styles.option, { backgroundColor: pressed || hovered ? colors.surfaceVariant : 'transparent' }]}>
              <Escutcheon size={30} color={colors.primary} initial={p.name.charAt(0).toUpperCase()} />
              <View style={styles.grow}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                  {[speciesLabel(p), p.breed, p.owner_name || p.tutor_name, p.owner_rut ? formatRut(p.owner_rut) : null].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </Pressable>
          ))}
          {query.trim() && !matches.length ? (
            <View style={styles.none}>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>No hay una ficha que coincida.</Text>
              <VButton size="sm" variant="filled" onPress={() => setMode('new')}>Registrar paciente nuevo</VButton>
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          {owner ? (
            <View style={[styles.ownerRow, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.name, { color: colors.text, flex: 1 }]} numberOfLines={1}>Tutor: {owner.name}{owner.rut ? ` · ${formatRut(owner.rut)}` : ''}</Text>
              <VButton variant="ghost" size="sm" onPress={() => setOwner(null)}>Cambiar</VButton>
            </View>
          ) : <OwnerPicker onPick={setOwner} autoFocus />}
          <View style={{ height: SPACING.lg }} />
          <VInput label="Nombre de la mascota" value={name} onChangeText={setName} autoCapitalize="words" />
          <Text style={[styles.meta, { color: colors.textSecondary, marginBottom: SPACING.sm }]}>Especie</Text>
          <Segmented label="Especie" options={SPECIES} value={species} onChange={setSpecies} style={styles.segment} />
          {species === 'other' ? <VInput label="¿Qué especie?" value={speciesOther} onChangeText={setSpeciesOther} placeholder="Conejo, hurón, ave…" /> : null}
        </View>
      )}
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  lead: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21, marginBottom: SPACING.lg },
  segment: { marginBottom: SPACING.lg },
  option: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, minHeight: 48 },
  grow: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  meta: { fontSize: TYPOGRAPHY.sizes.sm },
  none: { gap: SPACING.sm, alignItems: 'flex-start', paddingVertical: SPACING.sm },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingLeft: SPACING.md, borderRadius: RADIUS.md },
});
