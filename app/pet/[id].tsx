import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Chip, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePet } from '../../hooks/useDirectus';
import { ClinicalEntry } from '../../services/directus';
import { APP_COLORS } from '../../constants/colors';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pet, loading, updatePet } = usePet(id || null);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultDate, setConsultDate] = useState(new Date().toLocaleDateString('es-CL'));
  const [consultNotes, setConsultNotes] = useState('');
  const [consultVet, setConsultVet] = useState('');

  const handleAddConsult = async () => {
    if (!consultNotes.trim()) {
      Alert.alert('Error', 'Las notas son obligatorias');
      return;
    }
    if (!pet) return;
    const history: ClinicalEntry[] = (pet.clinical_history || []).concat({
      date: consultDate,
      notes: consultNotes.trim(),
      veterinarian: consultVet.trim() || undefined,
    });
    await updatePet({ clinical_history: history });
    setConsultNotes('');
    setConsultVet('');
    setShowConsultModal(false);
  };

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

  const statusLabels: Record<string, string> = {
    intacto: 'Intacto/a',
    castrado: 'Castrado',
    esterilizado: 'Esterilizado/a',
    gestante: 'Gestante',
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
              {pet.color && <Text variant="bodySmall" style={styles.petColor}>Color: {pet.color}</Text>}
              {pet.reproductive_status && (
                <Text variant="bodySmall" style={styles.petColor}>
                  Estado reproductivo: {statusLabels[pet.reproductive_status] || pet.reproductive_status}
                </Text>
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

      {/* Anamnesis */}
      {pet.anamnesis && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Anamnesis</Text>
            <Text style={styles.description}>{pet.anamnesis}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Historia Clínica */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Historia Clínica</Text>
            <Button mode="contained" compact onPress={() => setShowConsultModal(true)}>
              Agregar Consulta
            </Button>
          </View>
          {(!pet.clinical_history || pet.clinical_history.length === 0) ? (
            <Text style={styles.emptyText}>Sin consultas registradas</Text>
          ) : (
            [...pet.clinical_history].reverse().map((entry: ClinicalEntry, i: number) => (
              <View key={i} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <MaterialCommunityIcons name="calendar" size={14} color={APP_COLORS.primary} />
                  <Text style={styles.entryDate}>{entry.date}</Text>
                  {entry.veterinarian && (
                    <Text style={styles.entryVet}> · {entry.veterinarian}</Text>
                  )}
                </View>
                <Text style={styles.entryNotes}>{entry.notes}</Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Notes */}
      {pet.notes && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.description}>{pet.notes}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Add Consult Modal */}
      <Portal>
        <Modal visible={showConsultModal} onDismiss={() => setShowConsultModal(false)} contentContainerStyle={styles.modal}>
          <Text variant="titleMedium" style={styles.modalTitle}>Nueva Consulta</Text>
          <TextInput label="Fecha" value={consultDate} onChangeText={setConsultDate} mode="outlined" style={styles.input} />
          <TextInput label="Veterinario (opcional)" value={consultVet} onChangeText={setConsultVet} mode="outlined" style={styles.input} />
          <TextInput label="Notas" value={consultNotes} onChangeText={setConsultNotes} mode="outlined" multiline numberOfLines={4} style={styles.input} />
          <Button mode="contained" onPress={handleAddConsult} style={styles.saveButton}>Guardar Consulta</Button>
        </Modal>
      </Portal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyText: {
    color: APP_COLORS.textSecondary,
    fontStyle: 'italic',
  },
  entryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.primary,
    marginLeft: 4,
  },
  entryVet: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
  },
  entryNotes: {
    fontSize: 14,
    color: APP_COLORS.text,
    lineHeight: 20,
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    margin: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 8,
  },
});
