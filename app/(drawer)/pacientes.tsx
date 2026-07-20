import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePets } from '../../hooks/useDirectus';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';

export default function PacientesScreen() {
  const router = useRouter();
  const { pets, loading, removePet } = usePets();
  const { colors } = useTheme();

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    try {
      let birth: Date;
      if (birthDate.includes('-')) {
        birth = new Date(birthDate);
      } else if (birthDate.includes('/')) {
        const parts = birthDate.split('/');
        if (parts.length !== 3) return '';
        birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        return '';
      }
      if (isNaN(birth.getTime())) return '';
      const now = new Date();
      const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return years >= 0 ? `${years} año${years !== 1 ? 's' : ''}` : '';
    } catch {
      return '';
    }
  };

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
                {item.weight > 0 && (
                  <Text variant="bodySmall" style={[styles.petWeight, { color: colors.textSecondary }]}>{item.weight} kg</Text>
                )}
              </View>
              <View style={styles.petActions}>
                <TouchableOpacity onPress={() => removePet(item.id)} style={styles.actionButton}>
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
      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="dog" size={64} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tienes pacientes registrados</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Registra a tu paciente para llevar un seguimiento de su historial médico
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 10, paddingBottom: 80 },
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
  petWeight: { marginTop: 2 },
  petActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { marginTop: 8, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
});
