import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DirectusLabExam } from '../../services/directus';
import DisplayText from '../ui/DisplayText';
import VButton from '../ui/Button';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { formatDay } from '../../utils/vaccinePlan';

interface Props {
  exams: DirectusLabExam[];
  onOrder: () => void;
  onOpenAll: () => void;
  readOnly?: boolean;
}

// Pending exams first, then the latest results: the shortcut from the chart to what was ordered
export default function LabSection({ exams, onOrder, onOpenAll, readOnly }: Props) {
  const { colors } = useTheme();
  const sorted = [...exams].sort((a, b) =>
    (a.status === b.status ? 0 : a.status === 'pendiente' ? -1 : 1) || String(b.date || b.created_at).localeCompare(String(a.date || a.created_at)));
  const shown = sorted.slice(0, 5);
  const pending = exams.filter((e) => e.status === 'pendiente').length;

  return (
    <View style={styles.section}>
      <View style={styles.head}>
        <DisplayText style={[styles.title, { color: colors.text }]}>Exámenes</DisplayText>
        <View style={styles.headActions}>
          {exams.length > shown.length || exams.length ? <VButton size="sm" variant="ghost" onPress={onOpenAll}>Ver todos</VButton> : null}
          {!readOnly ? <VButton size="sm" variant="secondary" onPress={onOrder} icon={<Plus size={15} color={colors.primary} />}>Pedir exámenes</VButton> : null}
        </View>
      </View>
      <View style={[styles.table, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {shown.length ? shown.map((e, i) => (
          <View key={e.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={styles.what}>
              <Text style={[styles.name, { color: colors.text }]}>{e.exam_name}</Text>
              <Text style={[styles.state, { color: e.status === 'pendiente' ? colors.warning : colors.success }]}>
                {e.status === 'pendiente' ? 'Pendiente' : 'Con resultado'} · {formatDay(String(e.date || e.created_at).slice(0, 10))}
              </Text>
              {e.status === 'completado' && e.result ? <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={2}>{e.result}</Text> : null}
            </View>
          </View>
        )) : (
          <View style={styles.row}><Text style={[styles.meta, { color: colors.textSecondary }]}>Sin exámenes pedidos.</Text></View>
        )}
      </View>
      {pending > shown.filter((e) => e.status === 'pendiente').length ? (
        <Text style={[styles.meta, { color: colors.textSecondary, marginTop: SPACING.xs }]}>{pending} pendientes en total.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: SPACING.xl },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm, marginBottom: SPACING.md },
  headActions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  title: { fontSize: 26, lineHeight: 30, fontWeight: '600' },
  table: { borderWidth: 1, borderRadius: RADIUS.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  what: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  state: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium, marginTop: 1 },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 1 },
});
