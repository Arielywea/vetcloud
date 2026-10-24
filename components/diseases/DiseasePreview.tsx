import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Star, AlertTriangle, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DirectusDisease } from '../../services/directus';
import { SEVERITY_LABELS, SEVERITY_TONE } from '../../constants/colors';
import { PROGNOSIS_LABELS, SPECIES_LABELS, categoryLabel, signTitle } from '../../constants/diseaseMeta';
import DisplayText from '../ui/DisplayText';
import VButton from '../ui/Button';
import VBadge from '../ui/Badge';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { isDraft } from './DiseaseRow';

export const FREQUENCY_LABELS: Record<string, string> = {
  muy_frecuente: 'Muy frecuente', frecuente: 'Frecuente', ocasional: 'Ocasional', rara: 'Rara',
};

interface DiseasePreviewProps {
  disease: DirectusDisease | null;
  favorite: boolean;
  onToggleFavorite: (d: DirectusDisease) => void;
  onOpen: (d: DirectusDisease) => void;
}

/** First sentences of the description, so the preview reads as a summary and not a wall of text */
function lead(text: string, max = 420): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return (end > 160 ? cut.slice(0, end + 1) : cut.trimEnd() + '…');
}

// Desktop only: enough to confirm "this is the one" (or rule it out) without leaving the list.
export default function DiseasePreview({ disease: d, favorite, onToggleFavorite, onOpen }: DiseasePreviewProps) {
  const { colors, onAccentText } = useTheme();
  if (!d) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Text style={[styles.body, { color: colors.textSecondary, textAlign: 'center' }]}>Elige una enfermedad de la lista para ver su resumen aquí.</Text>
      </View>
    );
  }
  const signs = (d.key_signs || []).map(signTitle).filter(Boolean).slice(0, 8);
  // The emergency field is "PRESENTACIÓN: … PROTOCOLO: …": the preview shows how it presents; the protocol is in the sheet
  const emergency = (d.treatment?.emergency || '').split(/PROTOCOLO\s*:/i)[0].replace(/^\s*PRESENTACI[ÓO]N\s*:\s*/i, '').trim();
  const severity = (SEVERITY_LABELS as Record<string, string>)[d.severity] || d.severity;
  const facts = [SPECIES_LABELS[d.species], categoryLabel(d.category), d.prognosis ? `Pronóstico ${String(PROGNOSIS_LABELS[d.prognosis] || d.prognosis).toLowerCase()}` : null].filter(Boolean).join(' · ');

  return (
    <ScrollView style={[styles.pane, { backgroundColor: colors.surface }]} contentContainerStyle={styles.content}>
      <DisplayText style={[styles.title, { color: colors.text }]}>{d.name}</DisplayText>
      {d.scientific_name || d.english_name ? (
        <Text style={[styles.alt, { color: colors.textSecondary }]}>
          {d.scientific_name ? <Text style={{ fontStyle: 'italic' }}>{d.scientific_name}</Text> : null}
          {d.scientific_name && d.english_name ? ' · ' : ''}{d.english_name || ''}
        </Text>
      ) : null}
      <Text style={[styles.facts, { color: colors.textSecondary }]}>{facts}</Text>
      <View style={styles.seals}>
        <VBadge variant={SEVERITY_TONE[d.severity] || 'neutral'} size="sm">{severity}</VBadge>
        {d.is_zoonotic ? <VBadge variant="danger" size="sm">Zoonótica</VBadge> : null}
        {d.chile_frequency ? <VBadge variant="neutral" size="sm">{`En Chile: ${FREQUENCY_LABELS[d.chile_frequency].toLowerCase()}`}</VBadge> : null}
        {isDraft(d) ? <VBadge variant="warning" size="sm">Borrador sin revisar</VBadge> : null}
      </View>

      {emergency ? (
        <View style={[styles.emergency, { backgroundColor: alpha(colors.error, 0.08) }]}>
          <AlertTriangle size={16} color={colors.error} />
          <View style={styles.grow}>
            <Text style={[styles.label, { color: colors.error }]}>Urgencia</Text>
            <Text style={[styles.body, { color: colors.text }]} numberOfLines={5}>{emergency}</Text>
          </View>
        </View>
      ) : null}

      {d.description ? <Text style={[styles.body, { color: colors.text }]}>{lead(d.description)}</Text> : null}

      {signs.length ? (
        <View style={styles.block}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Signos clave</Text>
          {signs.map((s, i) => <Text key={i} style={[styles.body, { color: colors.text }]}>{`• ${s}`}</Text>)}
        </View>
      ) : null}

      <View style={styles.actions}>
        <VButton onPress={() => onOpen(d)} icon={<ArrowRight size={16} color={onAccentText.default} />} iconPosition="right">Abrir ficha completa</VButton>
        <VButton variant="ghost" onPress={() => onToggleFavorite(d)}
          icon={<Star size={16} color={colors.primary} fill={favorite ? colors.primary : 'transparent'} />}>{favorite ? 'Quitar de favoritas' : 'Agregar a favoritas'}</VButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pane: { flex: 1, borderRadius: RADIUS.md },
  content: { padding: SPACING.xl, gap: SPACING.md },
  empty: { flex: 1, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', padding: SPACING['2xl'] },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '600' },
  alt: { fontSize: TYPOGRAPHY.sizes.md, marginTop: -SPACING.xs },
  facts: { fontSize: TYPOGRAPHY.sizes.md },
  seals: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  emergency: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md },
  grow: { flex: 1, minWidth: 0 },
  block: { gap: 4 },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: 2 },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 22 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.sm },
});
