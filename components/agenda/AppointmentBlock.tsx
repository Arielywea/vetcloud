import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';

export interface AppointmentBlockData {
  id: string;
  patient_name: string;
  start_time: string;
  end_time: string | null;
  appointment_type: string;
  description?: string | null;
  tutor_phone?: string | null;
}

interface AppointmentBlockProps {
  appointment: AppointmentBlockData;
  top: number;
  height: number;
  onPress?: (appointment: AppointmentBlockData) => void;
  compact?: boolean;
}

function formatTimeRange(start: string, end: string | null): string {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(s.getTime() + 45 * 60000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return `${fmt(s)} - ${fmt(e)}`;
}

export default function AppointmentBlock({ appointment, top, height, onPress, compact }: AppointmentBlockProps) {
  const color = APPOINTMENT_TYPE_COLORS[appointment.appointment_type] || APPOINTMENT_TYPE_COLORS.consulta;

  return (
    <TouchableOpacity
      style={[
        styles.block,
        {
          top,
          height: Math.max(height, 24),
          backgroundColor: color + '18',
          borderLeftColor: color,
        },
      ]}
      onPress={() => onPress?.(appointment)}
      activeOpacity={0.7}
    >
      <View style={[styles.content, compact && styles.contentCompact]}>
        <Text style={[styles.time, { color }]} numberOfLines={1}>
          {formatTimeRange(appointment.start_time, appointment.end_time)}
        </Text>
        <Text style={styles.name} numberOfLines={1}>
          {appointment.patient_name}
        </Text>
        {!compact && height > 40 && (
          <Text style={styles.detail} numberOfLines={1}>
            {appointment.appointment_type.charAt(0).toUpperCase() + appointment.appointment_type.slice(1)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    left: 2,
    right: 2,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  contentCompact: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 13,
  },
  name: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: '#1A2332',
    lineHeight: 14,
  },
  detail: {
    fontSize: 10,
    color: '#5A6B80',
    lineHeight: 13,
  },
});
