import { useEffect, useState } from 'react';
import { AccessibilityInfo, Easing } from 'react-native';

/** Strong ease-out used for UI motion (enter/exit ≤ 250 ms) */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * True when the OS asks for reduced motion. RN's Animated runs in JS, so the
 * CSS `prefers-reduced-motion` rule in utils/webFonts.ts doesn't reach it.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (mounted) setReduced(!!v); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => setReduced(!!v));
    return () => { mounted = false; sub?.remove?.(); };
  }, []);
  return reduced;
}
