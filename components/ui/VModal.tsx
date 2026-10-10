import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface VModalProps {
  visible: boolean;
  onDismiss: () => void;
  /** Rendered as the dialog heading; omit when the content draws its own header */
  title?: string;
  /** Desktop width cap; the modal used to stretch across a 1280px screen */
  maxWidth?: number;
  children: React.ReactNode;
}

// Paper's Modal with what clinical forms need: Escape closes it, a visible close button,
// a heading screen readers announce, and a readable width on desktop.
export default function VModal({ visible, onDismiss, title, maxWidth = 720, children }: VModalProps) {
  const { colors } = useTheme();
  useEscapeKey(visible, onDismiss);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: colors.surface, maxWidth }]}
      >
        <View style={[styles.header, !title && styles.headerFloating]}>
          {title ? (
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            style={({ pressed }) => [styles.close, { backgroundColor: pressed ? colors.surfaceVariant : 'transparent' }]}
          >
            <X size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
        {children}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    padding: SPACING.lg,
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    maxHeight: '88%',
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerFloating: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    marginBottom: 0,
    zIndex: 1,
  },
  title: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  // 40px target: hitSlop is a no-op on react-native-web
  close: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
