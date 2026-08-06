import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { APPOINTMENT_TYPE_COLORS, APPOINTMENT_STATUS_COLORS } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';
import { formatTimeRange } from '../../utils/format';

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
  onDragStart?: (appointmentId: string, data: AppointmentCardData, x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
};

export default function AppointmentCard({
  appointment,
  top,
  height,
  onPress,
  onContextMenu,
  onDragStart,
  onDragMove,
  onDragEnd,
  isDragging,
  compact,
}: AppointmentCardProps) {
  const { colors } = useTheme();
  const color = APPOINTMENT_TYPE_COLORS[appointment.appointment_type] || APPOINTMENT_TYPE_COLORS.consulta;
  const status = APPOINTMENT_STATUS_COLORS[appointment.status] || APPOINTMENT_STATUS_COLORS.programada;
  const speciesEmoji = SPECIES_EMOJI[appointment.petSpecies || ''] || '';

  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const isDragActive = useRef(false);
  const wasDragGesture = useRef(false);

  const handleContextMenu = (e: any) => {
    if (onContextMenu) {
      const x = e.nativeEvent?.pageX || e.nativeEvent?.locationX || 0;
      const y = e.nativeEvent?.pageY || e.nativeEvent?.locationY || 0;
      onContextMenu(appointment, x, y);
    }
  };

  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onStart((e) => {
      isDragActive.current = true;
      onDragStart?.(appointment.id, appointment, e.absoluteX, e.absoluteY);
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    });

  const pan = Gesture.Pan()
    .enabled(!!onDragStart)
    .onUpdate((e) => {
      if (isDragActive.current) {
        translateX.setValue(e.translationX);
        translateY.setValue(e.translationY);
        onDragMove?.(e.translationX, e.translationY);
      }
    })
    .onEnd((e) => {
      if (isDragActive.current) {
        isDragActive.current = false;
        wasDragGesture.current = true;
        setTimeout(() => { wasDragGesture.current = false; }, 300);
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        ]).start();
        onDragEnd?.();
      }
    })
    .onTouchesCancelled(() => {
      if (isDragActive.current) {
        isDragActive.current = false;
        wasDragGesture.current = true;
        setTimeout(() => { wasDragGesture.current = false; }, 300);
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        ]).start();
      }
    });

  const tap = Gesture.Tap()
    .onEnd(() => {
      if (!isDragActive.current && !wasDragGesture.current) {
        onPress?.(appointment);
      }
    });

  const composed = Gesture.Simultaneous(tap, longPress, pan);

  const cardContent = (
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
  );

  if (onDragStart) {
    return (
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            styles.card,
            {
              top,
              height: Math.max(height, compact ? 28 : 36),
              backgroundColor: color + '12',
              borderLeftColor: color,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
              zIndex: isDragging ? 100 : 1,
              elevation: isDragging ? 5 : 0,
              shadowColor: isDragging ? '#000' : 'transparent',
              shadowOffset: isDragging ? { width: 0, height: 2 } : { width: 0, height: 0 },
              shadowOpacity: isDragging ? 0.25 : 0,
              shadowRadius: isDragging ? 4 : 0,
            },
          ]}
        >
          {cardContent}
        </Animated.View>
      </GestureDetector>
    );
  }

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
      {cardContent}
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
    fontSize: TYPOGRAPHY.sizes.md,
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
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 13,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 14,
  },
  detail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 13,
  },
  tutor: {
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 12,
  },
});
