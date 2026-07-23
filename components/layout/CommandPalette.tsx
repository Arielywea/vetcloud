import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import {
  Search, Home, PawPrint, Activity, Calendar, Heart, FlaskConical,
  Package, BarChart3, Settings, Plus, Command, ArrowRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { usePets } from '../../hooks/useDirectus';

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
}

interface PaletteItem {
  id: string;
  category: string;
  label: string;
  icon: React.ReactNode;
  route?: string;
  action?: () => void;
}

export default function CommandPalette({ visible, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { pets } = usePets();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigationItems: PaletteItem[] = useMemo(() => [
    { id: 'nav-home', category: 'NAVIGATION', label: 'Inicio', icon: <Home size={18} color={colors.primary} />, route: '/(drawer)' },
    { id: 'nav-pacientes', category: 'NAVIGATION', label: 'Pacientes', icon: <PawPrint size={18} color={colors.primary} />, route: '/(drawer)/pacientes' },
    { id: 'nav-diseases', category: 'NAVIGATION', label: 'Enfermedades', icon: <Activity size={18} color={colors.primary} />, route: '/(drawer)/diseases' },
    { id: 'nav-agenda', category: 'NAVIGATION', label: 'Agenda', icon: <Calendar size={18} color={colors.primary} />, route: '/(drawer)/agenda' },
    { id: 'nav-hosp', category: 'NAVIGATION', label: 'Hospitalización', icon: <Heart size={18} color={colors.primary} />, route: '/(drawer)/hospitalizacion' },
    { id: 'nav-lab', category: 'NAVIGATION', label: 'Laboratorio', icon: <FlaskConical size={18} color={colors.primary} />, route: '/(drawer)/laboratorio' },
    { id: 'nav-inv', category: 'NAVIGATION', label: 'Inventario', icon: <Package size={18} color={colors.primary} />, route: '/(drawer)/inventario' },
    { id: 'nav-reportes', category: 'NAVIGATION', label: 'Reportes', icon: <BarChart3 size={18} color={colors.primary} />, route: '/(drawer)/reportes' },
    { id: 'nav-config', category: 'NAVIGATION', label: 'Configuración', icon: <Settings size={18} color={colors.primary} />, route: '/(drawer)/configuracion' },
  ], [colors.primary]);

  const patientItems: PaletteItem[] = useMemo(() =>
    pets.slice(0, 8).map((pet: any) => ({
      id: `pet-${pet.id}`,
      category: 'PACIENTES',
      label: `${pet.name} (${pet.species})`,
      icon: <PawPrint size={18} color={colors.accent} />,
      route: `/pet/${pet.id}`,
    })), [pets, colors.accent]);

  const actionItems: PaletteItem[] = useMemo(() => [
    { id: 'act-new-pet', category: 'ACCIONES', label: 'Nuevo Paciente', icon: <Plus size={18} color={colors.success} />, route: '/(drawer)/add-paciente' },
    { id: 'act-new-appt', category: 'ACCIONES', label: 'Nueva Cita', icon: <Plus size={18} color={colors.info} />, route: '/(drawer)/agenda' },
  ], [colors.success, colors.info]);

  const allItems = useMemo(() => [...navigationItems, ...patientItems, ...actionItems],
    [navigationItems, patientItems, actionItems]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const grouped = useMemo(() => {
    const groups: Record<string, PaletteItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filtered]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [visible]);

  const handleSelect = useCallback((item: PaletteItem) => {
    onClose();
    if (item.route) {
      router.push(item.route as any);
    }
    item.action?.();
  }, [onClose, router]);

  const handleKeyDown = useCallback((e: any) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault?.();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault?.();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, selectedIndex, handleSelect, onClose]);

  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  let flatIndex = 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.container, { backgroundColor: colors.surface }, SHADOWS.lg]}>
          {/* Search input */}
          <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
            <Search size={20} color={colors.textLight} />
            <TextInput
              placeholder="Buscar pacientes, pantallas, acciones..."
              placeholderTextColor={colors.textLight}
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={[styles.input, { color: colors.text }]}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ colors: { background: 'transparent' } }}
            />
            <View style={[styles.escBadge, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}>
              <Text style={[styles.escText, { color: colors.textSecondary }]}>ESC</Text>
            </View>
          </View>

          {/* Results */}
          <View style={styles.results}>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Sin resultados para "{query}"
                </Text>
              </View>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <View key={category}>
                  <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>{category}</Text>
                  {items.map((item) => {
                    const currentIndex = flatIndex++;
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.item,
                          isSelected && { backgroundColor: colors.primaryContainer },
                        ]}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.7}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                      >
                        {item.icon}
                        <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                        <ArrowRight size={14} color={colors.textLight} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.3)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: SPACING.xl,
  },
  container: {
    borderRadius: RADIUS.xl,
    maxHeight: 480,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 560,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: TYPOGRAPHY.sizes.base,
    minHeight: 32,
  },
  escBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  escText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  results: {
    paddingVertical: SPACING.md,
    maxHeight: 380,
  },
  empty: {
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  itemLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
  },
});
