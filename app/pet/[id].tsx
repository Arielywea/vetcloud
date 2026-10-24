import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Portal, Dialog, Divider } from 'react-native-paper';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePet, useClinicalRecords, usePrescriptions, useVaccinations, useRefreshOn } from '../../hooks/useDirectus';
import { api, Appointment, ClinicalRecord, Prescription, VaccinationKind, VaccinePlanItem } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { calculateAge } from '../../utils/age';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ChartHeader from '../../components/pet/ChartHeader';
import StatusStrip from '../../components/pet/StatusStrip';
import VaccinesSection from '../../components/pet/VaccinesSection';
import VaccinationSheet from '../../components/pet/VaccinationSheet';
import LifeStatusSheet from '../../components/pet/LifeStatusSheet';
import PetTimeline from '../../components/pet/PetTimeline';
import ClinicalHistory from '../../components/pet/ClinicalHistory';
import WeightChart from '../../components/pet/WeightChart';
import RecordDetail from '../../components/pet/RecordDetail';
import PaymentForm from '../../components/pet/PaymentForm';
import { useResponsive } from '../../hooks/useResponsive';
import DynamicIcon from '../../components/ui/DynamicIcon';
import { useToast } from '../../components/ui/VToast';
import VModal from '../../components/ui/VModal';
import VButton from '../../components/ui/Button';
import VBadge from '../../components/ui/Badge';
import { Stethoscope, FileText, Wallet, Download, Syringe, CalendarPlus } from 'lucide-react-native';
import { authHeaders, apiFetch } from '../../services/auth';
import { API_URL } from '../../config';

export default function PetDetailScreen() {
  const router = useRouter();
  const { colors, onPrimaryText, onAccentText } = useTheme();
  const { user } = useAuth();
  const toast = useToast();
  const { id, consulta } = useLocalSearchParams<{ id: string; consulta?: string }>();
  const { pet, loading, refresh: refreshPet } = usePet(id || null);
  const { records, removeRecord } = useClinicalRecords(id || undefined);
  const { prescriptions, addPrescription, sendEmail } = usePrescriptions(id || undefined);
  const { vaccinations } = useVaccinations(id || null);
  const { isMobile } = useResponsive();
  const [vaccinePreset, setVaccinePreset] = useState<{ kind: VaccinationKind; plan_item?: VaccinePlanItem | null } | null | undefined>(undefined);
  const [showStatus, setShowStatus] = useState(false);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [rxLinkedRecordId, setRxLinkedRecordId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [deleteRecordTarget, setDeleteRecordTarget] = useState<ClinicalRecord | null>(null);
  const [rxVet, setRxVet] = useState('');
  const [rxBranch, setRxBranch] = useState('Casa Matriz');
  const [rxBody, setRxBody] = useState('');
  const [rxFormat, setRxFormat] = useState('standard');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<Prescription | null>(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const loadNext = useCallback(async () => {
    if (!id) return;
    try {
      const upcoming: Appointment[] = await api.appointments.list({ start: new Date().toISOString() });
      setNextAppointment(upcoming.find((a) => a.pet_id === id && !['cancelada', 'completada', 'ausente'].includes(a.status)) || null);
    } catch { setNextAppointment(null); }
  }, [id]);
  useEffect(() => { loadNext(); }, [loadNext]);
  useRefreshOn(['appointments'], loadNext);
  // Status changes and tutor edits come back without the joined tutor fields: reload the pet
  useRefreshOn(['owners', 'clinical_records'], refreshPet);

  const lastAnamnesis = useMemo(() => {
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    for (const r of sorted) { if (r.details?.anamnesis) return r; }
    return null;
  }, [records]);

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

  const openRxModal = (linkedRecordId?: string) => {
    setRxLinkedRecordId(linkedRecordId || null); setRxVet(lastAnamnesis?.veterinarian || user?.name || '');
    setRxBranch(''); setRxFormat('standard'); setRxBody(''); setShowRxModal(true);
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
  // Old links (?consulta=1) open the consultation screen
  useEffect(() => {
    if (consulta === '1' && id) router.replace(`/consulta/${id}` as any);
  }, [consulta, id]);
  const openRecord = useCallback((r: ClinicalRecord) => setSelectedRecord(r), []);
  const openRx = useCallback((rx: Prescription) => setSelectedRx(rx), []);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg, width: '90%' }} /></View>;
  if (!pet) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.loadingText, { color: colors.textSecondary }]}>Paciente no encontrado</Text></View>;

  const alive = (pet.status || 'alive') === 'alive';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <ChartHeader pet={pet} onEdit={() => router.push({ pathname: '/(drawer)/add-paciente', params: { id: pet.id } } as any)} onChangeStatus={() => setShowStatus(true)} />
      <StatusStrip pet={pet} records={records} vaccinations={vaccinations} nextAppointment={nextAppointment} />
      <View style={styles.actionBar}>
        {alive ? <VButton variant="primary" size="lg" onPress={() => router.push(`/consulta/${pet.id}` as any)} icon={<Stethoscope size={18} color={onAccentText.default} />}>Nueva consulta</VButton> : null}
        {alive ? <VButton variant="secondary" onPress={() => setVaccinePreset(null)} icon={<Syringe size={16} color={colors.primary} />}>Vacuna</VButton> : null}
        <VButton variant="secondary" onPress={() => openRxModal()} icon={<FileText size={16} color={colors.primary} />}>Receta</VButton>
        {alive ? <VButton variant="secondary" onPress={() => router.push({ pathname: '/(drawer)/agenda', params: { nueva: '1', pet_id: pet.id } } as any)} icon={<CalendarPlus size={16} color={colors.primary} />}>Agendar</VButton> : null}
        <VButton variant="secondary" onPress={() => setShowPayment(true)} icon={<Wallet size={16} color={colors.primary} />}>Cobrar</VButton>
        <VButton variant="ghost" onPress={handleDownloadPdf} icon={<Download size={16} color={colors.primary} />}>Ficha PDF</VButton>
      </View>
      <View style={[styles.columns, isMobile && styles.columnsMobile]}>
        <View style={styles.main}>
          <PetTimeline records={records} prescriptions={prescriptions} vaccinations={vaccinations} onOpenRecord={openRecord} onOpenRx={openRx} />
        </View>
        <View style={isMobile ? undefined : styles.side}>
          <VaccinesSection pet={pet} vaccinations={vaccinations} onApply={(p) => setVaccinePreset(p)} readOnly={!alive} />
          <WeightChart records={records} petId={id || undefined} />
          {clinicalFieldCount > 0 ? <ClinicalHistory pet={pet} fieldCount={clinicalFieldCount} /> : null}
        </View>
      </View>

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

      <VaccinationSheet visible={vaccinePreset !== undefined} pet={pet} preset={vaccinePreset || null} onClose={() => setVaccinePreset(undefined)}
        onSaved={() => { setVaccinePreset(undefined); toast.success('Dosis registrada'); }} />
      <LifeStatusSheet visible={showStatus} pet={pet} onClose={() => setShowStatus(false)}
        onSaved={() => { setShowStatus(false); refreshPet(true); toast.success('Estado actualizado'); }} />

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
  content: { padding: SPACING.lg, paddingBottom: SPACING['5xl'], maxWidth: 1240, width: '100%', alignSelf: 'center' },
  columns: { flexDirection: 'row', gap: SPACING['2xl'], alignItems: 'flex-start' },
  columnsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  main: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
  side: { width: 420 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { textAlign: 'center', marginTop: 40 },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 24, fontWeight: '600' },
  actionBar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm, marginBottom: SPACING.xl },
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
