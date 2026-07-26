import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS, APPOINTMENT_STATUS_COLORS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export interface AppointmentCardData {
  id: string;
  patient_name: string;
  start_time: string;
  end_time: string | null;
  appointment_type: string;
  description?: string | null;
  tutor_phone?: string | null;
  status: string;
  veterinarian?: string | null;
  room?: string | null;
  pet_id?: string | null;
  petPhoto?: string | null;
  petSpecies?: string;
  petBreed?: string;
  tutorName?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentCardData;
  top: number;
  height: number;
  onPress?: (appointment: AppointmentCardData) => void;
  onContextMenu?: (appointment: AppointmentCardData, x: number, y: number) => void;
  compact?: boolean;
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
};

function formatTimeRange(start: string, end: string | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(s.getTime() + 45 * 60000);
  const fmt = (d: Date) => d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(s)} - ${fmt(e)}`;
}

export default function AppointmentCard({
  appointment,
  top,
  height,
  onPress,
  onContextMenu,
  compact,
}: AppointmentCardProps) {
  const { colors } = useTheme();
  const color = APPOINTMENT_TYPE_COLORS[appointment.appointment_type] || APPOINTMENT_TYPE_COLORS.consulta;
  const status = APPOINTMENT_STATUS_COLORS[appointment.status] || APPOINTMENT_STATUS_COLORS.programada;
  const speciesEmoji = SPECIES_EMOJI[appointment.petSpecies || ''] || '';

  const handleContextMenu = (e: any) => {
    if (onContextMenu) {
      const x = e.nativeEvent?.pageX || e.nativeEvent?.locationX || 0;
      const y = e.nativeEvent?.pageY || e.nativeEvent?.locationY || 0;
      onContextMenu(appointment, x, y);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          top,
          height: Math.max(height, compact ? 28 : 36),
          backgroundColor: color + '12',
          borderLeftColor: color,
        },
      ]}
      onPress={() => onPress?.(appointment)}
      onLongPress={handleContextMenu}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Photo */}
        {!compact && appointment.petPhoto ? (
          <Image source={{ uri: appointment.petPhoto }} style={styles.photo} />
        ) : !compact ? (
          <View style={[styles.photoPlaceholder, { backgroundColor: color + '20' }]}>
            <Text style={styles.photoEmoji}>{speciesEmoji || '🐾'}</Text>
          </View>
        ) : null}

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={[styles.time, { color }]} numberOfLines={1}>
              {formatTimeRange(appointment.start_time, appointment.end_time)}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
          </View>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{appointment.patient_name}</Text>
          {!compact && height > 50 && (
            <>
              {appointment.petBreed ? (
                <Text style={[styles.detail, { color: colors.textLight }]} numberOfLines={1}>
                  {speciesEmoji} {appointment.petBreed}
                </Text>
              ) : appointment.petSpecies ? (
                <Text style={[styles.detail, { color: colors.textLight }]} numberOfLines={1}>
                  {speciesEmoji} {appointment.petSpecies === 'dog' ? 'Perro' : 'Gato'}
                </Text>
              ) : null}
              {appointment.tutorName && height > 65 ? (
                <Text style={[styles.tutor, { color: colors.textLight }]} numberOfLines={1}>👤 {appointment.tutorName}</Text>
              ) : null}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: 6,
    borderLeftWidth: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  photo: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  photoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 14,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  detail: {
    fontSize: 10,
    lineHeight: 13,
  },
  tutor: {
    fontSize: 9,
    lineHeight: 12,
  },
});
