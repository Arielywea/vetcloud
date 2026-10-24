import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Star } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DirectusDisease } from '../../services/directus';
import { SEVERITY_LABELS, SEVERITY_TONE } from '../../constants/colors';
import { DISEASE_CATEGORIES, DiseaseCategoryKey, SPECIES_LABELS, categoryLabel, signTitle } from '../../constants/diseaseMeta';
import SpeciesIcon from '../ui/SpeciesIcon';
import VBadge from '../ui/Badge';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface DiseaseRowProps {
  disease: DirectusDisease;
  selected: boolean;
  favorite: boolean;
  onPress: (d: DirectusDisease) => void;
  /** Phones: the seals go under the name so long names keep their room */
  compact?: boolean;
}

export const isDraft = (d: DirectusDisease) => /^Borrador pendiente de revisión/i.test(d.treatment?.notes || '');

// One line to recognise the disease and decide whether to open it: name, who it affects, its system and
// the signs a vet would match against, with severity and zoonosis as seals.
function DiseaseRow({ disease: d, selected, favorite, onPress, compact }: DiseaseRowProps) {
  const { colors } = useTheme();
  const category = DISEASE_CATEGORIES[d.category as DiseaseCategoryKey];
  const signs = (d.key_signs || []).slice(0, 3).map(signTitle).filter(Boolean);
  const severity = (SEVERITY_LABELS as Record<string, string>)[d.severity] || d.severity;
  const seals = (
    <>
      {isDraft(d) ? <VBadge variant="warning" size="sm">Borrador</VBadge> : null}
      {d.is_zoonotic ? <VBadge variant="danger" size="sm">Zoonótica</VBadge> : null}
      <VBadge variant={SEVERITY_TONE[d.severity] || 'neutral'} size="sm">{severity}</VBadge>
    </>
  );
  return (
    <Pressable
      onPress={() => onPress(d)}
      accessibilityRole="button"
      aria-selected={selected}
      accessibilityLabel={`${d.name}, ${SPECIES_LABELS[d.species] || ''}, ${categoryLabel(d.category)}, severidad ${severity}${d.is_zoonotic ? ', zoonótica' : ''}`}
      style={({ pressed, hovered }: any) => [
        styles.row,
        { backgroundColor: selected ? colors.primaryContainer : pressed || hovered ? colors.surfaceVariant : colors.surface },
      ]}
    >
      <View style={styles.main}>
        <View style={styles.titleLine}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{d.name}</Text>
          {favorite ? <Star size={13} color={colors.textSecondary} fill={colors.textSecondary} accessibilityLabel="Favorita" /> : null}
        </View>
        <View style={styles.meta}>
          <SpeciesIcon species={d.species === 'both' ? null : d.species} size={14} color={colors.textSecondary} />
          <Text style={[styles.metaText, styles.fixed, { color: colors.textSecondary }]} numberOfLines={1}>{SPECIES_LABELS[d.species] || d.species}</Text>
          <View style={[styles.dot, { backgroundColor: category?.color || colors.textLight }]} />
          <Text style={[styles.metaText, styles.fixed, { color: colors.textSecondary }]} numberOfLines={1}>{categoryLabel(d.category)}</Text>
          {signs.length ? <Text style={[styles.metaText, styles.signs, { color: colors.textSecondary }]} numberOfLines={1}>· {signs.join(', ')}</Text> : null}
        </View>
        {compact ? <View style={[styles.seals, styles.sealsBelow]}>{seals}</View> : null}
      </View>
      {compact ? null : <View style={styles.seals}>{seals}</View>}
    </Pressable>
  );
}

export default memo(DiseaseRow);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, minHeight: 62, borderRadius: RADIUS.md, marginBottom: 2 },
  main: { flex: 1, minWidth: 0 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3, minWidth: 0 },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm },
  // Species and system always read whole; only the list of signs gives way
  fixed: { flexShrink: 0 },
  signs: { flexShrink: 1, minWidth: 0 },
  dot: { width: 7, height: 7, borderRadius: RADIUS.full },
  seals: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: SPACING.xs, maxWidth: 220 },
  sealsBelow: { justifyContent: 'flex-start', maxWidth: undefined, marginTop: SPACING.xs },
});
