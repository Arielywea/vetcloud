import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, Scissors, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSurgeries } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/tokens';
import VEmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import { Surgery } from '../../services/directus';

export default function SurgeriesScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { surgeries, loading } = useSurgeries(searchQuery || undefined);

  const filteredSurgeries = useMemo(() => {
    if (!searchQuery.trim()) return surgeries;
    const q = searchQuery.toLowerCase();
    return surgeries.filter(s =>
      s.nombre_cirugia.toLowerCase().includes(q) ||
      (s.indicaciones && s.indicaciones.toLowerCase().includes(q)) ||
      (s.material_quirurgico && s.material_quirurgico.toLowerCase().includes(q)) ||
      (s.tipo_sutura && s.tipo_sutura.toLowerCase().includes(q))
    );
  }, [surgeries, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Scissors size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Biblioteca de Cirugías</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {surgeries.length} procedimientos quirúrgicos
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.textLight} />
        <RNTextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar cirugías..."
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
          data={filteredSurgeries}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <SurgeryCard surgery={item} index={index} colors={colors} />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <VEmptyState
              icon="scissors"
              title="Sin cirugías"
              description={searchQuery ? 'No se encontraron resultados para tu búsqueda' : 'No hay cirugías disponibles'}
            />
          }
        />
      )}
    </View>
  );
}

function SurgeryCard({ surgery, index, colors }: { surgery: Surgery; index: number; colors: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIcon, { backgroundColor: colors.primaryLight || colors.primary + '20' }]}>
            <Scissors size={16} color={colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {surgery.nombre_cirugia}
          </Text>
        </View>
        {expanded ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </View>

      {surgery.indicaciones && (
        <Text style={[styles.cardIndicaciones, { color: colors.textSecondary }]} numberOfLines={2}>
          {surgery.indicaciones}
        </Text>
      )}

      {expanded && (
        <View style={styles.cardDetails}>
          {surgery.tecnica_quirurgica && (
            <DetailSection title="Técnica Quirúrgica" content={surgery.tecnica_quirurgica} colors={colors} />
          )}
          {surgery.material_quirurgico && (
            <DetailSection title="Material Quirúrgico" content={surgery.material_quirurgico} colors={colors} />
          )}
          {surgery.tipo_sutura && (
            <DetailSection title="Tipo de Sutura" content={surgery.tipo_sutura} colors={colors} />
          )}
          {surgery.complicaciones_frecuentes && (
            <DetailSection title="Complicaciones Frecuentes" content={surgery.complicaciones_frecuentes} colors={colors} />
          )}
          {surgery.manejo_anestesico_sugerido && (
            <DetailSection title="Manejo Anestésico" content={surgery.manejo_anestesico_sugerido} colors={colors} />
          )}
          {surgery.consideraciones_por_raza && (
            <DetailSection title="Consideraciones por Raza" content={surgery.consideraciones_por_raza} colors={colors} />
          )}
          {surgery.consideraciones_comorbilidades && (
            <DetailSection title="Comorbilidades" content={surgery.consideraciones_comorbilidades} colors={colors} />
          )}
          {surgery.fuente && (
            <Text style={[styles.fuente, { color: colors.textLight }]}>
              📚 {surgery.fuente}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function DetailSection({ title, content, colors }: { title: string; content: string; colors: any }) {
  return (
    <View style={styles.detailSection}>
      <Text style={[styles.detailTitle, { color: colors.primary }]}>{title}</Text>
      <Text style={[styles.detailContent, { color: colors.text }]}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
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
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  cardIndicaciones: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: SPACING.xs,
    marginLeft: 48,
  },
  cardDetails: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF2',
  },
  detailSection: {
    marginBottom: SPACING.md,
  },
  detailTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  detailContent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
  },
  fuente: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontStyle: 'italic',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#E8ECF2',
  },
});
