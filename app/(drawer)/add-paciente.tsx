import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, Stethoscope, CalendarPlus, Copy, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { api, DirectusPet, Owner, PetSpecies } from '../../services/directus';
import { uploadPetPhoto } from '../../services/cloudinary';
import PageHeader from '../../components/ui/PageHeader';
import DisplayText from '../../components/ui/DisplayText';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import Segmented from '../../components/ui/Segmented';
import Escutcheon from '../../components/icons/Escutcheon';
import OwnerPicker from '../../components/owners/OwnerPicker';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/VToast';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { DOG_BREEDS, CAT_BREEDS, filterBreeds } from '../../constants/breeds';
import { parseNumberInRange } from '../../utils/parseNumber';
import { birthDateFromAge, formatDmy, parseDmy } from '../../utils/date';
import { formatRut } from '../../utils/identity';

const SPECIES_OPTIONS = [{ value: 'dog', label: 'Perro' }, { value: 'cat', label: 'Gato' }, { value: 'other', label: 'Otra' }] as const;
const SEX_OPTIONS = [{ value: 'macho', label: 'Macho' }, { value: 'hembra', label: 'Hembra' }] as const;
const REPRO_BY_SEX = {
  macho: [{ value: 'intacto', label: 'Entero' }, { value: 'castrado', label: 'Castrado' }],
  hembra: [{ value: 'intacto', label: 'Entera' }, { value: 'esterilizado', label: 'Esterilizada' }, { value: 'gestante', label: 'Gestante' }],
} as const;
const BIRTH_MODES = [{ value: 'date', label: 'Fecha de nacimiento' }, { value: 'age', label: 'Edad aproximada' }] as const;
type Species = PetSpecies;
type Sex = 'macho' | 'hembra';

