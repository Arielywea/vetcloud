import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ClinicalRecord } from '../services/directus';
import { useTheme } from '../contexts/ThemeContext';

interface HistoryTimelineProps {
  records: ClinicalRecord[];
  onViewRecord?: (record: ClinicalRecord) => void;
}

const RECORD_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  consulta: { icon: 'stethoscope', color: '#1976D2', label: 'Consulta' },
  vacuna: { icon: 'needle', color: '#43A047', label: 'Vacuna' },
  cirugia: { icon: 'scissors-cutting', color: '#E53935', label: 'Cirugía' },
  control: { icon: 'clipboard-check', color: '#F57C00', label: 'Control' },
};

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export default function HistoryTimeline({ records, onViewRecord }: HistoryTimelineProps) {
  const { colors } = useTheme();

  if (!records.length) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="clipboard-text-clock-outline" size={48} color={colors.textLight} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin registros clínicos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {records.map((record, i) => {
        const config = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.consulta;
        return (
          <View key={record.id} style={styles.timelineItem}>
            {i < records.length - 1 && <View style={[styles.line, { backgroundColor: colors.border }]} />}
            <View style={[styles.dot, { backgroundColor: config.color }]}>
              <MaterialCommunityIcons name={config.icon as any} size={12} color="#FFF" />
            </View>
            <Card style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: colors.border }]}>
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
                    <Button compact mode="text" onPress={() => onViewRecord(record)} style={styles.viewBtn}>
                      Ver módulo →
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
  container: { paddingLeft: 20 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { marginTop: 8, fontStyle: 'italic' },
  timelineItem: { position: 'relative', marginBottom: 8, paddingLeft: 24 },
  line: {
    position: 'absolute', left: 7, top: 20, bottom: -8,
    width: 2,
  },
  dot: {
    position: 'absolute', left: 0, top: 12,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  typeIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  recordTitle: { fontSize: 13, fontWeight: '600' },
  recordDate: { fontSize: 11, marginTop: 2 },
  viewBtn: { paddingVertical: 0 },
});
