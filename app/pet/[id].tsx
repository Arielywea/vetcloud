import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePet, useClinicalRecords } from '../../hooks/useDirectus';
import { ClinicalRecord } from '../../services/directus';
import { APP_COLORS } from '../../constants/colors';
import PetHeader from '../../components/PetHeader';
import ClinicalTabs, { ClinicalTabType } from '../../components/ClinicalTabs';
import HistoryTimeline from '../../components/HistoryTimeline';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pet, loading } = usePet(id || null);
  const { records, loading: recordsLoading, addRecord } = useClinicalRecords(id || undefined);
  const [activeTab, setActiveTab] = useState<ClinicalTabType>('historial');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);

  const [recordType, setRecordType] = useState<ClinicalRecord['record_type']>('consulta');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 16));
  const [recordVet, setRecordVet] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordWeight, setRecordWeight] = useState('');

  const filteredRecords = activeTab === 'historial'
    ? records
    : records.filter(r => r.record_type === activeTab.slice(0, -1));

  const handleAddRecord = async () => {
    if (!recordNotes.trim()) {
      Alert.alert('Error', 'Las notas son obligatorias');
      return;
    }
    if (!id) return;
    try {
      await addRecord({
        pet_id: id,
        record_type: recordType,
        date: new Date(recordDate).toISOString(),
        veterinarian: recordVet.trim() || null,
        details: {
          notes: recordNotes.trim(),
          weight: recordWeight ? parseFloat(recordWeight) : undefined,
        },
      });
      setRecordNotes('');
      setRecordVet('');
      setRecordWeight('');
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Mascota no encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PetHeader pet={pet} />

      {pet.anamnesis && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Anamnesis</Text>
            <Text style={styles.description}>{pet.anamnesis}</Text>
          </Card.Content>
        </Card>
      )}

      {pet.allergies && pet.allergies.length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Alergias</Text>
            <View style={styles.chipRow}>
              {pet.allergies.map((a: string, i: number) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{a}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleSmall" style={styles.sectionTitle}>Historia Clínica</Text>
            <Button mode="contained" compact onPress={() => setShowModal(true)}>
              Agregar
            </Button>
          </View>
          <ClinicalTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {recordsLoading ? (
            <Text style={styles.loadingText}>Cargando registros...</Text>
          ) : (
            <HistoryTimeline records={filteredRecords} onViewRecord={setSelectedRecord} />
          )}
        </Card.Content>
      </Card>

      {pet.notes && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.description}>{pet.notes}</Text>
          </Card.Content>
        </Card>
      )}

      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={styles.modal}>
          <ScrollView>
            <Text variant="titleMedium" style={styles.modalTitle}>Nuevo Registro Clínico</Text>

            <Text style={styles.fieldLabel}>Tipo de registro</Text>
            <View style={styles.typeRow}>
              {(['consulta', 'vacuna', 'cirugia', 'control'] as const).map((t) => (
                <Button
                  key={t}
                  mode={recordType === t ? 'contained' : 'outlined'}
                  compact
                  onPress={() => setRecordType(t)}
                  style={styles.typeBtn}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </View>

            <TextInput
              label="Fecha y hora"
              value={recordDate}
              onChangeText={setRecordDate}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Veterinario (opcional)"
              value={recordVet}
              onChangeText={setRecordVet}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Peso (kg, opcional)"
              value={recordWeight}
              onChangeText={setRecordWeight}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Notas *"
              value={recordNotes}
              onChangeText={setRecordNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddRecord} style={styles.saveButton}>
              Guardar Registro
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!selectedRecord} onDismiss={() => setSelectedRecord(null)} contentContainerStyle={styles.modal}>
          {selectedRecord && (
            <ScrollView>
              <Text variant="titleMedium" style={styles.modalTitle}>Detalle del Registro</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tipo:</Text>
                <Text style={styles.detailValue}>{selectedRecord.record_type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fecha:</Text>
                <Text style={styles.detailValue}>{new Date(selectedRecord.date).toLocaleString('es-CL')}</Text>
              </View>
              {selectedRecord.veterinarian && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Veterinario:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.veterinarian}</Text>
                </View>
              )}
              {selectedRecord.details?.weight && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Peso:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.details.weight} kg</Text>
                </View>
              )}
              {selectedRecord.details?.notes && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Notas:</Text>
                  <Text style={styles.detailNotes}>{selectedRecord.details.notes}</Text>
                </View>
              )}
              <Button mode="outlined" onPress={() => setSelectedRecord(null)} style={{ marginTop: 16 }}>
                Cerrar
              </Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: APP_COLORS.textSecondary, textAlign: 'center', marginTop: 40 },
  sectionCard: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12, backgroundColor: APP_COLORS.surface },
  sectionTitle: { fontWeight: '700', color: APP_COLORS.text, marginBottom: 8, fontSize: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  description: { color: APP_COLORS.text, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#FFF3E0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12, color: APP_COLORS.text },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: APP_COLORS.textSecondary, marginBottom: 6 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  typeBtn: { flex: 1, minWidth: 70 },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
  modal: { backgroundColor: 'white', padding: 24, margin: 20, borderRadius: 12, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { color: APP_COLORS.textSecondary, width: 100 },
  detailValue: { color: APP_COLORS.text, fontWeight: '500', flex: 1 },
  detailSection: { marginBottom: 8 },
  detailNotes: { color: APP_COLORS.text, lineHeight: 22, marginTop: 4 },
});
