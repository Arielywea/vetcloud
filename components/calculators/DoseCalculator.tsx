import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, SegmentedButtons } from 'react-native-paper';
import { Search, Calculator, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useMedications } from '../../hooks/useDirectus';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { Medication } from '../../services/directus';
import VBadge from '../ui/Badge';

type Species = 'perro' | 'gato';

interface DoseResult {
  dosisMinMg: number | null;
  dosisMaxMg: number | null;
  volumenMinMl: number | null;
  volumenMaxMl: number | null;
  frecuencia: number | null;
  hasStructure: boolean;
}

export default function DoseCalculator({ initialWeight, initialSpecies }: { initialWeight?: number; initialSpecies?: Species }) {
  const { colors } = useTheme();
  const { medications, loading } = useMedications();
  const [peso, setPeso] = useState(initialWeight?.toString() || '');
  const [especie, setEspecie] = useState<Species>(initialSpecies || 'perro');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const filteredMeds = useMemo(() => {
    if (!searchQuery.trim()) return medications.filter(m => m.dosis_min_mg_kg || m.dosis_max_mg_kg);
    const q = searchQuery.toLowerCase();
    return medications.filter(m =>
      (m.dosis_min_mg_kg || m.dosis_max_mg_kg) &&
      (m.nombre.toLowerCase().includes(q) || (m.familia && m.familia.toLowerCase().includes(q)))
    );
  }, [medications, searchQuery]);

  const result = useMemo<DoseResult | null>(() => {
    if (!selectedMed || !peso) return null;
    const pesoNum = parseFloat(peso);
    if (isNaN(pesoNum) || pesoNum <= 0) return null;

    const dosisMinMg = selectedMed.dosis_min_mg_kg ? selectedMed.dosis_min_mg_kg * pesoNum : null;
    const dosisMaxMg = selectedMed.dosis_max_mg_kg ? selectedMed.dosis_max_mg_kg * pesoNum : null;

    let volumenMinMl: number | null = null;
    let volumenMaxMl: number | null = null;
    if (selectedMed.concentracion_mg_ml) {
      if (dosisMinMg !== null) volumenMinMl = dosisMinMg / selectedMed.concentracion_mg_ml;
      if (dosisMaxMg !== null) volumenMaxMl = dosisMaxMg / selectedMed.concentracion_mg_ml;
    }

    return {
      dosisMinMg,
      dosisMaxMg,
      volumenMinMl,
      volumenMaxMl,
      frecuencia: selectedMed.frecuencia_horas,
      hasStructure: !!(selectedMed.dosis_min_mg_kg || selectedMed.dosis_max_mg_kg),
    };
  }, [selectedMed, peso]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>Calculadora de Dosis</Text>

      {/* Inputs */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Peso (kg)</Text>
        <TextInput
          value={peso}
          onChangeText={setPeso}
          keyboardType="numeric"
          mode="outlined"
          placeholder="Ej: 5"
          style={styles.input}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Especie</Text>
        <SegmentedButtons
          value={especie}
          onValueChange={(v) => setEspecie(v as Species)}
          buttons={[
            { value: 'perro', label: 'Perro' },
            { value: 'gato', label: 'Gato' },
          ]}
        />
      </View>

      {/* Search medications */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Seleccionar medicamento</Text>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color={colors.textLight} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar medicamento..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Medication list */}
      <FlatList
        data={filteredMeds}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.medCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedMed?.id === item.id && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setSelectedMed(item)}
          >
            <Text style={[styles.medName, { color: colors.text }]}>{item.nombre}</Text>
            {item.familia && <Text style={[styles.medFamilia, { color: colors.textSecondary }]}>{item.familia}</Text>}
            <View style={styles.medBadges}>
              {item.dosis_min_mg_kg && <VBadge color={colors.primary}>{`${item.dosis_min_mg_kg}-${item.dosis_max_mg_kg || '?'} mg/kg`}</VBadge>}
              {item.concentracion_mg_ml && <VBadge color="#1565C0">{`${item.concentracion_mg_ml} mg/ml`}</VBadge>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {loading ? 'Cargando...' : 'No hay medicamentos con dosis estructurada'}
          </Text>
        }
      />

      {/* Resultados */}
      {result && selectedMed && (
        <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.resultHeader}>
            <Calculator size={20} color={colors.primary} />
            <Text style={[styles.resultTitle, { color: colors.text }]}>{selectedMed.nombre}</Text>
          </View>

          {!result.hasStructure && (
            <View style={[styles.alertCard, { backgroundColor: '#FF980015', borderColor: '#FF980040' }]}>
              <AlertTriangle size={16} color="#FF9800" />
              <Text style={[styles.alertText, { color: '#E65100' }]}>
                Calculadora no disponible para este medicamento, ver dosis de referencia en el texto
              </Text>
            </View>
          )}

          {result.hasStructure && (
            <>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Dosis</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>
                  {result.dosisMinMg !== null && result.dosisMaxMg !== null
                    ? `${result.dosisMinMg.toFixed(1)} - ${result.dosisMaxMg.toFixed(1)} mg`
                    : result.dosisMinMg !== null
                    ? `${result.dosisMinMg.toFixed(1)} mg`
                    : `${result.dosisMaxMg?.toFixed(1)} mg`}
                </Text>
              </View>

              {result.volumenMinMl !== null && (
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Volumen</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>
                    {result.volumenMaxMl !== null
                      ? `${result.volumenMinMl.toFixed(2)} - ${result.volumenMaxMl.toFixed(2)} ml`
                      : `${result.volumenMinMl.toFixed(2)} ml`}
                  </Text>
                </View>
              )}

              {result.frecuencia && (
                <View style={styles.resultRow}>
                  <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Frecuencia</Text>
                  <Text style={[styles.resultValue, { color: colors.text }]}>Cada {result.frecuencia} horas</Text>
                </View>
              )}

              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Peso</Text>
                <Text style={[styles.resultValue, { color: colors.text }]}>{peso} kg ({especie})</Text>
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xl * 2,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'transparent',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    backgroundColor: 'transparent',
  },
  medCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  medName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  medFamilia: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
  },
  medBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  emptyText: {
    textAlign: 'center',
    padding: SPACING.xl,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resultCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  alertText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  resultLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  resultValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
