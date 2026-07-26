import React from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS, APPOINTMENT_STATUS_COLORS } from '../../constants/colors';
import { X, Calendar, Stethoscope, Flag, User, Phone, FileText, AlertTriangle, FolderOpen, UserPlus } from 'lucide-react-native';

const TYPE_LABELS: Record<string, string> = {
  consulta: 'Consulta',
  vacuna: 'Vacuna',
  cirugia: 'Cirugía',
  control: 'Control',
  terreno: 'Terreno',
  examenes: 'Exámenes',
  hospitalizacion: 'Hospitalización',
};

export interface AppointmentDetail {
  id: string;
  patient_name: string;
  start_time: string;
  end_time: string | null;
  appointment_type: string;
  status: string;
  description?: string | null;
  tutor_phone?: string | null;
  veterinarian?: string | null;
  room?: string | null;
  pet_id?: string | null;
  petPhoto?: string | null;
  petSpecies?: string;
  petBreed?: string;
  tutorName?: string;
}

interface AppointmentDetailModalProps {
  visible: boolean;
  appointment: AppointmentDetail | null;
  onClose: () => void;
  onGoToPatient?: () => void;
  onRegisterPatient?: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
};

export default function AppointmentDetailModal({
  visible,
  appointment,
  onClose,
  onGoToPatient,
  onRegisterPatient,
}: AppointmentDetailModalProps) {
  const { colors } = useTheme();

  if (!appointment) return null;

  const color = APPOINTMENT_TYPE_COLORS[appointment.appointment_type] || APPOINTMENT_TYPE_COLORS.consulta;
  const status = APPOINTMENT_STATUS_COLORS[appointment.status] || APPOINTMENT_STATUS_COLORS.programada;
  const speciesEmoji = SPECIES_EMOJI[appointment.petSpecies || ''] || '';
  const isRegistered = !!appointment.pet_id;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {appointment.petPhoto ? (
                <Image source={{ uri: appointment.petPhoto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: color + '20' }]}>
                  <Text style={styles.avatarEmoji}>{speciesEmoji || '🐾'}</Text>
                </View>
              )}
              <View>
                <Text style={[styles.patientName, { color: colors.text }]}>{appointment.patient_name}</Text>
                {appointment.petBreed ? (
                  <Text style={[styles.breed, { color: colors.textSecondary }]}>
                    {speciesEmoji} {appointment.petBreed}
                  </Text>
                ) : appointment.petSpecies ? (
                  <Text style={[styles.breed, { color: colors.textSecondary }]}>
                    {speciesEmoji} {appointment.petSpecies === 'dog' ? 'Perro' : 'Gato'}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={[styles.body, { borderTopColor: colors.border }]}>
            {/* Date & Time */}
            <View style={styles.row}>
              <Calendar size={18} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Fecha y hora</Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>
                  {formatDate(appointment.start_time)}
                </Text>
                <Text style={[styles.rowValue, { color }]}>
                  {formatTime(appointment.start_time)} - {appointment.end_time ? formatTime(appointment.end_time) : 'por definir'}
                </Text>
              </View>
            </View>

            {/* Type */}
            <View style={styles.row}>
              <Stethoscope size={18} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Tipo de cita</Text>
                <View style={styles.typeBadge}>
                  <View style={[styles.typeDot, { backgroundColor: color }]} />
                  <Text style={[styles.rowValue, { color: colors.text }]}>
                    {TYPE_LABELS[appointment.appointment_type] || appointment.appointment_type}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status */}
            <View style={styles.row}>
              <Flag size={18} color={colors.textSecondary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Estado</Text>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={[styles.rowValue, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
            </View>

            {/* Veterinarian */}
            {appointment.veterinarian ? (
              <View style={styles.row}>
                <User size={18} color={colors.textSecondary} />
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Veterinario</Text>
                  <Text style={[styles.rowValue, { color: colors.text }]}>{appointment.veterinarian}</Text>
                </View>
              </View>
            ) : null}

            {/* Phone */}
            {appointment.tutor_phone ? (
              <View style={styles.row}>
                <Phone size={18} color={colors.textSecondary} />
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Teléfono del tutor</Text>
                  <Text style={[styles.rowValue, { color: colors.text }]}>{appointment.tutor_phone}</Text>
                </View>
              </View>
            ) : null}

            {/* Description */}
            {appointment.description ? (
              <View style={styles.row}>
                <FileText size={18} color={colors.textSecondary} />
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Descripción</Text>
                  <Text style={[styles.rowValue, { color: colors.text }]}>{appointment.description}</Text>
                </View>
              </View>
            ) : null}

            {/* Registration status */}
            {!isRegistered && (
              <View style={[styles.unregisteredBanner, { backgroundColor: colors.warning + '20', borderColor: colors.warning }]}>
                <AlertTriangle size={18} color={colors.warning} />
                <Text style={styles.unregisteredText}>
                  Este paciente no tiene ficha clínica registrada
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            {isRegistered ? (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={onGoToPatient}
              >
                <FolderOpen size={18} color="#FFF" />
                <Text style={styles.primaryBtnText}>Ver ficha clínica</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.warning }]}
                onPress={onRegisterPatient}
              >
                <UserPlus size={18} color="#FFF" />
                <Text style={styles.primaryBtnText}>Registrar paciente</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={onClose}>
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '700',
  },
  breed: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unregisteredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginTop: 4,
  },
  unregisteredText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
