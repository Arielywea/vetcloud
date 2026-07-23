import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Search, ChevronDown, X, Filter } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

export type SpeciesFilter = 'all' | 'dog' | 'cat';
export type StatusFilter = 'all' | 'active' | 'inactive';

interface PatientFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  species: SpeciesFilter;
  onSpeciesChange: (species: SpeciesFilter) => void;
  breeds: string[];
  selectedBreed: string;
  onBreedChange: (breed: string) => void;
  ownerFilter: string;
  onOwnerFilterChange: (owner: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
}

const SPECIES_OPTIONS: { key: SpeciesFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'dog', label: 'Perros' },
  { key: 'cat', label: 'Gatos' },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
];

export default function PatientFilters({
  searchQuery, onSearchChange,
  species, onSpeciesChange,
  breeds, selectedBreed, onBreedChange,
  ownerFilter, onOwnerFilterChange,
  statusFilter, onStatusFilterChange,
}: PatientFiltersProps) {
  const { colors } = useTheme();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState(false);

  const hasActiveFilters = ownerFilter || statusFilter !== 'all';

  return (
    <View style={styles.container}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textLight} />
        <TextInput
          placeholder="Buscar paciente..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={onSearchChange}
          style={[styles.searchInput, { color: colors.text }]}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          contentStyle={styles.searchInputContent}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.7}>
            <X size={16} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.dropdowns}>
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { setShowSpeciesDropdown(!showSpeciesDropdown); setShowBreedDropdown(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, { color: colors.text }]}>Especie</Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => { setShowBreedDropdown(!showBreedDropdown); setShowSpeciesDropdown(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, { color: colors.text }]}>Raza</Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.dropdown,
            {
              backgroundColor: hasActiveFilters ? colors.primary + '10' : colors.surface,
              borderColor: hasActiveFilters ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setShowMoreFilters(!showMoreFilters)}
          activeOpacity={0.7}
        >
          <Filter size={14} color={hasActiveFilters ? colors.primary : colors.textSecondary} />
          <Text style={[
            styles.dropdownText,
            { color: hasActiveFilters ? colors.primary : colors.text },
          ]}>
            Más filtros
          </Text>
        </TouchableOpacity>
      </View>

      {showSpeciesDropdown && (
        <View style={[styles.dropdownContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {SPECIES_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.dropdownItem, species === opt.key && { backgroundColor: colors.primary + '10' }]}
              onPress={() => { onSpeciesChange(opt.key); setShowSpeciesDropdown(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownItemText, { color: species === opt.key ? colors.primary : colors.text }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showBreedDropdown && (
        <View style={[styles.dropdownContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.dropdownItem, selectedBreed === 'all' && { backgroundColor: colors.primary + '10' }]}
            onPress={() => { onBreedChange('all'); setShowBreedDropdown(false); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownItemText, { color: selectedBreed === 'all' ? colors.primary : colors.text }]}>
              Todas
            </Text>
          </TouchableOpacity>
          {breeds.map(breed => (
            <TouchableOpacity
              key={breed}
              style={[styles.dropdownItem, selectedBreed === breed && { backgroundColor: colors.primary + '10' }]}
              onPress={() => { onBreedChange(breed); setShowBreedDropdown(false); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownItemText, { color: selectedBreed === breed ? colors.primary : colors.text }]}>
                {breed}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showMoreFilters && (
        <View style={[styles.moreFilters, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.moreFiltersTitle, { color: colors.text }]}>Filtros adicionales</Text>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Propietario</Text>
          <TextInput
            placeholder="Nombre del propietario"
            placeholderTextColor={colors.textLight}
            value={ownerFilter}
            onChangeText={onOwnerFilterChange}
            style={[styles.fieldInput, { backgroundColor: colors.surfaceVariant, color: colors.text }]}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Estado</Text>
          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.statusOption,
                  {
                    backgroundColor: statusFilter === opt.key ? colors.primary : colors.surfaceVariant,
                    borderColor: statusFilter === opt.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => onStatusFilterChange(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.statusOptionText,
                  { color: statusFilter === opt.key ? '#FFFFFF' : colors.text },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, backgroundColor: 'transparent', minHeight: 36 },
  searchInputContent: { paddingVertical: 0, paddingHorizontal: 0 },
  dropdowns: { flexDirection: 'row', gap: SPACING.sm },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 10,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  dropdownText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
  dropdownContent: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.xs,
    zIndex: 100,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  dropdownItemText: { fontSize: TYPOGRAPHY.sizes.sm },
  moreFilters: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.sm,
    zIndex: 100,
    elevation: 5,
  },
  moreFiltersTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.xs,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.xs,
  },
  fieldInput: { borderRadius: RADIUS.sm, fontSize: TYPOGRAPHY.sizes.sm, minHeight: 36 },
  statusOptions: { flexDirection: 'row', gap: SPACING.sm },
  statusOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusOptionText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
});