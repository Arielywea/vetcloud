import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, SectionList, LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Search, Plus, BriefcaseMedical, SlidersHorizontal, X } from 'lucide-react-native';
import { useDiseases, useFavorites } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import DisplayText from '../../components/ui/DisplayText';
import PageHeader from '../../components/ui/PageHeader';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import Segmented from '../../components/ui/Segmented';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import DiseaseRow from '../../components/diseases/DiseaseRow';
import DiseasePreview from '../../components/diseases/DiseasePreview';
import { categoryLabel, normalizeSearch, signTitle } from '../../constants/diseaseMeta';
import { DirectusDisease } from '../../services/directus';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

const SEVERITY_ORDER = ['critical', 'severe', 'moderate', 'mild'];
const TIERS = ['muy_frecuente', 'frecuente', 'ocasional', 'rara'] as const;
const TIER_TITLES: Record<string, { title: string; hint: string }> = {
  muy_frecuente: { title: 'Muy frecuentes en Chile', hint: 'todas las semanas en atención primaria' },
  frecuente: { title: 'Frecuentes', hint: 'varias veces al mes' },
  ocasional: { title: 'Ocasionales', hint: 'algunas veces al mes o menos' },
  rara: { title: 'Raras', hint: 'pocas veces al año o en zonas concretas' },
  none: { title: 'Sin clasificar', hint: 'fichas propias de la clínica' },
};
const SPECIES = [{ value: 'all', label: 'Todas' }, { value: 'dog', label: 'Perros' }, { value: 'cat', label: 'Gatos' }] as const;
const SORTS = [{ value: 'frequency', label: 'Frecuencia en Chile' }, { value: 'az', label: 'A–Z' }, { value: 'severity', label: 'Gravedad' }] as const;
type Sort = (typeof SORTS)[number]['value'];
const WIDE = 1100;

// Recently opened sheets: a per-device convenience, so browser storage is enough
const RECENT_KEY = 'vetcloud:recent-diseases';
function readRecent(): string[] {
  try { return JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function pushRecent(id: string) {
  try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify([id, ...readRecent().filter((x) => x !== id)].slice(0, 8))); } catch { /* storage blocked */ }
}

// Everything a vet might type: Spanish or English name, Latin agent, category, signs
function searchText(d: DirectusDisease): string {
  return normalizeSearch([d.name, d.english_name, d.scientific_name, categoryLabel(d.category), ...(d.key_signs || []).map(signTitle)].filter(Boolean).join(' '));
}
// Every sheet has an emergency section, so urgency comes from severity alone
const isUrgent = (d: DirectusDisease) => d.severity === 'critical' || d.severity === 'severe';
const isYoung = (d: DirectusDisease) => d.life_stage === 'puppy' || d.life_stage === 'kitten';

