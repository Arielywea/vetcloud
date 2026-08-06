import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY, ANIMATION, Z_INDEX } from '../../constants/tokens';

// ─────────────────────────────────────────────────────────
// VetCloud Toast System
// Slide-in notifications for success, error, info
// ─────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, text: string, duration?: number) => void;
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((type: ToastType, text: string, duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, text, duration }]);
  }, []);

  const success = useCallback((text: string) => toast('success', text), [toast]);
  const error = useCallback((text: string) => toast('error', text), [toast]);
  const info = useCallback((text: string) => toast('info', text), [toast]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toast Container ────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

// ─── Toast Item ─────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION.normal,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: ANIMATION.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: ANIMATION.slow,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, []);

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: colors.success + '15',
          border: colors.success,
          icon: <CheckCircle size={18} color={colors.success} />,
          textColor: colors.success,
        };
      case 'error':
        return {
          bg: colors.error + '15',
          border: colors.error,
          icon: <AlertCircle size={18} color={colors.error} />,
          textColor: colors.error,
        };
      case 'info':
        return {
          bg: colors.info + '15',
          border: colors.info,
          icon: <Info size={18} color={colors.info} />,
          textColor: colors.info,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: typeStyles.bg,
          borderLeftColor: typeStyles.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      {typeStyles.icon}
      <Text style={[styles.text, { color: typeStyles.textColor }]} numberOfLines={2}>
        {toast.text}
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
        <X size={14} color={typeStyles.textColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.xl + SPACING.sm,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: Z_INDEX.toast,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.md,
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
});
