import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePet } from '../../hooks/useDirectus';
import { APP_COLORS } from '../../constants/colors';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pet, loading } = usePet(id || null);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Mascota no encontrada</Text>
      </View>
    );
  }

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return 'Desconocida';
    try {
      const parts = birthDate.split('/');
      if (parts.length !== 3) return 'Desconocida';
      const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const now = new Date();
      const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return years >= 0 ? `${years} año${years !== 1 ? 's' : ''}` : 'Desconocida';
    } catch {
      return 'Desconocida';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pet Info Card */}
      <Card style={styles.petCard}>
        <Card.Content>
          <View style={styles.petHeader}>
            <View style={styles.petAvatar}>
              <MaterialCommunityIcons
                name={pet.species === 'dog' ? 'dog' : 'cat'}
                size={48}
                color={APP_COLORS.primary}
              />
            </View>
            <View style={styles.petInfo}>
              <Text variant="headlineSmall" style={styles.petName}>{pet.name}</Text>
              <Text variant="bodyMedium" style={styles.petBreed}>{pet.breed || 'Sin raza especificada'}</Text>
              <Text variant="bodySmall" style={styles.petDetails}>
                {calculateAge(pet.birth_date)} · {pet.weight > 0 ? `${pet.weight} kg` : 'Peso no registrado'}
              </Text>
              {pet.color && (
                <Text variant="bodySmall" style={styles.petColor}>Color: {pet.color}</Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* General Info */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Especie:</Text>
            <Text style={styles.infoValue}>{pet.species === 'dog' ? 'Perro' : 'Gato'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
            <Text style={styles.infoValue}>{pet.birth_date || 'No registrada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso:</Text>
            <Text style={styles.infoValue}>{pet.weight > 0 ? `${pet.weight} kg` : 'No registrado'}</Text>
          </View>
          {pet.allergies && pet.allergies.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Alergias:</Text>
              <View style={styles.chipRow}>
                {pet.allergies.map((allergy: string, i: number) => (
                  <Chip key={i} compact style={styles.allergyChip}>{allergy}</Chip>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Tutor Info */}
      {(pet.tutor_name || pet.phone || pet.email || pet.address || pet.clinic_location) && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Datos del Tutor</Text>
            {pet.tutor_name && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={16} color={APP_COLORS.primary} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{pet.tutor_name}</Text>
              </View>
            )}
            {pet.phone && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={16} color={APP_COLORS.primary} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>{pet.phone}</Text>
              </View>
            )}
            {pet.email && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email" size={16} color={APP_COLORS.primary} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{pet.email}</Text>
              </View>
            )}
            {pet.address && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={APP_COLORS.primary} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Dirección:</Text>
                <Text style={styles.infoValue}>{pet.address}</Text>
              </View>
            )}
            {pet.clinic_location && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="hospital-box" size={16} color={APP_COLORS.primary} style={styles.infoIcon} />
                <Text style={styles.infoLabel}>Clínica:</Text>
                <Text style={styles.infoValue}>{pet.clinic_location}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Notes */}
      {pet.notes && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.description}>{pet.notes}</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  content: {
    paddingBottom: 32,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    color: APP_COLORS.textSecondary,
  },
  petCard: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petInfo: {
    flex: 1,
    marginLeft: 16,
  },
  petName: {
    fontWeight: '800',
    color: APP_COLORS.text,
  },
  petBreed: {
    color: APP_COLORS.textSecondary,
    marginTop: 4,
  },
  petDetails: {
    color: APP_COLORS.textSecondary,
    marginTop: 4,
  },
  petColor: {
    color: APP_COLORS.textSecondary,
    marginTop: 2,
  },
  sectionCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
  },
  sectionTitle: {
    fontWeight: '700',
    color: APP_COLORS.text,
    marginBottom: 12,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    color: APP_COLORS.textSecondary,
    width: 140,
  },
  infoValue: {
    color: APP_COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    flex: 1,
  },
  allergyChip: {
    backgroundColor: '#FFF3E0',
    height: 24,
  },
  description: {
    color: APP_COLORS.text,
    lineHeight: 22,
  },
});
