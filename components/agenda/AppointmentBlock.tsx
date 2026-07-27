import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { formatTimeRange } from '../../utils/format';

export interface AppointmentBlockData {
  id: string;
  patient_name: string;
  start_time: string;
  end_time: string | null;
  appointment_type: string;
  description?: string | null;
  tutor_phone?: string | null;
  breed?: string;
}

interface AppointmentBlockProps {
  appointment: AppointmentBlockData;
  top: number;
  height: number;
  onPress?: (appointment: AppointmentBlockData) => void;
  compact?: boolean;
}

export default function AppointmentBlock({ appointment, top, height, onPress, compact }: AppointmentBlockProps) {
  const { colors } = useTheme();
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
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {appointment.patient_name}
        </Text>
        {!compact && height > 40 && appointment.breed ? (
          <Text style={[styles.breed, { color: colors.textLight }]} numberOfLines={1}>
            {appointment.breed}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  block: {
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
    lineHeight: 14,
  },
  breed: {
    fontSize: 10,
    lineHeight: 13,
  },
});
