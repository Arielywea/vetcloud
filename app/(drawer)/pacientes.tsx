import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Plus, Search, Download, PawPrint, Users } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePets, useOwners } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import PageHeader from '../../components/ui/PageHeader';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import Segmented from '../../components/ui/Segmented';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import PetList from '../../components/pacientes/PetList';
import OwnerList from '../../components/pacientes/OwnerList';
import OwnerFormSheet from '../../components/owners/OwnerFormSheet';
import { SPACING } from '../../constants/tokens';
import { exportCsv } from '../../utils/exportCsv';
import { canonRut, digits, petMatches } from '../../utils/identity';
import { Owner } from '../../services/directus';
import { useToast } from '../../components/ui/VToast';

type View_ = 'mascotas' | 'tutores';
type SpeciesFilter = 'all' | 'dog' | 'cat' | 'other';
type LifeFilter = 'alive' | 'archived' | 'all';

const VIEWS = [{ value: 'mascotas', label: 'Mascotas' }, { value: 'tutores', label: 'Tutores' }] as const;
const SPECIES = [{ value: 'all', label: 'Todas' }, { value: 'dog', label: 'Perros' }, { value: 'cat', label: 'Gatos' }, { value: 'other', label: 'Otras' }] as const;
const LIFE = [{ value: 'alive', label: 'Activos' }, { value: 'archived', label: 'Fallecidos y otros' }, { value: 'all', label: 'Todos' }] as const;

function ownerMatches(owner: Owner, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (owner.name.toLowerCase().includes(q)) return true;
  if ((owner.pets || []).some((p) => p.name.toLowerCase().includes(q))) return true;
  if ((owner.email || '').toLowerCase().includes(q)) return true;
  const qd = digits(q);
  if (qd.length >= 5) {
    if (owner.rut && (canonRut(q) === owner.rut || digits(owner.rut).startsWith(qd))) return true;
    if (qd.length >= 6 && digits(owner.phone).endsWith(qd)) return true;
  }
  return false;
}

export default function PacientesScreen() {
  const router = useRouter();
  const toast = useToast();
  const { colors, onAccentText } = useTheme();
  const { isMobile } = useResponsive();
  const { pets, loading: petsLoading } = usePets();
  const { owners, loading: ownersLoading } = useOwners();

  const params = useLocalSearchParams<{ q?: string; vista?: string }>();
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  // Ctrl+K tutor results land here pre-filtered
  useEffect(() => { if (typeof params.q === 'string') setQuery(params.q); }, [params.q]);
  const view: View_ = params.vista === 'tutores' ? 'tutores' : 'mascotas';
  const setView = (v: View_) => router.setParams({ vista: v });

  const [species, setSpecies] = useState<SpeciesFilter>('all');
  const [life, setLife] = useState<LifeFilter>('alive');
  const [newOwner, setNewOwner] = useState(false);

  const visiblePets = useMemo(() => pets.filter((p) =>
    (species === 'all' || p.species === species) &&
    (life === 'all' || (life === 'alive' ? (p.status || 'alive') === 'alive' : (p.status || 'alive') !== 'alive')) &&
    petMatches(p, query)
  ), [pets, species, life, query]);

  const visibleOwners = useMemo(() => owners.filter((o) => ownerMatches(o, query)), [owners, query]);

  const handleExport = useCallback(async () => {
    try {
      await exportCsv(visiblePets, 'pacientes', { includeMedical: true });
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo exportar la lista');
    }
  }, [visiblePets, toast]);

  const searching = query.trim() !== '';
  const subtitle = petsLoading || ownersLoading ? ' ' : `${pets.length} mascota${pets.length === 1 ? '' : 's'} · ${owners.length} tutor${owners.length === 1 ? '' : 'es'}`;

  const emptyPets = searching || species !== 'all' || life !== 'alive' ? (
    <VEmptyState icon={<Search size={28} color={colors.textLight} />} title="Ninguna mascota coincide"
      description="Prueba con el nombre, el RUT o el teléfono del tutor, o cambia los filtros."
      action={<VButton variant="secondary" onPress={() => { setQuery(''); setSpecies('all'); setLife('alive'); }}>Limpiar búsqueda</VButton>} />
  ) : (
    <VEmptyState icon={<PawPrint size={28} color={colors.textLight} />} title="Aún no hay pacientes"
      description="Registra primero al tutor; desde su ficha agregas sus mascotas."
      action={<VButton onPress={() => setNewOwner(true)}>Nuevo tutor</VButton>} />
  );
  const emptyOwners = searching ? (
    <VEmptyState icon={<Search size={28} color={colors.textLight} />} title="Ningún tutor coincide"
      description="Busca por nombre, RUT (con o sin puntos), teléfono o el nombre de una mascota."
      action={<VButton onPress={() => setNewOwner(true)}>Registrar tutor nuevo</VButton>} />
  ) : (
    <VEmptyState icon={<Users size={28} color={colors.textLight} />} title="Aún no hay tutores"
      action={<VButton onPress={() => setNewOwner(true)}>Nuevo tutor</VButton>} />
  );

  const loading = view === 'mascotas' ? petsLoading : ownersLoading;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.top}>
        <PageHeader
          title="Pacientes"
          subtitle={subtitle}
          actions={<>
            {view === 'mascotas' && !isMobile ? <VButton variant="ghost" onPress={handleExport} icon={<Download size={16} color={colors.primary} />}>Exportar</VButton> : null}
            <VButton onPress={() => setNewOwner(true)} icon={<Plus size={16} color={onAccentText.default} />}>Nuevo tutor</VButton>
          </>}
        />
        <View style={styles.toolbar}>
          <VInput
            containerStyle={styles.search}
            value={query}
            onChangeText={setQuery}
            placeholder={isMobile ? 'Mascota, tutor, RUT o teléfono' : 'Buscar por mascota, tutor, RUT, teléfono o microchip'}
            accessibilityLabel="Buscar pacientes y tutores"
            leftIcon={<Search size={18} color={colors.textLight} />}
            autoCorrect={false}
            returnKeyType="search"
          />
          <Segmented label="Ver" options={VIEWS} value={view} onChange={setView} />
        </View>
        {view === 'mascotas' ? (
          <View style={styles.filters}>
            <Segmented label="Especie" size="sm" options={SPECIES} value={species} onChange={setSpecies} />
            <Segmented label="Estado" size="sm" options={LIFE} value={life} onChange={setLife} />
          </View>
        ) : null}
      </View>

      <View style={[styles.list, !isMobile && { backgroundColor: colors.surface }]}>
        {loading ? <SkeletonList count={6} style={{ padding: SPACING.lg }} /> : view === 'mascotas'
          ? <PetList pets={visiblePets} compact={isMobile} empty={emptyPets} />
          : <OwnerList owners={visibleOwners} compact={isMobile} empty={emptyOwners} />}
      </View>

      <OwnerFormSheet
        visible={newOwner}
        onClose={() => setNewOwner(false)}
        initialName={view === 'tutores' && searching && !digits(query) ? query.trim() : undefined}
        onSaved={(o) => { setNewOwner(false); toast.success('Tutor registrado'); router.push(`/owner/${o.id}` as any); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: SPACING.md, rowGap: SPACING.sm, marginBottom: SPACING.md },
  search: { flexGrow: 1, flexBasis: 280, marginBottom: 0 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.xl, rowGap: SPACING.sm, marginBottom: SPACING.md },
  list: { flex: 1, marginHorizontal: SPACING.lg },
});
