import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Search, Stethoscope, Dog, Cat } from 'lucide-react-native';
import { useDiseases } from '../../hooks/useDirectus';
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { DirectusDisease } from '../../services/directus';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VBadge from '../../components/ui/Badge';
import VEmptyState from '../../components/ui/EmptyState';

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
    if (selectedSpecies !== 'all') { filtered = filtered.filter(d => d.species === selectedSpecies || d.species === 'both'); }
    if (mode === 'symptoms') {
      return filtered.filter(d => d.key_signs && d.key_signs.some((sign: string) => sign.toLowerCase().includes(q)));
    }
    return filtered.filter(d =>
      d.name.toLowerCase().includes(q) || d.scientific_name?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q)
    );
  }, [diseases, query, mode, selectedSpecies]);

  const renderDisease = ({ item }: { item: DirectusDisease }) => (
    <TouchableOpacity onPress={() => router.push(`/disease/${item.id}`)}>
      <VCard style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text variant="titleMedium" style={[styles.resultName, { color: colors.text }]}>{item.name}</Text>
          <VBadge variant={item.severity === 'high' ? 'danger' : item.severity === 'medium' ? 'warning' : 'info'}>
            {SEVERITY_LABELS[item.severity as keyof typeof SEVERITY_LABELS] || item.severity}
          </VBadge>
        </View>
        <Text variant="bodySmall" style={[styles.resultScientific, { color: colors.textSecondary }]}>{item.scientific_name}</Text>
        <View style={styles.resultMeta}>
          {item.species === 'dog' ? <Dog size={14} color={colors.primary} /> : <Cat size={14} color={colors.primary} />}
          <Text style={[styles.resultSpecies, { color: colors.primary }]}>{item.species === 'dog' ? 'Perro' : 'Gato'}</Text>
        </View>
        {mode === 'symptoms' && item.key_signs && (
          <View style={[styles.matchedSigns, { borderTopColor: colors.border }]}>
            <Text variant="bodySmall" style={[styles.matchedLabel, { color: colors.textSecondary }]}>Signos coincidentes:</Text>
            {item.key_signs.filter((s: string) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((sign: string, i: number) => (
              <Text key={i} variant="bodySmall" style={[styles.matchedSign, { color: colors.primary }]}>• {sign}</Text>
            ))}
          </View>
        )}
      </VCard>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.modeRow}>
        <TouchableOpacity onPress={() => setMode('name')} style={[styles.modeBtn, { backgroundColor: colors.surface, borderColor: colors.border }, mode === 'name' && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Search size={14} color={mode === 'name' ? '#fff' : colors.textSecondary} />
          <Text style={{ color: mode === 'name' ? '#fff' : colors.text, fontSize: 13 }}>Por nombre</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMode('symptoms')} style={[styles.modeBtn, { backgroundColor: colors.surface, borderColor: colors.border }, mode === 'symptoms' && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
          <Stethoscope size={14} color={mode === 'symptoms' ? '#fff' : colors.textSecondary} />
          <Text style={{ color: mode === 'symptoms' ? '#fff' : colors.text, fontSize: 13 }}>Por síntomas</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textLight} />
        <RNTextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={mode === 'name' ? 'Buscar por nombre...' : 'Describir síntomas...'}
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.speciesRow}>
        {(['all', 'dog', 'cat'] as const).map(sp => (
          <TouchableOpacity key={sp} onPress={() => setSelectedSpecies(sp)} style={[styles.speciesChip, { backgroundColor: colors.surface, borderColor: colors.border }, selectedSpecies === sp && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
            <Text style={{ color: selectedSpecies === sp ? '#fff' : colors.text, fontSize: 13 }}>
              {sp === 'all' ? 'Todos' : sp === 'dog' ? 'Perros' : 'Gatos'}
            </Text>
          </TouchableOpacity>
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
          <VEmptyState
            icon={<Search size={32} color={colors.textLight} />}
            title={loading ? 'Cargando...' : query ? 'No se encontraron resultados' : 'Escribe para buscar'}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modeRow: { flexDirection: 'row', margin: SPACING.lg, gap: SPACING.sm },
  modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: 15 },
  speciesRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, gap: 6 },
  speciesChip: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1 },
  resultsHeader: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  listContent: { padding: SPACING.lg, paddingBottom: 24 },
  resultCard: { marginBottom: SPACING.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultName: { fontWeight: '700', flex: 1 },
  resultScientific: { fontStyle: 'italic', marginTop: 2 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: 6 },
  resultSpecies: { fontSize: 12, fontWeight: '500' },
  matchedSigns: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1 },
  matchedLabel: { marginBottom: 4 },
  matchedSign: { marginBottom: 2 },
});
