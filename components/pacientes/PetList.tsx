import React, { memo } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import Escutcheon from '../icons/Escutcheon';
import { calculateAge } from '../../utils/age';
import { formatPhone, speciesLabel, STATUS_LABEL } from '../../utils/identity';

interface PetListProps {
  pets: DirectusPet[];
  compact: boolean;
  empty: React.ReactNode;
}

const shortDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin visitas';

// The table only needs the order of magnitude: "3 años", "5 meses" (the chart has the exact age)
function age(pet: DirectusPet) {
  const a = calculateAge(pet.birth_date);
  if (a === 'N/D') return '';
  const short = a.split(',')[0];
  return pet.birth_date_estimated ? `~${short}` : short;
}

const PetRow = memo(function PetRow({ pet, compact }: { pet: DirectusPet; compact: boolean }) {
  const { colors } = useTheme();
  const router = useRouter();
  const alive = pet.status === 'alive' || !pet.status;
  const tutor = pet.owner_name || pet.tutor_name;
  const open = () => router.push(`/pet/${pet.id}` as any);
  const openOwner = () => pet.owner_id && router.push(`/owner/${pet.owner_id}` as any);
  const mark = alive ? colors.primary : colors.textLight;
  const kind = [speciesLabel(pet), pet.breed].filter(Boolean).join(' · ');

  const status = alive ? null : (
    <View style={[styles.seal, { backgroundColor: alpha(colors.textSecondary, 0.12) }]}>
      <Text style={[styles.sealText, { color: colors.textSecondary }]}>{STATUS_LABEL[pet.status]}</Text>
    </View>
  );

  if (compact) {
    return (
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${pet.name}`}
        style={({ pressed }) => [styles.compactRow, { backgroundColor: pressed ? colors.surfaceVariant : colors.surface }]}>
        <Escutcheon size={36} color={mark} initial={pet.name.charAt(0).toUpperCase()} />
        <View style={styles.grow}>
          <Text style={[styles.name, { color: alive ? colors.text : colors.textSecondary }]} numberOfLines={1}>{pet.name}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{[kind, tutor].filter(Boolean).join(' · ')}</Text>
        </View>
        {status || <Text style={[styles.meta, { color: colors.textSecondary }]}>{pet.last_visit ? shortDate(pet.last_visit) : ''}</Text>}
      </Pressable>
    );
  }

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${pet.name}`}
      style={({ pressed, hovered }: any) => [styles.row, { borderBottomColor: colors.border, backgroundColor: pressed || hovered ? colors.surfaceVariant : colors.surface }]}>
      <View style={[styles.cellPatient]}>
        <Escutcheon size={34} color={mark} initial={pet.name.charAt(0).toUpperCase()} />
        <View style={styles.grow}>
          <Text style={[styles.name, { color: alive ? colors.text : colors.textSecondary }]} numberOfLines={1}>{pet.name}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{kind}</Text>
        </View>
      </View>
      <View style={styles.cellTutor}>
        {tutor ? (
          <Pressable onPress={openOwner} disabled={!pet.owner_id} accessibilityRole="link" accessibilityLabel={`Abrir ficha del tutor ${tutor}`} hitSlop={4}>
            {({ hovered }: any) => (
              <Text style={[styles.cellText, { color: colors.primary, textDecorationLine: hovered ? 'underline' : 'none' }]} numberOfLines={1}>{tutor}</Text>
            )}
          </Pressable>
        ) : <Text style={[styles.cellText, { color: colors.textLight }]}>Sin tutor</Text>}
        {pet.owner_phone || pet.phone ? <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>{formatPhone(pet.owner_phone || pet.phone)}</Text> : null}
      </View>
      <Text style={[styles.cell, styles.cellText, { color: colors.text }]} numberOfLines={1}>{age(pet)}</Text>
      <Text style={[styles.cell, styles.cellText, { color: pet.last_visit ? colors.text : colors.textLight }]} numberOfLines={1}>{shortDate(pet.last_visit)}</Text>
      <View style={styles.cellStatus}>{status}</View>
    </Pressable>
  );
});

export default function PetList({ pets, compact, empty }: PetListProps) {
  const { colors } = useTheme();
  return (
    <FlatList
      data={pets}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <PetRow pet={item} compact={compact} />}
      ListEmptyComponent={<>{empty}</>}
      ListHeaderComponent={compact || !pets.length ? null : (
        <View style={[styles.head, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.headText, styles.cellPatient, { color: colors.textSecondary }]}>Paciente</Text>
          <Text style={[styles.headText, styles.cellTutor, { color: colors.textSecondary }]}>Tutor</Text>
          <Text style={[styles.headText, styles.cell, { color: colors.textSecondary }]}>Edad</Text>
          <Text style={[styles.headText, styles.cell, { color: colors.textSecondary }]}>Última visita</Text>
          <Text style={[styles.headText, styles.cellStatus, { color: colors.textSecondary }]}>Estado</Text>
        </View>
      )}
      stickyHeaderIndices={compact || !pets.length ? undefined : [0]}
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
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, minHeight: 60, borderRadius: RADIUS.md },
  grow: { flex: 1, minWidth: 0 },
  cellPatient: { flex: 2.2, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, minWidth: 0, paddingRight: SPACING.md },
  cellTutor: { flex: 1.6, minWidth: 0, paddingRight: SPACING.md },
  cell: { flex: 1, minWidth: 0, paddingRight: SPACING.md },
  cellStatus: { width: 110, alignItems: 'flex-start' },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 1 },
  cellText: { fontSize: TYPOGRAPHY.sizes.md },
  seal: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  sealText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
});
