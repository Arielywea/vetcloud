import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import DynamicIcon from '../ui/DynamicIcon';
import { DirectusPet } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { calculateAge } from '../../utils/age';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import InfoPills from './InfoPills';
import PawShieldIcon from '../icons/PawShieldIcon';

interface PetHeaderProps {
  pet: DirectusPet;
  onEdit?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
}

const SEX_LABELS: Record<string, string> = {
  macho: 'Macho',
  hembra: 'Hembra',
};

export default function PetHeader({ pet, onEdit, onCall, onEmail }: PetHeaderProps) {
  const { colors } = useTheme();
  const age = calculateAge(pet.birth_date);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Breadcrumb */}
      <View style={styles.breadcrumb}>
        <TouchableOpacity onPress={() => { /* navigated via router in parent */ }}>
          <Text style={[styles.breadcrumbLink, { color: colors.primary }]}>← Pacientes</Text>
        </TouchableOpacity>
        <Text style={[styles.breadcrumbSeparator, { color: colors.textSecondary }]}>›</Text>
        <Text style={[styles.breadcrumbCurrent, { color: colors.text }]}>{pet.name}</Text>
      </View>

      {/* Main header row */}
      <View style={styles.headerRow}>
        {/* Left: Photo */}
        <View style={styles.photoSection}>
          <View style={[styles.photo, { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#C9A227' }]}>
            {pet.photo ? (
              <Image source={{ uri: pet.photo }} style={styles.photoImage} />
            ) : (
              <PawShieldIcon size={48} color="#FFFFFF" accentColor="#C9A227" />
            )}
          </View>
        </View>

        {/* Center: Pet info */}
        <View style={styles.infoSection}>
          <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
          <Text style={[styles.petBreed, { color: colors.textSecondary }]}>
            {pet.breed || 'Sin raza'} � {age}
          </Text>
          <View style={styles.statusRow}>
            {pet.sex && (
              <View style={styles.statusBadge}>
                <DynamicIcon
                  name={pet.sex === 'macho' ? 'gender-male' : 'gender-female'}
                  size={14}
                  color={colors.primary}
                />
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  {SEX_LABELS[pet.sex] || pet.sex}
                </Text>
              </View>
            )}
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.statusText, { color: '#10B981' }]}>Activo</Text>
            </View>
          </View>
        </View>

        {/* Right: Owner + actions */}
        <View style={styles.ownerSection}>
          {pet.tutor_name && (
            <>
              <Text style={[styles.ownerLabel, { color: colors.textSecondary }]}>PROPIETARIO</Text>
              <Text style={[styles.ownerName, { color: colors.text }]}>{pet.tutor_name}</Text>
            </>
          )}
          {pet.phone && (
            <Text style={[styles.ownerDetail, { color: colors.textSecondary }]}>{pet.phone}</Text>
          )}
          {pet.email && (
            <Text style={[styles.ownerDetail, { color: colors.textSecondary }]}>{pet.email}</Text>
          )}
          <View style={styles.actionsRow}>
            {pet.phone && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryContainer }]} onPress={onCall}>
                <DynamicIcon name="phone" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            {pet.email && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryContainer }]} onPress={onEmail}>
                <DynamicIcon name="email-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryContainer }]} onPress={onEdit}>
              <DynamicIcon name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Info pills */}
      <InfoPills pet={pet} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    ...SHADOWS.xl,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  breadcrumbLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  breadcrumbSeparator: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  breadcrumbCurrent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  headerRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  photoSection: {
    flex: 0,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: SPACING.lg,
  },
  petName: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  petBreed: {
    fontSize: TYPOGRAPHY.sizes.base,
    marginTop: SPACING.xs,
  },
  statusRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  ownerSection: {
    flex: 0,
    alignItems: 'flex-end',
  },
  ownerLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ownerName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.xs,
  },
  ownerDetail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
