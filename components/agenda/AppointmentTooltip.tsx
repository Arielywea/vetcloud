import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';

interface AppointmentTooltipProps {
  appointment: {
    patient_name: string;
    start_time: string;
    end_time: string | null;
    appointment_type: string;
    status: string;
    description?: string | null;
    tutor_phone?: string | null;
    veterinarian?: string | null;
    petPhoto?: string | null;
    petSpecies?: string;
    petBreed?: string;
    petWeight?: number | null;
    petSex?: string | null;
    tutorName?: string;
  };
  visible: boolean;
  x: number;
  y: number;
}

const STATUS_LABELS: Record<string, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  en_espera: 'En espera',
  en_consulta: 'En consulta',
  completada: 'Finalizada',
  pendiente: 'Pendiente',
  cancelada: 'Cancelada',
  ausente: 'Ausente',
};

const SPECIES_LABELS: Record<string, string> = {
  dog: 'Perro',
  cat: 'Gato',
};

const SEX_LABELS: Record<string, string> = {
  macho: 'Macho',
  hembra: 'Hembra',
};

export default function AppointmentTooltip({ appointment, visible, x, y }: AppointmentTooltipProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  const color = APPOINTMENT_TYPE_COLORS[appointment.appointment_type] || '#3B82F6';
  const startTime = new Date(appointment.start_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const endTime = appointment.end_time
    ? new Date(appointment.end_time).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View
      style={[
        styles.tooltip,
        {
          left: x,
          top: y,
          backgroundColor: colors.surface,
          ...SHADOWS.xl,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        {appointment.petPhoto ? (
          <Image source={{ uri: appointment.petPhoto }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: color + '20' }]}>
            <Text style={{ fontSize: 16 }}>🐾</Text>
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{appointment.patient_name}</Text>
          <Text style={[styles.time, { color }]}>
            {startTime} - {endTime}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.statusText, { color }]}>
            {STATUS_LABELS[appointment.status] || appointment.status}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={[styles.details, { borderTopColor: colors.border }]}>
        {appointment.petSpecies && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Especie</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {SPECIES_LABELS[appointment.petSpecies] || appointment.petSpecies}
            </Text>
          </View>
        )}
        {appointment.petBreed && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Raza</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.petBreed}</Text>
          </View>
        )}
        {appointment.petWeight && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Peso</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.petWeight} kg</Text>
          </View>
        )}
        {appointment.petSex && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Sexo</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{SEX_LABELS[appointment.petSex] || appointment.petSex}</Text>
          </View>
        )}
        {appointment.tutorName && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tutor</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.tutorName}</Text>
          </View>
        )}
        {appointment.veterinarian && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Veterinario</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{appointment.veterinarian}</Text>
          </View>
        )}
        {appointment.description && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Nota</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
              {appointment.description}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    zIndex: 500,
    width: 280,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  photoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  details: {
    borderTopWidth: 1,
    padding: SPACING.sm,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
