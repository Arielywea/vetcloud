import React, { memo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { Owner } from '../../services/directus';
import Escutcheon from '../icons/Escutcheon';
import SpeciesIcon from '../ui/SpeciesIcon';
import { formatPhone, formatRut } from '../../utils/identity';

interface OwnerListProps {
  owners: Owner[];
  compact: boolean;
  empty: React.ReactNode;
}

const OwnerRow = memo(function OwnerRow({ owner, compact }: { owner: Owner; compact: boolean }) {
  const { colors } = useTheme();
  const router = useRouter();
  const pets = owner.pets || [];
  const anonymized = !!owner.anonymized_at;
  const open = () => router.push(`/owner/${owner.id}` as any);

  const rut = owner.rut
    ? <Text style={[styles.meta, { color: colors.textSecondary }]}>{formatRut(owner.rut)}</Text>
    : !anonymized ? <Text style={[styles.meta, { color: colors.warning }]}>Falta el RUT</Text> : null;

  const petLine = pets.length ? (
    <View style={styles.pets}>
      {pets.map((p) => (
        <View key={p.id} style={styles.pet}>
          <SpeciesIcon species={p.species} size={14} color={p.status === 'alive' ? colors.textSecondary : colors.textLight} />
          <Text style={[styles.petName, { color: p.status === 'alive' ? colors.text : colors.textLight }]} numberOfLines={1}>{p.name}</Text>
        </View>
      ))}
    </View>
  ) : <Text style={[styles.meta, { color: colors.textLight }]}>Sin mascotas</Text>;

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${owner.name}, ${pets.length} mascota${pets.length === 1 ? '' : 's'}`}
      style={({ pressed, hovered }: any) => [
        compact ? styles.compactRow : [styles.row, { borderBottomColor: colors.border }],
        { backgroundColor: pressed || hovered ? colors.surfaceVariant : colors.surface },
      ]}>
      <View style={compact ? styles.compactMain : styles.cellName}>
        <Escutcheon size={compact ? 36 : 34} color={anonymized ? colors.textLight : colors.primary} initial={owner.name.charAt(0).toUpperCase()} />
        <View style={styles.grow}>
          <Text style={[styles.name, { color: anonymized ? colors.textSecondary : colors.text }]} numberOfLines={1}>{owner.name}</Text>
          {compact ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
              {!owner.rut && !anonymized ? <Text style={{ color: colors.warning }}>Falta el RUT{owner.phone ? ' · ' : ''}</Text> : null}
              {[owner.rut ? formatRut(owner.rut) : null, formatPhone(owner.phone)].filter(Boolean).join(' · ')}
            </Text>
          ) : rut}
        </View>
      </View>
      {compact ? <View style={styles.compactPets}>{petLine}</View> : (
        <>
          <Text style={[styles.cell, styles.cellText, { color: owner.phone ? colors.text : colors.textLight }]} numberOfLines={1}>{formatPhone(owner.phone) || 'Sin teléfono'}</Text>
          <View style={styles.cellPets}>{petLine}</View>
        </>
      )}
    </Pressable>
  );
});

export default function OwnerList({ owners, compact, empty }: OwnerListProps) {
  const { colors } = useTheme();
  return (
    <FlatList
      data={owners}
      keyExtractor={(o) => o.id}
      renderItem={({ item }) => <OwnerRow owner={item} compact={compact} />}
      ListEmptyComponent={<>{empty}</>}
      ListHeaderComponent={compact || !owners.length ? null : (
        <View style={[styles.head, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.headText, styles.cellName, { color: colors.textSecondary }]}>Tutor</Text>
          <Text style={[styles.headText, styles.cell, { color: colors.textSecondary }]}>Teléfono</Text>
          <Text style={[styles.headText, styles.cellPets, { color: colors.textSecondary }]}>Mascotas</Text>
        </View>
      )}
      stickyHeaderIndices={compact || !owners.length ? undefined : [0]}
      ItemSeparatorComponent={compact ? () => <View style={{ height: SPACING.xs }} /> : undefined}
      initialNumToRender={24}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: SPACING['4xl'] },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  headText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, minHeight: 60, borderBottomWidth: 1 },
  compactRow: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.md, gap: SPACING.xs },
  compactMain: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  compactPets: { paddingLeft: 36 * 0.82 + SPACING.md },
  grow: { flex: 1, minWidth: 0 },
  cellName: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minWidth: 0, paddingRight: SPACING.md },
  cell: { flex: 1.2, minWidth: 0, paddingRight: SPACING.md },
  cellPets: { flex: 2.4, minWidth: 0 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 1 },
  cellText: { fontSize: TYPOGRAPHY.sizes.md },
  pets: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.md, rowGap: 2 },
  pet: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, maxWidth: 180 },
  petName: { fontSize: TYPOGRAPHY.sizes.md },
});
