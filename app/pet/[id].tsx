import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { usePet, useClinicalRecords, usePrescriptions } from '../../hooks/useDirectus';
import { ClinicalRecord, Prescription } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import PetHeader from '../../components/PetHeader';
import ClinicalTabs, { ClinicalTabType } from '../../components/ClinicalTabs';
import HistoryTimeline from '../../components/HistoryTimeline';

export default function PetDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pet, loading } = usePet(id || null);
  const { records, loading: recordsLoading, addRecord } = useClinicalRecords(id || undefined);
  const { prescriptions, loading: rxLoading, addPrescription, sendEmail } = usePrescriptions(id || undefined);
  const [activeTab, setActiveTab] = useState<ClinicalTabType>('historial');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [rxLinkedRecordId, setRxLinkedRecordId] = useState<string | null>(null);

  // Clinical record form
  const [recordType, setRecordType] = useState<ClinicalRecord['record_type']>('consulta');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 16));
  const [recordVet, setRecordVet] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordWeight, setRecordWeight] = useState('');
  const [recordAnamnesis, setRecordAnamnesis] = useState('');

  // Prescription form
  const [rxVet, setRxVet] = useState('');
  const [rxBranch, setRxBranch] = useState('Casa Matriz');
  const [rxBody, setRxBody] = useState('');

  const counts = useMemo(() => ({
    historial: records.length,
    consultas: records.filter(r => r.record_type === 'consulta').length,
    vacunas: records.filter(r => r.record_type === 'vacuna').length,
    cirugias: records.filter(r => r.record_type === 'cirugia').length,
    recetas: prescriptions.length,
  }), [records, prescriptions]);

  const lastAnamnesis = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const r of sorted) {
      if (r.details?.anamnesis) return r;
    }
    return null;
  }, [records]);

  const filteredRecords = activeTab === 'historial'
    ? records
    : activeTab === 'recetas'
    ? records
    : records.filter(r => r.record_type === activeTab.slice(0, -1));

  const filteredPrescriptions = activeTab === 'recetas' ? prescriptions : [];

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
          anamnesis: recordAnamnesis.trim() || undefined,
        },
      });
      setRecordNotes('');
      setRecordVet('');
      setRecordWeight('');
      setRecordAnamnesis('');
      setShowRecordModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  const openRxModal = (linkedRecordId?: string) => {
    setRxLinkedRecordId(linkedRecordId || null);
    setRxVet(lastAnamnesis?.veterinarian || user?.name || '');
    setRxBranch('Casa Matriz');
    setRxBody('');
    setShowRxModal(true);
  };

  const handleSaveRx = async () => {
    if (!rxBody.trim()) {
      Alert.alert('Error', 'El cuerpo de la receta es obligatorio');
      return;
    }
    if (!id) return;
    try {
      await addPrescription({
        pet_id: id,
        user_id: user?.id || '',
        clinical_record_id: rxLinkedRecordId || null,
        veterinarian_name: rxVet.trim() || null,
        clinic_branch: rxBranch.trim() || null,
        prescription_body: rxBody.trim(),
        format: 'standard',
        status: 'active',
        issued_at: new Date().toISOString(),
      });
      setShowRxModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la receta');
    }
  };

  const handleSendRxEmail = async (rx: Prescription) => {
    try {
      await sendEmail(rx.id);
      Alert.alert('Éxito', 'Receta enviada por correo al tutor');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar el correo');
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
            <View style={styles.headerButtons}>
              <Button mode="outlined" compact onPress={() => openRxModal()} style={{ marginRight: 8 }}>
                Receta
              </Button>
              <Button mode="contained" compact onPress={() => setShowRecordModal(true)}>
                Agregar
              </Button>
            </View>
          </View>
          <ClinicalTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

          {activeTab === 'recetas' ? (
            rxLoading ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando recetas...</Text>
            ) : filteredPrescriptions.length === 0 ? (
              <View style={styles.emptyRx}>
                <MaterialCommunityIcons name="document-text-outline" size={32} color={colors.textLight} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin recetas</Text>
              </View>
            ) : (
              filteredPrescriptions.map(rx => (
                <Card key={rx.id} style={[styles.rxCard, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
                  <Card.Content>
                    <View style={styles.rxRow}>
                      <View style={styles.rxInfo}>
                        <Text style={[styles.rxDate, { color: colors.textSecondary }]}>
                          {new Date(rx.issued_at).toLocaleDateString('es-CL')}
                        </Text>
                        <Text style={[styles.rxVet, { color: colors.text }]} numberOfLines={1}>
                          {rx.veterinarian_name || 'Sin veterinario'}
                        </Text>
                        <Text style={[styles.rxPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                          {rx.prescription_body.substring(0, 80)}...
                        </Text>
                      </View>
                      <View style={styles.rxActions}>
                        <Button compact mode="text" onPress={() => setSelectedRx(rx)}>
                          <MaterialCommunityIcons name="eye" size={18} color={colors.primary} />
                        </Button>
                        <Button compact mode="text" onPress={() => handleSendRxEmail(rx)}>
                          <MaterialCommunityIcons name="email-outline" size={18} color={colors.info} />
                        </Button>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )
          ) : (
            recordsLoading ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando registros...</Text>
            ) : (
              <HistoryTimeline records={filteredRecords} onViewRecord={setSelectedRecord} />
            )
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

      {/* Modal: Nuevo Registro Clínico */}
      <Portal>
        <Modal visible={showRecordModal} onDismiss={() => setShowRecordModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nuevo Registro Clínico</Text>

            {lastAnamnesis && (
              <Card style={[styles.lastAnamnesisCard, { backgroundColor: colors.primaryContainer + '40', borderColor: colors.primary }]}>
                <Card.Content>
                  <Text style={[styles.lastAnamnesisLabel, { color: colors.primary }]}>
                    📋 Última anamnesis ({new Date(lastAnamnesis.date).toLocaleDateString('es-CL')})
                  </Text>
                  <Text style={[styles.lastAnamnesisText, { color: colors.text }]} numberOfLines={3}>
                    {lastAnamnesis.details?.anamnesis || lastAnamnesis.details?.notes || 'Sin anamnesis registrada'}
                  </Text>
                </Card.Content>
              </Card>
            )}

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
            <TextInput label="Anamnesis / Motivo de consulta" value={recordAnamnesis} onChangeText={setRecordAnamnesis} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <TextInput label="Notas *" value={recordNotes} onChangeText={setRecordNotes} mode="outlined" multiline numberOfLines={4} style={styles.input} />
            <Button mode="contained" onPress={handleAddRecord} style={styles.saveButton}>Guardar Registro</Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Modal: Detalle de Registro */}
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
              {selectedRecord.details?.anamnesis && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Anamnesis:</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.anamnesis}</Text>
                </View>
              )}
              {selectedRecord.details?.notes && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notas:</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.notes}</Text>
                </View>
              )}
              <View style={styles.detailActions}>
                <Button mode="contained" compact onPress={() => { setSelectedRecord(null); openRxModal(selectedRecord.id); }}>
                  Generar Receta
                </Button>
                <Button mode="outlined" onPress={() => setSelectedRecord(null)} style={{ marginTop: 8 }}>Cerrar</Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Modal: Nueva Receta */}
      <Portal>
        <Modal visible={showRxModal} onDismiss={() => setShowRxModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nueva Receta</Text>

            <Card style={[styles.rxPreviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Card.Content>
                <View style={styles.rxPreviewRow}>
                  <MaterialCommunityIcons name={pet.species === 'dog' ? 'dog' : 'cat'} size={24} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rxPreviewName, { color: colors.text }]}>{pet.name}</Text>
                    <Text style={[styles.rxPreviewDetail, { color: colors.textSecondary }]}>
                      {pet.species === 'dog' ? 'Canino' : 'Felino'} — {pet.breed || 'N/D'} | {pet.weight || 'N/D'} kg
                    </Text>
                  </View>
                </View>
                {pet.tutor_name && (
                  <View style={styles.rxPreviewTutor}>
                    <MaterialCommunityIcons name="account" size={14} color={colors.textSecondary} />
                    <Text style={[styles.rxPreviewTutorText, { color: colors.textSecondary }]}>
                      {pet.tutor_name}{pet.phone ? ` — ${pet.phone}` : ''}{pet.email ? ` — ${pet.email}` : ''}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            <TextInput label="Prescriptor" value={rxVet} onChangeText={setRxVet} mode="outlined" style={styles.input} />
            <TextInput label="Sucursal" value={rxBranch} onChangeText={setRxBranch} mode="outlined" style={styles.input} />
            <TextInput label="Receta *" value={rxBody} onChangeText={setRxBody} mode="outlined" multiline numberOfLines={10} style={styles.input} placeholder={"Uso Veterinario\nRimadyl (Carprofeno en comprimidos 100 mg):\nDar vía oral 1 comprimido cada 24 horas x 7 días.\n\nUso humano\nMetamizol sodico 300 mg (Comprimido):\nDar vía oral 2 comprimidos cada 12 horas x 5 días."} />

            <View style={styles.rxActionRow}>
              <Button mode="contained" onPress={handleSaveRx} style={{ flex: 1, marginRight: 8 }}>
                Guardar
              </Button>
              <Button mode="outlined" onPress={() => { handleSaveRx().then(() => { if (id) { const latest = prescriptions[0]; if (latest) handleSendRxEmail(latest); } }); }} style={{ flex: 1 }}>
                Guardar + Enviar
              </Button>
            </View>
            <Button mode="text" onPress={() => setShowRxModal(false)} style={{ marginTop: 4 }}>Cerrar</Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Modal: Ver Receta */}
      <Portal>
        <Modal visible={!!selectedRx} onDismiss={() => setSelectedRx(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          {selectedRx && (
            <ScrollView>
              <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Receta</Text>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRx.issued_at).toLocaleDateString('es-CL')}</Text>
              </View>
              {selectedRx.veterinarian_name && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Prescriptor:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRx.veterinarian_name}</Text>
                </View>
              )}
              {selectedRx.clinic_branch && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sucursal:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRx.clinic_branch}</Text>
                </View>
              )}
              <Card style={[styles.rxBodyCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Card.Content>
                  <Text style={[styles.rxBodyText, { color: colors.text }]}>{selectedRx.prescription_body}</Text>
                </Card.Content>
              </Card>
              <View style={styles.detailActions}>
                <Button mode="contained" compact onPress={() => handleSendRxEmail(selectedRx)} style={{ marginRight: 8 }}>
                  Enviar por correo
                </Button>
                <Button mode="outlined" compact onPress={() => setSelectedRx(null)}>
                  Cerrar
                </Button>
              </View>
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
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
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
  detailActions: { marginTop: 12 },
  lastAnamnesisCard: { marginBottom: 12, borderRadius: 8, borderWidth: 1 },
  lastAnamnesisLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  lastAnamnesisText: { fontSize: 13, lineHeight: 18 },
  emptyRx: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyText: { fontSize: 13 },
  rxCard: { marginBottom: 8, borderRadius: 10, borderLeftWidth: 3 },
  rxRow: { flexDirection: 'row', alignItems: 'center' },
  rxInfo: { flex: 1 },
  rxDate: { fontSize: 11 },
  rxVet: { fontWeight: '600', fontSize: 13, marginTop: 2 },
  rxPreview: { fontSize: 12, marginTop: 2 },
  rxActions: { flexDirection: 'row' },
  rxPreviewCard: { marginBottom: 12, borderRadius: 8, borderWidth: 1 },
  rxPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rxPreviewName: { fontWeight: '700', fontSize: 15 },
  rxPreviewDetail: { fontSize: 12, marginTop: 2 },
  rxPreviewTutor: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  rxPreviewTutorText: { fontSize: 12 },
  rxActionRow: { flexDirection: 'row', marginTop: 8 },
  rxBodyCard: { marginTop: 8, marginBottom: 8, borderRadius: 8, borderWidth: 1 },
  rxBodyText: { lineHeight: 22, whiteSpace: 'pre-wrap' },
});
