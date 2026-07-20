import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePets } from '../../hooks/useDirectus';
import { DirectusPet } from '../../services/directus';
import { APP_COLORS } from '../../constants/colors';

export default function PacientesScreen() {
  const router = useRouter();
  const { pets, loading, removePet } = usePets();

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    try {
      const parts = birthDate.split('/');
      if (parts.length !== 3) return '';
      const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
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
        <Card style={styles.petCard}>
          <Card.Content>
            <View style={styles.petHeader}>
              <View style={styles.petAvatar}>
                <MaterialCommunityIcons
                  name={item.species === 'dog' ? 'dog' : 'cat'}
                  size={32}
                  color={APP_COLORS.primary}
                />
              </View>
              <View style={styles.petInfo}>
                <Text variant="titleMedium" style={styles.petName}>{item.name}</Text>
                <Text variant="bodySmall" style={styles.petBreed}>
                  {item.breed || 'Sin raza especificada'}{age ? ` · ${age}` : ''}
                </Text>
                {item.weight > 0 && (
                  <Text variant="bodySmall" style={styles.petWeight}>{item.weight} kg</Text>
                )}
              </View>
              <View style={styles.petActions}>
                <TouchableOpacity onPress={() => removePet(item.id)} style={styles.actionButton}>
                  <MaterialCommunityIcons name="delete" size={18} color={APP_COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="dog" size={64} color={APP_COLORS.textLight} />
            <Text style={styles.emptyTitle}>No tienes pacientes registrados</Text>
            <Text style={styles.emptySubtitle}>
              Registra a tu mascota para llevar un seguimiento de su historial médico
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(drawer)/add-paciente')}
        color="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  listContent: { padding: 12, paddingBottom: 80 },
  petCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
    elevation: 1,
  },
  petHeader: { flexDirection: 'row', alignItems: 'center' },
  petAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: APP_COLORS.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  petInfo: { flex: 1, marginLeft: 12 },
  petName: { fontWeight: '700', color: APP_COLORS.text },
  petBreed: { color: APP_COLORS.textSecondary, marginTop: 2 },
  petWeight: { color: APP_COLORS.textSecondary, marginTop: 2 },
  petActions: { flexDirection: 'row' },
  actionButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '600', color: APP_COLORS.text, textAlign: 'center' },
  emptySubtitle: { marginTop: 8, color: APP_COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: APP_COLORS.primary, borderRadius: 16 },
});
