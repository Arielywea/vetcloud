import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar, Clock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { TEXT_ON_PRIMARY } from '../../constants/colors';

interface NextAppointmentCardProps {
  petName?: string;
  petBreed?: string;
  petAge?: string;
  time?: string;
  type?: string;
  petAvatar?: string;
  onViewDetails?: () => void;
  onStartConsult?: () => void;
}

export default function NextAppointmentCard({
  petName = 'Max',
  petBreed = 'Golden Retriever',
  petAge = '3 años',
  time = '11:30 AM',
  type = 'Consulta general',
  onViewDetails,
  onStartConsult,
}: NextAppointmentCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm]}>
      {/* Header */}
      <View style={styles.header}>
        <Calendar size={18} color={colors.primary} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Próxima Cita</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.time, { color: colors.warning }]}>{time}</Text>
          <Text style={[styles.petName, { color: colors.text }]}>{petName}</Text>
          <Text style={[styles.type, { color: colors.textSecondary }]}>{type}</Text>
          <Text style={[styles.breed, { color: colors.textSecondary }]}>
            {petBreed} · {petAge}
          </Text>
        </View>

        {/* Avatar placeholder */}
        <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.avatarEmoji, { color: colors.primary }]}>🐕</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btnOutlined, { borderColor: colors.border }]}
          onPress={onViewDetails}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnOutlinedText, { color: colors.text }]}>Ver detalles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
          onPress={onStartConsult}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnPrimaryText, { color: TEXT_ON_PRIMARY.light.default }]}>
            Iniciar consulta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  info: {
    flex: 1,
    gap: SPACING.xs,
  },
  time: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  petName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  type: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  breed: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  btnOutlined: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnOutlinedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
