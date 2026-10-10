import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput as RNTextInput, LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Plus, BriefcaseMedical, Dog, Cat, PawPrint, Baby, ChevronDown, X, ArrowUpDown } from 'lucide-react-native';
import { useDiseases } from '../../hooks/useDirectus';
import { SEVERITY_LABELS, SEVERITY_TONE } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { DISEASE_CATEGORIES, DiseaseCategoryKey, SPECIES_LABELS, categoryLabel, normalizeSearch, signTitle } from '../../constants/diseaseMeta';
import { DirectusDisease } from '../../services/directus';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY, FAB } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VBadge from '../../components/ui/Badge';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const SPECIES_ICONS: Record<string, typeof Dog> = { dog: Dog, cat: Cat };
const SEVERITY_ORDER = ['critical', 'severe', 'moderate', 'mild'] as const;
const STAGES = [
  { key: 'young', label: 'Cachorros y gatitos' },
  { key: 'adult', label: 'Adultos' },
  { key: 'senior', label: 'Senior' },
] as const;
type StageKey = typeof STAGES[number]['key'];
type SortKey = 'relevance' | 'az' | 'severity';
const SORT_LABELS: Record<SortKey, string> = { relevance: 'Más frecuentes', az: 'A–Z', severity: 'Más graves' };

// Everything a vet might type: Spanish or English name, Latin agent, category, signs
function searchText(d: DirectusDisease): string {
  return normalizeSearch([
    d.name, d.english_name, d.scientific_name, categoryLabel(d.category), ...(d.key_signs || []).map(signTitle),
  ].filter(Boolean).join(' '));
}

const stageOf = (d: DirectusDisease): StageKey | 'all' =>
  d.life_stage === 'puppy' || d.life_stage === 'kitten' ? 'young' : d.life_stage === 'adult' ? 'adult' : d.life_stage === 'senior' ? 'senior' : 'all';

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter(v => v !== value) : [...list, value];
}

