import React, { useState, useEffect, useCallback } from 'react';
import {
  View, StyleSheet, Text, Modal, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import {
  X, Calendar, Clock, Stethoscope, User, FileText, Search,
  ChevronDown, Check, AlertCircle,
} from 'lucide-react-native';
import { api } from '../../services/directus';

const APPOINTMENT_TYPES = [
  { key: 'consulta', label: 'Consulta', color: APPOINTMENT_TYPE_COLORS.consulta },
  { key: 'vacuna', label: 'Vacuna', color: APPOINTMENT_TYPE_COLORS.vacuna },
  { key: 'cirugia', label: 'Cirugía', color: APPOINTMENT_TYPE_COLORS.cirugia },
  { key: 'control', label: 'Control', color: APPOINTMENT_TYPE_COLORS.control },
  { key: 'terreno', label: 'Terreno', color: APPOINTMENT_TYPE_COLORS.terreno },
  { key: 'examenes', label: 'Exámenes', color: APPOINTMENT_TYPE_COLORS.examenes },
  { key: 'hospitalizacion', label: 'Hospitalización', color: APPOINTMENT_TYPE_COLORS.hospitalizacion },
];

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
};

interface AppointmentCreationModalProps {
  visible: boolean;
  initialDate?: Date;
  initialHour?: number;
  onClose: () => void;
  onCreated: () => void;
}

