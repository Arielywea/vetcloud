import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, Portal, Modal, Dialog, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { usePet, useClinicalRecords, usePrescriptions } from '../../hooks/useDirectus';
import { ClinicalRecord, Prescription } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { calculateAge } from '../../utils/age';
import PetHeader from '../../components/PetHeader';
import ClinicalTabs, { ClinicalTabType } from '../../components/ClinicalTabs';
import HistoryTimeline from '../../components/HistoryTimeline';
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
  const [clinicalHistoryExpanded, setClinicalHistoryExpanded] = useState(false);
  const [historialSanitarioExpanded, setHistorialSanitarioExpanded] = useState(false);
  const [anamnesisExpanded, setAnamnesisExpanded] = useState(false);
  const [constantExpanded, setConstantExpanded] = useState(false);

  // Clinical record form
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

  // Prescription form
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
    if (!recordNotes.trim()) {
      setErrorDialog('Las notas son obligatorias');
      return;
    }
    if (!id) return;
    setSaving(true);
    try {
      await addRecord({
        pet_id: id,
        record_type: recordType,
        date: new Date(recordDate).toISOString(),
        veterinarian: recordVet.trim() || null,
        details: {
          notes: recordNotes.trim(),
          weight: recordWeight ? parseFloat(recordWeight) : undefined,
          motivo_consulta: recordMotivoConsulta.trim() || undefined,
          anamnesis: recordAnamnesis.trim() || undefined,
          hallazgos_examen_fisico: recordHallazgos.trim() || undefined,
          vital_signs: {
            temperature: recordVitalTemp ? parseFloat(recordVitalTemp) : undefined,
            heart_rate: recordVitalFC ? parseInt(recordVitalFC) : undefined,
            respiratory_rate: recordVitalFR ? parseInt(recordVitalFR) : undefined,
            blood_pressure: recordVitalPA.trim() || undefined,
            spo2: recordVitalSpO2 ? parseInt(recordVitalSpO2) : undefined,
          },
        },
      });
      setRecordNotes('');
      setRecordVet('');
      setRecordWeight('');
      setRecordMotivoConsulta('');
      setRecordAnamnesis('');
      setRecordHallazgos('');
      setRecordVitalTemp('');
      setRecordVitalFC('');
      setRecordVitalFR('');
      setRecordVitalPA('');
      setRecordVitalSpO2('');
      setShowRecordModal(false);
    } catch (error) {
      setErrorDialog('No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  };

  const openRxModal = (linkedRecordId?: string) => {
    setRxLinkedRecordId(linkedRecordId || null);
    setRxVet(lastAnamnesis?.veterinarian || user?.name || '');
    setRxBranch('');
    setRxFormat('standard');
    setRxBody('');
    setShowRxModal(true);
  };

  const handleSaveRx = async () => {
    if (!rxBody.trim()) {
      setErrorDialog('El cuerpo de la receta es obligatorio');
      return;
    }
    if (!id) return;
    setSaving(true);
    try {
      await addPrescription({
        pet_id: id,
        user_id: user?.id || '',
        clinical_record_id: rxLinkedRecordId || null,
        veterinarian_name: rxVet.trim() || null,
        clinic_branch: rxBranch.trim() || null,
        prescription_body: rxBody.trim(),
        format: rxFormat,
        status: 'active',
        issued_at: new Date().toISOString(),
      });
      setShowRxModal(false);
    } catch (error) {
      setErrorDialog('No se pudo guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  const handleSendRxEmail = async (rx: Prescription) => {
    setEmailTarget(rx);
    setEmailRecipient(pet?.email || '');
    setShowEmailModal(true);
  };

  const confirmSendEmail = async () => {
    if (!emailTarget) return;
    setSendingEmail(true);
    try {
      await sendEmail(emailTarget.id);
      setShowEmailModal(false);
      setEmailTarget(null);
    } catch (error: any) {
      setErrorDialog(error.message || 'No se pudo enviar el correo');
    } finally {
      setSendingEmail(false);
    }
  };

  const confirmDeleteRecord = async () => {
    if (!deleteRecordTarget) return;
    try {
      await removeRecord(deleteRecordTarget.id);
      setDeleteRecordTarget(null);
      setSelectedRecord(null);
    } catch (error) {
      setErrorDialog('No se pudo eliminar el registro');
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
      {/* ─── RESEÑA ─── */}
      <PetHeader pet={pet} />

      {/* ─── HISTORIA CLÍNICA INICIAL (colapsable) ─── */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => setClinicalHistoryExpanded(!clinicalHistoryExpanded)} activeOpacity={0.7}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
                  Historia Clínica Inicial
                </Text>
                {clinicalFieldCount > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: colors.primaryContainer }]}>
                    <Text style={[styles.countBadgeText, { color: colors.primary }]}>{clinicalFieldCount}</Text>
                  </View>
                )}
              </View>
              <MaterialCommunityIcons
                name={clinicalHistoryExpanded ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.textSecondary}
              />
            </View>
          </Card.Content>
        </TouchableOpacity>

        {clinicalHistoryExpanded && (
          <Card.Content style={{ paddingTop: 0 }}>
            <Divider style={{ marginBottom: 12 }} />

            {/* 1. Motivo de consulta */}
            {pet.motivo_consulta && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="comment-alert-outline" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Motivo de consulta</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.motivo_consulta}</Text>
              </View>
            )}

            {/* 2. Hábitat */}
            {pet.habitat && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="home" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Hábitat</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>
                  {pet.habitat}{pet.habitat_other ? ` — ${pet.habitat_other}` : ''}
                </Text>
              </View>
            )}

            {/* 3. Alimentación */}
            {(pet.food || pet.food_frequency) && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="food" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Alimentación</Text>
                </View>
                {pet.food && <Text style={[styles.fieldText, { color: colors.text }]}>Tipo: {pet.food}</Text>}
                {pet.food_frequency && <Text style={[styles.fieldText, { color: colors.text }]}>Frecuencia: {pet.food_frequency}</Text>}
              </View>
            )}

            {/* 4. Consumo de agua */}
            {pet.water_consumption && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="cup-water" size={16} color={colors.info} />
                  <Text style={[styles.fieldLabel, { color: colors.info }]}>Consumo de agua</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.water_consumption}</Text>
              </View>
            )}

            {/* 5. Micción */}
            {pet.urination && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="water-opacity" size={16} color={colors.info} />
                  <Text style={[styles.fieldLabel, { color: colors.info }]}>Micción</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.urination}</Text>
              </View>
            )}

            {/* 6. Vive con otros animales */}
            {pet.lives_with_other_animals && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="paw" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Vive con otros animales</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.lives_with_other_animals}</Text>
              </View>
            )}

            {/* 7. Entorno (solo gatos) */}
            {pet.species === 'cat' && pet.entorno && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="home-outline" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Entorno</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.entorno}</Text>
              </View>
            )}

            {/* 8. Areneros (solo gatos) */}
            {pet.species === 'cat' && pet.areneros && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="inbox-outline" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Areneros</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.areneros}</Text>
              </View>
            )}

            {/* 9. Historial sanitario (colapsable) */}
            <TouchableOpacity onPress={() => setHistorialSanitarioExpanded(!historialSanitarioExpanded)} style={styles.subSectionHeader}>
              <View style={styles.subSectionTitleRow}>
                <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.success} />
                <Text style={[styles.fieldLabel, { color: colors.success }]}>Historial sanitario</Text>
              </View>
              <MaterialCommunityIcons
                name={historialSanitarioExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {historialSanitarioExpanded && (
              <View style={styles.subSectionContent}>
                {pet.vaccines && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="needle" size={16} color={colors.success} />
                      <Text style={[styles.fieldLabel, { color: colors.success }]}>Vacunas</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.vaccines}</Text>
                  </View>
                )}

                {pet.deworming && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="bug" size={16} color={colors.warning} />
                      <Text style={[styles.fieldLabel, { color: colors.warning }]}>Desparasitación</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.deworming}</Text>
                  </View>
                )}

                {pet.flea_treatment && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="shield-bug" size={16} color={colors.warning} />
                      <Text style={[styles.fieldLabel, { color: colors.warning }]}>Antipulgas</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.flea_treatment}</Text>
                  </View>
                )}

                {pet.last_heat && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="calendar-heart" size={16} color={colors.primary} />
                      <Text style={[styles.fieldLabel, { color: colors.primary }]}>Último celo</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.last_heat}</Text>
                  </View>
                )}

                {pet.other_diseases && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="hospital-box-outline" size={16} color={colors.warning} />
                      <Text style={[styles.fieldLabel, { color: colors.warning }]}>Enfermedades previas</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.other_diseases}</Text>
                  </View>
                )}

                {pet.surgeries && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="scissors-cutting" size={16} color={colors.error} />
                      <Text style={[styles.fieldLabel, { color: colors.error }]}>Cirugías previas</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.surgeries}</Text>
                  </View>
                )}

                {pet.medications && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="pill" size={16} color={colors.info} />
                      <Text style={[styles.fieldLabel, { color: colors.info }]}>Medicamentos actuales</Text>
                    </View>
                    <Text style={[styles.fieldText, { color: colors.text }]}>{pet.medications}</Text>
                  </View>
                )}

                {pet.allergies && pet.allergies.length > 0 && (
                  <View style={styles.fieldBlock}>
                    <View style={styles.fieldHeader}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.error} />
                      <Text style={[styles.fieldLabel, { color: colors.error }]}>Alergias</Text>
                    </View>
                    <View style={styles.chipRow}>
                      {pet.allergies.map((a: string, i: number) => (
                        <View key={i} style={[styles.chip, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
                          <Text style={[styles.chipText, { color: colors.error }]}>{a}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* 10. Anamnesis */}
            {pet.anamnesis && (
              <TouchableOpacity onPress={() => setAnamnesisExpanded(!anamnesisExpanded)} style={styles.subSectionHeader}>
                <View style={styles.subSectionTitleRow}>
                  <MaterialCommunityIcons name="stethoscope" size={16} color={colors.primary} />
                  <Text style={[styles.fieldLabel, { color: colors.primary }]}>Anamnesis</Text>
                </View>
                <MaterialCommunityIcons
                  name={anamnesisExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            {pet.anamnesis && anamnesisExpanded && (
              <View style={styles.subSectionContent}>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.anamnesis}</Text>
              </View>
            )}

            {/* 11. Constantes fisiológicas */}
            {pet.vital_signs && (
              <TouchableOpacity onPress={() => setConstantExpanded(!constantExpanded)} style={styles.subSectionHeader}>
                <View style={styles.subSectionTitleRow}>
                  <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.error} />
                  <Text style={[styles.fieldLabel, { color: colors.error }]}>Constantes fisiológicas</Text>
                </View>
                <MaterialCommunityIcons
                  name={constantExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            {pet.vital_signs && constantExpanded && (
              <View style={styles.subSectionContent}>
                {pet.vital_signs.temperature != null && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Temperatura:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.temperature} °C</Text>
                  </View>
                )}
                {pet.vital_signs.heart_rate != null && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>FC:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.heart_rate} lpm</Text>
                  </View>
                )}
                {pet.vital_signs.respiratory_rate != null && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>FR:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.respiratory_rate} rpm</Text>
                  </View>
                )}
                {pet.vital_signs.blood_pressure && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>PA:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.blood_pressure}</Text>
                  </View>
                )}
                {pet.vital_signs.spo2 != null && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>SpO₂:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.spo2}%</Text>
                  </View>
                )}
                {pet.vital_signs.mucous_membranes && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Mucosas:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.mucous_membranes}</Text>
                  </View>
                )}
                {pet.vital_signs.hydration && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Hidratación:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.hydration}</Text>
                  </View>
                )}
                {pet.vital_signs.body_condition && (
                  <View style={styles.vitalRow}>
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Condición corporal:</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>{pet.vital_signs.body_condition}</Text>
                  </View>
                )}
              </View>
            )}

            {/* 12. Hallazgos examen físico */}
            {pet.hallazgos_examen_fisico && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="magnify" size={16} color={colors.warning} />
                  <Text style={[styles.fieldLabel, { color: colors.warning }]}>Hallazgos examen físico</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.hallazgos_examen_fisico}</Text>
              </View>
            )}

            {/* 13. Notas */}
            {pet.notes && (
              <View style={styles.fieldBlock}>
                <View style={styles.fieldHeader}>
                  <MaterialCommunityIcons name="note-text-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notas</Text>
                </View>
                <Text style={[styles.fieldText, { color: colors.text }]}>{pet.notes}</Text>
              </View>
            )}

            {/* Empty state */}
            {!pet.motivo_consulta && !pet.anamnesis && (!pet.allergies || pet.allergies.length === 0) && !pet.habitat && !pet.food && !pet.vaccines && !pet.surgeries && !pet.medications && !pet.notes && !pet.vital_signs && !pet.hallazgos_examen_fisico && (
              <View style={styles.emptySection}>
                <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.textLight} />
                <Text style={[styles.emptySectionText, { color: colors.textSecondary }]}>
                  Sin datos clínicos iniciales registrados
                </Text>
                <Text style={[styles.emptySectionHint, { color: colors.textLight }]}>
                  Edita el paciente para completar la historia clínica
                </Text>
              </View>
            )}
          </Card.Content>
        )}
      </Card>

      {mostRecentRecord && (
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
                <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
                  Última Consulta
                </Text>
              </View>
              <Button compact mode="text" onPress={() => setSelectedRecord(mostRecentRecord)}>
                Ver todo
              </Button>
            </View>

            <View style={styles.recentRecordMeta}>
              <View style={[styles.recentTypeBadge, { backgroundColor: getRecordColor(mostRecentRecord.record_type) + '18' }]}>
                <MaterialCommunityIcons name={getRecordIcon(mostRecentRecord.record_type) as any} size={14} color={getRecordColor(mostRecentRecord.record_type)} />
                <Text style={[styles.recentTypeText, { color: getRecordColor(mostRecentRecord.record_type) }]}>
                  {getRecordLabel(mostRecentRecord.record_type)}
                </Text>
              </View>
              <Text style={[styles.recentDate, { color: colors.textSecondary }]}>
                {new Date(mostRecentRecord.date).toLocaleDateString('es-CL')}
              </Text>
            </View>

            {mostRecentRecord.veterinarian && (
              <View style={styles.recentField}>
                <Text style={[styles.recentFieldLabel, { color: colors.textSecondary }]}>Veterinario:</Text>
                <Text style={[styles.recentFieldValue, { color: colors.text }]}>{mostRecentRecord.veterinarian}</Text>
              </View>
            )}

            {mostRecentRecord.details?.weight && (
              <View style={styles.recentField}>
                <Text style={[styles.recentFieldLabel, { color: colors.textSecondary }]}>Peso:</Text>
                <Text style={[styles.recentFieldValue, { color: colors.text }]}>{mostRecentRecord.details.weight} kg</Text>
              </View>
            )}

            {mostRecentRecord.details?.anamnesis && (
              <View style={styles.recentField}>
                <Text style={[styles.recentFieldLabel, { color: colors.textSecondary }]}>Anamnesis:</Text>
                <Text style={[styles.recentFieldValue, { color: colors.text }]} numberOfLines={4}>
                  {mostRecentRecord.details.anamnesis}
                </Text>
              </View>
            )}

            {mostRecentRecord.details?.motivo_consulta && (
              <View style={styles.recentField}>
                <Text style={[styles.recentFieldLabel, { color: colors.textSecondary }]}>Motivo de consulta:</Text>
                <Text style={[styles.recentFieldValue, { color: colors.text }]} numberOfLines={4}>
                  {mostRecentRecord.details.motivo_consulta}
                </Text>
              </View>
            )}

            {mostRecentRecord.details?.vital_signs && (
              <View style={styles.recentField}>
                <Text style={[styles.recentFieldLabel, { color: colors.textSecondary }]}>Constantes:</Text>
                <Text style={[styles.recentFieldValue, { color: colors.text }]} numberOfLines={3}>
                  {[
                    mostRecentRecord.details.vital_signs.temperature != null && `Temp: ${mostRecentRecord.details.vital_signs.temperature}°C`,
                    mostRecentRecord.details.vital_signs.heart_rate != null && `FC: ${mostRecentRecord.details.vital_signs.heart_rate}`,
                    mostRecentRecord.details.vital_signs.respiratory_rate != null && `FR: ${mostRecentRecord.details.vital_signs.respiratory_rate}`,
                    mostRecentRecord.details.vital_signs.blood_pressure && `PA: ${mostRecentRecord.details.vital_signs.blood_pressure}`,
                    mostRecentRecord.details.vital_signs.spo2 != null && `SpO₂: ${mostRecentRecord.details.vital_signs.spo2}%`,
                  ].filter(Boolean).join(' | ')}
                </Text>
              </View>
            )}

            {mostRecentRecord.details?.notes && (
              <View style={styles.recentField}>
                <Text style={[styles.recentFieldLabel, { color: colors.textSecondary }]}>Notas:</Text>
                <Text style={[styles.recentFieldValue, { color: colors.text }]} numberOfLines={4}>
                  {mostRecentRecord.details.notes}
                </Text>
              </View>
            )}

            <View style={styles.recentActions}>
              <Button compact mode="outlined" onPress={() => { setSelectedRecord(mostRecentRecord); }} style={{ marginRight: 8 }}>
                Detalle
              </Button>
              <Button compact mode="outlined" onPress={() => openRxModal(mostRecentRecord.id)}>
                Generar Receta
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* ─── HISTORIAL COMPLETO (tabs) ─── */}
      <Card style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
              <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
                Historial Completo
              </Text>
            </View>
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
                <MaterialCommunityIcons name="file-document-outline" size={32} color={colors.textLight} />
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

      {/* ─── MODALS ─── */}

      {/* Modal: Nuevo Registro Clínico */}
      <Portal>
        <Modal visible={showRecordModal} onDismiss={() => setShowRecordModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView>
            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>Nueva Consulta</Text>

            {/* Preview del paciente */}
            <Card style={[styles.previewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Card.Content style={styles.previewContent}>
                <MaterialCommunityIcons name={pet.species === 'dog' ? 'dog' : 'cat'} size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.previewName, { color: colors.text }]}>{pet.name}</Text>
                  <Text style={[styles.previewDetail, { color: colors.textSecondary }]}>
                    {pet.species === 'dog' ? 'Canino' : 'Felino'} — {pet.breed || 'N/D'} | {pet.weight || 'N/D'} kg
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {lastAnamnesis && (
              <Card style={[styles.lastAnamnesisCard, { backgroundColor: colors.primaryContainer + '40', borderColor: colors.primary }]}>
                <Card.Content>
                  <Text style={[styles.lastAnamnesisLabel, { color: colors.primary }]}>
                    Última anamnesis ({new Date(lastAnamnesis.date).toLocaleDateString('es-CL')})
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
            <TextInput label="Motivo de consulta" value={recordMotivoConsulta} onChangeText={setRecordMotivoConsulta} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <TextInput label="Anamnesis" value={recordAnamnesis} onChangeText={setRecordAnamnesis} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <VoiceNotes
              onTranscription={(text) => setRecordNotes(text)}
              onSoapParsed={(soapData) => {
                const parts: string[] = [];
                if (soapData.subjective) parts.push(`S: ${soapData.subjective}`);
                if (soapData.objective) parts.push(`O: ${soapData.objective}`);
                if (soapData.assessment) parts.push(`A: ${soapData.assessment}`);
                if (soapData.plan) parts.push(`P: ${soapData.plan}`);
                if (parts.length > 0) setRecordNotes(parts.join('\n\n'));
              }}
            />

            {/* Constantes fisiológicas */}
            <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary, marginBottom: 8, marginTop: 4 }]}>
              Constantes fisiológicas
            </Text>
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}>
                <TextInput label="Temp (°C)" value={recordVitalTemp} onChangeText={setRecordVitalTemp} mode="outlined" style={styles.rxInput} keyboardType="numeric" />
              </View>
              <View style={styles.rxFieldHalf}>
                <TextInput label="FC (lpm)" value={recordVitalFC} onChangeText={setRecordVitalFC} mode="outlined" style={styles.rxInput} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}>
                <TextInput label="FR (rpm)" value={recordVitalFR} onChangeText={setRecordVitalFR} mode="outlined" style={styles.rxInput} keyboardType="numeric" />
              </View>
              <View style={styles.rxFieldHalf}>
                <TextInput label="PA (mmHg)" value={recordVitalPA} onChangeText={setRecordVitalPA} mode="outlined" style={styles.rxInput} />
              </View>
            </View>
            <TextInput label="SpO₂ (%)" value={recordVitalSpO2} onChangeText={setRecordVitalSpO2} mode="outlined" style={styles.input} keyboardType="numeric" />

            <TextInput label="Hallazgos examen físico" value={recordHallazgos} onChangeText={setRecordHallazgos} mode="outlined" multiline numberOfLines={3} style={styles.input} />
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
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{getRecordLabel(selectedRecord.record_type)}</Text>
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
              {selectedRecord.details?.motivo_consulta && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Motivo de consulta:</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.motivo_consulta}</Text>
                </View>
              )}
              {selectedRecord.details?.hallazgos_examen_fisico && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Hallazgos examen físico:</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.hallazgos_examen_fisico}</Text>
                </View>
              )}
              {selectedRecord.details?.vital_signs && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Constantes fisiológicas:</Text>
                  <View style={{ marginTop: 4 }}>
                    {selectedRecord.details.vital_signs.temperature != null && (
                      <Text style={{ color: colors.text, fontSize: 13 }}>Temp: {selectedRecord.details.vital_signs.temperature} °C</Text>
                    )}
                    {selectedRecord.details.vital_signs.heart_rate != null && (
                      <Text style={{ color: colors.text, fontSize: 13 }}>FC: {selectedRecord.details.vital_signs.heart_rate} lpm</Text>
                    )}
                    {selectedRecord.details.vital_signs.respiratory_rate != null && (
                      <Text style={{ color: colors.text, fontSize: 13 }}>FR: {selectedRecord.details.vital_signs.respiratory_rate} rpm</Text>
                    )}
                    {selectedRecord.details.vital_signs.blood_pressure && (
                      <Text style={{ color: colors.text, fontSize: 13 }}>PA: {selectedRecord.details.vital_signs.blood_pressure}</Text>
                    )}
                    {selectedRecord.details.vital_signs.spo2 != null && (
                      <Text style={{ color: colors.text, fontSize: 13 }}>SpO₂: {selectedRecord.details.vital_signs.spo2}%</Text>
                    )}
                  </View>
                </View>
              )}
              {selectedRecord.details?.notes && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notas:</Text>
                  <Text style={{ color: colors.text, lineHeight: 22, marginTop: 4 }}>{selectedRecord.details.notes}</Text>
                </View>
              )}
              <View style={styles.detailActions}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button mode="contained" compact onPress={() => { setSelectedRecord(null); openRxModal(selectedRecord.id); }}>
                    Generar Receta
                  </Button>
                  <Button mode="outlined" compact onPress={() => setDeleteRecordTarget(selectedRecord)} textColor={colors.error}>
                    Eliminar
                  </Button>
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

            {/* Patient + Owner info */}
            <View style={styles.rxInfoRow}>
              <View style={styles.rxInfoCol}>
                <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Paciente</Text>
                <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.name}</Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                  {pet.species === 'dog' ? 'Canino' : 'Felino'} — {pet.breed || 'N/D'}
                </Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                  Edad: {calculateAge(pet.birth_date)}
                </Text>
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                  Peso: {pet.weight > 0 ? `${pet.weight} kg` : 'N/D'}
                </Text>
                {pet.sex && (
                  <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                    Sexo: {pet.sex === 'macho' ? 'Macho' : 'Hembra'}
                  </Text>
                )}
                <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                  Estado reproductivo: {pet.reproductive_status || 'N/D'}
                </Text>
              </View>
              <View style={styles.rxInfoCol}>
                <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Propietario</Text>
                <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.tutor_name || 'N/D'}</Text>
                {pet.email && (
                  <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                    {pet.email}
                  </Text>
                )}
                {pet.phone && (
                  <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                    {pet.phone}
                  </Text>
                )}
              </View>
            </View>

            <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />

            {/* Form fields row */}
            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}>
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Sucursal</Text>
                <TextInput
                  placeholder="Ej: Clínica Central"
                  value={rxBranch}
                  onChangeText={setRxBranch}
                  mode="outlined"
                  dense
                  style={styles.rxInput}
                />
              </View>
              <View style={styles.rxFieldHalf}>
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Formato</Text>
                <View style={styles.rxSelectRow}>
                  {[
                    { value: 'standard', label: 'Estándar' },
                    { value: 'compact', label: 'Compacto' },
                  ].map(f => (
                    <Button
                      key={f.value}
                      mode={rxFormat === f.value ? 'contained' : 'outlined'}
                      onPress={() => setRxFormat(f.value)}
                      style={[styles.rxSelectBtn, rxFormat === f.value && { backgroundColor: colors.primary }]}
                      labelStyle={[styles.rxSelectLabel, rxFormat === f.value ? { color: '#FFF' } : { color: colors.primary }]}
                      compact
                    >
                      {f.label}
                    </Button>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.rxFieldRow}>
              <View style={styles.rxFieldHalf}>
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Prescriptor</Text>
                <TextInput
                  value={rxVet}
                  onChangeText={setRxVet}
                  mode="outlined"
                  dense
                  placeholder="Nombre del veterinario"
                  style={styles.rxInput}
                />
              </View>
              <View style={styles.rxFieldHalf}>
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Fecha Emisión</Text>
                <TextInput
                  value={new Date().toLocaleDateString('es-CL')}
                  mode="outlined"
                  dense
                  disabled
                  style={styles.rxInput}
                />
              </View>
            </View>

            <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />

            {/* Prescription body */}
            <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Receta *</Text>
            <TextInput
              value={rxBody}
              onChangeText={setRxBody}
              mode="outlined"
              multiline
              numberOfLines={12}
              style={styles.rxBodyInput}
              placeholder={"Uso Veterinario\nRimadyl (Carprofeno en comprimidos 100 mg):\nDar vía oral 1 comprimido cada 24 horas x 7 días.\n\nUso humano\nMetamizol sodico 300 mg (Comprimido):\nDar vía oral 2 comprimidos cada 12 horas x 5 días."}
            />

            {/* Action buttons */}
            <View style={styles.rxActionRow}>
              <Button mode="outlined" onPress={() => setShowRxModal(false)} style={{ flex: 1, marginRight: 8 }}>
                Volver
              </Button>
              <Button mode="contained" onPress={handleSaveRx} style={{ flex: 1 }} loading={saving} disabled={saving} icon="content-save">
                Guardar
              </Button>
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

      {/* Modal: Enviar Correo */}
      <Portal>
        <Modal visible={showEmailModal} onDismiss={() => setShowEmailModal(false)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.emailHeader}>
              <MaterialCommunityIcons name="email-outline" size={28} color={colors.primary} />
              <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Enviar por correo</Text>
            </View>

            {emailTarget && (
              <>
                {/* Patient + Owner info */}
                <View style={styles.rxInfoRow}>
                  <View style={styles.rxInfoCol}>
                    <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Paciente</Text>
                    <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.name}</Text>
                    <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                      {pet.species === 'dog' ? 'Canino' : 'Felino'} — {pet.breed || 'N/D'}
                    </Text>
                    <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>
                      Edad: {calculateAge(pet.birth_date)}
                    </Text>
                  </View>
                  <View style={styles.rxInfoCol}>
                    <Text style={[styles.rxInfoSectionTitle, { color: colors.primary }]}>Propietario</Text>
                    <Text style={[styles.rxInfoName, { color: colors.text }]}>{pet.tutor_name || 'N/D'}</Text>
                    {pet.phone && (
                      <Text style={[styles.rxInfoDetail, { color: colors.textSecondary }]}>{pet.phone}</Text>
                    )}
                  </View>
                </View>

                <Divider style={[styles.rxDivider, { backgroundColor: colors.border }]} />

                {/* Prescription preview */}
                <Text style={[styles.rxFieldLabel, { color: colors.textSecondary }]}>Vista previa de la receta</Text>
                <Card style={[styles.emailPreviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Card.Content>
                    <View style={styles.emailPreviewRow}>
                      <Text style={[styles.emailPreviewLabel, { color: colors.textSecondary }]}>Fecha:</Text>
                      <Text style={[styles.emailPreviewValue, { color: colors.text }]}>{new Date(emailTarget.issued_at).toLocaleDateString('es-CL')}</Text>
                    </View>
                    {emailTarget.veterinarian_name && (
                      <View style={styles.emailPreviewRow}>
                        <Text style={[styles.emailPreviewLabel, { color: colors.textSecondary }]}>Prescriptor:</Text>
                        <Text style={[styles.emailPreviewValue, { color: colors.text }]}>{emailTarget.veterinarian_name}</Text>
                      </View>
                    )}
                    {emailTarget.clinic_branch && (
                      <View style={styles.emailPreviewRow}>
                        <Text style={[styles.emailPreviewLabel, { color: colors.textSecondary }]}>Sucursal:</Text>
                        <Text style={[styles.emailPreviewValue, { color: colors.text }]}>{emailTarget.clinic_branch}</Text>
                      </View>
                    )}
                    <Divider style={{ marginVertical: 8 }} />
                    <Text style={[styles.emailPreviewBody, { color: colors.text }]}>{emailTarget.prescription_body}</Text>
                  </Card.Content>
                </Card>

                {/* Recipient */}
                <TextInput
                  label="Correo del destinatario"
                  value={emailRecipient}
                  onChangeText={setEmailRecipient}
                  mode="outlined"
                  keyboardType="email-address"
                  style={styles.rxInput}
                  left={<TextInput.Icon icon="email" />}
                />

                <View style={styles.rxActionRow}>
                  <Button mode="outlined" onPress={() => setShowEmailModal(false)} style={{ flex: 1, marginRight: 8 }}>
                    Cancelar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={confirmSendEmail}
                    style={{ flex: 1 }}
                    loading={sendingEmail}
                    disabled={sendingEmail || !emailRecipient.trim()}
                    icon="send"
                  >
                    Enviar
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Dialog: Confirmar eliminar registro */}
      <Portal>
        <Dialog visible={!!deleteRecordTarget} onDismiss={() => setDeleteRecordTarget(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Eliminar registro</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>
              ¿Estás seguro de eliminar este registro de <Text style={{ fontWeight: '700' }}>{deleteRecordTarget?.record_type}</Text>?
              Esta acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteRecordTarget(null)}>Cancelar</Button>
            <Button onPress={confirmDeleteRecord} textColor={colors.error}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Error Dialog */}
      <Portal>
        <Dialog visible={!!errorDialog} onDismiss={() => setErrorDialog(null)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: 'center' }}>Error</Dialog.Title>
          <Dialog.Content>
            <Text style={{ textAlign: 'center' }}>{errorDialog}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setErrorDialog(null)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

function getRecordColor(type: string): string {
  switch (type) {
    case 'consulta': return '#1976D2';
    case 'vacuna': return '#43A047';
    case 'cirugia': return '#E53935';
    case 'control': return '#F57C00';
    default: return '#757575';
  }
}

function getRecordIcon(type: string): string {
  switch (type) {
    case 'consulta': return 'stethoscope';
    case 'vacuna': return 'needle';
    case 'cirugia': return 'scissors-cutting';
    case 'control': return 'clipboard-check';
    default: return 'file-document';
  }
}

function getRecordLabel(type: string): string {
  switch (type) {
    case 'consulta': return 'Consulta';
    case 'vacuna': return 'Vacuna';
    case 'cirugia': return 'Cirugía';
    case 'control': return 'Control';
    default: return type;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { textAlign: 'center', marginTop: 40 },
  sectionCard: { marginHorizontal: 12, marginBottom: 12, borderRadius: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 18, borderRadius: 2 },
  sectionTitle: { fontWeight: '700', fontSize: 15 },
  countBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 6 },
  countBadgeText: { fontSize: 11, fontWeight: '700' },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },

  // Clinical fields
  fieldBlock: { marginBottom: 14 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '700' },
  fieldText: { fontSize: 13, lineHeight: 20, marginLeft: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginLeft: 22 },
  chip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  emptySection: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptySectionText: { fontSize: 13, fontWeight: '600' },
  emptySectionHint: { fontSize: 11 },
  subSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#00000010', marginTop: 8 },
  subSectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subSectionContent: { paddingBottom: 8 },
  vitalRow: { flexDirection: 'row', marginBottom: 4, marginLeft: 22 },
  vitalLabel: { fontSize: 12, fontWeight: '600', width: 110 },
  vitalValue: { fontSize: 13, fontWeight: '500', flex: 1 },

  // Recent record
  recentRecordMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  recentTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  recentTypeText: { fontSize: 11, fontWeight: '700' },
  recentDate: { fontSize: 12 },
  recentField: { marginBottom: 8 },
  recentFieldLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  recentFieldValue: { fontSize: 13, lineHeight: 18 },
  recentActions: { flexDirection: 'row', marginTop: 8 },

  // Preview cards
  previewCard: { marginBottom: 12, borderRadius: 8, borderWidth: 1 },
  previewContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewName: { fontWeight: '700', fontSize: 15 },
  previewDetail: { fontSize: 12, marginTop: 2 },
  previewTutor: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  previewTutorText: { fontSize: 12 },

  // Modals
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

  // Prescriptions
  emptyRx: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  emptyText: { fontSize: 13 },
  rxCard: { marginBottom: 8, borderRadius: 10, borderLeftWidth: 3 },
  rxRow: { flexDirection: 'row', alignItems: 'center' },
  rxInfo: { flex: 1 },
  rxDate: { fontSize: 11 },
  rxVet: { fontWeight: '600', fontSize: 13, marginTop: 2 },
  rxPreview: { fontSize: 12, marginTop: 2 },
  rxActions: { flexDirection: 'row' },
  rxActionRow: { flexDirection: 'row', marginTop: 12 },
  rxBodyCard: { marginTop: 8, marginBottom: 8, borderRadius: 8, borderWidth: 1 },
  rxBodyText: { lineHeight: 22, whiteSpace: 'pre-wrap' },

  // Redesigned Rx modal
  rxInfoRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  rxInfoCol: { flex: 1 },
  rxInfoSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
  rxInfoName: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  rxInfoDetail: { fontSize: 12, lineHeight: 18 },
  rxDivider: { marginVertical: 12 },
  rxFieldRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  rxFieldHalf: { flex: 1 },
  rxFieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  rxSelectRow: { flexDirection: 'row', gap: 6 },
  rxSelectBtn: { flex: 1 },
  rxSelectLabel: { fontSize: 12 },
  rxInput: { marginBottom: 12 },
  rxBodyInput: { marginBottom: 12, minHeight: 200 },

  // Email modal
  emailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  emailPreviewCard: { marginBottom: 12, borderRadius: 8, borderWidth: 1 },
  emailPreviewRow: { flexDirection: 'row', marginBottom: 4 },
  emailPreviewLabel: { width: 90, fontSize: 12 },
  emailPreviewValue: { fontWeight: '600', fontSize: 13, flex: 1 },
  emailPreviewBody: { fontSize: 13, lineHeight: 20, whiteSpace: 'pre-wrap' },
});
