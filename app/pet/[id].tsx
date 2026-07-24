import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, TextInput, Portal, Modal, Dialog, Divider } from 'react-native-paper';

import { useLocalSearchParams } from 'expo-router';
import { usePet, useClinicalRecords, usePrescriptions } from '../../hooks/useDirectus';
import { ClinicalRecord, Prescription } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { calculateAge } from '../../utils/age';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import ClinicalTabs, { ClinicalTabType } from '../../components/ClinicalTabs';
import PetHeader from '../../components/pet/PetHeader';
import ClinicalHistory from '../../components/pet/ClinicalHistory';
import RecentRecord from '../../components/pet/RecentRecord';
import RecordTimeline from '../../components/pet/RecordTimeline';
import PrescriptionList from '../../components/pet/PrescriptionList';
import VoiceNotes from '../../components/VoiceNotes';
export default function PetDetailScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pet, loading } = usePet(id || null);
  const { records, loading: recordsLoading, addRecord, removeRecord } = useClinicalRecords(id || undefined);
  const { prescriptions, loading: rxLoading, addPrescription, sendEmail } = usePrescriptions(id || undefined);
  const [activeTab, setActiveTab] = useState<ClinicalTabType>('historial');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [rxLinkedRecordId, setRxLinkedRecordId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [deleteRecordTarget, setDeleteRecordTarget] = useState<ClinicalRecord | null>(null);
  const [recordType, setRecordType] = useState<ClinicalRecord['record_type']>('consulta');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 16));
  const [recordVet, setRecordVet] = useState('');
  const [recordNotes, setRecordNotes] = useState('');
  const [recordWeight, setRecordWeight] = useState('');
  const [recordMotivoConsulta, setRecordMotivoConsulta] = useState('');
  const [recordAnamnesis, setRecordAnamnesis] = useState('');
  const [recordHallazgos, setRecordHallazgos] = useState('');
  const [recordVitalTemp, setRecordVitalTemp] = useState('');
  const [recordVitalFC, setRecordVitalFC] = useState('');
  const [recordVitalFR, setRecordVitalFR] = useState('');
  const [recordVitalPA, setRecordVitalPA] = useState('');
  const [recordVitalSpO2, setRecordVitalSpO2] = useState('');
  const [rxVet, setRxVet] = useState('');
  const [rxBranch, setRxBranch] = useState('Casa Matriz');
  const [rxBody, setRxBody] = useState('');
  const [rxFormat, setRxFormat] = useState('standard');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<Prescription | null>(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const counts = useMemo(() => ({
    historial: records.length,
    consultas: records.filter(r => r.record_type === 'consulta').length,
    vacunas: records.filter(r => r.record_type === 'vacuna').length,
    cirugias: records.filter(r => r.record_type === 'cirugia').length,
    recetas: prescriptions.length,
  }), [records, prescriptions]);

  const mostRecentRecord = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0] || null;
  }, [records]);

  const lastAnamnesis = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const r of sorted) { if (r.details?.anamnesis) return r; }
    return null;
  }, [records]);

  const filteredRecords = activeTab === 'historial' ? records : activeTab === 'recetas' ? records : records.filter(r => r.record_type === activeTab.slice(0, -1));
  const filteredPrescriptions = activeTab === 'recetas' ? prescriptions : [];
  const clinicalFieldCount = useMemo(() => {
    if (!pet) return 0;
    let count = 0;
    if (pet.motivo_consulta) count++;
    if (pet.anamnesis) count++;
    if (pet.allergies && pet.allergies.length > 0) count++;
    if (pet.habitat) count++;
    if (pet.food) count++;
    if (pet.food_frequency) count++;
    if (pet.water_consumption) count++;
    if (pet.urination) count++;
    if (pet.lives_with_other_animals) count++;
    if (pet.entorno) count++;
    if (pet.areneros) count++;
    if (pet.vaccines) count++;
    if (pet.deworming) count++;
    if (pet.flea_treatment) count++;
    if (pet.last_heat) count++;
    if (pet.surgeries) count++;
    if (pet.other_diseases) count++;
    if (pet.medications) count++;
    if (pet.vital_signs) count++;
    if (pet.hallazgos_examen_fisico) count++;
    if (pet.notes) count++;
    return count;
  }, [pet]);

  const handleAddRecord = async () => {
    if (!recordNotes.trim()) { setErrorDialog('Las notas son obligatorias'); return; }
    if (!id) return; setSaving(true);
    try {
      await addRecord({
        pet_id: id, record_type: recordType, date: new Date(recordDate).toISOString(),
        veterinarian: recordVet.trim() || null,
        details: { notes: recordNotes.trim(), weight: recordWeight ? parseFloat(recordWeight) : undefined,
          motivo_consulta: recordMotivoConsulta.trim() || undefined, anamnesis: recordAnamnesis.trim() || undefined,
          hallazgos_examen_fisico: recordHallazgos.trim() || undefined,
          vital_signs: { temperature: recordVitalTemp ? parseFloat(recordVitalTemp) : undefined,
            heart_rate: recordVitalFC ? parseInt(recordVitalFC) : undefined,
            respiratory_rate: recordVitalFR ? parseInt(recordVitalFR) : undefined,
            blood_pressure: recordVitalPA.trim() || undefined,
            spo2: recordVitalSpO2 ? parseInt(recordVitalSpO2) : undefined },
        },
      });
      setRecordNotes(''); setRecordVet(''); setRecordWeight(''); setRecordMotivoConsulta('');
      setRecordAnamnesis(''); setRecordHallazgos(''); setRecordVitalTemp('');
      setRecordVitalFC(''); setRecordVitalFR(''); setRecordVitalPA(''); setRecordVitalSpO2('');
      setShowRecordModal(false);
    } catch { setErrorDialog('No se pudo guardar el registro'); } finally { setSaving(false); }
  };

  const openRxModal = (linkedRecordId?: string) => {
    setRxLinkedRecordId(linkedRecordId || null); setRxVet(lastAnamnesis?.veterinarian || user?.name || '');
    setRxBranch(''); setRxFormat('standard'); setRxBody(''); setShowRxModal(true);
  };

  const handleSaveRx = async () => {
    if (!rxBody.trim()) { setErrorDialog('El cuerpo de la receta es obligatorio'); return; }
    if (!id) return; setSaving(true);
    try {
      await addPrescription({
        pet_id: id, user_id: user?.id || '', clinical_record_id: rxLinkedRecordId || null,
        veterinarian_name: rxVet.trim() || null, clinic_branch: rxBranch.trim() || null,
        prescription_body: rxBody.trim(), format: rxFormat, status: 'active', issued_at: new Date().toISOString(),
      });
      setShowRxModal(false);
    } catch { setErrorDialog('No se pudo guardar la receta'); } finally { setSaving(false); }
  };

  const handleSendRxEmail = async (rx: Prescription) => { setEmailTarget(rx); setEmailRecipient(pet?.email || ''); setShowEmailModal(true); };
  const confirmSendEmail = async () => {
    if (!emailTarget) return; setSendingEmail(true);
    try { await sendEmail(emailTarget.id); setShowEmailModal(false); setEmailTarget(null); }
    catch (error: any) { setErrorDialog(error.message || 'No se pudo enviar el correo'); } finally { setSendingEmail(false); }
  };
  const confirmDeleteRecord = async () => {
    if (!deleteRecordTarget) return;
    try { await removeRecord(deleteRecordTarget.id); setDeleteRecordTarget(null); setSelectedRecord(null); }
    catch { setErrorDialog('No se pudo eliminar el registro'); }
  };
  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando...</Text></View>;
  if (!pet) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Paciente no encontrado</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <PetHeader pet={pet} onEdit={() => {}} onCall={() => {}} onEmail={() => {}} />
      <ClinicalHistory pet={pet} fieldCount={clinicalFieldCount} />
      {mostRecentRecord && <RecentRecord record={mostRecentRecord} onView={() => setSelectedRecord(mostRecentRecord)} onGenerateRx={() => openRxModal(mostRecentRecord.id)} />}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historial Completo</Text>
          <View style={styles.headerButtons}>
            <Button mode="outlined" compact onPress={() => openRxModal()} style={{ marginRight: 8 }}>Receta</Button>
            <Button mode="contained" compact onPress={() => setShowRecordModal(true)}>Agregar</Button>
          </View>
        </View>
        <ClinicalTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        {activeTab === 'recetas' ? (
          rxLoading ? <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando recetas...</Text> : <PrescriptionList prescriptions={filteredPrescriptions} onView={setSelectedRx} onSendEmail={handleSendRxEmail} />
        ) : recordsLoading ? <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Cargando registros...</Text> : <RecordTimeline records={filteredRecords} onViewRecord={setSelectedRecord} />}
      </View>

      {/* Modal: Nuevo Registro */}
      <Portal>
        <Modal visible={showRecordModal} onDismiss={() => setShowRecordModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nueva Consulta</Text>
            <View style={styles.typeRow}>
              {(['consulta', 'vacuna', 'cirugia', 'control'] as const).map((t) => (
                <Button key={t} mode={recordType === t ? 'contained' : 'outlined'} compact onPress={() => setRecordType(t)} style={styles.typeBtn}>{t.charAt(0).toUpperCase() + t.slice(1)}</Button>
              ))}
            </View>
            <TextInput label="Fecha y hora" value={recordDate} onChangeText={setRecordDate} mode="outlined" style={styles.input} />
            <TextInput label="Veterinario (opcional)" value={recordVet} onChangeText={setRecordVet} mode="outlined" style={styles.input} />
            <TextInput label="Peso (kg, opcional)" value={recordWeight} onChangeText={setRecordWeight} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="Motivo de consulta" value={recordMotivoConsulta} onChangeText={setRecordMotivoConsulta} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <TextInput label="Anamnesis" value={recordAnamnesis} onChangeText={setRecordAnamnesis} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <VoiceNotes onTranscription={(text) => setRecordNotes(text)} onSoapParsed={(soapData) => { const parts: string[] = []; if (soapData.subjective) parts.push("S: " + soapData.subjective); if (soapData.objective) parts.push("O: " + soapData.objective); if (soapData.assessment) parts.push("A: " + soapData.assessment); if (soapData.plan) parts.push("P: " + soapData.plan); if (parts.length > 0) setRecordNotes(parts.join('\n\n')); }} />
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Constantes fisiologicas</Text>
            <View style={styles.rxFieldRow}><View style={styles.rxFieldHalf}><TextInput label="Temp (C)" value={recordVitalTemp} onChangeText={setRecordVitalTemp} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View><View style={styles.rxFieldHalf}><TextInput label="FC (lpm)" value={recordVitalFC} onChangeText={setRecordVitalFC} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View></View>
            <View style={styles.rxFieldRow}><View style={styles.rxFieldHalf}><TextInput label="FR (rpm)" value={recordVitalFR} onChangeText={setRecordVitalFR} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View><View style={styles.rxFieldHalf}><TextInput label="PA (mmHg)" value={recordVitalPA} onChangeText={setRecordVitalPA} mode="outlined" style={styles.rxInput} /></View></View>
            <TextInput label="SpO2 (%)" value={recordVitalSpO2} onChangeText={setRecordVitalSpO2} mode="outlined" style={styles.input} keyboardType="numeric" />
            <TextInput label="Hallazgos examen fisico" value={recordHallazgos} onChangeText={setRecordHallazgos} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <TextInput label="Notas *" value={recordNotes} onChangeText={setRecordNotes} mode="outlined" multiline numberOfLines={4} style={styles.input} />
            <Button mode="contained" onPress={handleAddRecord} style={styles.saveButton} loading={saving} disabled={saving}>Guardar Registro</Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Modal: Detalle de Registro */}
      <Portal>
        <Modal visible={!!selectedRecord} onDismiss={() => setSelectedRecord(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          {selectedRecord && (
            <ScrollView>
              <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Detalle del Registro</Text>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.record_type}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRecord.date).toLocaleString('es-CL')}</Text></View>
              {selectedRecord.veterinarian && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Veterinario:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.veterinarian}</Text></View>}
              {selectedRecord.details?.weight && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Peso:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.details.weight} kg</Text></View>}
              {selectedRecord.details?.notes && <View style={{ marginBottom: 8 }}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notas:</Text><Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.notes}</Text></View>}
              <View style={styles.detailActions}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button mode="contained" compact onPress={() => { setSelectedRecord(null); openRxModal(selectedRecord.id); }}>Generar Receta</Button>
                  <Button mode="outlined" compact onPress={() => setDeleteRecordTarget(selectedRecord)} textColor={colors.error}>Eliminar</Button>
                </View>
                <Button mode="outlined" onPress={() => setSelectedRecord(null)} style={{ marginTop: 8 }}>Cerrar</Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
      {/* Modal: Nueva Receta */}
      <Portal>
        <Modal visible={showRxModal} onDismiss={() => setShowRxModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nueva Receta</Text>
            <View style={styles.rxInfoRow}>
              <View style={styles.rxInfoCol}>
                <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Paciente</Text>
                <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.name}</Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.species === 'dog' ? 'Canino' : 'Felino'} - {pet.breed || 'N/D'}</Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>Edad: {calculateAge(pet.birth_date)}</Text>
              </View>
              <View style={styles.rxInfoCol}>
                <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Propietario</Text>
                <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.tutor_name || 'N/D'}</Text>
                {pet.email && <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.email}</Text>}
                {pet.phone && <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.phone}</Text>}
              </View>
            </View>
            <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}><Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Sucursal</Text><TextInput placeholder="Clinica Central" value={rxBranch} onChangeText={setRxBranch} mode="outlined" dense style={styles.rxInput} /></View>
              <View style={styles.rxFieldHalf}>
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Formato</Text>
                <View style={styles.rxSelectRow}>
                  {[{ value: 'standard', label: 'Estandar' }, { value: 'compact', label: 'Compacto' }].map(f => (
                    <Button key={f.value} mode={rxFormat === f.value ? 'contained' : 'outlined'} onPress={() => setRxFormat(f.value)} style={[styles.rxSelectBtn, rxFormat === f.value && { backgroundColor: colors.primary }]} labelStyle={[styles.rxSelectLabel, rxFormat === f.value ? { color: '#FFF' } : { color: colors.primary }]} compact>{f.label}</Button>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}><Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Prescriptor</Text><TextInput value={rxVet} onChangeText={setRxVet} mode="outlined" dense placeholder="Nombre del veterinario" style={styles.rxInput} /></View>
              <View style={styles.rxFieldHalf}><Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Fecha Emision</Text><TextInput value={new Date().toLocaleDateString('es-CL')} mode="outlined" dense disabled style={styles.rxInput} /></View>
            </View>
            <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Receta *</Text>
            <TextInput value={rxBody} onChangeText={setRxBody} mode="outlined" multiline numberOfLines={12} style={styles.rxBodyInput} placeholder={"Uso Veterinario\nRimadyl:\nDar via oral 1 comprimido cada 24 horas x 7 dias."} />
            <View style={styles.rxActionRow}>
              <Button mode="outlined" onPress={() => setShowRxModal(false)} style={{ flex: 1, marginRight: 8 }}>Volver</Button>
              <Button mode="contained" onPress={handleSaveRx} style={{ flex: 1 }} loading={saving} disabled={saving} icon="content-save">Guardar</Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Modal: Ver Receta */}
      <Portal>
        <Modal visible={!!selectedRx} onDismiss={() => setSelectedRx(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          {selectedRx && (
            <ScrollView>
              <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Receta</Text>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRx.issued_at).toLocaleDateString('es-CL')}</Text></View>
              {selectedRx.veterinarian_name && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Prescriptor:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRx.veterinarian_name}</Text></View>}
              {selectedRx.clinic_branch && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sucursal:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRx.clinic_branch}</Text></View>}
              <View style={[styles.rxBodyCard, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={{ color: colors.text, lineHeight: 22 }}>{selectedRx.prescription_body}</Text></View>
              <View style={styles.detailActions}>
                <Button mode="contained" compact onPress={() => handleSendRxEmail(selectedRx)} style={{ marginRight: 8 }}>Enviar por correo</Button>
                <Button mode="outlined" compact onPress={() => setSelectedRx(null)}>Cerrar</Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Modal: Enviar Correo */}
      <Portal>
        <Modal visible={showEmailModal} onDismiss={() => setShowEmailModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.emailHeader}>
              <DynamicIcon name="email-outline" size={28} color={colors.primary} />
              <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Enviar por correo</Text>
            </View>
            {emailTarget && (
              <>
                <View style={styles.rxInfoRow}>
                  <View style={styles.rxInfoCol}>
                    <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Paciente</Text>
                    <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.name}</Text>
                    <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.species === 'dog' ? 'Canino' : 'Felino'} - {pet.breed || 'N/D'}</Text>
                  </View>
                  <View style={styles.rxInfoCol}>
                    <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Propietario</Text>
                    <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.tutor_name || 'N/D'}</Text>
                    {pet.phone && <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.phone}</Text>}
                  </View>
                </View>
                <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Vista previa</Text>
                <View style={[styles.emailPreviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={{ color: colors.text }}>{emailTarget.prescription_body}</Text></View>
                <TextInput label="Correo del destinatario" value={emailRecipient} onChangeText={setEmailRecipient} mode="outlined" keyboardType="email-address" style={styles.rxInput} left={<TextInput.Icon icon="email" />} />
                <View style={styles.rxActionRow}>
                  <Button mode="outlined" onPress={() => setShowEmailModal(false)} style={{ flex: 1, marginRight: 8 }}>Cancelar</Button>
                  <Button mode="contained" onPress={confirmSendEmail} style={{ flex: 1 }} loading={sendingEmail} disabled={sendingEmail || !emailRecipient.trim()} icon="send">Enviar</Button>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Dialogs */}
      <Portal>
        <Dialog visible={!!deleteRecordTarget} onDismiss={() => setDeleteRecordTarget(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Eliminar registro</Dialog.Title>
          <Dialog.Content><Text style={{ textAlign: 'center' }}>Estas seguro? Esta accion no se puede deshacer.</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setDeleteRecordTarget(null)}>Cancelar</Button><Button onPress={confirmDeleteRecord} textColor={colors.error}>Eliminar</Button></Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={!!errorDialog} onDismiss={() => setErrorDialog(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Error</Dialog.Title>
          <Dialog.Content><Text style={{ textAlign: 'center' }}>{errorDialog}</Text></Dialog.Content>
          <Dialog.Actions><Button onPress={() => setErrorDialog(null)}>OK</Button></Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { textAlign: 'center', marginTop: 40 },
  section: { marginHorizontal: 20, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, minWidth: 70 },
  input: { marginBottom: 8 },
  saveButton: { marginTop: 8 },
  subTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 12 },
  modal: { padding: 20, margin: 16, borderRadius: 20, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { width: 100, fontSize: 13 },
  detailValue: { fontWeight: '600', flex: 1, fontSize: 13 },
  detailActions: { marginTop: 12 },
  rxInfoRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  rxInfoCol: { flex: 1 },
  rxInfoSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  rxInfoName: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  rxInfoDetail: { fontSize: 12, lineHeight: 18 },
  rxDivider: { marginVertical: 12 },
  rxFieldRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  rxFieldHalf: { flex: 1 },
  rxFieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  rxSelectRow: { flexDirection: 'row', gap: 8 },
  rxSelectBtn: { flex: 1 },
  rxSelectLabel: { fontSize: 12 },
  rxInput: { marginBottom: 8 },
  rxBodyInput: { marginBottom: 12, minHeight: 200 },
  rxActionRow: { flexDirection: 'row', marginTop: 12 },
  rxBodyCard: { marginTop: 8, marginBottom: 8, borderRadius: 8, borderWidth: 1, padding: 12 },
  emailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  emailPreviewCard: { marginBottom: 12, borderRadius: 8, borderWidth: 1, padding: 12 },
});