export default function AddPacienteScreen() {
  const router = useRouter();
  const toast = useToast();
  const { colors, onAccentText, onPrimaryText } = useTheme();
  const { isMobile } = useResponsive();
  const params = useLocalSearchParams<{ id?: string; owner_id?: string; prefillName?: string }>();
  const editId = typeof params.id === 'string' && params.id ? params.id : null;
  const isEdit = !!editId;

  const [loading, setLoading] = useState(isEdit || !!params.owner_id);
  const [owner, setOwner] = useState<Pick<Owner, 'id' | 'name' | 'rut'> | null>(null);
  const [changingOwner, setChangingOwner] = useState(false);

  // Identity
  const [name, setName] = useState(typeof params.prefillName === 'string' ? params.prefillName : '');
  const [species, setSpecies] = useState<Species>('dog');
  const [speciesOther, setSpeciesOther] = useState('');
  const [breed, setBreed] = useState('');
  const [breedFocused, setBreedFocused] = useState(false);
  const [sex, setSex] = useState<Sex | null>(null);
  const [repro, setRepro] = useState<string | null>(null);
  const [birthMode, setBirthMode] = useState<'date' | 'age'>('date');
  const [birthDate, setBirthDate] = useState('');
  const [ageYears, setAgeYears] = useState('');
  const [ageMonths, setAgeMonths] = useState('');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [registry, setRegistry] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<DirectusPet | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (editId) {
          const p: any = await api.pets.get(editId);
          if (cancelled || !p) return;
          const str = (v: any) => (v === null || v === undefined ? '' : String(v));
          setName(str(p.name));
          setSpecies(p.species === 'cat' ? 'cat' : p.species === 'other' ? 'other' : 'dog');
          setSpeciesOther(str(p.species_other));
          setBreed(str(p.breed)); setSex(p.sex || null); setRepro(p.reproductive_status || null);
          setBirthDate(formatDmy(p.birth_date));
          setColor(str(p.color));
          setMicrochip(str(p.id_number)); setRegistry(str(p.registry_number));
          setPhoto(p.photo || null); setOriginalPhoto(p.photo || null);
          if (p.owner_id) setOwner({ id: p.owner_id, name: p.owner_name || p.tutor_name || 'Tutor', rut: p.owner_rut || null });
        } else if (typeof params.owner_id === 'string' && params.owner_id) {
          const o = await api.owners.get(params.owner_id);
          if (!cancelled) setOwner(o);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'No se pudieron cargar los datos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [editId, params.owner_id]);

  const breedSuggestions = useMemo(() => {
    if (species === 'other' || !breedFocused) return [];
    const list = filterBreeds(species === 'dog' ? DOG_BREEDS : CAT_BREEDS, breed);
    return (breed.trim() ? list : list.slice(0, 8)).filter((b) => b !== breed);
  }, [species, breed, breedFocused]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { setError('Se necesita acceso a las fotos para agregar una imagen del paciente.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0].uri);
  };

  const save = async () => {
    if (!owner) { setError('Elige el tutor de la mascota'); return; }
    if (!name.trim()) { setError('El nombre de la mascota es obligatorio'); return; }
    if (species === 'other' && !speciesOther.trim()) { setError('Indica la especie (por ejemplo, conejo, hurón o ave)'); return; }

    let birth: string | null = null;
    let estimated = false;
    if (birthMode === 'date') {
      const parsed = parseDmy(birthDate);
      if (parsed === undefined) { setError('La fecha de nacimiento debe ser DD/MM/AAAA y no puede ser futura'); return; }
      birth = parsed;
    } else if (ageYears.trim() || ageMonths.trim()) {
      const y = parseInt(ageYears || '0', 10);
      const m = parseInt(ageMonths || '0', 10);
      if (!Number.isFinite(y) || !Number.isFinite(m) || y < 0 || y > 40 || m < 0 || m > 11) { setError('Edad aproximada inválida: años de 0 a 40 y meses de 0 a 11'); return; }
      birth = birthDateFromAge(y, m);
      estimated = true;
    }
    const kg = parseNumberInRange(weight, 0.05, 150);
    if (kg !== null && Number.isNaN(kg)) { setError('El peso debe estar entre 0,05 y 150 kg (ej. 12,5)'); return; }
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | null = photo && /^https?:\/\//.test(photo) ? photo : null;
      if (photo && !photoUrl) {
        try { photoUrl = await uploadPetPhoto(photo); }
        catch {
          photoUrl = isEdit ? originalPhoto : null;
          toast.error(isEdit ? 'No se pudo subir la foto nueva; se mantuvo la anterior.' : 'No se pudo subir la foto; la mascota se guardó sin ella.');
        }
      }
      const payload: Record<string, unknown> = {
        owner_id: owner.id,
        name: name.trim(),
        species,
        species_other: species === 'other' ? speciesOther.trim() : null,
        breed: breed.trim() || null,
        sex,
        reproductive_status: repro,
        color: color.trim() || null,
        id_number: microchip.trim() || null,
        registry_number: registry.trim() || null,
        photo: photoUrl,
      };
      // Editing never rewrites a birth date nobody touched into an "estimate"
      if (birthMode === 'age' ? estimated : true) { payload.birth_date = birth; payload.birth_date_estimated = estimated; }
      if (!isEdit && kg !== null) payload.weight = kg;

      if (isEdit) {
        await api.pets.update(editId!, payload);
        toast.success('Datos actualizados');
        router.replace(`/pet/${editId}` as any);
        return;
      }
      const created: DirectusPet = await api.pets.create(payload);
      setSaved(created);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar la mascota');
    } finally {
      setSaving(false);
    }
  };

  // Same litter: keep tutor, species, breed and birth date; clear what is individual
  const anotherFromLitter = () => {
    setSaved(null);
    setName(''); setSex(null); setRepro(null); setColor(''); setWeight(''); setMicrochip(''); setRegistry('');
    setPhoto(null); setOriginalPhoto(null); setError(null);
  };
  const reset = () => {
    anotherFromLitter();
    setSpecies('dog'); setSpeciesOther(''); setBreed(''); setBirthDate(''); setAgeYears(''); setAgeMonths('');
  };

  if (loading) return <View style={[styles.flex, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg }} /></View>;

  if (saved) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page}>
        <View style={[styles.done, { backgroundColor: colors.surface }]}>
          <Escutcheon size={56} color={colors.primary} initial={saved.name.charAt(0).toUpperCase()} />
          <DisplayText style={[styles.doneTitle, { color: colors.text }]}>{saved.name} quedó registrado</DisplayText>
          <Text style={[styles.body, { color: colors.textSecondary, textAlign: 'center' }]}>Tutor: {owner?.name}. ¿Qué sigue?</Text>
          <View style={styles.doneActions}>
            <VButton size="lg" onPress={() => router.replace(`/consulta/${saved.id}` as any)} icon={<Stethoscope size={18} color={onAccentText.default} />}>Iniciar primera consulta</VButton>
            <VButton size="lg" variant="secondary" onPress={() => router.replace({ pathname: '/(drawer)/agenda', params: { nueva: '1', pet_id: saved.id } } as any)} icon={<CalendarPlus size={18} color={colors.primary} />}>Agendar una cita</VButton>
            <VButton size="lg" variant="secondary" onPress={() => router.replace(`/pet/${saved.id}` as any)} icon={<FileText size={18} color={colors.primary} />}>Solo ver la ficha</VButton>
          </View>
          <View style={styles.doneMore}>
            <VButton variant="ghost" onPress={anotherFromLitter} icon={<Copy size={16} color={colors.primary} />}>Agregar otro de la misma camada</VButton>
            <VButton variant="ghost" onPress={reset}>{`Agregar otra mascota de ${(owner?.name || '').split(' ')[0]}`}</VButton>
          </View>
        </View>
      </ScrollView>
    );
  }

  const repros = sex ? REPRO_BY_SEX[sex] : null;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <PageHeader title={isEdit ? `Editar a ${name || 'la mascota'}` : 'Nueva mascota'} subtitle={isEdit ? 'Identidad de la mascota. Los antecedentes se actualizan en la consulta.' : 'Solo la identidad: los antecedentes se preguntan en la anamnesis remota de la primera consulta.'} />

      {/* Tutor */}
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        {owner && !changingOwner ? (
          <View style={styles.ownerRow}>
            <Escutcheon size={36} color={colors.primary} initial={owner.name.charAt(0).toUpperCase()} />
            <View style={styles.grow}>
              <Text style={[styles.small, { color: colors.textSecondary }]}>Tutor</Text>
              <Text style={[styles.ownerName, { color: colors.text }]} numberOfLines={1}>{owner.name}</Text>
              {owner.rut ? <Text style={[styles.small, { color: colors.textSecondary }]}>RUT {formatRut(owner.rut)}</Text> : null}
            </View>
            <VButton variant="ghost" size="sm" onPress={() => setChangingOwner(true)}>Cambiar</VButton>
          </View>
        ) : (
          <View>
            <OwnerPicker autoFocus={!owner} onPick={(o) => { setOwner(o); setChangingOwner(false); setError(null); }} />
            {changingOwner ? <VButton variant="ghost" size="sm" onPress={() => setChangingOwner(false)} style={{ alignSelf: 'flex-start', marginTop: SPACING.sm }}>{`Mantener a ${owner?.name || ""}`}</VButton> : null}
          </View>
        )}
      </View>

      {/* Identity */}
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <DisplayText style={[styles.panelTitle, { color: colors.text }]}>Identidad</DisplayText>
        <View style={[styles.identity, isMobile && styles.identityMobile]}>
          <Pressable onPress={pickImage} accessibilityRole="button" accessibilityLabel={photo ? 'Cambiar foto' : 'Agregar foto'}
            style={[styles.photo, { backgroundColor: colors.surfaceVariant }]}>
            {photo ? <Image source={{ uri: photo }} style={styles.photoImg} /> : (
              <>
                <Camera size={22} color={colors.textSecondary} />
                <Text style={[styles.small, { color: colors.textSecondary }]}>Foto</Text>
              </>
            )}
          </Pressable>
          <View style={styles.grow}>
            <VInput label="Nombre" value={name} onChangeText={setName} placeholder="Nombre de la mascota" autoCapitalize="words" autoFocus={!!owner && !isEdit} />
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Especie</Text>
            <Segmented label="Especie" options={SPECIES_OPTIONS} value={species} onChange={(v) => { setSpecies(v); setBreed(''); }} style={styles.segment} />
            {species === 'other' ? (
              <VInput label="¿Qué especie?" value={speciesOther} onChangeText={setSpeciesOther} placeholder="Conejo, hurón, ave, reptil…" autoCapitalize="sentences" />
            ) : null}
          </View>
        </View>

        <View style={[styles.pair, styles.breedRow]}>
          <View style={styles.half}>
            <VInput label={species === 'other' ? 'Raza o variedad' : 'Raza'} value={breed} onChangeText={setBreed}
              onFocus={() => setBreedFocused(true)} onBlur={() => setTimeout(() => setBreedFocused(false), 150)}
              placeholder={species === 'cat' ? 'Doméstico de pelo corto…' : species === 'dog' ? 'Mestizo, Poodle…' : 'Opcional'} />
            {breedSuggestions.length ? (
              <View style={[styles.suggestions, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {breedSuggestions.map((b) => (
                  <Pressable key={b} onPress={() => { setBreed(b); setBreedFocused(false); }} accessibilityRole="button"
                    style={({ pressed, hovered }: any) => [styles.suggestion, { backgroundColor: pressed || hovered ? colors.surfaceVariant : 'transparent' }]}>
                    <Text style={[styles.body, { color: colors.text }]}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <VInput containerStyle={styles.half} label="Color o pelaje" value={color} onChangeText={setColor} placeholder="Negro con blanco, atigrado…" />
        </View>

        <View style={styles.pair}>
          <View style={styles.half}>
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Sexo</Text>
            <Segmented label="Sexo" options={SEX_OPTIONS} value={sex} onChange={(v) => { setSex(v); setRepro(null); }} style={styles.segment} />
          </View>
          <View style={styles.half}>
            <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Estado reproductivo</Text>
            {repros ? <Segmented label="Estado reproductivo" options={repros} value={repro} onChange={setRepro} style={styles.segment} />
              : <Text style={[styles.body, styles.segment, { color: colors.textLight }]}>Elige primero el sexo</Text>}
          </View>
        </View>

        <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Nacimiento</Text>
        <Segmented label="Nacimiento" size="sm" options={BIRTH_MODES} value={birthMode} onChange={setBirthMode} style={styles.segment} />
        {birthMode === 'date' ? (
          <VInput value={birthDate} onChangeText={setBirthDate} placeholder="DD/MM/AAAA" accessibilityLabel="Fecha de nacimiento" keyboardType="numbers-and-punctuation" containerStyle={styles.narrow} />
        ) : (
          <View style={styles.pair}>
            <VInput containerStyle={styles.narrowHalf} value={ageYears} onChangeText={setAgeYears} placeholder="Años" accessibilityLabel="Edad aproximada en años" keyboardType="number-pad" hint="Años" />
            <VInput containerStyle={styles.narrowHalf} value={ageMonths} onChangeText={setAgeMonths} placeholder="Meses" accessibilityLabel="Meses además de los años" keyboardType="number-pad" hint="Meses" />
          </View>
        )}

        <View style={styles.pair}>
          {!isEdit ? <VInput containerStyle={styles.third} label="Peso (kg)" value={weight} onChangeText={setWeight} placeholder="12,5" keyboardType="decimal-pad" hint="Opcional; en cada consulta se actualiza" /> : null}
          <VInput containerStyle={styles.third} label="Microchip" value={microchip} onChangeText={setMicrochip} placeholder="15 dígitos" keyboardType="number-pad" />
          <VInput containerStyle={styles.third} label="N.º de Registro Nacional" value={registry} onChangeText={setRegistry} placeholder="Ley 21.020" />
        </View>
      </View>

      {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
      <View style={styles.footer}>
        <VButton variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(drawer)/pacientes' as any))}>Cancelar</VButton>
        <VButton size="lg" onPress={save} loading={saving} disabled={saving}>{isEdit ? 'Guardar cambios' : 'Registrar mascota'}</VButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING['6xl'], maxWidth: 880, width: '100%', alignSelf: 'center' },
  panel: { padding: SPACING.xl, borderRadius: RADIUS.md, marginBottom: SPACING.lg },
  panelTitle: { fontSize: 24, lineHeight: 28, fontWeight: '600', marginBottom: SPACING.lg },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  ownerName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  grow: { flex: 1, minWidth: 0 },
  identity: { flexDirection: 'row', gap: SPACING.xl, alignItems: 'flex-start' },
  identityMobile: { flexDirection: 'column', gap: SPACING.md },
  photo: { width: 112, height: 112, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, overflow: 'hidden' },
  photoImg: { width: '100%', height: '100%' },
  pair: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.md },
  half: { flexGrow: 1, flexBasis: 240 },
  // Above the rows below it, which its suggestion list overlaps (RN Web gives every View z-index 0,
  // so the row itself has to be raised, not the field inside it)
  breedRow: { zIndex: 20 },
  third: { flexGrow: 1, flexBasis: 180 },
  narrow: { maxWidth: 220 },
  narrowHalf: { width: 120 },
  groupLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm },
  segment: { marginBottom: SPACING.lg },
  suggestions: { position: 'absolute', top: 78, left: 0, right: 0, borderWidth: 1, borderRadius: RADIUS.md, paddingVertical: SPACING.xs, zIndex: 10, elevation: 6 },
  suggestion: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, minHeight: 40, justifyContent: 'center' },
  small: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 19 },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21 },
  error: { fontSize: TYPOGRAPHY.sizes.md, marginBottom: SPACING.md },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: SPACING.sm },
  done: { padding: SPACING['3xl'], borderRadius: RADIUS.md, alignItems: 'center', gap: SPACING.md, marginTop: SPACING['2xl'] },
  doneTitle: { fontSize: 32, lineHeight: 36, fontWeight: '600', textAlign: 'center' },
  doneActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  doneMore: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.sm },
});
