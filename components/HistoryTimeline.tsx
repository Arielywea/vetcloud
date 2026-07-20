import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ClinicalRecord } from '../services/directus';
import { APP_COLORS } from '../constants/colors';

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
    return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function HistoryTimeline({ records, onViewRecord }: HistoryTimelineProps) {
  if (!records.length) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="clipboard-text-clock-outline" size={48} color={APP_COLORS.textLight} />
        <Text style={styles.emptyText}>Sin registros clínicos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {records.map((record, i) => {
        const config = RECORD_TYPE_CONFIG[record.record_type] || RECORD_TYPE_CONFIG.consulta;
        return (
          <View key={record.id} style={styles.timelineItem}>
            {i < records.length - 1 && <View style={styles.line} />}
            <View style={[styles.dot, { backgroundColor: config.color }]}>
              <MaterialCommunityIcons name={config.icon as any} size={14} color="#FFF" />
            </View>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardType}>
                    <MaterialCommunityIcons name={config.icon as any} size={16} color={config.color} />
                    <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
                  </View>
                  <Text style={styles.date}>{formatDate(record.date)}</Text>
                </View>
                {record.veterinarian && (
                  <Text style={styles.vet}>Dr(a). {record.veterinarian}</Text>
                )}
                {record.details?.notes && (
                  <Text style={styles.notes} numberOfLines={2}>{record.details.notes}</Text>
                )}
                {record.details?.weight && (
                  <Text style={styles.weight}>Peso: {record.details.weight} kg</Text>
                )}
                {onViewRecord && (
                  <Button mode="text" compact onPress={() => onViewRecord(record)} style={styles.viewBtn}>
                    Ver detalle
                  </Button>
                )}
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
    paddingLeft: 20,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: APP_COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 12,
    paddingLeft: 24,
  },
  line: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: -12,
    width: 2,
    backgroundColor: APP_COLORS.border,
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
    borderRadius: 10,
    backgroundColor: APP_COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
  },
  vet: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginBottom: 4,
  },
  notes: {
    fontSize: 13,
    color: APP_COLORS.text,
    lineHeight: 18,
  },
  weight: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    marginTop: 4,
  },
  viewBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 0,
  },
});
