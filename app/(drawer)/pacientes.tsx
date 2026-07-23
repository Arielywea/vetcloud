import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, FAB, Searchbar, Chip, Dialog, Portal, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { PawPrint, Cat, Dog, Trash2, AlertCircle } from 'lucide-react-native';
import { usePets } from '../../hooks/useDirectus';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import VAvatar from '../../components/ui/Avatar';
import { calculateAge } from '../../utils/age';

export default function PacientesScreen() {
  const router = useRouter();
  const { pets, loading, removePet } = usePets();
  const { colors } = useTheme();
  const [deleteTarget, setDeleteTarget] = useState<DirectusPet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await removePet(deleteTarget.id);
    setDeleteTarget(null);
  };

  const filteredPets = useMemo(() => {
    let results = [...pets];
    if (selectedSpecies !== 'all') {
      results = results.filter(p => p.species === selectedSpecies);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.breed && p.breed.toLowerCase().includes(q)) ||
        (p.tutor_name && p.tutor_name.toLowerCase().includes(q)) ||
        (p.id_number && p.id_number.toLowerCase().includes(q))
      );
    }
    return results;
  }, [pets, searchQuery, selectedSpecies]);

  const renderPetCard = ({ item }: { item: DirectusPet }) => {
    const age = item.birth_date ? calculateAge(item.birth_date) : '';

    return (
      <TouchableOpacity
        onPress={() => router.push(`/pet/${item.id}`)}
        activeOpacity={0.7}
        style={[styles.petCard, { backgroundColor: colors.surface }, SHADOWS.sm]}
      >
        <View style={styles.petHeader}>
          <VAvatar
            name={item.name}
            size={50}
            style={{ backgroundColor: colors.primaryContainer }}
          />
          <View style={styles.petInfo}>
            <Text style={[styles.petName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.petBreed, { color: colors.textSecondary }]}>
              {item.breed || 'Sin raza especificada'}{age ? ` · ${age}` : ''}
            </Text>
            {item.tutor_name && (
              <Text style={[styles.petTutor, { color: colors.textSecondary }]}>
                Tutor: {item.tutor_name}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => setDeleteTarget(item)}
            style={[styles.deleteButton, { backgroundColor: colors.error + '12' }]}
            activeOpacity={0.7}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchbar, { backgroundColor: colors.surface }]}>
          <PawPrint size={18} color={colors.textLight} />
          <View style={styles.searchInputWrap}>
            <Text style={[styles.searchPlaceholder, { color: colors.textLight }]}>
              Buscar por nombre, raza, tutor...
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {([
            { key: 'all', label: 'Todos', icon: <PawPrint size={14} color={selectedSpecies === 'all' ? '#FFF' : colors.textSecondary} /> },
            { key: 'dog', label: 'Perros', icon: <Dog size={14} color={selectedSpecies === 'dog' ? '#FFF' : colors.textSecondary} /> },
            { key: 'cat', label: 'Gatos', icon: <Cat size={14} color={selectedSpecies === 'cat' ? '#FFF' : colors.textSecondary} /> },
          ] as const).map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedSpecies === filter.key ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: selectedSpecies === filter.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedSpecies(filter.key)}
              activeOpacity={0.7}
            >
              {filter.icon}
              <Text style={[
                styles.filterLabel,
                { color: selectedSpecies === filter.key ? '#FFF' : colors.text }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsRow}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {loading ? 'Cargando...' : `${filteredPets.length} paciente${filteredPets.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}>
              <PawPrint size={32} color={colors.textLight} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No se encontraron pacientes' : 'No tienes pacientes registrados'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Registra a tu paciente para llevar un seguimiento de su historial médico'}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(drawer)/add-paciente')}
        color="#FFFFFF"
      />

      {/* Delete Dialog */}
      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Eliminar paciente</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>
              ¿Estás seguro de eliminar a <Text style={{ fontWeight: '700' }}>{deleteTarget?.name}</Text>?
              Se borrará todo su historial médico.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button onPress={confirmDelete} textColor={colors.error}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  searchbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
  },
  searchInputWrap: { flex: 1 },
  searchPlaceholder: { fontSize: TYPOGRAPHY.sizes.md },
  filterRow: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  filterLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  resultsRow: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  resultsCount: { fontSize: TYPOGRAPHY.sizes.sm },
  listContent: { padding: SPACING.lg, paddingBottom: 100 },
  petCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  petHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  petInfo: { flex: 1 },
  petName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  petBreed: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  petTutor: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: SPACING['2xl'] },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: { marginTop: SPACING.md, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold, textAlign: 'center' },
  emptySubtitle: { marginTop: SPACING.sm, textAlign: 'center', lineHeight: 22, fontSize: TYPOGRAPHY.sizes.md },
  fab: { position: 'absolute', right: SPACING.xl, bottom: SPACING.xl, borderRadius: RADIUS.lg },
});
