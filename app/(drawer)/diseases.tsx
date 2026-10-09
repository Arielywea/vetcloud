import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Search, Filter, FilterX, Plus, BriefcaseMedical, Dog, Cat, PawPrint, Baby, ChevronDown, X } from 'lucide-react-native';
import { useDiseases } from '../../hooks/useDirectus';
import { SEVERITY_LABELS, SEVERITY_TONE } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { DISEASE_CATEGORIES, DiseaseCategoryKey, SPECIES_LABELS, categoryLabel, normalizeSearch, signTitle } from '../../constants/diseaseMeta';
import { DirectusDisease } from '../../services/directus';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VBadge from '../../components/ui/Badge';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const SPECIES_ICONS: Record<string, typeof Dog> = { dog: Dog, cat: Cat };

// Everything a vet might type: Spanish or English name, Latin agent, category, signs
function searchText(d: DirectusDisease): string {
  return normalizeSearch([
    d.name, d.english_name, d.scientific_name, categoryLabel(d.category), ...(d.key_signs || []).map(signTitle),
  ].filter(Boolean).join(' '));
}

export default function DiseasesScreen() {
  const router = useRouter();
  const { diseases, loading } = useDiseases();
  const { colors, onPrimaryText } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'dog' | 'cat' | 'all'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const indexed = useMemo(() => diseases.map(d => ({ d, text: searchText(d) })), [diseases]);

  const bySpecies = useMemo(
    () => (selectedSpecies === 'all' ? indexed : indexed.filter(({ d }) => d.species === selectedSpecies || d.species === 'both')),
    [indexed, selectedSpecies],
  );

  // Categories offered as filters: only those with diseases for the chosen species, with counts
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const { d } of bySpecies) counts.set(d.category, (counts.get(d.category) || 0) + 1);
    return [...counts.entries()].sort((a, b) => categoryLabel(a[0]).localeCompare(categoryLabel(b[0]), 'es'));
  }, [bySpecies]);

  const filteredDiseases = useMemo(() => {
    let results = bySpecies;
    if (selectedCategories.length > 0) results = results.filter(({ d }) => selectedCategories.includes(d.category));
    const q = normalizeSearch(searchQuery.trim());
    if (q) {
      const terms = q.split(/\s+/);
      results = results.filter(({ text }) => terms.every(t => text.includes(t)));
    }
    return results.map(({ d }) => d);
  }, [bySpecies, searchQuery, selectedCategories]);

  const puppyDiseases = useMemo(() => filteredDiseases.filter(d => d.life_stage === 'puppy'), [filteredDiseases]);
  const kittenDiseases = useMemo(() => filteredDiseases.filter(d => d.life_stage === 'kitten'), [filteredDiseases]);
  const generalDiseases = useMemo(() => filteredDiseases.filter(d => d.life_stage !== 'puppy' && d.life_stage !== 'kitten'), [filteredDiseases]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const renderDiseaseCard = ({ item }: { item: DirectusDisease }) => {
    const SpeciesIcon = SPECIES_ICONS[item.species] || PawPrint;
    const category = DISEASE_CATEGORIES[item.category as DiseaseCategoryKey];
    const signs = (item.key_signs || []).slice(0, 4).map(signTitle);
    return (
      <VCard style={styles.diseaseCard} onPress={() => router.push(`/disease/${item.id}`)} accessibilityLabel={`${item.name}, ${SEVERITY_LABELS[item.severity as keyof typeof SEVERITY_LABELS] || ''}`}>
        <View style={styles.cardTitleRow}>
          <Text variant="titleMedium" style={[styles.diseaseName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.cardBadges}>
            {item.is_zoonotic && <VBadge variant="danger">Zoonótica</VBadge>}
            <VBadge variant={SEVERITY_TONE[item.severity] || 'neutral'}>
              {SEVERITY_LABELS[item.severity as keyof typeof SEVERITY_LABELS] || item.severity}
            </VBadge>
          </View>
        </View>
        {item.scientific_name ? (
          <Text variant="bodySmall" style={[styles.scientificName, { color: colors.textSecondary }]} numberOfLines={1}>{item.scientific_name}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <SpeciesIcon size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{SPECIES_LABELS[item.species] || item.species}</Text>
          <Text style={[styles.metaText, { color: colors.textLight }]}>·</Text>
          <View style={[styles.categoryDot, { backgroundColor: category?.color || colors.textLight }]} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{categoryLabel(item.category)}</Text>
        </View>
        {signs.length > 0 && (
          <Text variant="bodySmall" style={[styles.signsText, { color: colors.text }]} numberOfLines={2}>
            {signs.join(' · ')}
          </Text>
        )}
      </VCard>
    );
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode, count: number, color: string, sectionKey?: string) => {
    const collapsible = !!sectionKey;
    const isCollapsed = collapsible && collapsedSections.has(sectionKey!);
    const content = (
      <>
        {icon}
        <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>{count}</Text>
        {collapsible && (
          <ChevronDown size={16} color={colors.textSecondary} style={{ transform: [{ rotate: isCollapsed ? '-90deg' : '0deg' }] }} />
        )}
      </>
    );
    const style = [styles.sectionHeader, { borderLeftColor: color, backgroundColor: colors.surface }];
    if (!collapsible) return <View style={style} accessibilityRole="header">{content}</View>;
    return (
      <TouchableOpacity
        style={style}
        onPress={() => toggleSection(sectionKey!)}
        activeOpacity={0.7}
        accessibilityRole="button"
        aria-expanded={!isCollapsed}
        accessibilityLabel={`${title}, ${count}`}
      >
        {content}
      </TouchableOpacity>
    );
  };

  const hasFilters = !!searchQuery.trim() || selectedCategories.length > 0 || selectedSpecies !== 'all';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, { backgroundColor: colors.primaryContainer }]}
          accessibilityRole="button"
          aria-expanded={showFilters}
        >
          {showFilters ? <FilterX size={18} color={colors.primary} /> : <Filter size={18} color={colors.primary} />}
          <Text style={[styles.filterButtonText, { color: colors.primary }]}>
            {showFilters ? 'Ocultar' : selectedCategories.length ? `Categorías (${selectedCategories.length})` : 'Categorías'}
          </Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesScroll} accessibilityRole="radiogroup">
          {(['all', 'dog', 'cat'] as const).map(sp => {
            const active = selectedSpecies === sp;
            return (
              <TouchableOpacity
                key={sp}
                onPress={() => setSelectedSpecies(sp)}
                accessibilityRole="radio"
                aria-checked={active}
                style={[styles.speciesChip, { backgroundColor: colors.surface, borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={{ color: active ? onPrimaryText.default : colors.text, fontSize: TYPOGRAPHY.sizes.sm }}>
                  {sp === 'all' ? 'Todas' : sp === 'dog' ? 'Perros' : 'Gatos'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categoryCounts.map(([key, count]) => {
              const active = selectedCategories.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => toggleCategory(key)}
                  accessibilityRole="checkbox"
                  aria-checked={active}
                  style={[styles.categoryChip, { backgroundColor: active ? colors.primaryContainer : colors.surface, borderColor: active ? colors.primary : colors.border }]}
                >
                  <View style={[styles.categoryDot, { backgroundColor: DISEASE_CATEGORIES[key as DiseaseCategoryKey]?.color || colors.textLight }]} />
                  <Text style={{ color: colors.text, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: active ? TYPOGRAPHY.weights.semibold : TYPOGRAPHY.weights.regular }}>
                    {categoryLabel(key)}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.sizes.xs }}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <View style={styles.resultsCount}>
        <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
          {loading ? '' : `${filteredDiseases.length} de ${diseases.length} enfermedades`}
        </Text>
        {hasFilters && !loading ? (
          <TouchableOpacity
            onPress={() => { setSearchQuery(''); setSelectedCategories([]); setSelectedSpecies('all'); }}
            accessibilityRole="button"
          >
            <Text style={{ color: colors.primary, fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold }}>Limpiar filtros</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={generalDiseases}
        renderItem={renderDiseaseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {puppyDiseases.length > 0 && (
              <>
                {renderSectionHeader('Cachorros', <Baby size={18} color={colors.textSecondary} />, puppyDiseases.length, colors.warning, 'puppy')}
                {!collapsedSections.has('puppy') && puppyDiseases.map(d => (
                  <View key={d.id}>{renderDiseaseCard({ item: d })}</View>
                ))}
              </>
            )}
            {kittenDiseases.length > 0 && (
              <>
                {renderSectionHeader('Gatitos', <Baby size={18} color={colors.textSecondary} />, kittenDiseases.length, colors.info, 'kitten')}
                {!collapsedSections.has('kitten') && kittenDiseases.map(d => (
                  <View key={d.id}>{renderDiseaseCard({ item: d })}</View>
                ))}
              </>
            )}
            {generalDiseases.length > 0 && (puppyDiseases.length > 0 || kittenDiseases.length > 0) &&
              renderSectionHeader('Todas las edades', <BriefcaseMedical size={18} color={colors.textSecondary} />, generalDiseases.length, colors.primary)}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <SkeletonList count={4} style={{ padding: SPACING.lg }} />
          ) : (puppyDiseases.length || kittenDiseases.length) ? null : (
            <VEmptyState
              icon={<BriefcaseMedical size={32} color={colors.textLight} />}
              title="No se encontraron enfermedades"
              description="Prueba con otro término (también busca en inglés y por agente) o limpia los filtros"
              variant="medical"
            />
          )
        }
      />

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Nueva enfermedad" style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]} onPress={() => router.push('/(drawer)/add-disease')}>
        <Plus size={24} color={onPrimaryText.default} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, margin: SPACING.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.sizes.base, minHeight: 32 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  filterButton: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, marginRight: SPACING.sm, borderRadius: RADIUS.md, gap: 6, minHeight: 44 },
  filterButtonText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  speciesScroll: { flex: 1 },
  speciesChip: { marginRight: 6, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, minHeight: 44, justifyContent: 'center' },
  categoriesContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 6, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.full, borderWidth: 1, minHeight: 40 },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  resultsCount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xs },
  listContent: { padding: SPACING.lg, paddingBottom: 96 },
  diseaseCard: { marginBottom: SPACING.md },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACING.sm },
  cardBadges: { flexDirection: 'row', gap: 4, flexShrink: 0 },
  diseaseName: { fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  scientificName: { fontStyle: 'italic', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: SPACING.sm, gap: 6 },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm },
  signsText: { lineHeight: 18, marginTop: SPACING.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACING.md, borderRadius: RADIUS.sm, borderLeftWidth: 3, marginBottom: SPACING.sm, minHeight: 44 },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.bold, flex: 1 },
  sectionCount: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  fab: { position: 'absolute', right: SPACING.lg, bottom: SPACING.lg, width: 56, height: 56, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
});
