import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { Text, TextInput, Portal, Dialog, Divider } from 'react-native-paper';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePet, useClinicalRecords, usePrescriptions } from '../../hooks/useDirectus';
import { ClinicalRecord, Prescription } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { calculateAge } from '../../utils/age';
import { toLocalDateTimeInput, parseLocalDateTime } from '../../utils/date';
import { parseVitals } from '../../utils/vitals';
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
import { useToast } from '../../components/ui/VToast';
import VModal from '../../components/ui/VModal';
import DisplayText from '../../components/ui/DisplayText';
import VButton from '../../components/ui/Button';
import VBadge from '../../components/ui/Badge';
import { Plus, FileText, Wallet, HeartPulse, Download } from 'lucide-react-native';

const RECORD_TYPE_LABELS = { consulta: 'Consulta', vacuna: 'Vacuna', cirugia: 'Cirugía', control: 'Control' } as const;
import { authHeaders, apiFetch } from '../../services/auth';
import { API_URL } from '../../config';
import { uploadPetPhoto } from '../../services/cloudinary';
import * as ImagePicker from 'expo-image-picker';

export default function PetDetailScreen() {
  const router = useRouter();
  const { colors, onPrimaryText, onAccentText } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
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
  const [recordDate, setRecordDate] = useState(() => toLocalDateTimeInput());
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
    if (!recordAssessment.trim() && !recordTreatment.trim()) { setErrorDialog('La evaluación o el tratamiento son obligatorios'); return; }
    const when = parseLocalDateTime(recordDate);
    if (!when) { setErrorDialog('Fecha inválida. Usa el formato AAAA-MM-DD HH:MM'); return; }
    const { values: vitals, error: vitalsError } = parseVitals({
      weight: recordWeight, temperature: recordVitalTemp, heart_rate: recordVitalFC,
      respiratory_rate: recordVitalFR, spo2: recordVitalSpO2,
    });
    if (vitalsError) { setErrorDialog(vitalsError); return; }
    if (!id) return; setSaving(true);
    try {
      const details: any = {
        notes: recordAssessment.trim() || undefined,
        assessment: recordAssessment.trim() || undefined,
        plan: recordPlan.trim() || undefined,
        treatment: recordTreatment.trim() || undefined,
        weight: vitals.weight,
        motivo_consulta: recordMotivoConsulta.trim() || undefined,
        anamnesis: recordAnamnesis.trim() || undefined,
        hallazgos_examen_fisico: recordHallazgos.trim() || undefined,
        vital_signs: {
          temperature: vitals.temperature,
          heart_rate: vitals.heart_rate,
          respiratory_rate: vitals.respiratory_rate,
          blood_pressure: recordVitalPA.trim() || undefined,
          spo2: vitals.spo2,
        },
      };
      if (recordType === 'cirugia') {
        details.procedimiento = recordProcedimiento.trim() || undefined;
        details.descripcion = recordDescripcion.trim() || undefined;
        details.postoperatorio = recordPostoperatorio.trim() || undefined;
        if (recordFiles.length > 0) details.files = recordFiles;
      }
      await addRecord({
        pet_id: id, record_type: recordType, date: when.toISOString(),
        veterinarian: recordVet.trim() || null,
        details,
      });
      resetForm();
      setShowRecordModal(false);
    } catch (e: any) { setErrorDialog(e?.message || 'No se pudo guardar el registro'); } finally { setSaving(false); }
  };

  const resetForm = () => {
    setRecordAssessment(''); setRecordPlan(''); setRecordTreatment('');
    setRecordVet(''); setRecordWeight(''); setRecordMotivoConsulta('');
    setRecordAnamnesis(''); setRecordHallazgos(''); setRecordVitalTemp('');
    setRecordVitalFC(''); setRecordVitalFR(''); setRecordVitalPA(''); setRecordVitalSpO2('');
    setRecordProcedimiento(''); setRecordDescripcion(''); setRecordPostoperatorio('');
    setRecordFiles([]);
    setRecordDate(toLocalDateTimeInput());
  };

  const openRxModal = (linkedRecordId?: string) => {
    setRxLinkedRecordId(linkedRecordId || null); setRxVet(lastAnamnesis?.veterinarian || user?.name || '');
    setRxBranch(''); setRxFormat('standard'); setRxBody(''); setShowRxModal(true);
  };

  const handleUploadFile = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { setErrorDialog('Necesitamos acceso a tu galería para subir archivos.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // the uploader recompresses as JPEG: images only
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.[0]) return;
      setUploadingFile(true);
      const url = await uploadPetPhoto(result.assets[0].uri);
      setRecordFiles(prev => [...prev, url]);
    } catch (e: any) { setErrorDialog(e?.message || 'No se pudo subir el archivo'); }
    finally { setUploadingFile(false); }
  };

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const baseUrl = API_URL;
      const headers = await authHeaders();
      const response = await apiFetch(`${baseUrl}/items/pets/${id}/file-pdf`, { headers });
      if (!response.ok) throw new Error('No se pudo generar el PDF');
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
    } catch (e: any) { setErrorDialog(e?.message || 'No se pudo guardar la receta'); } finally { setSaving(false); }
  };

  const handleSendRxEmail = async (rx: Prescription) => { setEmailTarget(rx); setEmailRecipient(pet?.email || ''); setShowEmailModal(true); };

  const handleDownloadRecipePdf = async (rx: Prescription) => {
    if (!id) return;
    try {
      const baseUrl = API_URL;
      const headers = await authHeaders();
      const response = await apiFetch(`${baseUrl}/items/pets/${id}/prescriptions/${rx.id}/pdf`, { headers });
      if (!response.ok) throw new Error('No se pudo generar el PDF');
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
    if (!emailTarget) return;
    const to = emailRecipient.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) { setErrorDialog('Ingresa un correo válido para el destinatario'); return; }
    setSendingEmail(true);
    try { await sendEmail(emailTarget.id, to); setShowEmailModal(false); setEmailTarget(null); toast.success(`Receta enviada a ${to}`); }
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
      <PetHeader
        pet={pet}
        onEdit={() => router.push({ pathname: '/(drawer)/add-paciente', params: { id: pet.id } } as any)}
        onCall={pet.phone ? () => Linking.openURL(`tel:${String(pet.phone).replace(/[^\d+]/g, '')}`) : undefined}
        onEmail={pet.email ? () => Linking.openURL(`mailto:${pet.email}`) : undefined}
      />
      {/* The day's work first: these actions used to sit below the weight chart as five equal pills */}
      <View style={styles.actionBar}>
        <VButton variant="primary" onPress={() => setShowRecordModal(true)} icon={<Plus size={16} color={onAccentText.default} />}>Nueva consulta</VButton>
        <VButton variant="secondary" onPress={() => openRxModal()} icon={<FileText size={16} color={colors.primary} />}>Receta</VButton>
        <VButton variant="secondary" onPress={() => setShowPayment(true)} icon={<Wallet size={16} color={colors.primary} />}>Cobrar</VButton>
        <VButton variant="ghost" onPress={() => setShowVitals(true)} icon={<HeartPulse size={16} color={colors.primary} />}>Signos</VButton>
        <VButton variant="ghost" onPress={handleDownloadPdf} icon={<Download size={16} color={colors.primary} />}>Ficha PDF</VButton>
      </View>
      <AlertBanner pet={pet} />
      <ClinicalHistory pet={pet} fieldCount={clinicalFieldCount} />
      {mostRecentRecord && <RecentRecord record={mostRecentRecord} onView={() => setSelectedRecord(mostRecentRecord)} onGenerateRx={() => openRxModal(mostRecentRecord.id)} />}
      <WeightChart records={records} petId={id || undefined} />
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <DisplayText style={[styles.sectionTitle, { color: colors.text }]}>Historial completo</DisplayText>
        </View>
        <ClinicalTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        {activeTab === 'recetas' ? (
          rxLoading ? <SkeletonCard style={{ marginTop: SPACING.md }} /> : <PrescriptionList prescriptions={filteredPrescriptions} onView={setSelectedRx} onSendEmail={handleSendRxEmail} onDownloadPdf={handleDownloadRecipePdf} />
        ) : recordsLoading ? <SkeletonCard style={{ marginTop: SPACING.md }} /> : <RecordTimeline records={filteredRecords} onViewRecord={setSelectedRecord} />}
      </View>

      {/* Modal: Nuevo Registro */}
      <VModal visible={showRecordModal} onDismiss={() => setShowRecordModal(false)} title="Nueva consulta">
          <ScrollView>
            <View style={styles.typeRow}>
              {(['consulta', 'vacuna', 'cirugia', 'control'] as const).map((t) => (
                <VBadge key={t} label={RECORD_TYPE_LABELS[t]} variant={recordType === t ? 'filled' : 'outlined'} color={recordType === t ? colors.primary : colors.textSecondary} selected={recordType === t} onPress={() => setRecordType(t)} />
              ))}
            </View>
            <TextInput label="Fecha y hora" value={recordDate} onChangeText={setRecordDate} mode="outlined" style={styles.input} />
            <TextInput label="Veterinario (opcional)" value={recordVet} onChangeText={setRecordVet} mode="outlined" style={styles.input} />
            <TextInput label="Peso (kg, opcional)" value={recordWeight} onChangeText={setRecordWeight} mode="outlined" style={styles.input} keyboardType="numeric" />

            {/* SOAP: Subjective */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Subjetivo</Text>
            <TextInput label="Motivo de consulta" value={recordMotivoConsulta} onChangeText={setRecordMotivoConsulta} mode="outlined" multiline numberOfLines={2} style={styles.input} />
            <TextInput label="Anamnesis" value={recordAnamnesis} onChangeText={setRecordAnamnesis} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <VoiceNotes onTranscription={(text) => setRecordAssessment(prev => prev ? prev + ' ' + text : text)} onSoapParsed={(soapData) => { if (soapData.subjective) setRecordAnamnesis(soapData.subjective); if (soapData.objective) setRecordHallazgos(soapData.objective); if (soapData.assessment) setRecordAssessment(soapData.assessment); if (soapData.plan) setRecordPlan(soapData.plan); }} />

            {/* SOAP: Objective */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.info }]}>Objetivo</Text>
            <TextInput label="Hallazgos examen físico" value={recordHallazgos} onChangeText={setRecordHallazgos} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Constantes fisiologicas</Text>
            <View style={styles.rxFieldRow}><View style={styles.rxFieldHalf}><TextInput label="Temp (C)" value={recordVitalTemp} onChangeText={setRecordVitalTemp} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View><View style={styles.rxFieldHalf}><TextInput label="FC (lpm)" value={recordVitalFC} onChangeText={setRecordVitalFC} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View></View>
            <View style={styles.rxFieldRow}><View style={styles.rxFieldHalf}><TextInput label="FR (rpm)" value={recordVitalFR} onChangeText={setRecordVitalFR} mode="outlined" style={styles.rxInput} keyboardType="numeric" /></View><View style={styles.rxFieldHalf}><TextInput label="PA (mmHg)" value={recordVitalPA} onChangeText={setRecordVitalPA} mode="outlined" style={styles.rxInput} /></View></View>
            <TextInput label="SpO2 (%)" value={recordVitalSpO2} onChangeText={setRecordVitalSpO2} mode="outlined" style={styles.input} keyboardType="numeric" />

            {/* SOAP: Assessment */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.warning }]}>Evaluación</Text>
            <TextInput label="Diagnóstico / evaluación" value={recordAssessment} onChangeText={setRecordAssessment} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            {/* SOAP: Plan */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.success }]}>Plan</Text>
            <TextInput label="Plan / indicaciones" value={recordPlan} onChangeText={setRecordPlan} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            {/* SOAP: Treatment */}
            <Text variant="titleSmall" style={[styles.subTitle, { color: colors.primary }]}>Tratamiento</Text>
            <TextInput label="Tratamiento indicado" value={recordTreatment} onChangeText={setRecordTreatment} mode="outlined" multiline numberOfLines={3} placeholder="Medicamentos, dosis, duración..." style={styles.input} />

            {/* Cirugia: Campos especificos */}
            {recordType === 'cirugia' && (
              <View style={{ marginTop: SPACING.md }}>
                <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
                <Text variant="titleSmall" style={[styles.subTitle, { color: colors.error }]}>Datos de cirugía</Text>
                <TextInput label="Nombre de procedimiento" value={recordProcedimiento} onChangeText={setRecordProcedimiento} mode="outlined" style={styles.input} placeholder="Ej.: esterilización, LDA, toracotomía" />
                <TextInput label="Descripción del procedimiento" value={recordDescripcion} onChangeText={setRecordDescripcion} mode="outlined" multiline numberOfLines={4} style={styles.input} placeholder="Detalles técnicos del procedimiento" />
                <TextInput label="Indicaciones postoperatorias" value={recordPostoperatorio} onChangeText={setRecordPostoperatorio} mode="outlined" multiline numberOfLines={4} style={styles.input} placeholder="Cuidados, medicación, controles" />

                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Archivos (imagenes / PDF)</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {recordFiles.map((fileUrl, idx) => (
                    <TouchableOpacity key={idx} accessibilityRole="button" accessibilityLabel={`Quitar archivo ${idx + 1}`} style={[styles.fileChip, { backgroundColor: colors.primaryContainer, borderColor: colors.border }]} onPress={() => { setRecordFiles(prev => prev.filter((_, i) => i !== idx)); }}>
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

            <VButton onPress={handleAddRecord} loading={saving} disabled={saving} style={styles.saveButton}>Guardar registro</VButton>
          </ScrollView>
      </VModal>

      {/* Modal: Detalle de Registro */}
      <VModal visible={!!selectedRecord} onDismiss={() => setSelectedRecord(null)} title="Detalle del registro">
          {selectedRecord && (
            <ScrollView>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.record_type}</Text></View>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRecord.date).toLocaleString('es-CL')}</Text></View>
              {selectedRecord.veterinarian && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Veterinario:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.veterinarian}</Text></View>}
              {selectedRecord.details?.weight && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Peso:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRecord.details.weight} kg</Text></View>}
              <RecordDetail record={selectedRecord} />
              <View style={styles.detailActions}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <VButton size="sm" onPress={() => { setSelectedRecord(null); openRxModal(selectedRecord.id); }}>Generar receta</VButton>
                  <VButton size="sm" variant="ghost" color={colors.error} onPress={() => setDeleteRecordTarget(selectedRecord)}>Eliminar</VButton>
                </View>
                <VButton variant="secondary" onPress={() => setSelectedRecord(null)} style={{ marginTop: 8 }}>Cerrar</VButton>
              </View>
            </ScrollView>
          )}
      </VModal>

      {/* Modal: Nueva Receta */}
      <VModal visible={showRxModal} onDismiss={() => setShowRxModal(false)} title="Nueva receta">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.rxInfoRow}>
              <View style={styles.rxInfoCol}>
                <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Paciente</Text>
                <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.name}</Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.species === 'dog' ? 'Canino' : 'Felino'} - {pet.breed || 'N/D'}</Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>Edad: {calculateAge(pet.birth_date)}</Text>
              </View>
              <View style={styles.rxInfoCol}>
                <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Tutor</Text>
                <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.tutor_name || 'N/D'}</Text>
                {pet.email && <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.email}</Text>}
                {pet.phone && <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.phone}</Text>}
              </View>
            </View>
            <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}><Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Sucursal</Text><TextInput placeholder="Clínica central" value={rxBranch} onChangeText={setRxBranch} mode="outlined" dense style={styles.rxInput} /></View>
              <View style={styles.rxFieldHalf}>
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Formato</Text>
                <View style={styles.rxSelectRow}>
                  {[{ value: 'standard', label: 'Estándar' }, { value: 'compact', label: 'Compacto' }].map(f => (
                    <VBadge key={f.value} label={f.label} variant={rxFormat === f.value ? 'filled' : 'outlined'} color={rxFormat === f.value ? colors.primary : colors.textSecondary} selected={rxFormat === f.value} onPress={() => setRxFormat(f.value)} />
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}><Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Prescriptor</Text><TextInput value={rxVet} onChangeText={setRxVet} mode="outlined" dense placeholder="Nombre del veterinario" style={styles.rxInput} /></View>
              <View style={styles.rxFieldHalf}><Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Fecha de emisión</Text><TextInput value={new Date().toLocaleDateString('es-CL')} mode="outlined" dense disabled style={styles.rxInput} /></View>
            </View>
            <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
            <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Receta *</Text>
            <TextInput value={rxBody} onChangeText={setRxBody} mode="outlined" multiline numberOfLines={12} style={styles.rxBodyInput} placeholder="Fármaco, dosis, vía, frecuencia y duración. Ej.: carprofeno 4 mg/kg VO cada 24 h por 7 días." />
            <View style={styles.rxActionRow}>
              <View style={{ flex: 1, marginRight: 8 }}><VButton variant="secondary" fullWidth onPress={() => setShowRxModal(false)}>Volver</VButton></View>
              <View style={{ flex: 1 }}><VButton fullWidth onPress={handleSaveRx} loading={saving} disabled={saving}>Guardar receta</VButton></View>
            </View>
          </ScrollView>
      </VModal>

      {/* Modal: Ver Receta */}
      <VModal visible={!!selectedRx} onDismiss={() => setSelectedRx(null)} title="Receta">
          {selectedRx && (
            <ScrollView>
              <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fecha:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRx.issued_at).toLocaleDateString('es-CL')}</Text></View>
              {selectedRx.veterinarian_name && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Prescriptor:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRx.veterinarian_name}</Text></View>}
              {selectedRx.clinic_branch && <View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sucursal:</Text><Text style={[styles.detailValue, { color: colors.text }]}>{selectedRx.clinic_branch}</Text></View>}
              <View style={[styles.rxBodyCard, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={{ color: colors.text, lineHeight: 22 }}>{selectedRx.prescription_body}</Text></View>
              <View style={styles.detailActions}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <VButton size="sm" onPress={() => handleSendRxEmail(selectedRx)}>Enviar por correo</VButton>
                  <VButton size="sm" variant="secondary" onPress={() => setSelectedRx(null)}>Cerrar</VButton>
                </View>
              </View>
            </ScrollView>
          )}
      </VModal>

      {/* Modal: Enviar Correo */}
      <VModal visible={showEmailModal} onDismiss={() => setShowEmailModal(false)}>
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
                    <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Tutor</Text>
                    <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.tutor_name || 'N/D'}</Text>
                    {pet.phone && <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.phone}</Text>}
                  </View>
                </View>
                <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Vista previa</Text>
                <View style={[styles.emailPreviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={{ color: colors.text }}>{emailTarget.prescription_body}</Text></View>
                <TextInput label="Correo del destinatario" value={emailRecipient} onChangeText={setEmailRecipient} mode="outlined" keyboardType="email-address" style={styles.rxInput} left={<TextInput.Icon icon="email" />} />
                {/* Sending elsewhere is allowed (a family member) but should be a conscious choice */}
                {!!emailRecipient.trim() && emailRecipient.trim().toLowerCase() !== String(pet.email || '').trim().toLowerCase() && (
                  <Text accessibilityRole="alert" style={[styles.emailWarning, { color: colors.warning }]}>
                    {pet.email ? `No es el correo registrado del tutor (${pet.email}).` : 'El tutor no tiene correo registrado.'} Revisa la dirección antes de enviar.
                  </Text>
                )}
                <View style={styles.rxActionRow}>
                  <View style={{ flex: 1, marginRight: 8 }}><VButton variant="secondary" fullWidth onPress={() => setShowEmailModal(false)}>Cancelar</VButton></View>
                  <View style={{ flex: 1 }}><VButton fullWidth onPress={confirmSendEmail} loading={sendingEmail} disabled={sendingEmail || !emailRecipient.trim()}>Enviar</VButton></View>
                </View>
              </>
            )}
          </ScrollView>
      </VModal>

      {/* VitalSignsForm */}
      <VitalSignsForm petId={id || ''} visible={showVitals} onClose={() => setShowVitals(false)} />

      {/* PaymentForm */}
      <PaymentForm visible={showPayment} onClose={() => setShowPayment(false)} petId={id} />

      {/* Dialogs */}
      <Portal>
        <Dialog visible={!!deleteRecordTarget} onDismiss={() => setDeleteRecordTarget(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Eliminar registro</Dialog.Title>
          <Dialog.Content><Text style={{ textAlign: 'center' }}>¿Estás seguro? Esta acción no se puede deshacer.</Text></Dialog.Content>
          <Dialog.Actions><VButton variant="ghost" onPress={() => setDeleteRecordTarget(null)}>Cancelar</VButton><VButton variant="danger" onPress={confirmDeleteRecord}>Eliminar</VButton></Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog visible={!!errorDialog} onDismiss={() => setErrorDialog(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Error</Dialog.Title>
          <Dialog.Content><Text style={{ textAlign: 'center' }}>{errorDialog}</Text></Dialog.Content>
          <Dialog.Actions><VButton variant="ghost" onPress={() => setErrorDialog(null)}>Entendido</VButton></Dialog.Actions>
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
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 24, fontWeight: '600' },
  actionBar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, marginHorizontal: SPACING.xl, marginTop: SPACING.md, marginBottom: SPACING.md },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, minWidth: 60 },
  input: { marginBottom: 8 },
  saveButton: { marginTop: 8 },
  subTitle: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: 8, marginTop: 12 },
  modalTitle: { fontWeight: TYPOGRAPHY.weights.bold, marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { minWidth: 80, fontSize: TYPOGRAPHY.sizes.sm },
  detailValue: { fontWeight: TYPOGRAPHY.weights.semibold, flex: 1, fontSize: TYPOGRAPHY.sizes.sm },
  detailActions: { marginTop: 12 },
  rxInfoRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  rxInfoCol: { flex: 1 },
  rxInfoSectionTitle: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.bold, marginBottom: 4 },
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
  rxBodyCard: { marginTop: 8, marginBottom: 8, borderRadius: 2, borderWidth: 1, padding: 12 },
  emailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  emailWarning: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm },
  emailPreviewCard: { marginBottom: 12, borderRadius: 2, borderWidth: 1, padding: 12 },
  fileChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1 },
  fileThumb: { width: 32, height: 32, borderRadius: 4 },
  fileUploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, borderWidth: 1, borderStyle: 'dashed' },
  fileUploadText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
});
