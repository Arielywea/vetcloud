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
  if (!birthDate) return 'N/D';
  try {
    const parts = birthDate.split('/');
    if (parts.length !== 3) return 'N/D';
    const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const now = new Date();
    const years = Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return years >= 0 ? `${years} año${years !== 1 ? 's' : ''}` : 'N/D';
  } catch {
    return 'N/D';
  }
}

export default function PetHeader({ pet }: PetHeaderProps) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.topRow}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name={pet.species === 'dog' ? 'dog' : 'cat'}
                size={40}
                color="#FFFFFF"
              />
            </View>
            <Text variant="titleLarge" style={styles.name}>{pet.name}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: '#43A047' }]} />
              <Text style={styles.statusText}>Viva</Text>
            </View>
            <Text style={styles.clinicLabel}>Ficha clínica</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="paw" size={14} color={APP_COLORS.primary} />
            <Text style={styles.infoLabel}>ESPECIE</Text>
            <Text style={styles.infoValue}>{pet.species === 'dog' ? 'Canino' : 'Felino'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shape" size={14} color={APP_COLORS.primary} />
            <Text style={styles.infoLabel}>RAZA</Text>
            <Text style={styles.infoValue}>{pet.breed || 'N/D'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="palette" size={14} color={APP_COLORS.primary} />
            <Text style={styles.infoLabel}>COLOR</Text>
            <Text style={styles.infoValue}>{pet.color || 'N/D'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="weight" size={14} color={APP_COLORS.primary} />
            <Text style={styles.infoLabel}>PESO</Text>
            <Text style={styles.infoValue}>{pet.weight > 0 ? `${pet.weight} kg` : 'N/D'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={14} color={APP_COLORS.primary} />
            <Text style={styles.infoLabel}>NACIMIENTO</Text>
            <Text style={styles.infoValue}>{pet.birth_date || 'N/D'}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="baby-face-outline" size={14} color={APP_COLORS.primary} />
            <Text style={styles.infoLabel}>REPRODUCTIVO</Text>
            <Text style={styles.infoValue}>{STATUS_LABELS[pet.reproductive_status] || 'N/D'}</Text>
          </View>
        </View>

        {(pet.tutor_name || pet.phone || pet.address) && (
          <View style={styles.tutorSection}>
            <View style={styles.tutorRow}>
              <MaterialCommunityIcons name="account" size={14} color={APP_COLORS.primary} />
              <Text style={styles.tutorLabel}>TUTOR</Text>
              <Text style={styles.tutorValue}>{pet.tutor_name || 'N/D'}</Text>
            </View>
            {pet.phone && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="phone" size={14} color={APP_COLORS.primary} />
                <Text style={styles.tutorLabel}>TELÉFONO</Text>
                <Text style={styles.tutorValue}>{pet.phone}</Text>
              </View>
            )}
            {pet.address && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color={APP_COLORS.primary} />
                <Text style={styles.tutorLabel}>DIRECCIÓN</Text>
                <Text style={styles.tutorValue}>{pet.address}</Text>
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
    borderLeftWidth: 4,
    borderLeftColor: APP_COLORS.primary,
  },
  topRow: { alignItems: 'center', marginBottom: 16 },
  avatarSection: { alignItems: 'center' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  name: { fontWeight: '800', color: APP_COLORS.text, fontSize: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: '#43A047', fontWeight: '600' },
  clinicLabel: { fontSize: 12, color: APP_COLORS.textSecondary, marginTop: 2 },
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    borderTopWidth: 1, borderTopColor: APP_COLORS.border, paddingTop: 12,
  },
  infoItem: {
    width: '30%', backgroundColor: APP_COLORS.surfaceVariant,
    borderRadius: 8, padding: 10, alignItems: 'center',
  },
  infoLabel: { fontSize: 9, color: APP_COLORS.textSecondary, marginTop: 4, letterSpacing: 0.5 },
  infoValue: { fontSize: 12, fontWeight: '700', color: APP_COLORS.text, marginTop: 2, textAlign: 'center' },
  tutorSection: {
    borderTopWidth: 1, borderTopColor: APP_COLORS.border, paddingTop: 12, marginTop: 8,
  },
  tutorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tutorLabel: { fontSize: 10, color: APP_COLORS.textSecondary, width: 70, letterSpacing: 0.5 },
  tutorValue: { color: APP_COLORS.text, fontWeight: '600', flex: 1, fontSize: 13 },
});
