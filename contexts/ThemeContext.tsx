import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { APP_COLORS, APP_COLORS_DARK, PALETTES, AppColors, getTextOnPrimary } from '../constants/colors';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, ANIMATION, Z_INDEX } from '../constants/tokens';

type OnColor = { default: string; muted: string; subtle: string; faint: string };

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  themeName: string;
  /** Text/icon colors for content sitting on colors.primary fills */
  onPrimaryText: OnColor;
  /** Text/icon colors for content sitting on colors.accent fills (primary buttons) */
  onAccentText: OnColor;
  /** Text/icon colors for content sitting on colors.chrome (sidebar, headers, hero) */
  onChromeText: OnColor;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  typography: typeof TYPOGRAPHY;
  shadows: typeof SHADOWS;
  animation: typeof ANIMATION;
  zIndex: typeof Z_INDEX;
}

const onChromeFor = (c: AppColors): OnColor => ({
  default: c.onChrome, muted: c.onChrome + 'C7', subtle: c.onChrome + '99', faint: c.onChrome + '66',
});

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: APP_COLORS,
  themeName: 'saber',
  onPrimaryText: getTextOnPrimary(APP_COLORS.primary),
  onAccentText: getTextOnPrimary(APP_COLORS.accent),
  onChromeText: onChromeFor(APP_COLORS),
  spacing: SPACING,
  radius: RADIUS,
  typography: TYPOGRAPHY,
  shadows: SHADOWS,
  animation: ANIMATION,
  zIndex: Z_INDEX,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const value = useMemo(() => {
    const palette = user?.color_palette;
    const isDark = user?.theme_preference === 'dark';

    let colors: AppColors;
    let themeName: string;

    if (palette && PALETTES[palette]) {
      colors = isDark ? PALETTES[palette].dark : PALETTES[palette].light;
      themeName = palette;
    } else {
      colors = isDark ? APP_COLORS_DARK : APP_COLORS;
      themeName = isDark ? 'alter' : 'saber';
    }

    return {
      isDark, colors, themeName,
      onPrimaryText: getTextOnPrimary(colors.primary),
      onAccentText: getTextOnPrimary(colors.accent),
      onChromeText: onChromeFor(colors),
      spacing: SPACING, radius: RADIUS, typography: TYPOGRAPHY, shadows: SHADOWS, animation: ANIMATION, zIndex: Z_INDEX,
    };
  }, [user?.color_palette, user?.theme_preference]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
