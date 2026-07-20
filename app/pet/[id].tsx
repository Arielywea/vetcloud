import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { usePet, useClinicalRecords } from '../../hooks/useDirectus';
import { ClinicalRecord } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import PetHeader from '../../components/PetHeader';
import ClinicalTabs, { ClinicalTabType } from '../../components/ClinicalTabs';
import HistoryTimeline from '../../components/HistoryTimeline';

export default function PetDetailScreen() {
  const { colors } = useTheme();
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

  const counts = useMemo(() => ({
    historial: records.length,
    consultas: records.filter(r => r.record_type === 'consulta').length,
    vacunas: records.filter(r => r.record_type === 'vacuna').length,
    cirugias: records.filter(r => r.record_type === 'cirugia').length,
  }), [records]);

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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Paciente no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <PetHeader pet={pet} />

      {pet.anamnesis && (
        <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text }]}>Anamnesis</Text>
            <Text style={[styles.description, { color: colors.text }]}>{pet.anamnesis}</Text>
          </Card.Content>
        </Card>
      )}

      {pet.allergies && pet.allergies.length > 0 && (
        <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text }]}>Alergias</Text>
            <View style={styles.chipRow}>
              {pet.allergies.map((a: string, i: number) => (
                <View key={i} style={[styles.chip, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.chipText, { color: colors.text }]}>{a}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text }]}>Historia Clínica</Text>
            <Button mode="contained" compact onPress={() => setShowModal(true)}>
              Agregar
            </Button>
          </View>
          <ClinicalTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
          {recordsLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando registros...</Text>
          ) : (
            <HistoryTimeline records={filteredRecords} onViewRecord={setSelectedRecord} />
          )}
        </Card.Content>
      </Card>

      {pet.notes && (
        <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <Card.Content>
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.text }]}>Notas</Text>
            <Text style={[styles.description, { color: colors.text }]}>{pet.notes}</Text>
          </Card.Content>
        </Card>
      )}

      <Portal>
        <Modal visible={showModal} onDismiss={() => setShowModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nuevo Registro Clínico</Text>
            <View style={styles.typeRow}>
              {(['consulta', 'vacuna', 'cirugia', 'control'] as const).map((t) => (
                <Button key={t} mode={recordType === t ? 'contained' : 'outlined'} compact onPress={() => setRecordType(t)} style={styles.typeBtn}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </View>
            <TextInput label="Fecha y hora" value={recordDate} onChangeText={setRecordDate} mode="outlined" style={styles.input} />
            <TextInput label="Veterinario (opcional)" value={recordVet} onChangeText={setRecordVet} mode="outlined" style={styles.input} />
            <TextInput label="Peso (kg, opcional)" value={recordWeight} onChangeText={setRecordWeight} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="Notas *" value={recordNotes} onChangeText={setRecordNotes} mode="outlined" multiline numberOfLines={4} style={styles.input} />
            <Button mode="contained" onPress={handleAddRecord} style={styles.saveButton}>Guardar Registro</Button>
          </ScrollView>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!selectedRecord} onDismiss={() => setSelectedRecord(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          {selectedRecord && (
            <ScrollView>
              <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Detalle del Registro</Text>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.record_type}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRecord.date).toLocaleString('es-CL')}</Text>
              </View>
              {selectedRecord.veterinarian && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Veterinario:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.veterinarian}</Text>
                </View>
              )}
              {selectedRecord.details?.weight && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Peso:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.details.weight} kg</Text>
                </View>
              )}
              {selectedRecord.details?.notes && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notas:</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.notes}</Text>
                </View>
              )}
              <Button mode="outlined" onPress={() => setSelectedRecord(null)} style={{ marginTop: 16 }}>Cerrar</Button>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { textAlign: 'center', marginTop: 40 },
  sectionCard: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12 },
  sectionTitle: { fontWeight: '700', marginBottom: 8, fontSize: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  description: { lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { fontSize: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  typeBtn: { flex: 1, minWidth: 70 },
  input: { marginBottom: 12 },
  saveButton: { marginTop: 8 },
  modal: { padding: 24, margin: 20, borderRadius: 12, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { width: 100 },
  detailValue: { fontWeight: '500', flex: 1 },
});
