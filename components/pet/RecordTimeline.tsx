import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ClinicalRecord } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface RecordTimelineProps {
  records: ClinicalRecord[];
  onViewRecord?: (record: ClinicalRecord) => void;
}

const RECORD_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  consulta: { icon: 'stethoscope', color: '#3B82F6', label: 'Consulta' },
  vacuna: { icon: 'needle', color: '#10B981', label: 'Vacuna' },
  cirugia: { icon: 'scissors-cutting', color: '#EF4444', label: 'Cirugia' },
  control: { icon: 'clipboard-check', color: '#F59E0B', label: 'Control' },
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export default function RecordTimeline({ records, onViewRecord }: RecordTimelineProps) {
  const { colors } = useTheme();

  if (!records.length) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="clipboard-text-clock-outline" size={48} color={colors.textLight} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin registros clinicos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {records.map((record, i) => {
        const config = RECORD_CONFIG[record.record_type] || RECORD_CONFIG.consulta;
        return (
          <View key={record.id} style={styles.timelineItem}>
            {i < records.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
            <View style={[styles.dot, { backgroundColor: config.color }]}>
              <MaterialCommunityIcons name={config.icon as any} size={12} color="#FFF" />
            </View>
            <Card style={[styles.card, { backgroundColor: colors.surface }]}>
              <Card.Content>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.typeIcon, { backgroundColor: config.color + '18' }]}>
                      <MaterialCommunityIcons name={config.icon as any} size={16} color={config.color} />
                    </View>
                    <View>
                      <Text style={[styles.recordTitle, { color: colors.text }]}>
                        {config.label}{record.details?.notes ? ` — ${record.details.notes.substring(0, 40)}` : ''}
                      </Text>
                      <Text style={[styles.recordDate, { color: colors.textSecondary }]}>{formatDate(record.date)}</Text>
                    </View>
                  </View>
                  {onViewRecord && (
                    <Button compact mode="text" onPress={() => onViewRecord(record)} labelStyle={{ color: colors.primary }}>
                      Ver modulo ->
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: SPACING.lg,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  timelineItem: {
    position: 'relative',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.xl,
  },
  line: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: -8,
    width: 2,
  },
  dot: {
    position: 'absolute',
    left: 0,
    top: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: RADIUS.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  recordDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING['2xs'],
  },
});
