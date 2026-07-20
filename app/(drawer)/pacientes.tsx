import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, FAB, Button, Dialog, Portal, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePets } from '../../hooks/useDirectus';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
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
      <TouchableOpacity onPress={() => router.push(`/pet/${item.id}`)}>
        <Card style={[styles.petCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <View style={styles.petHeader}>
              <View style={[styles.petAvatar, { backgroundColor: colors.primaryContainer }]}>
                <MaterialCommunityIcons
                  name={item.species === 'dog' ? 'dog' : 'cat'}
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.petInfo}>
                <Text variant="titleMedium" style={[styles.petName, { color: colors.text }]}>{item.name}</Text>
                <Text variant="bodySmall" style={[styles.petBreed, { color: colors.textSecondary }]}>
                  {item.breed || 'Sin raza especificada'}{age ? ` · ${age}` : ''}
                </Text>
                {item.tutor_name && (
                  <Text variant="bodySmall" style={[styles.petTutor, { color: colors.textSecondary }]}>
                    Tutor: {item.tutor_name}
                  </Text>
                )}
                {item.weight > 0 && (
                  <Text variant="bodySmall" style={[styles.petWeight, { color: colors.textSecondary }]}>{item.weight} kg</Text>
                )}
              </View>
              <View style={styles.petActions}>
                <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.actionButton}>
                  <MaterialCommunityIcons name="delete" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Searchbar
        placeholder="Buscar por nombre, raza, tutor..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: colors.surface }]}
        inputStyle={styles.searchInput}
        icon="magnify"
      />

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      <View style={styles.resultsCount}>
        <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
          {loading ? 'Cargando...' : `${filteredPets.length} paciente${filteredPets.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      <FlatList
        data={filteredPets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="dog" size={64} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? 'No se encontraron pacientes' : 'No tienes pacientes registrados'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Registra a tu paciente para llevar un seguimiento de su historial médico'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(drawer)/add-paciente')}
        color="#FFFFFF"
      />

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
  searchbar: { margin: 12, marginBottom: 4, elevation: 2, borderRadius: 12 },
  searchInput: { fontSize: 15 },
  filterRow: { paddingHorizontal: 12, marginBottom: 4 },
  speciesChip: { marginRight: 6 },
  resultsCount: { paddingHorizontal: 16, paddingBottom: 4 },
  listContent: { padding: 12, paddingBottom: 80 },
  petCard: {
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  petHeader: { flexDirection: 'row', alignItems: 'center' },
  petAvatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
  },
  petInfo: { flex: 1, marginLeft: 12 },
  petName: { fontWeight: '700' },
  petBreed: { marginTop: 2 },
  petTutor: { marginTop: 2 },
  petWeight: { marginTop: 2 },
  petActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { marginTop: 8, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
