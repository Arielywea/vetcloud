import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Searchbar, Chip, Card, Text, Badge, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDiseases } from '../../hooks/useDirectus';
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../components/ScreenContainer';
import { DISEASE_CATEGORIES, SPECIES_INFO } from '../../constants/diseases';
import { DirectusDisease } from '../../services/directus';
import { DiseaseCategory } from '../../types';

export default function DiseasesScreen() {
  const router = useRouter();
  const { diseases, loading } = useDiseases();
  const { colors } = useTheme();
  const { isDesktop } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'dog' | 'cat' | 'all'>('all');
  const [selectedCategories, setSelectedCategories] = useState<DiseaseCategory[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredDiseases = useMemo(() => {
    let results = [...diseases];
    if (selectedSpecies !== 'all') {
      results = results.filter(d => d.species === selectedSpecies || d.species === 'both');
    }
    if (selectedCategories.length > 0) {
      results = results.filter(d => selectedCategories.includes(d.category as DiseaseCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.key_signs && d.key_signs.some((s: string) => s.toLowerCase().includes(q)))
      );
    }
    return results;
  }, [diseases, searchQuery, selectedSpecies, selectedCategories]);

  const toggleCategory = (cat: DiseaseCategory) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const renderDiseaseCard = ({ item }: { item: DirectusDisease }) => (
    <TouchableOpacity onPress={() => router.push(`/disease/${item.id}`)} activeOpacity={0.7}>
      <Card style={[styles.diseaseCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text variant="titleMedium" style={[styles.diseaseName, { color: colors.text }]}>{item.name}</Text>
              <Badge style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[item.severity as keyof typeof SEVERITY_COLORS] || colors.textSecondary }]}>
                {SEVERITY_LABELS[item.severity as keyof typeof SEVERITY_LABELS] || item.severity}
              </Badge>
            </View>
            <Text variant="bodySmall" style={[styles.scientificName, { color: colors.textSecondary }]}>{item.scientific_name}</Text>
          </View>
          <View style={styles.speciesRow}>
            <MaterialCommunityIcons
              name={SPECIES_INFO[item.species as keyof typeof SPECIES_INFO]?.icon as any || 'paw'}
              size={16}
              color={SPECIES_INFO[item.species as keyof typeof SPECIES_INFO]?.color || colors.textSecondary}
            />
            <Text style={[styles.speciesText, { color: SPECIES_INFO[item.species as keyof typeof SPECIES_INFO]?.color || colors.textSecondary }]}>
              {SPECIES_INFO[item.species as keyof typeof SPECIES_INFO]?.label || item.species}
            </Text>
            {item.is_zoonotic && <Badge style={[styles.zoonoticBadge, { backgroundColor: colors.error }]}>Zoonótica</Badge>}
          </View>
          <View style={styles.signsContainer}>
            <Text variant="bodySmall" style={[styles.signsTitle, { color: colors.textSecondary }]}>Signos clave:</Text>
            <Text variant="bodySmall" style={[styles.signsText, { color: colors.text }]} numberOfLines={2}>
              {item.key_signs && item.key_signs.slice(0, 3).join(' · ')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, isDesktop && styles.containerDesktop]}>
      <Searchbar
        placeholder="Buscar enfermedades..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }, isDesktop && styles.searchbarDesktop]}
        inputStyle={styles.searchInput}
        icon="magnify"
      />
      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} style={[styles.filterButton, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name={showFilters ? 'filter-remove' : 'filter'} size={18} color={colors.primary} />
          <Text style={[styles.filterButtonText, { color: colors.primary }]}>{showFilters ? 'Ocultar filtros' : 'Filtros'}</Text>
        </TouchableOpacity>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.speciesScroll}>
          {(['all', 'dog', 'cat'] as const).map(sp => (
            <Chip
              key={sp}
              selected={selectedSpecies === sp}
              onPress={() => setSelectedSpecies(sp)}
              style={[styles.speciesChip, { backgroundColor: colors.surfaceVariant }, selectedSpecies === sp && { backgroundColor: colors.primary }]}
              textStyle={selectedSpecies === sp ? { color: '#FFFFFF' } : undefined}
            >
              {sp === 'all' ? 'Todos' : sp === 'dog' ? 'Perros' : 'Gatos'}
            </Chip>
          ))}
        </ScrollView>
      </View>
      {showFilters && (
        <View style={styles.categoriesContainer}>
          <Text variant="bodySmall" style={[styles.categoriesLabel, { color: colors.textSecondary }]}>Categorías:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(DISEASE_CATEGORIES).map(([key, value]) => (
              <Chip
                key={key}
                selected={selectedCategories.includes(key as DiseaseCategory)}
                onPress={() => toggleCategory(key as DiseaseCategory)}
                style={[styles.categoryChip, { backgroundColor: colors.surfaceVariant }, selectedCategories.includes(key as DiseaseCategory) && { backgroundColor: (value as any).color + '30', borderColor: (value as any).color }]}
                compact
              >
                {value.label}
              </Chip>
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
        contentContainerStyle={[styles.listContent, isDesktop && styles.listContentDesktop]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="medical-bag" size={48} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {loading ? 'Cargando enfermedades...' : 'No se encontraron enfermedades'}
            </Text>
          </View>
        }
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => router.push('/(drawer)/add-disease')} color="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerDesktop: { alignItems: 'center' },
  searchbar: { margin: 12, elevation: 2, borderRadius: 12 },
  searchbarDesktop: { maxWidth: 800, width: '100%', alignSelf: 'center' },
  searchInput: { fontSize: 15 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  filterButton: { flexDirection: 'row', alignItems: 'center', padding: 8, marginRight: 8, borderRadius: 8 },
  filterButtonText: { marginLeft: 4, fontSize: 13, fontWeight: '500' },
  speciesScroll: { flex: 1 },
  speciesChip: { marginRight: 6 },
  categoriesContainer: { paddingHorizontal: 12, paddingBottom: 8 },
  categoriesLabel: { marginBottom: 6 },
  categoryChip: { marginRight: 4, marginBottom: 4 },
  resultsCount: { paddingHorizontal: 16, paddingBottom: 4 },
  listContent: { padding: 12, paddingBottom: 24 },
  listContentDesktop: { maxWidth: 800, width: '100%', alignSelf: 'center' },
  diseaseCard: { marginBottom: 10, borderRadius: 12, elevation: 1 },
  cardHeader: { marginBottom: 6 },
  cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diseaseName: { fontWeight: '700', flex: 1 },
  severityBadge: { fontSize: 10, color: '#FFFFFF', marginLeft: 8 },
  scientificName: { fontStyle: 'italic', marginTop: 2 },
  speciesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  speciesText: { fontSize: 12, fontWeight: '500' },
  zoonoticBadge: { color: '#FFFFFF', fontSize: 9 },
  signsContainer: { marginTop: 8 },
  signsTitle: { fontWeight: '600', marginBottom: 2 },
  signsText: { lineHeight: 18 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
