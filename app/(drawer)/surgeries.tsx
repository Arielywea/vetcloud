import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, SectionList, ScrollView, LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Search, Scissors, X } from 'lucide-react-native';
import { useSurgeries } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import DisplayText from '../../components/ui/DisplayText';
import PageHeader from '../../components/ui/PageHeader';
import VButton from '../../components/ui/Button';
import VInput from '../../components/ui/Input';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import SurgeryRow from '../../components/surgery/SurgeryRow';
import SurgeryPreview from '../../components/surgery/SurgeryPreview';
import { SURGERY_CATEGORIES, surgeryCategoryLabel, readRecentSurgeries, pushRecentSurgery } from '../../constants/surgeryMeta';
import { normalizeSearch } from '../../constants/diseaseMeta';
import { Surgery, SurgeryCategory } from '../../services/directus';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

const WIDE = 1100;

// Name, indication, material and suture: what a vet types ("piómetra", "PDS", "gancho")
function searchText(s: Surgery): string {
  return normalizeSearch([s.nombre_cirugia, s.indicaciones, s.material_quirurgico, s.tipo_sutura, surgeryCategoryLabel(s.category)].filter(Boolean).join(' '));
}

export default function SurgeriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  // Small reference catalog: load it once and filter locally
  const { surgeries, loading } = useSurgeries();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SurgeryCategory | null>(null);
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [recent, setRecent] = useState<number[]>([]);
  useEffect(() => { setRecent(readRecentSurgeries()); }, []);

  const wide = width >= WIDE;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const indexed = useMemo(() => surgeries.map((s) => ({ s, text: searchText(s) })), [surgeries]);
  const filtered = useMemo(() => {
    const terms = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
    return indexed.filter(({ s, text }) => (!category || s.category === category) && terms.every((t) => text.includes(t))).map((r) => r.s);
  }, [indexed, query, category]);

  // Grouped by body region, the most common work first; the server already orders within a group
  const sections = useMemo(() => {
    const groups = SURGERY_CATEGORIES.map((c) => ({ key: c.key, title: c.label, data: filtered.filter((s) => s.category === c.key) }));
    const other = filtered.filter((s) => !SURGERY_CATEGORIES.some((c) => c.key === s.category));
    if (other.length) groups.push({ key: 'otras' as SurgeryCategory, title: 'Otras', data: other });
    return groups.filter((g) => g.data.length);
  }, [filtered]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    surgeries.forEach((s) => m.set(s.category || '', (m.get(s.category || '') || 0) + 1));
    return m;
  }, [surgeries]);

  // Nothing picked yet: the first row as shown (grouped), not the server's order
  const selected = useMemo(() => filtered.find((s) => s.id === selectedId) || (wide ? sections[0]?.data[0] || null : null), [filtered, sections, selectedId, wide]);
  const recentSurgeries = useMemo(() => recent.map((id) => surgeries.find((s) => s.id === id)).filter(Boolean) as Surgery[], [recent, surgeries]);
  const guides = surgeries.filter((s) => s.has_guide).length;

  const open = useCallback((s: Surgery) => {
    pushRecentSurgery(s.id);
    setRecent(readRecentSurgeries());
    router.push(`/surgery/${s.id}` as any);
  }, [router]);
  // Desktop: a click previews, the button opens; phone: a tap opens
  const onRow = useCallback((s: Surgery) => (wide ? setSelectedId(s.id) : open(s)), [wide, open]);

  const filtering = !!query.trim() || !!category;
  const clearAll = () => { setQuery(''); setCategory(null); };

  const top = (
    <View style={styles.top}>
      <PageHeader
        title="Cirugías"
        subtitle={loading ? ' ' : `${surgeries.length} procedimientos, ${guides} con guía paso a paso`}
      />
      <VInput
        value={query}
        onChangeText={setQuery}
        placeholder="Cirugía, indicación, instrumental o hilo"
        accessibilityLabel="Buscar cirugías"
        leftIcon={<Search size={18} color={colors.textLight} />}
        autoCorrect={false}
        containerStyle={{ marginBottom: SPACING.md }}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        <VButton size="sm" variant={!category ? 'filled' : 'secondary'} onPress={() => setCategory(null)}>Todas</VButton>
        {SURGERY_CATEGORIES.filter((c) => counts.get(c.key)).map((c) => (
          <VButton key={c.key} size="sm" variant={category === c.key ? 'filled' : 'secondary'} onPress={() => setCategory(category === c.key ? null : c.key)}>
            {`${c.label} ${counts.get(c.key)}`}
          </VButton>
        ))}
      </ScrollView>
      {!filtering && recentSurgeries.length ? (
        <View style={styles.recent}>
          <Text style={[styles.small, { color: colors.textSecondary }]}>Consultadas hace poco</Text>
          <View style={styles.row}>
            {recentSurgeries.map((s) => <VButton key={s.id} size="sm" variant="ghost" onPress={() => open(s)}>{s.nombre_cirugia}</VButton>)}
          </View>
        </View>
      ) : null}
      {filtering ? (
        <View style={styles.resultsRow}>
          <Text style={[styles.small, { color: colors.textSecondary }]}>{`${filtered.length} de ${surgeries.length}`}</Text>
          <VButton size="sm" variant="ghost" onPress={clearAll} icon={<X size={14} color={colors.primary} />}>Limpiar filtros</VButton>
        </View>
      ) : null}
    </View>
  );

  const list = loading ? <SkeletonList count={6} /> : (
    <SectionList
      sections={sections}
      keyExtractor={(s) => String(s.id)}
      renderItem={({ item }) => <SurgeryRow surgery={item} selected={wide && selected?.id === item.id} onPress={onRow} />}
      renderSectionHeader={({ section }) => (
        <View style={[styles.sectionHead, { backgroundColor: colors.background }]} accessibilityRole="header">
          <DisplayText style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</DisplayText>
          <Text style={[styles.small, { color: colors.textSecondary }]}>{section.data.length}</Text>
        </View>
      )}
      ListHeaderComponent={wide ? null : top}
      ListEmptyComponent={
        <VEmptyState icon={<Scissors size={32} color={colors.textLight} />} title="Ninguna cirugía coincide"
          description="Prueba con la indicación («piómetra», «cálculos»), el instrumental o el hilo, o limpia los filtros."
          action={filtering ? <VButton variant="secondary" onPress={clearAll}>Limpiar filtros</VButton> : undefined} variant="medical" />
      }
      stickySectionHeadersEnabled
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
              <SurgeryPreview surgery={selected} onOpen={open} />
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
  categories: { gap: SPACING.xs, paddingBottom: SPACING.xs },
  recent: { marginTop: SPACING.md, gap: SPACING.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  resultsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  small: { fontSize: TYPOGRAPHY.sizes.sm },
  split: { flex: 1, flexDirection: 'row', gap: SPACING.lg, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, maxWidth: 1400, width: '100%', alignSelf: 'center' },
  listPane: { flex: 1, minWidth: 0 },
  previewPane: { width: 440 },
  listContent: { paddingBottom: SPACING['4xl'] },
  listPad: { paddingHorizontal: SPACING.lg },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  sectionTitle: { fontSize: 24, lineHeight: 28, fontWeight: '600' },
});
