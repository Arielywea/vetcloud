import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DynamicIcon from '../ui/DynamicIcon';
import { Prescription } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import RoundTableIcon from '../icons/RoundTableIcon';

interface PrescriptionListProps {
  prescriptions: Prescription[];
  onView: (rx: Prescription) => void;
  onSendEmail: (rx: Prescription) => void;
}

export default function PrescriptionList({ prescriptions, onView, onSendEmail }: PrescriptionListProps) {
  const { colors } = useTheme();

  if (!prescriptions.length) {
    return (
      <View style={styles.empty}>
        <RoundTableIcon size={48} color={colors.textLight} accentColor="#C9A22740" />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Sin recetas</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>Las recetas emitidas se guardaran aqui</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {prescriptions.map(rx => (
        <Card key={rx.id} style={[styles.card, { backgroundColor: colors.background }]}>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(rx.issued_at).toLocaleDateString('es-CL')}
                </Text>
                <Text style={[styles.vet, { color: colors.text }]} numberOfLines={1}>
                  {rx.veterinarian_name || 'Sin veterinario'}
                </Text>
                <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
                  {rx.prescription_body.substring(0, 80)}...
                </Text>
              </View>
              <View style={styles.actions}>
                <Button compact mode="text" onPress={() => onView(rx)}>
                  <DynamicIcon name="eye" size={18} color="#C9A227" />
                </Button>
                <Button compact mode="text" onPress={() => onSendEmail(rx)}>
                  <DynamicIcon name="email-outline" size={18} color={colors.info} />
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl + SPACING.lg,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptySubtitle: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  card: {
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: '#C9A227',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  vet: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING['2xs'],
  },
  preview: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING['2xs'],
  },
  actions: {
    flexDirection: 'row',
  },
});