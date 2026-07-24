import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView, TextInput as RNTextInput } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Search, Filter, FilterX, Plus, BriefcaseMedical, Dog, Cat, PawPrint } from 'lucide-react-native';
import { useDiseases } from '../../hooks/useDirectus';
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { DISEASE_CATEGORIES, SPECIES_INFO } from '../../constants/diseases';
import { DirectusDisease } from '../../services/directus';
import { DiseaseCategory } from '../../types';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VBadge from '../../components/ui/Badge';
import VEmptyState from '../../components/ui/EmptyState';
import AnimatedIcon from '../../components/icons/AnimatedIcon';

const SPECIES_ICONS: Record<string, typeof Dog> = { dog: Dog, cat: Cat };

export default function DiseasesScreen() {
  const router = useRouter();
  const { diseases, loading } = useDiseases();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'dog' | 'cat' | 'all'>('all');
  const [selectedCategories, setSelectedCategories] = useState<DiseaseCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredDiseases = useMemo(() => {
    let results = [...diseases];
    if (selectedSpecies !== 'all') { results = results.filter(d => d.species === selectedSpecies || d.species === 'both'); }
    if (selectedCategories.length > 0) { results = results.filter(d => selectedCategories.includes(d.category as DiseaseCategory)); }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(d => d.name.toLowerCase().includes(q) || (d.key_signs && d.key_signs.some((s: string) => s.toLowerCase().includes(q))));
    }
    return results;
  }, [diseases, searchQuery, selectedSpecies, selectedCategories]);

  const toggleCategory = (cat: DiseaseCategory) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const renderDiseaseCard = ({ item }: { item: DirectusDisease }) => {
    const SpeciesIcon = SPECIES_ICONS[item.species] || PawPrint;
    return (
      <TouchableOpacity onPress={() => router.push(`/disease/${item.id}`)} activeOpacity={0.7}>
        <VCard style={styles.diseaseCard}>
          <View style={styles.cardTitleRow}>
            <Text variant="titleMedium" style={[styles.diseaseName, { color: colors.text }]}>{item.name}</Text>
            <VBadge variant={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'info'}>
              {SEVERITY_LABELS[item.severity as keyof typeof SEVERITY_LABELS] || item.severity}
            </VBadge>
          </View>
          <Text variant="bodySmall" style={[styles.scientificName, { color: colors.textSecondary }]}>{item.scientific_name}</Text>
          <View style={styles.speciesRow}>
            <SpeciesIcon size={16} color={colors.primary} />
            <Text style={[styles.speciesText, { color: colors.primary }]}>
              {SPECIES_INFO[item.species as keyof typeof SPECIES_INFO]?.label || item.species}
            </Text>
            {item.is_zoonotic && <VBadge variant="danger">Zoonótica</VBadge>}
          </View>
          {item.key_signs && item.key_signs.length > 0 && (
            <View style={styles.signsContainer}>
              <Text variant="bodySmall" style={[styles.signsTitle, { color: colors.textSecondary }]}>Signos clave:</Text>
              <Text variant="bodySmall" style={[styles.signsText, { color: colors.text }]} numberOfLines={2}>
                {item.key_signs.slice(0, 3).join(' · ')}
              </Text>
            </View>
          )}
        </VCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textLight} />
        <RNTextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar enfermedades..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[styles.filterButton, { backgroundColor: colors.primaryContainer }]}>
          {showFilters ? <FilterX size={18} color={colors.primary} /> : <Filter size={18} color={colors.primary} />}
          <Text style={[styles.filterButtonText, { color: colors.primary }]}>{showFilters ? 'Ocultar' : 'Filtros'}</Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesScroll}>
          {(['all', 'dog', 'cat'] as const).map(sp => (
            <TouchableOpacity
              key={sp}
              onPress={() => setSelectedSpecies(sp)}
              style={[styles.speciesChip, { backgroundColor: colors.surface, borderColor: colors.border }, selectedSpecies === sp && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={{ color: selectedSpecies === sp ? '#fff' : colors.text, fontSize: 13 }}>
                {sp === 'all' ? 'Todos' : sp === 'dog' ? 'Perros' : 'Gatos'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showFilters && (
        <View style={styles.categoriesContainer}>
          <Text variant="bodySmall" style={[styles.categoriesLabel, { color: colors.textSecondary }]}>Categorías:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(DISEASE_CATEGORIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => toggleCategory(key as DiseaseCategory)}
                style={[styles.categoryChip, { backgroundColor: colors.surface, borderColor: colors.border }, selectedCategories.includes(key as DiseaseCategory) && { backgroundColor: (value as any).color + '30', borderColor: (value as any).color }]}
              >
                <Text style={{ color: selectedCategories.includes(key as DiseaseCategory) ? (value as any).color : colors.text, fontSize: 12 }}>{value.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.resultsCount}>
        <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
          {loading ? 'Cargando...' : `${filteredDiseases.length} enfermedades encontradas`}
        </Text>
      </View>

      <FlatList
        data={filteredDiseases}
        renderItem={renderDiseaseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <VEmptyState
            icon={<BriefcaseMedical size={32} color={colors.textLight} />}
            title={loading ? 'Cargando enfermedades...' : 'No se encontraron enfermedades'}
            description="Intenta ajustar los filtros de búsqueda"
          />
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]} onPress={() => router.push('/(drawer)/add-disease')}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', margin: SPACING.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: 15 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  filterButton: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, marginRight: SPACING.sm, borderRadius: RADIUS.md, gap: 4 },
  filterButtonText: { fontSize: 13, fontWeight: '500' },
  speciesScroll: { flex: 1 },
  speciesChip: { marginRight: 6, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  categoriesContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  categoriesLabel: { marginBottom: 6 },
  categoryChip: { marginRight: 4, marginBottom: 4, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm, borderWidth: 1 },
  resultsCount: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xs },
  listContent: { padding: SPACING.lg, paddingBottom: 24 },
  diseaseCard: { marginBottom: SPACING.md },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diseaseName: { fontWeight: '700', flex: 1 },
  scientificName: { fontStyle: 'italic', marginTop: 2 },
  speciesRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 6 },
  speciesText: { fontSize: 12, fontWeight: '500' },
  signsContainer: { marginTop: SPACING.md },
  signsTitle: { fontWeight: '600', marginBottom: 2 },
  signsText: { lineHeight: 18 },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
