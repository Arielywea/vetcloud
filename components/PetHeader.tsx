import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DirectusPet } from '../services/directus';
import { APP_COLORS } from '../constants/colors';

interface PetHeaderProps {
  pet: DirectusPet;
}

const STATUS_LABELS: Record<string, string> = {
  intacto: 'Intacto/a',
  castrado: 'Castrado',
  esterilizado: 'Esterilizado/a',
  gestante: 'Gestante',
};

function calculateAge(birthDate: string): string {
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
}

export default function PetHeader({ pet }: PetHeaderProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name={pet.species === 'dog' ? 'dog' : 'cat'}
              size={48}
              color={APP_COLORS.primary}
            />
          </View>
          <View style={styles.info}>
            <Text variant="headlineSmall" style={styles.name}>{pet.name}</Text>
            <Text variant="bodyMedium" style={styles.breed}>{pet.breed || 'Sin raza especificada'}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <MaterialCommunityIcons name="paw" size={14} color={APP_COLORS.primary} />
            <Text style={styles.gridLabel}>Especie</Text>
            <Text style={styles.gridValue}>{pet.species === 'dog' ? 'Perro' : 'Gato'}</Text>
          </View>
          <View style={styles.gridItem}>
            <MaterialCommunityIcons name="calendar" size={14} color={APP_COLORS.primary} />
            <Text style={styles.gridLabel}>Edad</Text>
            <Text style={styles.gridValue}>{calculateAge(pet.birth_date)}</Text>
          </View>
          <View style={styles.gridItem}>
            <MaterialCommunityIcons name="weight" size={14} color={APP_COLORS.primary} />
            <Text style={styles.gridLabel}>Peso</Text>
            <Text style={styles.gridValue}>{pet.weight > 0 ? `${pet.weight} kg` : '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <MaterialCommunityIcons name="palette" size={14} color={APP_COLORS.primary} />
            <Text style={styles.gridLabel}>Color</Text>
            <Text style={styles.gridValue}>{pet.color || '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <MaterialCommunityIcons name="baby-face-outline" size={14} color={APP_COLORS.primary} />
            <Text style={styles.gridLabel}>Reproductivo</Text>
            <Text style={styles.gridValue}>{STATUS_LABELS[pet.reproductive_status] || pet.reproductive_status || '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <MaterialCommunityIcons name="heart-pulse" size={14} color={APP_COLORS.primary} />
            <Text style={styles.gridLabel}>Nacimiento</Text>
            <Text style={styles.gridValue}>{pet.birth_date || '-'}</Text>
          </View>
        </View>

        {(pet.tutor_name || pet.phone || pet.address) && (
          <View style={styles.tutorSection}>
            <Text variant="titleSmall" style={styles.tutorTitle}>Datos del Tutor</Text>
            {pet.tutor_name && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="account" size={14} color={APP_COLORS.primary} />
                <Text style={styles.tutorLabel}>Nombre:</Text>
                <Text style={styles.tutorValue}>{pet.tutor_name}</Text>
              </View>
            )}
            {pet.phone && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="phone" size={14} color={APP_COLORS.primary} />
                <Text style={styles.tutorLabel}>Teléfono:</Text>
                <Text style={styles.tutorValue}>{pet.phone}</Text>
              </View>
            )}
            {pet.address && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color={APP_COLORS.primary} />
                <Text style={styles.tutorLabel}>Dirección:</Text>
                <Text style={styles.tutorValue}>{pet.address}</Text>
              </View>
            )}
            {pet.clinic_location && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="hospital-box" size={14} color={APP_COLORS.primary} />
                <Text style={styles.tutorLabel}>Clínica:</Text>
                <Text style={styles.tutorValue}>{pet.clinic_location}</Text>
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontWeight: '800',
    color: APP_COLORS.text,
  },
  breed: {
    color: APP_COLORS.textSecondary,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  gridItem: {
    width: '30%',
    backgroundColor: APP_COLORS.surfaceVariant,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 10,
    color: APP_COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.text,
    marginTop: 2,
    textAlign: 'center',
  },
  tutorSection: {
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
    paddingTop: 12,
    marginTop: 4,
  },
  tutorTitle: {
    fontWeight: '700',
    color: APP_COLORS.text,
    marginBottom: 8,
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tutorLabel: {
    color: APP_COLORS.textSecondary,
    marginLeft: 8,
    width: 70,
  },
  tutorValue: {
    color: APP_COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
});
