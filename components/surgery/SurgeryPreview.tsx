import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowRight, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSurgery } from '../../hooks/useDirectus';
import { Surgery } from '../../services/directus';
import { CONTAMINATION_LABELS, surgeryCategoryLabel } from '../../constants/surgeryMeta';
import DisplayText from '../ui/DisplayText';
import VButton from '../ui/Button';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';

// Desktop only: the critical points and the closure, to refresh memory without opening the whole guide.
export default function SurgeryPreview({ surgery, onOpen }: { surgery: Surgery | null; onOpen: (s: Surgery) => void }) {
  const { colors, onAccentText } = useTheme();
  const { surgery: full } = useSurgery(surgery ? String(surgery.id) : null);
  if (!surgery) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Text style={[styles.body, { color: colors.textSecondary, textAlign: 'center' }]}>Elige una cirugía de la lista para ver su resumen aquí.</Text>
      </View>
    );
  }
  const guide = full?.id === surgery.id ? full.guide : null;
  const meta = surgery.guide_meta;
  const facts = [surgeryCategoryLabel(surgery.category), meta?.duration, meta && CONTAMINATION_LABELS[meta.contamination]].filter(Boolean).join(' · ');

  return (
    <ScrollView style={[styles.pane, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
      <DisplayText style={[styles.title, { color: colors.text }]}>{surgery.nombre_cirugia}</DisplayText>
      <Text style={[styles.facts, { color: colors.textSecondary }]}>{facts}</Text>
      {surgery.guide_draft ? (
        <View style={[styles.draft, { backgroundColor: alpha(colors.warning, 0.1) }]}>
          <AlertTriangle size={15} color={colors.warning} style={{ marginTop: 2 }} />
          <Text style={[styles.small, { color: colors.text, flex: 1 }]}>Borrador pendiente de revisión veterinaria.</Text>
        </View>
      ) : null}
      <Text style={[styles.body, { color: colors.text, marginTop: SPACING.lg }]}>{surgery.guide_lede || surgery.indicaciones}</Text>

      {guide?.before_you_start?.length ? (
        <View style={[styles.block, { backgroundColor: alpha(colors.primary, 0.06) }]}>
          <Text style={[styles.heading, { color: colors.text }]}>Antes de entrar a pabellón</Text>
          {guide.before_you_start.map((t, i) => (
            <View key={i} style={styles.item}>
              <Text style={[styles.num, { color: colors.primary }]}>{i + 1}</Text>
              <Text style={[styles.small, { color: colors.text, flex: 1 }]}>{t}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {guide?.closure?.length ? (
        <View style={styles.closure}>
          <Text style={[styles.heading, { color: colors.text }]}>Cierre</Text>
          {guide.closure.map((c, i) => (
            <View key={i} style={styles.layer}>
              <Text style={[styles.small, { color: colors.text, fontWeight: TYPOGRAPHY.weights.semibold }]}>{c.layer}</Text>
              <Text style={[styles.small, { color: colors.textSecondary }]}>{`${c.suture} ${c.gauge} · ${c.pattern}`}</Text>
            </View>
          ))}
        </View>
      ) : !surgery.has_guide && surgery.tipo_sutura ? (
        <View style={styles.closure}>
          <Text style={[styles.heading, { color: colors.text }]}>Suturas</Text>
          <Text style={[styles.small, { color: colors.text }]}>{surgery.tipo_sutura}</Text>
        </View>
      ) : null}

      <VButton onPress={() => onOpen(surgery)} icon={<ArrowRight size={16} color={onAccentText.default} />} iconPosition="right" style={{ marginTop: SPACING.xl, alignSelf: 'flex-start' }}>
        {surgery.has_guide ? 'Abrir guía paso a paso' : 'Abrir ficha'}
      </VButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pane: { flex: 1, borderRadius: RADIUS.sm },
  content: { padding: SPACING['2xl'] },
  empty: { flex: 1, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center', padding: SPACING['2xl'] },
  title: { fontSize: 28, lineHeight: 32, fontWeight: '600' },
  facts: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.sm },
  draft: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.sm, borderRadius: RADIUS.sm, marginTop: SPACING.md },
  body: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 23 },
  block: { padding: SPACING.lg, borderRadius: RADIUS.sm, marginTop: SPACING.xl, gap: SPACING.sm },
  heading: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.xs },
  item: { flexDirection: 'row', gap: SPACING.sm },
  num: { width: 12, fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, fontWeight: TYPOGRAPHY.weights.bold },
  small: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20 },
  closure: { marginTop: SPACING.xl, gap: SPACING.sm },
  layer: { gap: 1 },
});
