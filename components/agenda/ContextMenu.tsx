import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import {
  FileText, Stethoscope, Building2, Calendar, CreditCard,
  Pencil, CalendarClock, XCircle, Trash2, Eye, LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

export interface ContextMenuAction {
  key: string;
  label: string;
  /** Icon component; colored by the menu (a color on a wrapper View isn't inherited in RN) */
  icon?: LucideIcon;
  destructive?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  actions?: ContextMenuAction[];
  onAction: (key: string) => void;
  onClose: () => void;
}

const DEFAULT_ACTIONS: ContextMenuAction[] = [
  { key: 'detail', label: 'Ver detalle', icon: Eye },
  { key: 'divider0', label: '' },
  { key: 'open_chart', label: 'Abrir ficha clínica', icon: FileText },
  { key: 'register', label: 'Registrar consulta', icon: Stethoscope },
  { key: 'hospitalize', label: 'Hospitalizar', icon: Building2 },
  { key: 'followup', label: 'Agendar control', icon: Calendar },
  { key: 'charge', label: 'Cobrar', icon: CreditCard },
  { key: 'divider1', label: '' },
  { key: 'edit', label: 'Editar', icon: Pencil },
  { key: 'reschedule', label: 'Reprogramar', icon: CalendarClock },
  { key: 'cancel', label: 'Cancelar cita', icon: XCircle, destructive: true },
  { key: 'delete', label: 'Eliminar', icon: Trash2, destructive: true },
];

const ITEM_HEIGHT = 36;
const MENU_WIDTH = 220;

export default function ContextMenu({ visible, x, y, actions = DEFAULT_ACTIONS, onAction, onClose }: ContextMenuProps) {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    if (!visible || typeof document === 'undefined') return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  // Keep the menu on screen
  const menuHeight = actions.length * ITEM_HEIGHT;
  const posX = Math.max(8, Math.min(x, screenWidth - MENU_WIDTH - 8));
  const posY = Math.max(8, Math.min(y, screenHeight - menuHeight - 8));

  return (
    <>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} accessibilityLabel="Cerrar menú" />
      <View
        accessibilityRole="menu"
        style={[styles.menu, { left: posX, top: posY, backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.lg]}
      >
        {actions.map((action) => {
          if (action.key.startsWith('divider')) {
            return <View key={action.key} style={[styles.divider, { backgroundColor: colors.border }]} />;
          }
          const Icon = action.icon;
          const color = action.destructive ? colors.error : colors.text;
          return (
            <TouchableOpacity
              key={action.key}
              style={styles.item}
              onPress={() => onAction(action.key)}
              activeOpacity={0.6}
              accessibilityRole="menuitem"
              accessibilityLabel={action.label}
            >
              {Icon ? <Icon size={15} color={action.destructive ? colors.error : colors.textSecondary} /> : null}
              <Text style={[styles.itemLabel, { color }]}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  menu: { position: 'absolute', zIndex: 1000, width: MENU_WIDTH, borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.xs },
  divider: { height: 1, marginVertical: SPACING.xs, marginHorizontal: SPACING.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.sm, minHeight: ITEM_HEIGHT, borderRadius: RADIUS.sm },
  itemLabel: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.medium },
});
