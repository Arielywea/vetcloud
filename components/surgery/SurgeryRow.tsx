import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Surgery } from '../../services/directus';
import { SPECIES_SHORT } from '../../constants/surgeryMeta';
import SpeciesIcon from '../ui/SpeciesIcon';
import VBadge from '../ui/Badge';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface SurgeryRowProps {
  surgery: Surgery;
  selected: boolean;
  onPress: (s: Surgery) => void;
}

/** First indication only: enough to tell OVH from cesárea at a glance */
const firstIndication = (s: Surgery) => (s.indicaciones || '').split(/[;.]/)[0].trim();

// Name, what it is for, and the three facts that set expectations: species, duration, difficulty.
function SurgeryRow({ surgery: s, selected, onPress }: SurgeryRowProps) {
  const { colors } = useTheme();
  const meta = s.guide_meta;
  const facts = meta ? [meta.duration, meta.difficulty.charAt(0).toUpperCase() + meta.difficulty.slice(1)].join(' · ') : null;
  return (
    <Pressable
      onPress={() => onPress(s)}
      accessibilityRole="button"
      aria-selected={selected}
      accessibilityLabel={`${s.nombre_cirugia}${facts ? `, ${facts}` : ''}`}
      style={({ pressed, hovered }: any) => [
        styles.row,
        { backgroundColor: selected ? colors.primaryContainer : pressed || hovered ? colors.surfaceVariant : colors.surface },
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.main}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{s.nombre_cirugia}</Text>
        <Text style={[styles.indication, { color: colors.textSecondary }]} numberOfLines={1}>{firstIndication(s)}</Text>
        {meta ? (
          <View style={styles.meta}>
            {meta.species.map((sp) => (
              <View key={sp} style={styles.species}>
                <SpeciesIcon species={sp === 'perro' ? 'dog' : 'cat'} size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{SPECIES_SHORT[sp]}</Text>
              </View>
            ))}
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>· {facts}</Text>
          </View>
        ) : null}
      </View>
      {s.guide_draft ? <VBadge variant="warning" size="sm">Borrador</VBadge> : null}
      {!s.has_guide ? <VBadge variant="neutral" size="sm">Ficha breve</VBadge> : null}
      <ChevronRight size={18} color={colors.textLight} />
    </Pressable>
  );
}

export default memo(SurgeryRow);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, minHeight: 68, borderRadius: RADIUS.md, marginBottom: 2 },
  main: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  indication: { fontSize: TYPOGRAPHY.sizes.sm },
  meta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.sm, marginTop: 2 },
  species: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: TYPOGRAPHY.sizes.sm },
});
