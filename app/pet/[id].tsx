import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Platform, Alert } from 'react-native';
import { Text, Button, TextInput, Portal, Modal, Dialog, Divider } from 'react-native-paper';

import { useLocalSearchParams } from 'expo-router';
import { usePet, useClinicalRecords, usePrescriptions } from '../../hooks/useDirectus';
import { ClinicalRecord, Prescription } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { calculateAge } from '../../utils/age';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ClinicalTabs, { ClinicalTabType } from '../../components/ClinicalTabs';
import PetHeader from '../../components/pet/PetHeader';
import ClinicalHistory from '../../components/pet/ClinicalHistory';
import RecentRecord from '../../components/pet/RecentRecord';
import RecordTimeline from '../../components/pet/RecordTimeline';
import PrescriptionList from '../../components/pet/PrescriptionList';
import WeightChart from '../../components/pet/WeightChart';
import RecordDetail from '../../components/pet/RecordDetail';
import AlertBanner from '../../components/pet/AlertBanner';
import VitalSignsForm from '../../components/pet/VitalSignsForm';
import PaymentForm from '../../components/pet/PaymentForm';
import VoiceNotes from '../../components/VoiceNotes';
import DynamicIcon from '../../components/ui/DynamicIcon';
import { authHeaders } from '../../services/auth';
import { uploadPetPhoto } from '../../services/cloudinary';
import * as ImagePicker from 'expo-image-picker';

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
  const [recordAssessment, setRecordAssessment] = useState('');
  const [recordPlan, setRecordPlan] = useState('');
  const [recordTreatment, setRecordTreatment] = useState('');
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
  const [showVitals, setShowVitals] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [recordProcedimiento, setRecordProcedimiento] = useState('');
  const [recordDescripcion, setRecordDescripcion] = useState('');
  const [recordPostoperatorio, setRecordPostoperatorio] = useState('');
  const [recordFiles, setRecordFiles] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

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
    if (!recordAssessment.trim() && !recordTreatment.trim()) { setErrorDialog('La evaluacion o tratamiento son obligatorios'); return; }
    if (!id) return; setSaving(true);
    try {
      const details: any = {
        notes: recordAssessment.trim() || undefined,
        assessment: recordAssessment.trim() || undefined,
        plan: recordPlan.trim() || undefined,
        treatment: recordTreatment.trim() || undefined,
        weight: recordWeight ? parseFloat(recordWeight) : undefined,
        motivo_consulta: recordMotivoConsulta.trim() || undefined,
        anamnesis: recordAnamnesis.trim() || undefined,
        hallazgos_examen_fisico: recordHallazgos.trim() || undefined,
        vital_signs: { temperature: recordVitalTemp ? parseFloat(recordVitalTemp) : undefined,
          heart_rate: recordVitalFC ? parseInt(recordVitalFC) : undefined,
          respiratory_rate: recordVitalFR ? parseInt(recordVitalFR) : undefined,
          blood_pressure: recordVitalPA.trim() || undefined,
          spo2: recordVitalSpO2 ? parseInt(recordVitalSpO2) : undefined },
      };
      if (recordType === 'cirugia') {
        details.procedimiento = recordProcedimiento.trim() || undefined;
        details.descripcion = recordDescripcion.trim() || undefined;
        details.postoperatorio = recordPostoperatorio.trim() || undefined;
        if (recordFiles.length > 0) details.files = recordFiles;
      }
      await addRecord({
        pet_id: id, record_type: recordType, date: new Date(recordDate).toISOString(),
        veterinarian: recordVet.trim() || null,
        details,
      });
      resetForm();
      setShowRecordModal(false);
    } catch { setErrorDialog('No se pudo guardar el registro'); } finally { setSaving(false); }
  };

  const resetForm = () => {
    setRecordAssessment(''); setRecordPlan(''); setRecordTreatment('');
    setRecordVet(''); setRecordWeight(''); setRecordMotivoConsulta('');
    setRecordAnamnesis(''); setRecordHallazgos(''); setRecordVitalTemp('');
    setRecordVitalFC(''); setRecordVitalFR(''); setRecordVitalPA(''); setRecordVitalSpO2('');
    setRecordProcedimiento(''); setRecordDescripcion(''); setRecordPostoperatorio('');
    setRecordFiles([]);
  };

  const openRxModal = (linkedRecordId?: string) => {
    setRxLinkedRecordId(linkedRecordId || null); setRxVet(lastAnamnesis?.veterinarian || user?.name || '');
    setRxBranch(''); setRxFormat('standard'); setRxBody(''); setShowRxModal(true);
  };

  const handleUploadFile = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galeria para subir archivos.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setUploadingFile(true);
      const url = await uploadPetPhoto(result.assets[0].uri);
      setRecordFiles(prev => [...prev, url]);
    } catch { Alert.alert('Error', 'No se pudo subir el archivo'); }
    finally { setUploadingFile(false); }
  };

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8055';
      const headers = await authHeaders();
      const response = await fetch(`${baseUrl}/items/pets/${id}/file-pdf`, { headers });
      if (!response.ok) throw new Error('Error generating PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ficha_${pet?.name || 'paciente'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch { setErrorDialog('No se pudo generar el PDF'); }
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

  const handleDownloadRecipePdf = async (rx: Prescription) => {
    if (!id) return;
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8055';
      const headers = await authHeaders();
      const response = await fetch(`${baseUrl}/items/pets/${id}/prescriptions/${rx.id}/pdf`, { headers });
      if (!response.ok) throw new Error('Error generating PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receta_${pet?.name || 'paciente'}_${new Date(rx.issued_at).toLocaleDateString('es-CL').replace(/\//g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch { setErrorDialog('No se pudo generar el PDF de la receta'); }
  };
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
  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg, width: '90%' }} /></View>;
  if (!pet) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Paciente no encontrado</Text></View>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <PetHeader pet={pet} onEdit={() => {}} onCall={() => {}} onEmail={() => {}} />
      <AlertBanner pet={pet} />
      <ClinicalHistory pet={pet} fieldCount={clinicalFieldCount} />
      {mostRecentRecord && <RecentRecord record={mostRecentRecord} onView={() => setSelectedRecord(mostRecentRecord)} onGenerateRx={() => openRxModal(mostRecentRecord.id)} />}
      <WeightChart records={records} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historial Completo</Text>
          <View style={styles.headerButtons}>
            <Button mode="outlined" compact onPress={() => setShowVitals(true)} style={{ marginRight: 8 }}>Signos</Button>
            <Button mode="outlined" compact onPress={() => setShowPayment(true)} style={{ marginRight: 8 }}>Cobrar</Button>
            <Button mode="outlined" compact onPress={() => openRxModal()} style={{ marginRight: 8 }}>Receta</Button>
            <Button mode="outlined" compact onPress={handleDownloadPdf} style={{ marginRight: 8, borderColor: colors.info }}>Ficha PDF</Button>
            <Button mode="contained" compact onPress={() => setShowRecordModal(true)}>Agregar</Button>
          </View>
        </View>
        <ClinicalTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        {activeTab === 'recetas' ? (
          rxLoading ? <SkeletonCard style={{ marginTop: SPACING.md }} /> : <PrescriptionList prescriptions={filteredPrescriptions} onView={setSelectedRx} onSendEmail={handleSendRxEmail} onDownloadPdf={handleDownloadRecipePdf} />
        ) : recordsLoading ? <SkeletonCard style={{ marginTop: SPACING.md }} /> : <RecordTimeline records={filteredRecords} onViewRecord={setSelectedRecord} />}
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

            {/* SOAP: Subjective */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Subjetivo</Text>
            <TextInput label="Motivo de consulta" value={recordMotivoConsulta} onChangeText={setRecordMotivoConsulta} mode="outlined" multiline numberOfLines={2} style={styles.input} />
            <TextInput label="Anamnesis" value={recordAnamnesis} onChangeText={setRecordAnamnesis} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <VoiceNotes onTranscription={(text) => setRecordAssessment(text)} onSoapParsed={(soapData) => { if (soapData.subjective) setRecordAnamnesis(soapData.subjective); if (soapData.objective) setRecordHallazgos(soapData.objective); if (soapData.assessment) setRecordAssessment(soapData.assessment); if (soapData.plan) setRecordPlan(soapData.plan); }} />

            {/* SOAP: Objective */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.info }]}>Objetivo</Text>
            <TextInput label="Hallazgos examen fisico" value={recordHallazgos} onChangeText={setRecordHallazgos} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Constantes fisiologicas</Text>
            <View style={styles.rxFieldRow}><View style={styles.rxFieldHalf}><TextInput label="Temp (C)" value={recordVitalTemp} onChangeText={setRecordVitalTemp} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View><View style={styles.rxFieldHalf}><TextInput label="FC (lpm)" value={recordVitalFC} onChangeText={setRecordVitalFC} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View></View>
            <View style={styles.rxFieldRow}><View style={styles.rxFieldHalf}><TextInput label="FR (rpm)" value={recordVitalFR} onChangeText={setRecordVitalFR} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View><View style={styles.rxFieldHalf}><TextInput label="PA (mmHg)" value={recordVitalPA} onChangeText={setRecordVitalPA} mode="outlined" style={styles.rxInput} /></View></View>
            <TextInput label="SpO2 (%)" value={recordVitalSpO2} onChangeText={setRecordVitalSpO2} mode="outlined" style={styles.input} keyboardType="numeric" />

            {/* SOAP: Assessment */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.warning }]}>Evaluacion</Text>
            <TextInput label="Diagnostico / Evaluacion" value={recordAssessment} onChangeText={setRecordAssessment} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            {/* SOAP: Plan */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.success }]}>Plan</Text>
            <TextInput label="Plan / Indicaciones" value={recordPlan} onChangeText={setRecordPlan} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            {/* SOAP: Treatment */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Tratamiento</Text>
            <TextInput label="Tratamiento indicado" value={recordTreatment} onChangeText={setRecordTreatment} mode="outlined" multiline numberOfLines={3} placeholder="Medicamentos, dosis, duracion..." style={styles.input} />

            {/* Cirugia: Campos especificos */}
            {recordType === 'cirugia' && (
              <View style={{ marginTop: SPACING.md }}>
                <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
                <Text variant="titleSmall" style={[styles.subTitle, { color: colors.error }]}>Datos de Cirugia</Text>
                <TextInput label="Nombre de procedimiento" value={recordProcedimiento} onChangeText={setRecordProcedimiento} mode="outlined" style={styles.input} placeholder="Ej: Esterilizacion, LDA, Toracotomia..." />
                <TextInput label="Descripcion del procedimiento" value={recordDescripcion} onChangeText={setRecordDescripcion} mode="outlined" multiline numberOfLines={4} style={styles.input} placeholder="Detalles tecnicos del procedimiento..." />
                <TextInput label="Indicaciones postoperatorias" value={recordPostoperatorio} onChangeText={setRecordPostoperatorio} mode="outlined" multiline numberOfLines={4} style={styles.input} placeholder="Cuidados, medicacion, controles..." />

                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Archivos (imagenes / PDF)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {recordFiles.map((fileUrl, idx) => (
                    <TouchableOpacity key={idx} style={[styles.fileChip, { backgroundColor: colors.primaryContainer, borderColor: colors.border }]} onPress={() => { setRecordFiles(prev => prev.filter((_, i) => i !== idx)); }}>
                      {fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <Image source={{ uri: fileUrl }} style={styles.fileThumb} />
                      ) : (
                        <DynamicIcon name="file-pdf-box" size={24} color={colors.error} />
                      )}
                      <DynamicIcon name="close-circle" size={16} color={colors.error} />
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={[styles.fileUploadBtn, { borderColor: colors.primary }]} onPress={handleUploadFile} disabled={uploadingFile}>
                    {uploadingFile ? (
                      <DynamicIcon name="loading" size={20} color={colors.primary} />
                    ) : (
                      <>
                        <DynamicIcon name="plus-circle-outline" size={20} color={colors.primary} />
                        <Text style={[styles.fileUploadText, { color: colors.primary }]}>Agregar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
              <RecordDetail record={selectedRecord} />
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

      {/* VitalSignsForm */}
      <VitalSignsForm petId={id || ''} visible={showVitals} onClose={() => setShowVitals(false)} />

      {/* PaymentForm */}
      <PaymentForm visible={showPayment} onClose={() => setShowPayment(false)} petId={id} />

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
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, minWidth: 70 },
  input: { marginBottom: 8 },
  saveButton: { marginTop: 8 },
  subTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: 8, marginTop: 12 },
  modal: { padding: 20, margin: 16, borderRadius: 20, maxHeight: '85%' },
  modalTitle: { fontWeight: TYPOGRAPHY.weights.bold, marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { minWidth: 100, fontSize: TYPOGRAPHY.sizes.sm },
  detailValue: { fontWeight: TYPOGRAPHY.weights.semibold, flex: 1, fontSize: TYPOGRAPHY.sizes.sm },
  detailActions: { marginTop: 12 },
  rxInfoRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  rxInfoCol: { flex: 1 },
  rxInfoSectionTitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  rxInfoName: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.base, marginBottom: 2 },
  rxInfoDetail: { fontSize: TYPOGRAPHY.sizes.xs, lineHeight: 18 },
  rxDivider: { marginVertical: 12 },
  rxFieldRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  rxFieldHalf: { flex: 1 },
  rxFieldLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: 8 },
  rxSelectRow: { flexDirection: 'row', gap: 8 },
  rxSelectBtn: { flex: 1 },
  rxSelectLabel: { fontSize: TYPOGRAPHY.sizes.xs },
  rxInput: { marginBottom: 8 },
  rxBodyInput: { marginBottom: 12, minHeight: 200 },
  rxActionRow: { flexDirection: 'row', marginTop: 12 },
  rxBodyCard: { marginTop: 8, marginBottom: 8, borderRadius: 8, borderWidth: 1, padding: 12 },
  emailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  emailPreviewCard: { marginBottom: 12, borderRadius: 8, borderWidth: 1, padding: 12 },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1 },
  fileThumb: { width: 32, height: 32, borderRadius: 4 },
  fileUploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderStyle: 'dashed' },
  fileUploadText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
});
