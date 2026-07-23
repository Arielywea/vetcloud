import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { DirectusPet } from '../../services/directus';
import PatientRow from './PatientRow';
import PatientPagination from './PatientPagination';
import PatientEmptyState from './PatientEmptyState';

interface PatientTableProps {
  patients: DirectusPet[];
  paginatedPatients: DirectusPet[];
  loading: boolean;
  selectedPatient: DirectusPet | null;
  selectedIds: Set<string>;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasFilters: boolean;
  onSelectPatient: (pet: DirectusPet) => void;
  onClickPatient: (pet: DirectusPet) => void;
  onDeletePatient: (pet: DirectusPet) => void;
  onToggleSelect: (id: string) => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

export default function PatientTable({
  patients, paginatedPatients, loading, selectedPatient, selectedIds,
  currentPage, totalPages, totalItems, itemsPerPage,
  onSelectPatient, onClickPatient, onDeletePatient, onToggleSelect, onPageChange,
  hasFilters, onClearFilters,
}: PatientTableProps) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={styles.tableWrapper}>
        <View style={[styles.table, { backgroundColor: colors.surface }]}>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={[styles.skeletonRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 18 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 120 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 80 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 80 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 100 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 80 }]} />
              <View style={[styles.skeleton, { backgroundColor: colors.surfaceVariant, width: 60 }]} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tableWrapper}>
      <View style={[styles.tableHeader, { backgroundColor: colors.surfaceVariant }]}>
        <View style={styles.checkboxHeader} />
        <View style={styles.patientHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Paciente</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Especie</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Raza</Text>
        </View>
        <View style={styles.cellWideHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Propietario</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Última visita</Text>
        </View>
        <View style={styles.cellHeader}>
          <Text style={[styles.headerText, { color: colors.textSecondary }]}>Estado</Text>
        </View>
        <View style={styles.actionsHeader} />
      </View>

      <ScrollView style={styles.tableBody}>
        {paginatedPatients.length === 0 ? (
          <PatientEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        ) : (
          paginatedPatients.map(patient => (
            <PatientRow
              key={patient.id}
              patient={patient}
              isSelected={selectedIds.has(patient.id)}
              onSelect={() => onToggleSelect(patient.id)}
              onClick={() => onClickPatient(patient)}
              onDelete={() => onDeletePatient(patient)}
            />
          ))
        )}
      </ScrollView>

      {totalItems > 0 && (
        <PatientPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tableWrapper: { flex: 1 },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderTopLeftRadius: 10, borderTopRightRadius: 10,
  },
  checkboxHeader: { width: 40 },
  patientHeader: { flex: 2, minWidth: 160 },
  cellHeader: { flex: 1, minWidth: 90 },
  cellWideHeader: { flex: 1.2, minWidth: 120 },
  actionsHeader: { width: 40 },
  headerText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableBody: { flex: 1 },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, gap: SPACING.md, minHeight: 56 },
  skeleton: { height: 14, borderRadius: 7 },
});
