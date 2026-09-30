import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import VButton from './Button';

// Replacement for Alert.alert, which is a no-op on react-native-web.
// const { confirm, notify } = useConfirm();
// if (await confirm({ title: 'Dar de alta', message: '...', confirmLabel: 'Dar de alta' })) { ... }

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmContextValue {
  /** Resolves true when the user confirms, false when they cancel or dismiss. */
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  /** Informational dialog with a single button. */
  notify: (title: string, message?: string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: async () => false,
  notify: async () => {},
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

type Pending = ConfirmOptions & { kind: 'confirm' | 'notify' };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [pending, setPending] = useState<Pending | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const open = useCallback((p: Pending) => new Promise<boolean>((resolve) => {
    // A new dialog replaces an unanswered one; the old promise resolves as "cancel"
    resolver.current?.(false);
    resolver.current = resolve;
    setPending(p);
  }), []);

  const close = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setPending(null);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => open({ ...opts, kind: 'confirm' }), [open]);
  const notify = useCallback(async (title: string, message?: string) => { await open({ title, message, kind: 'notify' }); }, [open]);

  return (
    <ConfirmContext.Provider value={{ confirm, notify }}>
      {children}
      <Portal>
        <Dialog
          visible={!!pending}
          onDismiss={() => close(false)}
          style={[styles.dialog, { backgroundColor: colors.surface }]}
        >
          {pending && (
            <>
              <Dialog.Title style={[styles.title, { color: colors.text }]}>{pending.title}</Dialog.Title>
              {pending.message ? (
                <Dialog.Content>
                  <Text style={[styles.message, { color: colors.textSecondary }]}>{pending.message}</Text>
                </Dialog.Content>
              ) : null}
              <Dialog.Actions>
                <View style={styles.actions}>
                  {pending.kind === 'confirm' && (
                    <VButton variant="secondary" onPress={() => close(false)}>
                      {pending.cancelLabel || 'Cancelar'}
                    </VButton>
                  )}
                  <VButton
                    variant={pending.destructive ? 'danger' : 'primary'}
                    onPress={() => close(true)}
                  >
                    {pending.confirmLabel || (pending.kind === 'notify' ? 'Entendido' : 'Confirmar')}
                  </VButton>
                </View>
              </Dialog.Actions>
            </>
          )}
        </Dialog>
      </Portal>
    </ConfirmContext.Provider>
  );
}

const styles = StyleSheet.create({
  dialog: { maxWidth: 440, width: '92%', alignSelf: 'center', borderRadius: 14 },
  title: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  message: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'flex-end', flexWrap: 'wrap' },
});
