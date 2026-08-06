import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Divider } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import DynamicIcon from '../ui/DynamicIcon';

export interface PreSurgicalData {
  items: { label: string; checked: boolean }[];
  anestesista: string;
  cirujano: string;
  completed_at: string;
}

interface PreSurgicalChecklistProps {
  data?: PreSurgicalData;
  onChange?: (data: PreSurgicalData) => void;
  readonly?: boolean;
}

const DEFAULT_ITEMS = [
  { label: 'Consentimiento informado firmado', checked: false },
  { label: 'Ayuno 12h verificado', checked: false },
  { label: 'Acceso venoso permeable', checked: false },
  { label: 'Electrolitos prequirurgicos OK', checked: false },
  { label: 'Evaluacion cardiaca pre-anestesia', checked: false },
  { label: 'Radiografia toraxica (si aplica)', checked: false },
  { label: 'Pre-anestesico administrado', checked: false },
  { label: 'Monitor conectado y calibrado', checked: false },
  { label: 'Circuito de anestesia preparado', checked: false },
  { label: 'Equipo de reanimacion disponible', checked: false },
  { label: 'Cirujano y anestesista confirmados', checked: false },
];

export default function PreSurgicalChecklist({ data, onChange, readonly = false }: PreSurgicalChecklistProps) {
  const { colors } = useTheme();

  const [items, setItems] = useState(
    data?.items && data.items.length > 0 ? data.items : DEFAULT_ITEMS
  );
  const [anestesista, setAnestesista] = useState(data?.anestesista || '');
  const [cirujano, setCirujano] = useState(data?.cirujano || '');

  const checkedCount = items.filter(i => i.checked).length;
  const allChecked = checkedCount === items.length;
  const progress = items.length > 0 ? checkedCount / items.length : 0;

  const toggleItem = useCallback((index: number) => {
    if (readonly) return;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], checked: !newItems[index].checked };
    setItems(newItems);
    onChange?.({
      items: newItems,
      anestesista,
      cirujano,
      completed_at: allChecked ? new Date().toISOString() : '',
    });
  }, [items, anestesista, cirujano, allChecked, readonly, onChange]);

  const updateAnestesista = (v: string) => {
    setAnestesista(v);
    onChange?.({ items, anestesista: v, cirujano, completed_at: '' });
  };

  const updateCirujano = (v: string) => {
    setCirujano(v);
    onChange?.({ items, anestesista, cirujano: v, completed_at: '' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <DynamicIcon name="clipboard-check-outline" size={20} color={allChecked ? colors.success : colors.warning} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Checklist Pre-Cirugia</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {checkedCount}/{items.length} {allChecked ? '- Listo' : '- Pendiente'}
          </Text>
        </View>
        {!readonly && (
          <View style={[styles.progressCircle, { borderColor: allChecked ? colors.success : colors.warning }]}>
            <Text style={[styles.progressText, { color: allChecked ? colors.success : colors.warning }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: allChecked ? colors.success : colors.primary }]} />
      </View>

      {items.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.item, { backgroundColor: item.checked ? (colors.success + '10') : colors.surface, borderColor: item.checked ? colors.success : colors.border }]}
          onPress={() => toggleItem(i)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.7}
        >
          <View style={[styles.checkbox, { borderColor: item.checked ? colors.success : colors.textLight, backgroundColor: item.checked ? colors.success : 'transparent' }]}>
            {item.checked && <DynamicIcon name="check" size={14} color="#FFF" />}
          </View>
          <Text style={[styles.itemLabel, { color: item.checked ? colors.textSecondary : colors.text }, item.checked && styles.itemLabelChecked]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}

      <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.signaturesRow}>
        <View style={styles.signatureCol}>
          <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>Cirujano</Text>
          <TextInput
            value={cirujano}
            onChangeText={updateCirujano}
            mode="outlined"
            dense
            style={styles.signatureInput}
            placeholder="Dr. ..."
            editable={!readonly}
          />
        </View>
        <View style={styles.signatureCol}>
          <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>Anestesista</Text>
          <TextInput
            value={anestesista}
            onChangeText={updateAnestesista}
            mode="outlined"
            dense
            style={styles.signatureInput}
            placeholder="Dr. ..."
            editable={!readonly}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.xs,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    flex: 1,
  },
  itemLabelChecked: {
    textDecorationLine: 'line-through',
  },
  divider: {
    marginVertical: SPACING.md,
  },
  signaturesRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signatureInput: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
