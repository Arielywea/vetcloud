import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Chip, Card, Text, Badge, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDiseases } from '../../hooks/useDirectus';
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { DISEASE_CATEGORIES } from '../../constants/diseases';
import { DirectusDisease } from '../../services/directus';
import { DiseaseCategory } from '../../types';

export default function SearchScreen() {
  const router = useRouter();
  const { diseases, loading } = useDiseases();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'name' | 'symptoms'>('name');
  const [selectedSpecies, setSelectedSpecies] = useState<'dog' | 'cat' | 'all'>('all');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let filtered = diseases;
    if (selectedSpecies !== 'all') {
      filtered = filtered.filter(d => d.species === selectedSpecies || d.species === 'both');
    }
    if (mode === 'symptoms') {
      return filtered.filter(d =>
        d.key_signs && d.key_signs.some((sign: string) => sign.toLowerCase().includes(q))
      );
    }
    return filtered.filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.scientific_name?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  }, [diseases, query, mode, selectedSpecies]);

  const renderDisease = ({ item }: { item: DirectusDisease }) => (
    <TouchableOpacity onPress={() => router.push(`/disease/${item.id}`)}>
      <Card style={[styles.resultCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.resultHeader}>
            <Text variant="titleMedium" style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
            <Badge
              style={[styles.severityBadge, { backgroundColor: SEVERITY_COLORS[item.severity as keyof typeof SEVERITY_COLORS] || colors.textSecondary }]}
            >
              {SEVERITY_LABELS[item.severity as keyof typeof SEVERITY_LABELS] || item.severity}
            </Badge>
          </View>
          <Text variant="bodySmall" style={[styles.resultScientific, { color: colors.textSecondary }]}>{item.scientific_name}</Text>
          <View style={styles.resultMeta}>
            <MaterialCommunityIcons name={item.species === 'dog' ? 'dog' : 'cat'} size={14} color={colors.primary} />
            <Text style={[styles.resultSpecies, { color: colors.primary }]}>{item.species === 'dog' ? 'Perro' : 'Gato'}</Text>
          </View>
          {mode === 'symptoms' && item.key_signs && (
            <View style={[styles.matchedSigns, { borderTopColor: colors.border }]}>
              <Text variant="bodySmall" style={[styles.matchedLabel, { color: colors.textSecondary }]}>Signos coincidentes:</Text>
              {item.key_signs
                .filter((s: string) => s.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 3)
                .map((sign: string, i: number) => (
                  <Text key={i} variant="bodySmall" style={[styles.matchedSign, { color: colors.primary }]}>• {sign}</Text>
                ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SegmentedButtons
        value={mode}
        onValueChange={(val) => setMode(val as 'name' | 'symptoms')}
        buttons={[
          { value: 'name', label: 'Por nombre', icon: 'text-search' },
          { value: 'symptoms', label: 'Por síntomas', icon: 'stethoscope' },
        ]}
        style={styles.modeSelector}
      />
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={mode === 'name' ? 'Buscar por nombre...' : 'Describir síntomas...'}
          onChangeText={setQuery}
          value={query}
          style={[styles.searchbar, { backgroundColor: colors.surface }]}
        />
      </View>
      <View style={styles.speciesRow}>
        {(['all', 'dog', 'cat'] as const).map(sp => (
          <Chip
            key={sp}
            selected={selectedSpecies === sp}
            onPress={() => setSelectedSpecies(sp)}
            style={[styles.speciesChip, { backgroundColor: colors.surfaceVariant }, selectedSpecies === sp && { backgroundColor: colors.primary }]}
            textStyle={selectedSpecies === sp ? { color: '#FFFFFF' } : undefined}
            compact
          >
            {sp === 'all' ? 'Todos' : sp === 'dog' ? 'Perros' : 'Gatos'}
          </Chip>
        ))}
      </View>
      <View style={styles.resultsHeader}>
        <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
          {query ? `${results.length} resultado${results.length !== 1 ? 's' : ''}` : 'Escribe para buscar'}
        </Text>
      </View>
      <FlatList
        data={results}
        renderItem={renderDisease}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="magnify" size={48} color={colors.textLight} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {loading ? 'Cargando...' : query ? 'No se encontraron resultados' : 'Escribe para buscar'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeSelector: { margin: 12, marginBottom: 0 },
  searchContainer: { paddingHorizontal: 12, paddingBottom: 8 },
  searchbar: { elevation: 1, borderRadius: 12 },
  speciesRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 4 },
  speciesChip: {},
  resultsHeader: { paddingHorizontal: 16, paddingVertical: 8 },
  listContent: { padding: 12, paddingBottom: 24 },
  resultCard: { marginBottom: 10, borderRadius: 12, elevation: 1 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontWeight: '700', flex: 1 },
  severityBadge: { fontSize: 10, color: '#FFFFFF', marginLeft: 8 },
  resultScientific: { fontStyle: 'italic', marginTop: 2 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
  resultSpecies: { fontSize: 12, fontWeight: '500' },
  matchedSigns: { marginTop: 8, paddingTop: 8, borderTopWidth: 1 },
  matchedLabel: { marginBottom: 4 },
  matchedSign: { marginBottom: 2 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16 },
});
