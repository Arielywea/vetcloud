import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Modal, Platform, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import {
  Search, Home, PawPrint, Activity, Calendar, Heart, FlaskConical,
  Package, BarChart3, Settings, Plus, Command, ArrowRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { usePets } from '../../hooks/useDirectus';
import { api } from '../../services/directus';
import { SPECIES_LABELS } from '../../constants/diseaseMeta';

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
  const [remoteResults, setRemoteResults] = useState<{ pets: any[]; owners: any[] }>({ pets: [], owners: [] });

  const navigationItems: PaletteItem[] = useMemo(() => [
    { id: 'nav-home', category: 'Ir a', label: 'Inicio', icon: <Home size={18} color={colors.primary} />, route: '/(drawer)' },
    { id: 'nav-pacientes', category: 'Ir a', label: 'Pacientes', icon: <PawPrint size={18} color={colors.primary} />, route: '/(drawer)/pacientes' },
    { id: 'nav-diseases', category: 'Ir a', label: 'Enfermedades', icon: <Activity size={18} color={colors.primary} />, route: '/(drawer)/diseases' },
    { id: 'nav-agenda', category: 'Ir a', label: 'Agenda', icon: <Calendar size={18} color={colors.primary} />, route: '/(drawer)/agenda' },
    { id: 'nav-hosp', category: 'Ir a', label: 'Hospitalización', icon: <Heart size={18} color={colors.primary} />, route: '/(drawer)/hospitalizacion' },
    { id: 'nav-lab', category: 'Ir a', label: 'Laboratorio', icon: <FlaskConical size={18} color={colors.primary} />, route: '/(drawer)/laboratorio' },
    { id: 'nav-inv', category: 'Ir a', label: 'Inventario', icon: <Package size={18} color={colors.primary} />, route: '/(drawer)/inventario' },
    { id: 'nav-reportes', category: 'Ir a', label: 'Reportes', icon: <BarChart3 size={18} color={colors.primary} />, route: '/(drawer)/reportes' },
    { id: 'nav-config', category: 'Ir a', label: 'Configuración', icon: <Settings size={18} color={colors.primary} />, route: '/(drawer)/configuracion' },
  ], [colors.primary]);

  const patientItems: PaletteItem[] = useMemo(() =>
    pets.slice(0, 8).map((pet: any) => ({
      id: `pet-${pet.id}`,
      category: 'Pacientes',
      label: `${pet.name} · ${(SPECIES_LABELS as Record<string, string>)[pet.species] || pet.species}`,
      icon: <PawPrint size={18} color={colors.accent} />,
      route: `/pet/${pet.id}`,
    })), [pets, colors.accent]);

  const actionItems: PaletteItem[] = useMemo(() => [
    { id: 'act-new-pet', category: 'Acciones', label: 'Nuevo paciente', icon: <Plus size={18} color={colors.success} />, route: '/(drawer)/add-paciente' },
    { id: 'act-new-appt', category: 'Acciones', label: 'Nueva cita', icon: <Plus size={18} color={colors.info} />, route: '/(drawer)/agenda' },
  ], [colors.success, colors.info]);

  useEffect(() => {
    if (!visible || !query.trim() || query.trim().length < 2) { setRemoteResults({ pets: [], owners: [] }); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.search(query.trim());
        setRemoteResults(res || { pets: [], owners: [] });
      } catch { setRemoteResults({ pets: [], owners: [] }); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, visible]);

  const allItems = useMemo(() => {
    const remotePetItems: PaletteItem[] = remoteResults.pets.map((p: any) => ({
      id: `rp-${p.id}`, category: 'Resultados', label: `${p.name} — ${p.tutor_name || 'Sin tutor'}${p.tutor_phone ? ` · ${p.tutor_phone}` : ''}`,
      icon: <PawPrint size={18} color={colors.primary} />, route: `/pet/${p.id}`,
    }));
    // Opens the patient list filtered by this tutor (it used to do nothing)
    const remoteOwnerItems: PaletteItem[] = remoteResults.owners.map((o: any, i: number) => ({
      id: `ro-${i}`, category: 'Tutores', label: `${o.tutor_name} — ${o.tutor_phone || 'Sin teléfono'}`,
      icon: <PawPrint size={18} color={colors.info} />,
      action: () => router.push({ pathname: '/(drawer)/pacientes', params: { q: o.tutor_name } } as any),
    }));
    return [...navigationItems, ...patientItems, ...actionItems, ...remotePetItems, ...remoteOwnerItems];
  }, [navigationItems, patientItems, actionItems, remoteResults, colors.primary, colors.info, router]);

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

  // Keyboard navigation scrolls rows under a still mouse, and their hover events used to steal the
  // selection. Hover only selects after the mouse actually moves.
  const keyboardNav = useRef(false);
  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof document === 'undefined') return;
    // Opened from the keyboard: a row that appears under a resting pointer must not grab the selection
    keyboardNav.current = true;
    const onMouseMove = () => { keyboardNav.current = false; };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, [visible]);

  const handleKeyDown = useCallback((e: any) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') keyboardNav.current = true;
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

  // Capture phase: react-native-web's TextInput stops keydown propagation, so a bubbling
  // listener never saw the arrows or Enter while the search field had focus
  useEffect(() => {
    if (visible && Platform.OS === 'web') {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }
  }, [visible, handleKeyDown]);

  // Keep the keyboard selection visible inside the scrolling results
  useEffect(() => {
    if (!visible || Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.getElementById(`palette-item-${selectedIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, visible]);

  if (!visible) return null;

  let flatIndex = 0;

  return (
    // Opened from the keyboard many times a day: no fade, it should simply be there
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Sibling of the card, so a click inside the dialog never reaches it */}
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar búsqueda"
        />
        <View style={[styles.container, { backgroundColor: colors.surface }, SHADOWS.lg]} aria-label="Búsqueda rápida">
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
          <ScrollView style={styles.results} keyboardShouldPersistTaps="handled">
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
                      <Pressable
                        key={item.id}
                        nativeID={`palette-item-${currentIndex}`}
                        style={[
                          styles.item,
                          isSelected && { backgroundColor: colors.primaryContainer },
                        ]}
                        onPress={() => handleSelect(item)}
                        onHoverIn={() => { if (!keyboardNav.current) setSelectedIndex(currentIndex); }}
                        accessibilityRole="button"
                        aria-selected={isSelected}
                      >
                        {item.icon}
                        <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                        <ArrowRight size={14} color={colors.textLight} />
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
    maxHeight: 400,
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
