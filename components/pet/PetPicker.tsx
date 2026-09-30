import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import SpeciesIcon from '../ui/SpeciesIcon';

interface PetPickerProps {
  pets: DirectusPet[];
  value: string | null;
  onChange: (petId: string | null) => void;
  label?: string;
}

// Searchable patient selector (name, breed or owner). Shows the chosen patient as a chip.
export default function PetPicker({ pets, value, onChange, label = 'Paciente' }: PetPickerProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const selected = pets.find((p) => p.id === value) || null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pets.slice(0, 6);
    return pets
      .filter((p) => p.name.toLowerCase().includes(q) || (p.breed || '').toLowerCase().includes(q) || (p.tutor_name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [pets, query]);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label} *</Text>
      {selected ? (
        <View style={[styles.chip, { borderColor: colors.primary, backgroundColor: colors.primaryContainer }]}>
          <SpeciesIcon species={selected.species} size={16} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>{selected.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {[selected.breed, selected.tutor_name].filter(Boolean).join(' · ') || 'Sin datos del tutor'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onChange(null)} accessibilityRole="button" accessibilityLabel="Quitar paciente" hitSlop={10}>
            <X size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.search, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Search size={16} color={colors.textLight} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nombre, raza o tutor"
              placeholderTextColor={colors.textLight}
              accessibilityLabel={`Buscar ${label.toLowerCase()}`}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
          <View style={[styles.list, { borderColor: colors.border }]}>
            {results.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>
                {pets.length === 0 ? 'Aún no hay pacientes registrados.' : 'Ningún paciente coincide.'}
              </Text>
            ) : results.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.row, { borderBottomColor: colors.border }]}
                onPress={() => { onChange(p.id); setQuery(''); }}
                accessibilityRole="button"
                accessibilityLabel={`Elegir ${p.name}`}
              >
                <SpeciesIcon species={p.species} size={16} color={colors.textSecondary} />
                <Text style={[styles.name, { color: colors.text, flex: 1 }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{p.tutor_name || ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  label: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, marginBottom: SPACING.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 44 },
  input: { flex: 1, height: 42, fontSize: TYPOGRAPHY.sizes.base },
  list: { borderWidth: 1, borderRadius: RADIUS.md, marginTop: SPACING.xs, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, maxWidth: 160 },
  empty: { padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm },
});
