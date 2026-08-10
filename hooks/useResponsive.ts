import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '../constants/tokens';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    width,
    height,
  };
}
