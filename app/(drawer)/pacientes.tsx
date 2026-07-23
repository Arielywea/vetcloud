import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Dialog, Portal } from 'react-native-paper';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { usePets } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { exportCsv } from '../../utils/exportCsv';
import { isActive, filterByStatus, StatusFilter } from '../../utils/patientFilters';
import PatientTabs, { TabKey } from '../../components/pacientes/PatientTabs';
import PatientFilters, { SpeciesFilter } from '../../components/pacientes/PatientFilters';
import PatientTable from '../../components/pacientes/PatientTable';
import PatientSidePanel from '../../components/pacientes/PatientSidePanel';
import { DirectusPet } from '../../services/directus';

const ITEMS_PER_PAGE = 10;

export default function PacientesScreen() {
  const router = useRouter();
  const { pets, loading, removePet } = usePets();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [species, setSpecies] = useState<SpeciesFilter>('all');
  const [selectedBreed, setSelectedBreed] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedPatient, setSelectedPatient] = useState<DirectusPet | null>(null);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<DirectusPet | null>(null);

  const effectiveStatus: StatusFilter = useMemo(() => {
    if (activeTab === 'active') return 'active';
    if (activeTab === 'inactive') return 'inactive';
    return statusFilter;
  }, [activeTab, statusFilter]);

  const uniqueBreeds = useMemo(() => {
    const speciesFiltered = species === 'all' ? pets : pets.filter(p => p.species === species);
    const breeds = new Set<string>();
    speciesFiltered.forEach(p => { if (p.breed) breeds.add(p.breed); });
    return Array.from(breeds).sort();
  }, [pets, species]);

  const filteredPatients = useMemo(() => {
    let results = [...pets];

    if (species !== 'all') {
      results = results.filter(p => p.species === species);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.breed && p.breed.toLowerCase().includes(q)) ||
        (p.tutor_name && p.tutor_name.toLowerCase().includes(q))
      );
    }

    if (selectedBreed !== 'all') {
      results = results.filter(p => p.breed === selectedBreed);
    }

    if (ownerFilter.trim()) {
      const q = ownerFilter.toLowerCase();
      results = results.filter(p =>
        p.tutor_name && p.tutor_name.toLowerCase().includes(q)
      );
    }

    results = filterByStatus(results, effectiveStatus);

    return results;
  }, [pets, species, searchQuery, selectedBreed, ownerFilter, effectiveStatus]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const tabCounts = useMemo(() => {
    const speciesFiltered = species === 'all' ? pets : pets.filter(p => p.species === species);
    return {
      all: speciesFiltered.length,
      active: speciesFiltered.filter(p => isActive(p)).length,
      inactive: speciesFiltered.filter(p => !isActive(p)).length,
    };
  }, [pets, species]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, species, selectedBreed, ownerFilter, statusFilter, activeTab]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSpecies('all');
    setSelectedBreed('all');
    setOwnerFilter('');
    setStatusFilter('all');
    setActiveTab('all');
    setSelectedIds(new Set());
  }, []);

  const handleExport = useCallback(() => {
    exportCsv(filteredPatients, 'pacientes');
  }, [filteredPatients]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await removePet(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, removePet]);

  const handleClickPatient = useCallback((pet: DirectusPet) => {
    setSelectedPatient(pet);
    setSidePanelVisible(true);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const hasFilters = searchQuery.trim() !== '' || species !== 'all' || selectedBreed !== 'all' || ownerFilter.trim() !== '' || statusFilter !== 'all';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: colors.text }]}>Pacientes</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {loading ? 'Cargando...' : `${filteredPatients.length} paciente${filteredPatients.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={() => router.push('/(drawer)/add-paciente')}
          style={[styles.newButton, { backgroundColor: colors.primary }]}
          labelStyle={styles.newButtonText}
          contentStyle={styles.newButtonContent}
        >
          <Plus size={16} color="#FFFFFF" />
          Nuevo Paciente
        </Button>
      </View>

      <View style={styles.content}>
        <PatientTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={tabCounts}
          onExport={handleExport}
        />

        <PatientFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          species={species}
          onSpeciesChange={(s) => { setSpecies(s); setSelectedBreed('all'); }}
          breeds={uniqueBreeds}
          selectedBreed={selectedBreed}
          onBreedChange={setSelectedBreed}
          ownerFilter={ownerFilter}
          onOwnerFilterChange={setOwnerFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <PatientTable
          patients={filteredPatients}
          paginatedPatients={paginatedPatients}
          loading={loading}
          selectedPatient={selectedPatient}
          selectedIds={selectedIds}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredPatients.length}
          itemsPerPage={ITEMS_PER_PAGE}
          hasFilters={hasFilters}
          onSelectPatient={handleClickPatient}
          onClickPatient={handleClickPatient}
          onDeletePatient={setDeleteTarget}
          onToggleSelect={handleToggleSelect}
          onPageChange={setCurrentPage}
          onClearFilters={clearFilters}
        />
      </View>

      <PatientSidePanel
        patient={selectedPatient}
        visible={sidePanelVisible}
        onClose={() => setSidePanelVisible(false)}
      />

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)} style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={[styles.dialogTitle, { color: colors.text }]}>Eliminar paciente</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.dialogText, { color: colors.textSecondary }]}>
              ¿Estás seguro de eliminar a{' '}
              <Text style={{ fontWeight: TYPOGRAPHY.weights.bold, color: colors.text }}>
                {deleteTarget?.name}
              </Text>
              ? Se borrará todo su historial médico.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)} textColor={colors.textSecondary}>
              Cancelar
            </Button>
            <Button onPress={handleDelete} textColor={colors.error}>
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING['2xs'],
  },
  newButton: {
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  newButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  dialog: {
    borderRadius: RADIUS.lg,
  },
  dialogTitle: {
    textAlign: 'center',
  },
  dialogText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
