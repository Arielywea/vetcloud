import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput as RNTextInput, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useMedications } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import MedicationCard from '../../components/medications/MedicationCard';
import MedicationDetail from '../../components/medications/MedicationDetail';
import { Medication } from '../../services/directus';
import { ESPECIALIDADES } from '../../constants/medications';

const getIcon = (iconName: string, size: number, color: string) => {
  const IconComponent = (Icons as any)[iconName];
  if (IconComponent) {
    return <IconComponent size={size} color={color} />;
  }
  return <Icons.HelpCircle size={size} color={color} />;
};

export default function MedicationsScreen() {
  const { colors } = useTheme();
  const [activeEspecialidad, setActiveEspecialidad] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const canScrollLeft = scrollOffset > 0;
  const canScrollRight = scrollOffset < contentWidth - containerWidth - 10;

  const scrollLeft = useCallback(() => {
    scrollViewRef.current?.scrollTo({ x: Math.max(0, scrollOffset - 200), animated: true });
  }, [scrollOffset]);

  const scrollRight = useCallback(() => {
    scrollViewRef.current?.scrollTo({ x: Math.min(contentWidth - containerWidth, scrollOffset + 200), animated: true });
  }, [scrollOffset, contentWidth, containerWidth]);

  const { medications, loading } = useMedications(activeEspecialidad);

  const filteredMedications = useMemo(() => {
    if (!searchQuery.trim()) return medications;
    const q = searchQuery.toLowerCase();
    return medications.filter(m =>
      m.nombre.toLowerCase().includes(q) ||
      (m.marca_comercial && m.marca_comercial.toLowerCase().includes(q)) ||
      (m.familia && m.familia.toLowerCase().includes(q)) ||
      (m.funcion && m.funcion.toLowerCase().includes(q)) ||
      (m.via_administracion && m.via_administracion.toLowerCase().includes(q))
    );
  }, [medications, searchQuery]);

  const handlePress = (medication: Medication) => {
    setSelectedMedication(medication);
    setDetailVisible(true);
  };

  const renderEspecialidadTab = (esp: typeof ESPECIALIDADES[0]) => {
    const isActive = activeEspecialidad === esp.key;
    return (
      <TouchableOpacity
        key={esp.key}
        onPress={() => { setActiveEspecialidad(esp.key); setSearchQuery(''); }}
        style={[
          styles.tab,
          isActive && { backgroundColor: esp.color, borderColor: esp.color }
        ]}
        activeOpacity={0.7}
      >
        {getIcon(esp.icon, 14, isActive ? '#FFFFFF' : colors.textSecondary)}
        <Text style={[styles.tabText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
          {esp.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Scrollable Specialty Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsRow}>
          {canScrollLeft && (
            <TouchableOpacity onPress={scrollLeft} style={[styles.scrollArrow, { backgroundColor: colors.surface }]}>
              <ChevronLeft size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
            style={styles.tabScrollView}
            onScroll={(e) => setScrollOffset(e.nativeEvent.contentOffset.x)}
            onContentSizeChange={(w) => setContentWidth(w)}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            scrollEventThrottle={16}
          >
            {ESPECIALIDADES.map(renderEspecialidadTab)}
          </ScrollView>
          {canScrollRight && (
            <TouchableOpacity onPress={scrollRight} style={[styles.scrollArrow, { backgroundColor: colors.surface }]}>
              <ChevronRight size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
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
      {loading ? (
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
              description={searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'No hay medicamentos en esta especialidad'}
            />
          }
        />
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
  tabsContainer: {
    height: 70,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#DDE3EC',
    marginRight: SPACING.xs,
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
});