export default function DiseasesScreen() {
  const router = useRouter();
  const { diseases, loading } = useDiseases();
  const { colors, onPrimaryText } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'all'>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [severities, setSeverities] = useState<string[]>([]);
  const [stages, setStages] = useState<StageKey[]>([]);
  const [zoonoticOnly, setZoonoticOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [contentWidth, setContentWidth] = useState(0);

  // Columns follow the space actually available (the sidebar takes part of the window).
  // Measured on the container View: a ScrollView's onLayout doesn't fire on react-native-web.
  const usable = Math.min(contentWidth, 1400) - SPACING.lg * 2;
  const columns = usable >= 960 ? 3 : usable >= 600 ? 2 : 1;
  const onLayout = (e: LayoutChangeEvent) => setContentWidth(e.nativeEvent.layout.width);

  const indexed = useMemo(() => diseases.map((d, rank) => ({ d, rank, text: searchText(d) })), [diseases]);
  const bySpecies = useMemo(
    () => (species === 'all' ? indexed : indexed.filter(({ d }) => d.species === species || d.species === 'both')),
    [indexed, species],
  );

  // Facet counts for the chosen species, so empty options are never offered
  const facets = useMemo(() => {
    const cat = new Map<string, number>(); const sev = new Map<string, number>(); const stg = new Map<string, number>();
    let zoo = 0;
    for (const { d } of bySpecies) {
      cat.set(d.category, (cat.get(d.category) || 0) + 1);
      sev.set(d.severity, (sev.get(d.severity) || 0) + 1);
      const s = stageOf(d); if (s !== 'all') stg.set(s, (stg.get(s) || 0) + 1);
      if (d.is_zoonotic) zoo++;
    }
    return {
      categories: [...cat.entries()].sort((a, b) => categoryLabel(a[0]).localeCompare(categoryLabel(b[0]), 'es')),
      severities: sev, stages: stg, zoonotic: zoo,
    };
  }, [bySpecies]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(searchQuery.trim());
    const terms = q ? q.split(/\s+/) : [];
    let rows = bySpecies.filter(({ d, text }) =>
      (!categories.length || categories.includes(d.category)) &&
      (!severities.length || severities.includes(d.severity)) &&
      (!stages.length || stages.includes(stageOf(d) as StageKey)) &&
      (!zoonoticOnly || d.is_zoonotic) &&
      terms.every(t => text.includes(t)));
    if (sort === 'az') rows = [...rows].sort((a, b) => a.d.name.localeCompare(b.d.name, 'es'));
    else if (sort === 'severity') rows = [...rows].sort((a, b) =>
      SEVERITY_ORDER.indexOf(a.d.severity as any) - SEVERITY_ORDER.indexOf(b.d.severity as any) || a.rank - b.rank);
    return rows.map(r => r.d);
  }, [bySpecies, searchQuery, categories, severities, stages, zoonoticOnly, sort]);

  // Young patients get their own groups only in the default view; any sort or stage filter shows one flat list
  const groups = useMemo(() => {
    if (sort !== 'relevance' || stages.length) return [{ key: 'all', title: '', items: filtered }];
    const puppy = filtered.filter(d => d.life_stage === 'puppy');
    const kitten = filtered.filter(d => d.life_stage === 'kitten');
    const rest = filtered.filter(d => d.life_stage !== 'puppy' && d.life_stage !== 'kitten');
    return [
      { key: 'puppy', title: 'Cachorros', items: puppy },
      { key: 'kitten', title: 'Gatitos', items: kitten },
      { key: 'rest', title: puppy.length || kitten.length ? 'Todas las edades' : '', items: rest },
    ].filter(g => g.items.length);
  }, [filtered, sort, stages]);

  const activeFilterCount = categories.length + severities.length + stages.length + (zoonoticOnly ? 1 : 0);
  const hasFilters = activeFilterCount > 0 || !!searchQuery.trim() || species !== 'all';
  const clearAll = () => { setSearchQuery(''); setCategories([]); setSeverities([]); setStages([]); setZoonoticOnly(false); setSpecies('all'); };

  const Chip = ({ label, count, active, onPress, dot, role = 'checkbox' }: { label: string; count?: number; active: boolean; onPress: () => void; dot?: string; role?: 'checkbox' | 'radio' }) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole={role}
      aria-checked={active}
      style={[styles.chip, { backgroundColor: active ? colors.primaryContainer : colors.surface, borderColor: active ? colors.primary : colors.border }]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Text style={{ color: colors.text, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: active ? TYPOGRAPHY.weights.semibold : TYPOGRAPHY.weights.regular }}>{label}</Text>
      {count !== undefined ? <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.sizes.xs }}>{count}</Text> : null}
    </TouchableOpacity>
  );

  const FilterRow = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.filterGroup}>
      <Text style={[styles.filterTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={styles.chipWrap}>{children}</View>
    </View>
  );

  const renderCard = (item: DirectusDisease) => {
    const SpeciesIcon = SPECIES_ICONS[item.species] || PawPrint;
    const category = DISEASE_CATEGORIES[item.category as DiseaseCategoryKey];
    const signs = (item.key_signs || []).slice(0, 4).map(signTitle);
    const young = item.life_stage === 'puppy' ? 'Cachorro' : item.life_stage === 'kitten' ? 'Gatito' : null;
    return (
      <View key={item.id} style={[styles.cell, { width: `${100 / columns}%` }]}>
        <VCard
          style={styles.card}
          padding={SPACING.lg}
          onPress={() => router.push(`/disease/${item.id}`)}
          accessibilityLabel={`${item.name}, severidad ${(SEVERITY_LABELS as Record<string, string>)[item.severity] || ''}${item.is_zoonotic ? ', zoonótica' : ''}`}
        >
          <View style={styles.cardTitleRow}>
            <Text style={[styles.diseaseName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
            <VBadge variant={SEVERITY_TONE[item.severity] || 'neutral'} size="sm">
              {(SEVERITY_LABELS as Record<string, string>)[item.severity] || item.severity}
            </VBadge>
          </View>
          {item.scientific_name ? (
            <Text style={[styles.scientificName, { color: colors.textSecondary }]} numberOfLines={1}>{item.scientific_name}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <SpeciesIcon size={14} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{SPECIES_LABELS[item.species] || item.species}</Text>
            <View style={[styles.dot, { backgroundColor: category?.color || colors.textLight }]} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{categoryLabel(item.category)}</Text>
            {young && sort !== 'relevance' ? <Text style={[styles.metaText, { color: colors.textSecondary }]}>· {young}</Text> : null}
          </View>
          {signs.length > 0 && (
            <Text style={[styles.signsText, { color: colors.text }]} numberOfLines={2}>{signs.join(' · ')}</Text>
          )}
          {item.is_zoonotic || /^Borrador pendiente de revisión/i.test(item.treatment?.notes || '') ? (
            <View style={styles.zooRow}>
              {item.is_zoonotic ? <VBadge variant="danger" size="sm">Zoonótica</VBadge> : null}
              {/* Unreviewed entries must be recognisable before opening them, not only on the detail */}
              {/^Borrador pendiente de revisión/i.test(item.treatment?.notes || '') ? <VBadge variant="warning" size="sm">Borrador sin revisar</VBadge> : null}
            </View>
          ) : null}
        </VCard>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} onLayout={onLayout}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Search + species */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} />
          <RNTextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre, agente, signo o nombre en inglés…"
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Buscar enfermedades"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Borrar búsqueda">
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.toolbar}>
          <View style={styles.chipWrap} accessibilityRole="radiogroup">
            {(['all', 'dog', 'cat'] as const).map(sp => (
              <TouchableOpacity
                key={sp}
                onPress={() => setSpecies(sp)}
                accessibilityRole="radio"
                aria-checked={species === sp}
                style={[styles.segment, { borderColor: species === sp ? colors.primary : colors.border, backgroundColor: species === sp ? colors.primary : colors.surface }]}
              >
                <Text style={{ color: species === sp ? onPrimaryText.default : colors.text, fontSize: TYPOGRAPHY.sizes.sm }}>
                  {sp === 'all' ? 'Todas' : sp === 'dog' ? 'Perros' : 'Gatos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters(v => !v)}
            style={[styles.toolButton, { borderColor: activeFilterCount ? colors.primary : colors.border, backgroundColor: activeFilterCount ? colors.primaryContainer : colors.surface }]}
            accessibilityRole="button"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={16} color={colors.primary} />
            <Text style={[styles.toolButtonText, { color: colors.primary }]}>
              {activeFilterCount ? `Filtros (${activeFilterCount})` : 'Filtros'}
            </Text>
            <ChevronDown size={14} color={colors.primary} style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={[styles.filterPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <FilterRow title="Severidad">
              {SEVERITY_ORDER.filter(s => facets.severities.get(s)).map(s => (
                <Chip key={s} label={(SEVERITY_LABELS as Record<string, string>)[s]} count={facets.severities.get(s)} active={severities.includes(s)} onPress={() => setSeverities(v => toggle(v, s))} />
              ))}
            </FilterRow>
            <FilterRow title="Etapa de vida">
              {STAGES.filter(s => facets.stages.get(s.key)).map(s => (
                <Chip key={s.key} label={s.label} count={facets.stages.get(s.key)} active={stages.includes(s.key)} onPress={() => setStages(v => toggle(v, s.key))} />
              ))}
            </FilterRow>
            <FilterRow title="Riesgo para personas">
              <Chip label="Solo zoonóticas" count={facets.zoonotic} active={zoonoticOnly} onPress={() => setZoonoticOnly(v => !v)} />
            </FilterRow>
            <FilterRow title="Categoría">
              {facets.categories.map(([key, count]) => (
                <Chip key={key} label={categoryLabel(key)} count={count} dot={DISEASE_CATEGORIES[key as DiseaseCategoryKey]?.color} active={categories.includes(key)} onPress={() => setCategories(v => toggle(v, key))} />
              ))}
            </FilterRow>
          </View>
        )}

        {/* Count + sort */}
        <View style={styles.resultsRow}>
          <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm }}>
            {loading ? '' : `${filtered.length} de ${diseases.length} enfermedades`}
          </Text>
          {hasFilters && !loading ? (
            <TouchableOpacity onPress={clearAll} accessibilityRole="button" hitSlop={8}>
              <Text style={{ color: colors.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold }}>Limpiar</Text>
            </TouchableOpacity>
          ) : null}
          <View style={{ flex: 1 }} />
          <ArrowUpDown size={14} color={colors.textSecondary} />
          <View style={styles.chipWrap} accessibilityRole="radiogroup" accessibilityLabel="Ordenar">
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <Chip key={k} role="radio" label={SORT_LABELS[k]} active={sort === k} onPress={() => setSort(k)} />
            ))}
          </View>
        </View>

        {loading ? (
          <SkeletonList count={4} />
        ) : filtered.length === 0 ? (
          <VEmptyState
            icon={<BriefcaseMedical size={32} color={colors.textLight} />}
            title="No se encontraron enfermedades"
            description="Prueba con otro término (también busca en inglés y por agente) o limpia los filtros"
            variant="medical"
          />
        ) : (
          groups.map(g => {
            const isCollapsed = collapsed.has(g.key);
            const collapsible = g.key === 'puppy' || g.key === 'kitten';
            return (
              <View key={g.key} style={styles.group}>
                {g.title ? (
                  collapsible ? (
                    <TouchableOpacity
                      style={[styles.groupHeader, { borderBottomColor: colors.border }]}
                      onPress={() => setCollapsed(prev => { const n = new Set(prev); n.has(g.key) ? n.delete(g.key) : n.add(g.key); return n; })}
                      accessibilityRole="button"
                      aria-expanded={!isCollapsed}
                    >
                      <Baby size={16} color={colors.textSecondary} />
                      <Text style={[styles.groupTitle, { color: colors.text }]}>{g.title}</Text>
                      <Text style={[styles.groupCount, { color: colors.textSecondary }]}>{g.items.length}</Text>
                      <ChevronDown size={16} color={colors.textSecondary} style={{ transform: [{ rotate: isCollapsed ? '-90deg' : '0deg' }] }} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.groupHeader, { borderBottomColor: colors.border }]} accessibilityRole="header">
                      <Text style={[styles.groupTitle, { color: colors.text }]}>{g.title}</Text>
                      <Text style={[styles.groupCount, { color: colors.textSecondary }]}>{g.items.length}</Text>
                    </View>
                  )
                ) : null}
                {!isCollapsed && <View style={styles.grid}>{g.items.map(renderCard)}</View>}
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Nueva enfermedad" style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]} onPress={() => router.push('/(drawer)/add-disease')}>
        <Plus size={24} color={onPrimaryText.default} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 96, maxWidth: 1400, width: '100%', alignSelf: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, minHeight: 32 },
  toolbar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  segment: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, minHeight: 40, justifyContent: 'center' },
  toolButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, minHeight: 40, marginLeft: 'auto' },
  toolButtonText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  filterPanel: { marginTop: SPACING.md, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, gap: SPACING.md },
  filterGroup: { gap: SPACING.xs },
  filterTitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, minHeight: 36 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  resultsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md, marginBottom: SPACING.sm },
  group: { marginTop: SPACING.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, marginBottom: SPACING.md, minHeight: 44 },
  groupTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  groupCount: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.sm / 2 },
  cell: { paddingHorizontal: SPACING.sm / 2, marginBottom: SPACING.sm },
  card: { flex: 1, minHeight: 150 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.sm },
  diseaseName: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.base, flex: 1, lineHeight: 21 },
  scientificName: { fontStyle: 'italic', marginTop: 2, fontSize: TYPOGRAPHY.sizes.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 6 },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm, flexShrink: 1 },
  signsText: { lineHeight: 19, marginTop: SPACING.sm, fontSize: TYPOGRAPHY.sizes.sm },
  zooRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
  fab: { position: 'absolute', right: SPACING.lg, bottom: FAB.pageBottom, width: FAB.size, height: FAB.size, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
});
