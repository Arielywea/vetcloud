import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DirectusPet } from '../services/directus';
import { useTheme } from '../contexts/ThemeContext';
import { calculateAge } from '../utils/age';

interface PetHeaderProps {
  pet: DirectusPet;
}

const STATUS_LABELS: Record<string, string> = {
  intacto: 'Intacto/a',
  castrado: 'Castrado',
  esterilizado: 'Esterilizado/a',
  gestante: 'Gestante',
};

const SEX_LABELS: Record<string, string> = {
  macho: 'Macho',
  hembra: 'Hembra',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/D';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function PetHeader({ pet }: PetHeaderProps) {
  const { colors } = useTheme();
  const age = calculateAge(pet.birth_date);

  return (
    <Card style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
      <Card.Content>
        <View style={styles.topRow}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {pet.photo ? (
                <Image source={{ uri: pet.photo }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons
                  name={pet.species === 'dog' ? 'dog' : 'cat'}
                  size={40}
                  color="#FFFFFF"
                />
              )}
            </View>
            <Text variant="titleLarge" style={[styles.name, { color: colors.text }]}>{pet.name}</Text>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: '#43A047' }]} />
              <Text style={[styles.statusText, { color: '#43A047' }]}>{pet.sex === 'hembra' ? 'Viva' : 'Vivo'}</Text>
            </View>
            <Text style={[styles.clinicLabel, { color: colors.textSecondary }]}>Ficha clínica</Text>
          </View>
        </View>

        <View style={[styles.infoGrid, { borderTopColor: colors.border }]}>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="paw" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ESPECIE</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{pet.species === 'dog' ? 'Canino' : 'Felino'}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="shape" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>RAZA</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{pet.breed || 'N/D'}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="palette" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>COLOR</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{pet.color || 'N/D'}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="weight" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>PESO</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{pet.weight > 0 ? `${pet.weight} kg` : 'N/D'}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="calendar" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>NACIMIENTO</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(pet.birth_date)}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>EDAD</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{age}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
            <MaterialCommunityIcons name="baby-face-outline" size={14} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>REPRODUCTIVO</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{STATUS_LABELS[pet.reproductive_status] || 'N/D'}</Text>
          </View>
          {pet.sex && (
            <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name={pet.sex === 'macho' ? 'gender-male' : 'gender-female'} size={14} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>SEXO</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{SEX_LABELS[pet.sex] || 'N/D'}</Text>
            </View>
          )}
          {pet.id_number && (
            <View style={[styles.infoItem, { backgroundColor: colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="barcode" size={14} color={colors.primary} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>IDENTIFICACIÓN</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{pet.id_number}</Text>
            </View>
          )}
        </View>

        {pet.temperament && pet.temperament.length > 0 && (
          <View style={[styles.temperamentSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.temperamentLabel, { color: colors.textSecondary }]}>TEMPERAMENTO</Text>
            <View style={styles.chipRow}>
              {pet.temperament.map((t: string, i: number) => (
                <View key={i} style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.chipText, { color: colors.primary }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(pet.tutor_name || pet.phone || pet.email || pet.address || pet.clinic_location) && (
          <View style={[styles.tutorSection, { borderTopColor: colors.border }]}>
            {pet.tutor_name && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="account" size={14} color={colors.primary} />
                <Text style={[styles.tutorLabel, { color: colors.textSecondary }]}>TUTOR</Text>
                <Text style={[styles.tutorValue, { color: colors.text }]}>{pet.tutor_name}</Text>
              </View>
            )}
            {pet.phone && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="phone" size={14} color={colors.primary} />
                <Text style={[styles.tutorLabel, { color: colors.textSecondary }]}>TELÉFONO</Text>
                <Text style={[styles.tutorValue, { color: colors.text }]}>{pet.phone}</Text>
              </View>
            )}
            {pet.email && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="email-outline" size={14} color={colors.primary} />
                <Text style={[styles.tutorLabel, { color: colors.textSecondary }]}>CORREO</Text>
                <Text style={[styles.tutorValue, { color: colors.text }]}>{pet.email}</Text>
              </View>
            )}
            {pet.address && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} />
                <Text style={[styles.tutorLabel, { color: colors.textSecondary }]}>DIRECCIÓN</Text>
                <Text style={[styles.tutorValue, { color: colors.text }]}>{pet.address}</Text>
              </View>
            )}
            {pet.clinic_location && (
              <View style={styles.tutorRow}>
                <MaterialCommunityIcons name="hospital-box-outline" size={14} color={colors.primary} />
                <Text style={[styles.tutorLabel, { color: colors.textSecondary }]}>CLÍNICA</Text>
                <Text style={[styles.tutorValue, { color: colors.text }]}>{pet.clinic_location}</Text>
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
    borderLeftWidth: 4,
  },
  topRow: { alignItems: 'center', marginBottom: 16 },
  avatarSection: { alignItems: 'center' },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 72, height: 72, borderRadius: 36,
  },
  name: { fontWeight: '800', fontSize: 20 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  clinicLabel: { fontSize: 12, marginTop: 2 },
  infoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'space-between',
    borderTopWidth: 1, paddingTop: 12,
  },
  infoItem: {
    width: '30%',
    borderRadius: 8, padding: 10, alignItems: 'center',
  },
  infoLabel: { fontSize: 9, marginTop: 4, letterSpacing: 0.5 },
  infoValue: { fontSize: 12, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  temperamentSection: {
    borderTopWidth: 1, paddingTop: 10, marginTop: 8,
  },
  temperamentLabel: { fontSize: 10, letterSpacing: 0.5, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, fontWeight: '600' },
  tutorSection: {
    borderTopWidth: 1, paddingTop: 12, marginTop: 8,
  },
  tutorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tutorLabel: { fontSize: 10, width: 70, letterSpacing: 0.5 },
  tutorValue: { fontWeight: '600', flex: 1, fontSize: 13 },
});
