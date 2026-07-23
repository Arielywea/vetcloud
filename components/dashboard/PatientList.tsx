import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

interface Patient {
  id: string;
  name: string;
  species: string;
  breed?: string;
  lastVisit?: string;
  avatar?: string;
}

interface PatientListProps {
  patients?: Patient[];
  onViewAll?: () => void;
}

export default function PatientList({ patients = [], onViewAll }: PatientListProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'canino': return '🐕';
      case 'felino': return '🐈';
      default: return '🐾';
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>👥</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Pacientes Recientes</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>Ver todos →</Text>
        </TouchableOpacity>
      </View>

      {patients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>Sin pacientes registrados</Text>
        </View>
      ) : (
        patients.map((patient, idx) => (
          <View
            key={patient.id}
            style={[
              styles.patientRow,
              idx < patients.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
              <Text style={styles.avatarEmoji}>{getSpeciesEmoji(patient.species)}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { color: colors.text }]}>{patient.name}</Text>
              <Text style={[styles.patientDetail, { color: colors.textSecondary }]}>
                {patient.species} · {patient.breed}
              </Text>
            </View>
            <Text style={[styles.patientDate, { color: colors.textLight }]}>{patient.lastVisit}</Text>
          </View>
        ))
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  viewAll: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  patientDetail: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  patientDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  emptyState: {
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