function formatHour(hour: number): string {
  return hour.toString().padStart(2, '0');
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AppointmentCreationModal({
  visible,
  initialDate = new Date(),
  initialHour = 9,
  onClose,
  onCreated,
}: AppointmentCreationModalProps) {
  const { colors } = useTheme();

  // Form state
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [date, setDate] = useState(formatDateKey(initialDate));
  const [startHour, setStartHour] = useState(initialHour.toString());
  const [startMinute, setStartMinute] = useState('0');
  const [endHour, setEndHour] = useState((initialHour + 1).toString());
  const [endMinute, setEndMinute] = useState('0');
  const [appointmentType, setAppointmentType] = useState('consulta');
  const [veterinarian, setVeterinarian] = useState('');
  const [description, setDescription] = useState('');

  // Pet search
  const [pets, setPets] = useState<any[]>([]);
  const [petSearchQuery, setPetSearchQuery] = useState('');
  const [petSearchResults, setPetSearchResults] = useState<any[]>([]);
  const [showPetSearch, setShowPetSearch] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all pets on mount
  useEffect(() => {
    if (visible) {
      setLoadingPets(true);
      api.pets.list().then((res) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        setPets(list);
      }).catch(() => {
        setPets([]);
      }).finally(() => setLoadingPets(false));
    }
  }, [visible]);

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedPetId(null);
      setPatientName('');
      setTutorName('');
      setTutorPhone('');
      setDate(formatDateKey(initialDate));
      setStartHour(initialHour.toString());
      setStartMinute('0');
      setEndHour(Math.min(initialHour + 1, 19).toString());
      setEndMinute('0');
      setAppointmentType('consulta');
      setVeterinarian('');
      setDescription('');
      setPetSearchQuery('');
      setPetSearchResults([]);
      setShowPetSearch(false);
      setError(null);
    }
  }, [visible, initialDate, initialHour]);

  // Filter pets for search
  useEffect(() => {
    if (petSearchQuery.trim().length < 1) {
      setPetSearchResults([]);
      return;
    }
    const q = petSearchQuery.toLowerCase();
    const results = pets.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.breed && p.breed.toLowerCase().includes(q)) ||
        (p.tutor_name && p.tutor_name.toLowerCase().includes(q))
    );
    setPetSearchResults(results.slice(0, 8));
  }, [petSearchQuery, pets]);

  const selectPet = useCallback((pet: any) => {
    setSelectedPetId(pet.id);
    setPatientName(pet.name || '');
    setTutorName(pet.tutor_name || '');
    setTutorPhone(pet.tutor_phone || '');
    setShowPetSearch(false);
    setPetSearchQuery('');
  }, []);

  const handleSubmit = async () => {
    if (!patientName.trim()) {
      setError('Ingresa el nombre del paciente');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const startDateTime = new Date(`${date}T${formatHour(parseInt(startHour))}:${startMinute.padStart(2, '0')}:00`);
      const endDateTime = new Date(`${date}T${formatHour(parseInt(endHour))}:${endMinute.padStart(2, '0')}:00`);

      const appointmentData: any = {
        patient_name: patientName.trim(),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        appointment_type: appointmentType,
        description: description.trim() || null,
        status: 'programada',
      };

      if (selectedPetId) {
        appointmentData.pet_id = selectedPetId;
      }
      if (veterinarian.trim()) {
        appointmentData.veterinarian = veterinarian.trim();
      }

      await api.appointments.create(appointmentData);
      onCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create appointment:', err);
      setError(err?.message || 'Error al crear la cita. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.overlayBg} activeOpacity={1} onPress={onClose} />
        <TouchableOpacity activeOpacity={1} style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Nueva Cita</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Patient Search */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Paciente *</Text>
              <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Search size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Buscar paciente..."
                  placeholderTextColor={colors.textSecondary}
                  value={petSearchQuery}
                  onChangeText={(text) => {
                    setPetSearchQuery(text);
                    setShowPetSearch(true);
                    if (text.length === 0) setSelectedPetId(null);
                  }}
                  onFocus={() => setShowPetSearch(true)}
                />
                {loadingPets && <ActivityIndicator size="small" color={colors.primary} />}
              </View>

              {/* Selected pet indicator */}
              {selectedPetId && !showPetSearch && (
                <View style={[styles.selectedPet, { backgroundColor: colors.primary + '15' }]}>
                  {pets.find((p) => p.id === selectedPetId)?.photo ? (
                    <Image
                      source={{ uri: pets.find((p) => p.id === selectedPetId)?.photo }}
                      style={styles.petAvatar}
                    />
                  ) : (
                    <View style={[styles.petAvatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={styles.petAvatarEmoji}>
                        {SPECIES_EMOJI[pets.find((p) => p.id === selectedPetId)?.species || ''] || '🐾'}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.selectedPetName, { color: colors.text }]}>{patientName}</Text>
                  <TouchableOpacity onPress={() => { setSelectedPetId(null); setPatientName(''); }}>
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Search results dropdown */}
              {showPetSearch && petSearchResults.length > 0 && (
                <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {petSearchResults.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      onPress={() => selectPet(pet)}
                    >
                      {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={styles.dropdownAvatar} />
                      ) : (
                        <View style={[styles.dropdownAvatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
                          <Text style={styles.dropdownAvatarEmoji}>{SPECIES_EMOJI[pet.species || ''] || '🐾'}</Text>
                        </View>
                      )}
                      <View style={styles.dropdownInfo}>
                        <Text style={[styles.dropdownName, { color: colors.text }]}>{pet.name}</Text>
                        <Text style={[styles.dropdownDetail, { color: colors.textSecondary }]}>
                          {pet.breed || (pet.species === 'dog' ? 'Perro' : 'Gato')} • {pet.tutor_name || 'Sin tutor'}
                        </Text>
                      </View>
                      {selectedPetId === pet.id && <Check size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Manual name input when no pet selected */}
              {!selectedPetId && (
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="O escribir nombre del paciente"
                  placeholderTextColor={colors.textSecondary}
                  value={patientName}
                  onChangeText={setPatientName}
                />
              )}
            </View>

            {/* Tutor info (when no pet selected) */}
            {!selectedPetId && (
              <>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre del tutor</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    placeholder="Nombre del dueño"
                    placeholderTextColor={colors.textSecondary}
                    value={tutorName}
                    onChangeText={setTutorName}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Teléfono</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    placeholder="+56 9..."
                    placeholderTextColor={colors.textSecondary}
                    value={tutorPhone}
                    onChangeText={setTutorPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            {/* Date & Time */}
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Calendar size={16} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.inputRowText, { color: colors.text }]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Hora inicio</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Clock size={16} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.inputRowText, { color: colors.text }]}
                    value={formatHour(parseInt(startHour))}
                    onChangeText={(text) => {
                      const h = parseInt(text.split(':')[0]) || 9;
                      setStartHour(Math.min(Math.max(h, 6), 19).toString());
                    }}
                    placeholder="09:00"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: SPACING.sm }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Hora fin</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Clock size={16} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.inputRowText, { color: colors.text }]}
                    value={formatHour(parseInt(endHour))}
                    onChangeText={(text) => {
                      const h = parseInt(text.split(':')[0]) || 10;
                      setEndHour(Math.min(Math.max(h, 6), 19).toString());
                    }}
                    placeholder="10:00"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Appointment Type */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de cita</Text>
              <View style={styles.typeGrid}>
                {APPOINTMENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor: appointmentType === type.key ? type.color + '20' : colors.background,
                        borderColor: appointmentType === type.key ? type.color : colors.border,
                      },
                    ]}
                    onPress={() => setAppointmentType(type.key)}
                  >
                    <View style={[styles.typeDot, { backgroundColor: type.color }]} />
                    <Text
                      style={[
                        styles.typeChipText,
                        { color: appointmentType === type.key ? type.color : colors.textSecondary },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Veterinarian */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Veterinario</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <User size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.inputRowText, { color: colors.text }]}
                  placeholder="Nombre del veterinario"
                  placeholderTextColor={colors.textSecondary}
                  value={veterinarian}
                  onChangeText={setVeterinarian}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción</Text>
              <View style={[styles.textAreaContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <FileText size={16} color={colors.textSecondary} style={{ marginTop: 4 }} />
                <TextInput
                  style={[styles.textArea, { color: colors.text }]}
                  placeholder="Motivo de la consulta..."
                  placeholderTextColor={colors.textSecondary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Error */}
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Check size={18} color="#FFF" />
              )}
              <Text style={styles.primaryBtnText}>
                {submitting ? 'Creando...' : 'Crear Cita'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    maxHeight: '70%',
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5, textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  inputRowText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  selectedPet: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: RADIUS.sm,
    marginTop: 8,
    gap: 8,
  },
  petAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  petAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAvatarEmoji: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  selectedPetName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    maxHeight: 240,
    zIndex: 100,
    ...SHADOWS.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  dropdownAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownAvatarEmoji: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  dropdownInfo: {
    flex: 1,
  },
  dropdownName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  dropdownDetail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  textAreaContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    gap: 8,
  },
  textArea: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    minHeight: 60,
    paddingTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  secondaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
