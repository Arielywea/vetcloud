import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/** Web: calls `onEscape` when Escape is pressed while `active`. For custom overlays (RN Modal already handles it). */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  const handlerRef = useRef(onEscape);
  handlerRef.current = onEscape;

  useEffect(() => {
    if (!active || Platform.OS !== 'web' || typeof document === 'undefined') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handlerRef.current();
    };
    // Capture phase: react-native-web's TextInput stops keydown propagation, so a bubbling
    // listener never saw Escape while a field had focus
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [active]);
}
