import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import DynamicIcon from '../ui/DynamicIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';

interface AlertBannerProps {
  pet: DirectusPet;
}

interface Alert {
  icon: string;
  color: string;
  label: string;
}

export default function AlertBanner({ pet }: AlertBannerProps) {
  const { colors } = useTheme();

  const alerts: Alert[] = [];

  // Allergy alert
  if (pet.allergies && pet.allergies.length > 0) {
    alerts.push({
      icon: 'alert-circle',
      color: colors.error,
      label: `Alergia: ${pet.allergies[0]}${pet.allergies.length > 1 ? ` +${pet.allergies.length - 1}` : ''}`,
    });
  }

  // Medication alert
  if (pet.medications) {
    alerts.push({
      icon: 'pill',
      color: colors.info,
      label: 'Medicacion en curso',
    });
  }

  // Status alert
  if (pet.status === 'deceased') {
    alerts.push({
      icon: 'heart-broken',
      color: colors.textSecondary,
      label: 'Paciente fallecido',
    });
  }

  // Weight alert (underweight/overweight based on species)
  if (pet.weight > 0) {
    const isDog = pet.species === 'dog';
    const minHealthy = isDog ? 2 : 0.5;
    const maxHealthy = isDog ? 80 : 12;
    if (pet.weight < minHealthy) {
      alerts.push({
        icon: 'alert',
        color: colors.warning,
        label: `Peso bajo (${pet.weight} kg)`,
      });
    } else if (pet.weight > maxHealthy) {
      alerts.push({
        icon: 'alert',
        color: colors.warning,
        label: `Sobrepeso (${pet.weight} kg)`,
      });
    }
  }

  if (alerts.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {alerts.map((alert, i) => (
        <View key={i} style={[styles.alertRow, i < alerts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <DynamicIcon name={alert.icon as any} size={16} color={alert.color} />
          <Text style={[styles.alertText, { color: alert.color }]} numberOfLines={1}>
            {alert.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  alertText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
