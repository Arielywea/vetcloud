import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import DynamicIcon from '../ui/DynamicIcon';
import { ClinicalRecord } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { RECORD_TYPE_CONFIG } from '../../constants/icons';
import RoundTableIcon from '../icons/RoundTableIcon';

interface RecordTimelineProps {
  records: ClinicalRecord[];
  onViewRecord?: (record: ClinicalRecord) => void;
}

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
        <RoundTableIcon size={56} color={colors.textLight} accentColor="#C9A22760" />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Sin registros clinicos</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textLight }]}>Los registros de consultas apareceran aqui</Text>
      </View>
    );
  }

  const getSoapPreview = (record: ClinicalRecord): string => {
    const d = record.details || {};
    if (d.subjective || d.objective || d.assessment || d.plan) {
      const parts: string[] = [];
      if (d.subjective) parts.push(`S: ${d.subjective.substring(0, 30)}`);
      if (d.objective) parts.push(`O: ${d.objective.substring(0, 30)}`);
      return parts.join(' | ') || 'Formato SOAP';
    }
    if (d.notes) return d.notes.substring(0, 50);
    return '';
  };

  return (
    <View style={styles.container}>
      {records.map((record, i) => {
        const config = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.consulta;
        const preview = getSoapPreview(record);
        const hasChecklist = record.record_type === 'cirugia' && record.details?.pre_surgical_checklist;
        const hasSoap = !!(record.details?.subjective || record.details?.objective);
        return (
          <View key={record.id} style={styles.timelineItem}>
            {i < records.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
            <View style={[styles.dot, { backgroundColor: config.color }]}>
              <DynamicIcon name={config.icon as any} size={12} color="#FFF" />
            </View>
            <Card style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Card.Content>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.typeIcon, { backgroundColor: config.bgColor }]}>
                      <DynamicIcon name={config.icon as any} size={16} color={config.color} />
                    </View>
                    <View style={styles.cardInfo}>
                      <View style={styles.cardTitleRow}>
                        <Text style={[styles.recordTitle, { color: colors.text }]}>
                          {config.label}
                        </Text>
                        {hasSoap && (
                          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>SOAP</Text>
                          </View>
                        )}
                        {hasChecklist && (
                          <View style={[styles.badge, { backgroundColor: colors.success + '20' }]}>
                            <DynamicIcon name="clipboard-check" size={10} color={colors.success} />
                            <Text style={[styles.badgeText, { color: colors.success }]}>Check</Text>
                          </View>
                        )}
                      </View>
                      {preview ? (
                        <Text style={[styles.recordPreview, { color: colors.textSecondary }]} numberOfLines={1}>{preview}</Text>
                      ) : null}
                      <Text style={[styles.recordDate, { color: colors.textLight }]}>{formatDate(record.date)}</Text>
                    </View>
                  </View>
                  {onViewRecord && (
                    <Button compact mode="text" onPress={() => onViewRecord(record)} labelStyle={{ color: '#C9A227' }}>
                      Ver modulo
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
    borderWidth: 1,
    ...SHADOWS.xs,
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
  recordPreview: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  recordDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: SPACING['2xs'],
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});