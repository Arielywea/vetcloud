import React from 'react';
import { Modal, View, StyleSheet, ScrollView, TouchableOpacity, Pressable, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, BREAKPOINTS } from '../../constants/tokens';
import VButton from './Button';

interface FormSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  submitting?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

// One pattern for create/edit forms: centered card on desktop, bottom sheet on phones.
// RN Modal's onRequestClose also fires on Escape (web) and the back button (Android).
export default function FormSheet({ visible, title, onClose, onSubmit, submitLabel = 'Guardar', submitting, error, children }: FormSheetProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINTS.md;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }, isMobile ? styles.overlayMobile : styles.overlayDesktop]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Cerrar formulario" />
        <View
          style={[
            styles.sheet,
            isMobile ? styles.sheetMobile : styles.sheetDesktop,
            { backgroundColor: colors.surface },
            SHADOWS.xl,
          ]}
          accessibilityViewIsModal
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">{title}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10} style={styles.close}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {children}
            {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
          </ScrollView>
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <VButton variant="secondary" onPress={onClose}>Cancelar</VButton>
            <VButton onPress={onSubmit} loading={submitting} disabled={submitting}>{submitLabel}</VButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  overlayMobile: { justifyContent: 'flex-end' },
  overlayDesktop: { justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  sheet: { maxHeight: '90%' },
  sheetMobile: { borderTopLeftRadius: RADIUS['2xl'], borderTopRightRadius: RADIUS['2xl'], width: '100%' },
  sheetDesktop: { borderRadius: 14, width: '100%', maxWidth: 560 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderBottomWidth: 1 },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  close: { padding: SPACING.xs },
  body: { padding: SPACING.xl },
  error: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.sm },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, padding: SPACING.lg, borderTopWidth: 1 },
});
