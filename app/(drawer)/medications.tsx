import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, Syringe, Pill, Clock } from 'lucide-react-native';
import { useMedications } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VBadge from '../../components/ui/Badge';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import MedicationCard from '../../components/medications/MedicationCard';
import MedicationDetail from '../../components/medications/MedicationDetail';
import { Medication } from '../../services/directus';

type TabType = 'intraoperatorio' | 'receta';

export default function MedicationsScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('intraoperatorio');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const { medications, loading } = useMedications(activeTab);

  const filteredMedications = useMemo(() => {
    if (!searchQuery.trim()) return medications;
    const q = searchQuery.toLowerCase();
    return medications.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      (m.marca_comercial && m.marca_comercial.toLowerCase().includes(q)) ||
      (m.familia && m.familia.toLowerCase().includes(q))
    );
  }, [medications, searchQuery]);

  const handlePress = (medication: Medication) => {
    setSelectedMedication(medication);
    setDetailVisible(true);
  };

  const renderTab = (tab: TabType, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      key={tab}
      onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
      style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary, borderColor: colors.primary }]}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[styles.tabText, { color: activeTab === tab ? '#FFFFFF' : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={styles.tabRow}>
        {renderTab('intraoperatorio', 'Intraoperatorios', <Syringe size={16} color={activeTab === 'intraoperatorio' ? '#FFFFFF' : colors.textSecondary} />)}
        {renderTab('receta', 'Receta', <Pill size={16} color={activeTab === 'receta' ? '#FFFFFF' : colors.textSecondary} />)}
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textLight} />
        <RNTextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar medicamentos..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Content */}
      {activeTab === 'intraoperatorio' ? (
        loading ? (
          <SkeletonList count={5} />
        ) : (
          <FlatList
            data={filteredMedications}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item, index }) => (
              <MedicationCard medication={item} onPress={() => handlePress(item)} index={index} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <VEmptyState
                icon="pill"
                title="Sin medicamentos"
                description={searchQuery ? 'No se encontraron resultados para tu busqueda' : 'No hay medicamentos intraoperatorios registrados'}
              />
            }
          />
        )
      ) : (
        <View style={styles.comingSoon}>
          <VCard style={styles.comingSoonCard}>
            <Clock size={48} color={colors.textLight} />
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Proximamente</Text>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              El catalogo de receta estara disponible pronto. Mientras tanto, puedes agregar medicamentos de uso clinico ambulatorio directamente desde aqui.
            </Text>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.addButtonText}>Agregar medicamento</Text>
            </TouchableOpacity>
          </VCard>
        </View>
      )}

      {/* Detail Modal */}
      <MedicationDetail
        medication={selectedMedication}
        visible={detailVisible}
        onClose={() => { setDetailVisible(false); setSelectedMedication(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#DDE3EC',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
  },
  listContent: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xl * 2,
  },
  comingSoon: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  comingSoonTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    maxWidth: '90%',
  },
  addButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