export default function DiseasesScreen() {
  const router = useRouter();
  const { colors, onAccentText, onPrimaryText } = useTheme();
  const { diseases, loading } = useDiseases();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [species, setSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [urgent, setUrgent] = useState(false);
  const [zoonotic, setZoonotic] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [young, setYoung] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [sort, setSort] = useState<Sort>('frequency');
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { setRecent(readRecent()); }, []);

  const wide = width >= WIDE;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const indexed = useMemo(() => diseases.map((d) => ({ d, text: searchText(d) })), [diseases]);
  const bySpecies = useMemo(() => (species === 'all' ? indexed : indexed.filter(({ d }) => d.species === species || d.species === 'both')), [indexed, species]);
  const categoryCounts = useMemo(() => {
    const m = new Map<string, number>();
    bySpecies.forEach(({ d }) => m.set(d.category, (m.get(d.category) || 0) + 1));
    return [...m.entries()].sort((a, b) => categoryLabel(a[0]).localeCompare(categoryLabel(b[0]), 'es'));
  }, [bySpecies]);

  const filtered = useMemo(() => {
    const terms = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
    let rows = bySpecies.filter(({ d, text }) =>
      (!urgent || isUrgent(d)) && (!zoonotic || d.is_zoonotic) && (!favoritesOnly || isFavorite(d.id)) && (!young || isYoung(d)) &&
      (!categories.length || categories.includes(d.category)) && terms.every((t) => text.includes(t))).map((r) => r.d);
    if (sort === 'az') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    else if (sort === 'severity') rows = [...rows].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) || (a.chile_rank ?? 9999) - (b.chile_rank ?? 9999));
    return rows;
  }, [bySpecies, query, urgent, zoonotic, favoritesOnly, young, categories, sort, isFavorite]);

  // Grouped by how common it is in Chile; until the catalog is classified, one plain list
  const sections = useMemo(() => {
    const classified = filtered.some((d) => d.chile_frequency);
    if (sort !== 'frequency' || !classified) return [{ key: 'all', title: '', hint: '', data: filtered }];
    return [...TIERS, 'none' as const]
      .map((t) => ({ key: t, ...TIER_TITLES[t], data: filtered.filter((d) => (d.chile_frequency || 'none') === t) }))
      .filter((s) => s.data.length);
  }, [filtered, sort]);

  const selected = useMemo(() => filtered.find((d) => d.id === selectedId) || (wide ? filtered[0] || null : null), [filtered, selectedId, wide]);
  const recentDiseases = useMemo(() => recent.map((id) => diseases.find((d) => d.id === id)).filter(Boolean) as DirectusDisease[], [recent, diseases]);

  const open = useCallback((d: DirectusDisease) => {
    pushRecent(d.id);
    setRecent(readRecent());
    router.push(`/disease/${d.id}` as any);
  }, [router]);
  // Desktop: a click previews, the button opens; phone: a tap opens
  const onRow = useCallback((d: DirectusDisease) => (wide ? setSelectedId(d.id) : open(d)), [wide, open]);

  const filtering = !!query.trim() || urgent || zoonotic || favoritesOnly || young || categories.length > 0 || species !== 'all';
  const clearAll = () => { setQuery(''); setUrgent(false); setZoonotic(false); setFavoritesOnly(false); setYoung(false); setCategories([]); setSpecies('all'); };
  const toggleCategory = (k: string) => setCategories((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));
  // Called as a function (not <Toggle />) so the buttons are not remounted on every render
  const toggle = (on: boolean, set: (v: boolean) => void, label: string) => (
    <VButton key={label} size="sm" variant={on ? 'filled' : 'secondary'} onPress={() => set(!on)} accessibilityLabel={`${label}${on ? ', activo' : ''}`}>{label}</VButton>
  );

  const top = (
    <View style={styles.top}>
      <PageHeader
        title="Enfermedades"
        subtitle={loading ? ' ' : `${diseases.length} fichas de referencia para perros y gatos, ordenadas por lo habitual que son en Chile`}
        actions={<VButton onPress={() => router.push('/(drawer)/add-disease')} icon={<Plus size={16} color={onAccentText.default} />}>Nueva enfermedad</VButton>}
      />
      <VInput
        value={query}
        onChangeText={setQuery}
        placeholder="Nombre, signo, agente o nombre en inglés"
        accessibilityLabel="Buscar enfermedades"
        leftIcon={<Search size={18} color={colors.textLight} />}
        autoCorrect={false}
        containerStyle={{ marginBottom: SPACING.md }}
      />
      <View style={styles.toolbar}>
        <Segmented label="Especie" options={SPECIES} value={species} onChange={setSpecies} size="sm" />
        <View style={styles.toggles}>
          {toggle(urgent, setUrgent, 'Urgencias')}
          {toggle(zoonotic, setZoonotic, 'Zoonóticas')}
          {toggle(favoritesOnly, setFavoritesOnly, 'Favoritas')}
          {toggle(young, setYoung, 'Cachorros y gatitos')}
          <VButton size="sm" variant={categories.length ? 'filled' : 'ghost'} onPress={() => setShowCategories(!showCategories)}
            icon={<SlidersHorizontal size={14} color={categories.length ? onPrimaryText.default : colors.primary} />}>
            {categories.length ? `Sistema (${categories.length})` : 'Sistema'}
          </VButton>
        </View>
      </View>
      {showCategories ? (
        <View style={styles.categories}>
          {categoryCounts.map(([k, n]) => (
            <VButton key={k} size="sm" variant={categories.includes(k) ? 'filled' : 'secondary'} onPress={() => toggleCategory(k)}>{`${categoryLabel(k)} ${n}`}</VButton>
          ))}
        </View>
      ) : null}
      {!filtering && recentDiseases.length ? (
        <View style={styles.recent}>
          <Text style={[styles.small, { color: colors.textSecondary }]}>Consultadas hace poco</Text>
          <View style={styles.toggles}>
            {recentDiseases.slice(0, 6).map((d) => <VButton key={d.id} size="sm" variant="ghost" onPress={() => open(d)}>{d.name}</VButton>)}
          </View>
        </View>
      ) : null}
      <View style={styles.resultsRow}>
        <Text style={[styles.small, { color: colors.textSecondary }]}>{loading ? ' ' : `${filtered.length} de ${diseases.length}`}</Text>
        {filtering ? <VButton size="sm" variant="ghost" onPress={clearAll} icon={<X size={14} color={colors.primary} />}>Limpiar filtros</VButton> : null}
        <View style={styles.grow} />
        <Segmented label="Ordenar" options={SORTS} value={sort} onChange={setSort} size="sm" />
      </View>
    </View>
  );

  const list = loading ? <SkeletonList count={6} /> : (
    <SectionList
      sections={sections}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <DiseaseRow disease={item} selected={wide && selected?.id === item.id} favorite={isFavorite(item.id)} onPress={onRow} compact={!wide && width < 640} />}
      renderSectionHeader={({ section }) => (section.title ? (
        <View style={[styles.sectionHead, { backgroundColor: colors.background }]} accessibilityRole="header">
          <DisplayText style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</DisplayText>
          <Text style={[styles.small, { color: colors.textSecondary }]}>{`${section.data.length} · ${section.hint}`}</Text>
        </View>
      ) : null)}
      ListHeaderComponent={wide ? null : top}
      ListEmptyComponent={
        <VEmptyState icon={<BriefcaseMedical size={32} color={colors.textLight} />} title="Ninguna enfermedad coincide"
          description="Prueba con un signo («vómitos», «prurito»), el agente o el nombre en inglés, o limpia los filtros."
          action={filtering ? <VButton variant="secondary" onPress={clearAll}>Limpiar filtros</VButton> : undefined} variant="medical" />
      }
      stickySectionHeadersEnabled
      initialNumToRender={30}
      contentContainerStyle={[styles.listContent, !wide && styles.listPad]}
      keyboardShouldPersistTaps="handled"
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} onLayout={onLayout}>
      {wide ? (
        <>
          {top}
          <View style={styles.split}>
            <View style={styles.listPane}>{list}</View>
            <View style={styles.previewPane}>
              <DiseasePreview disease={selected} favorite={!!selected && isFavorite(selected.id)} onToggleFavorite={(d) => { toggleFavorite(d.id); }} onOpen={open} />
            </View>
          </View>
        </>
      ) : list}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  top: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, maxWidth: 1400, width: '100%', alignSelf: 'center' },
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: SPACING.xl, rowGap: SPACING.sm },
  toggles: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, alignItems: 'center', flexShrink: 1, maxWidth: '100%' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.md },
  recent: { marginTop: SPACING.md, gap: SPACING.xs },
  resultsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md, marginBottom: SPACING.sm },
  grow: { flexGrow: 1 },
  small: { fontSize: TYPOGRAPHY.sizes.sm },
  split: { flex: 1, flexDirection: 'row', gap: SPACING.lg, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, maxWidth: 1400, width: '100%', alignSelf: 'center' },
  listPane: { flex: 1, minWidth: 0 },
  previewPane: { width: 440 },
  listContent: { paddingBottom: SPACING['4xl'] },
  listPad: { paddingHorizontal: SPACING.lg },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  sectionTitle: { fontSize: 24, lineHeight: 28, fontWeight: '600' },
});
