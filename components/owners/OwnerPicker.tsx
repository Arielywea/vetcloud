import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, Plus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useOwners } from '../../hooks/useDirectus';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { Owner } from '../../services/directus';
import VInput from '../ui/Input';
import VButton from '../ui/Button';
import Escutcheon from '../icons/Escutcheon';
import OwnerFormSheet from './OwnerFormSheet';
import { canonRut, digits, formatPhone, formatRut } from '../../utils/identity';

interface OwnerPickerProps {
  onPick: (owner: Owner) => void;
  /** Name to prefill if the vet registers a new tutor from here */
  suggestedName?: string;
  autoFocus?: boolean;
}

// Find the tutor by name, RUT or phone; if they are not there, register them without leaving the form.
export default function OwnerPicker({ onPick, suggestedName, autoFocus }: OwnerPickerProps) {
  const { colors, onAccentText } = useTheme();
  const { owners, loading } = useOwners();
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const qd = digits(q);
    return owners.filter((o) => !o.anonymized_at && (
      o.name.toLowerCase().includes(q) ||
      (o.pets || []).some((p) => p.name.toLowerCase().includes(q)) ||
      (qd.length >= 5 && !!o.rut && (canonRut(q) === o.rut || digits(o.rut).startsWith(qd))) ||
      (qd.length >= 6 && digits(o.phone).endsWith(qd))
    )).slice(0, 6);
  }, [owners, query]);

  return (
    <View>
      <VInput
        label="Tutor"
        value={query}
        onChangeText={setQuery}
        placeholder="Busca por nombre, RUT o teléfono"
        leftIcon={<Search size={18} color={colors.textLight} />}
        autoFocus={autoFocus}
        autoCorrect={false}
        hint={loading ? 'Cargando tutores…' : undefined}
        containerStyle={{ marginBottom: SPACING.sm }}
      />
      {matches.map((o) => (
        <Pressable key={o.id} onPress={() => onPick(o)} accessibilityRole="button" accessibilityLabel={`Elegir a ${o.name}`}
          style={({ pressed, hovered }: any) => [styles.option, { backgroundColor: pressed || hovered ? colors.surfaceVariant : 'transparent' }]}>
          <Escutcheon size={30} color={colors.primary} initial={o.name.charAt(0).toUpperCase()} />
          <View style={styles.grow}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{o.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {[o.rut ? formatRut(o.rut) : null, formatPhone(o.phone), (o.pets || []).map((p) => p.name).join(', ')].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </Pressable>
      ))}
      {query.trim() && !matches.length && !loading ? (
        <Text style={[styles.meta, { color: colors.textSecondary, marginBottom: SPACING.sm }]}>No hay un tutor con esos datos.</Text>
      ) : null}
      <VButton variant={query.trim() && !matches.length ? 'primary' : 'secondary'} size="sm" onPress={() => setCreating(true)}
        icon={<Plus size={15} color={query.trim() && !matches.length ? onAccentText.default : colors.primary} />} style={{ alignSelf: 'flex-start' }}>
        Registrar tutor nuevo
      </VButton>
      <OwnerFormSheet
        visible={creating}
        onClose={() => setCreating(false)}
        initialName={query.trim() && !digits(query) ? query.trim() : suggestedName}
        onSaved={(o) => { setCreating(false); onPick(o); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  option: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, minHeight: 48 },
  grow: { flex: 1, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  meta: { fontSize: TYPOGRAPHY.sizes.sm },
});
