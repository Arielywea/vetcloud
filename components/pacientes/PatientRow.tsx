import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MoreVertical, Eye, Pencil, Trash2, Check } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { useRouter } from 'expo-router';
import { DirectusPet } from '../../services/directus';
import { isActive } from '../../utils/patientFilters';
import VAvatar from '../ui/Avatar';

interface PatientRowProps {
  patient: DirectusPet;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDelete: () => void;
  /** Phones: one card-like row (name + summary + status) instead of seven columns */
  compact?: boolean;
}

export default function PatientRow({ patient, isSelected, onSelect, onClick, onDelete, compact }: PatientRowProps) {
  const { colors, onPrimaryText } = useTheme();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const active = isActive(patient);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sin visitas';
    return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${patient.name}`}
      style={[
        styles.row,
        {
          backgroundColor: isSelected ? colors.primary + '0D' : colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity onPress={onSelect} style={styles.checkbox} activeOpacity={0.7} accessibilityRole="checkbox" accessibilityState={{ checked: !!isSelected }} accessibilityLabel={`Seleccionar ${patient.name}`}>
        <View style={[
          styles.checkboxBox,
          {
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent',
          },
        ]}>
          {isSelected && <Check size={12} color={onPrimaryText.default} strokeWidth={3} />}
        </View>
      </TouchableOpacity>

      {compact ? (
        <View style={styles.compactCell}>
          <VAvatar name={patient.name} size={36} style={{ backgroundColor: colors.primaryContainer }} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.patientName, { color: colors.text }]} numberOfLines={1}>{patient.name}</Text>
            <Text style={[styles.cellText, { color: colors.textSecondary }]} numberOfLines={1}>
              {[patient.species === 'dog' ? 'Canino' : 'Felino', patient.breed, patient.tutor_name].filter(Boolean).join(' · ')}
            </Text>
          </View>
          <View style={[styles.badge, { alignSelf: 'center', backgroundColor: alpha(active ? colors.success : colors.warning, 0.12) }]}>
            <Text style={[styles.badgeText, { color: active ? colors.success : colors.warning }]}>{active ? 'Activo' : 'Inactivo'}</Text>
          </View>
        </View>
      ) : (<>
      <View style={styles.patientCell}>
        <VAvatar name={patient.name} size={32} style={{ backgroundColor: colors.primaryContainer }} />
        <Text style={[styles.patientName, { color: colors.text }]} numberOfLines={1}>
          {patient.name}
        </Text>
      </View>

      <View style={styles.cell}>
        <Text style={[styles.cellText, { color: colors.text }]}>
          {patient.species === 'dog' ? 'Canino' : 'Felino'}
        </Text>
      </View>

      <View style={styles.cell}>
        <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={1}>
          {patient.breed || 'Sin raza'}
        </Text>
      </View>

      <View style={styles.cellWide}>
        <Text style={[styles.cellText, { color: colors.text }]} numberOfLines={1}>
          {patient.tutor_name || 'Sin propietario'}
        </Text>
      </View>

      <View style={styles.cell}>
        <Text style={[styles.cellText, { color: patient.last_visit ? colors.text : colors.textLight }]}>
          {formatDate(patient.last_visit)}
        </Text>
      </View>

      <View style={styles.cell}>
        <View style={[styles.badge, { backgroundColor: alpha(active ? colors.success : colors.warning, 0.12) }]}>
          <Text style={[styles.badgeText, { color: active ? colors.success : colors.warning }]}>
            {active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
      </>)}

      <View style={styles.actionsCell}>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuBtn} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`Acciones para ${patient.name}`} hitSlop={8}>
          <MoreVertical size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        {showMenu && (
          <>
            <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowMenu(false)} activeOpacity={1} accessibilityRole="button" accessibilityLabel="Cerrar menú" />
            <View style={[styles.menuDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); router.push(`/pet/${patient.id}` as any); }} activeOpacity={0.7}>
                <Eye size={16} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Ver ficha</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); router.push({ pathname: '/(drawer)/add-paciente', params: { id: patient.id } } as any); }} activeOpacity={0.7}>
                <Pencil size={16} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); onDelete(); }} activeOpacity={0.7}>
                <Trash2 size={16} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  checkbox: { width: 40, alignItems: 'center', justifyContent: 'center' },
  checkboxBox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  compactCell: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minWidth: 0 },
  patientCell: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minWidth: 160 },
  patientName: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  cell: { flex: 1, minWidth: 90, paddingHorizontal: SPACING.xs },
  cellWide: { flex: 1.2, minWidth: 120, paddingHorizontal: SPACING.xs },
  cellText: { fontSize: TYPOGRAPHY.sizes.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  actionsCell: { width: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  menuBtn: { padding: SPACING.xs },
  menuOverlay: { position: 'absolute', top: -1000, left: -1000, right: -1000, bottom: -1000, zIndex: 99 },
  menuDropdown: {
    position: 'absolute', top: 30, right: 0, width: 150,
    borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.xs, zIndex: 100, elevation: 5,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.sm },
  menuItemText: { fontSize: TYPOGRAPHY.sizes.sm },
});
