import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import {
  FileText, Stethoscope, Building2, Calendar, CreditCard,
  Pencil, CalendarClock, XCircle, Trash2, Eye
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

export interface ContextMenuAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  color?: string;
  destructive?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onAction: (key: string) => void;
  onClose: () => void;
}

const DEFAULT_ACTIONS: ContextMenuAction[] = [
  { key: 'detail', label: 'Ver detalle', icon: <Eye size={14} /> },
  { key: 'divider0', label: '', icon: null },
  { key: 'open_chart', label: 'Abrir Ficha Clínica', icon: <FileText size={14} /> },
  { key: 'register', label: 'Registrar Consulta', icon: <Stethoscope size={14} /> },
  { key: 'hospitalize', label: 'Hospitalizar', icon: <Building2 size={14} /> },
  { key: 'followup', label: 'Agendar Control', icon: <Calendar size={14} /> },
  { key: 'charge', label: 'Cobrar', icon: <CreditCard size={14} /> },
  { key: 'divider1', label: '', icon: null },
  { key: 'edit', label: 'Editar', icon: <Pencil size={14} /> },
  { key: 'reschedule', label: 'Reprogramar', icon: <CalendarClock size={14} /> },
  { key: 'cancel', label: 'Cancelar Cita', icon: <XCircle size={14} />, destructive: true },
  { key: 'delete', label: 'Eliminar', icon: <Trash2 size={14} />, destructive: true },
];

export default function ContextMenu({ visible, x, y, actions = DEFAULT_ACTIONS, onAction, onClose }: ContextMenuProps) {
  const { colors } = useTheme();
  const menuRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document?.addEventListener?.('keydown', handler);
      return () => document?.removeEventListener?.('keydown', handler);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const menuWidth = 220;
  const menuHeight = actions.length * 36;

  let posX = x;
  let posY = y;
  if (posX + menuWidth > screenWidth) posX = screenWidth - menuWidth - 8;
  if (posY + menuHeight > screenHeight) posY = screenHeight - menuHeight - 8;

  return (
    <>
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />
      <View
        ref={menuRef}
        style={[
          styles.menu,
          {
            left: posX,
            top: posY,
            backgroundColor: colors.surface,
            ...SHADOWS.lg,
          },
        ]}
      >
        {actions.map((action) => {
          if (action.key.startsWith('divider')) {
            return <View key={action.key} style={[styles.divider, { backgroundColor: colors.border }]} />;
          }
          return (
            <TouchableOpacity
              key={action.key}
              style={styles.item}
              onPress={() => onAction(action.key)}
              activeOpacity={0.6}
            >
              <View style={styles.itemContent}>
                <View style={{ color: action.destructive ? colors.error : colors.textSecondary }}>
                  {action.icon}
                </View>
                <Text
                  style={[
                    styles.itemLabel,
                    { color: action.destructive ? colors.error : colors.text },
                  ]}
                >
                  {action.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  menu: {
    position: 'absolute',
    zIndex: 1000,
    width: 220,
    borderRadius: RADIUS.md,
    padding: SPACING.xs,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.sm,
  },
  item: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  itemLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
  },
});
