import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { APP_COLORS, APP_COLORS_DARK, PALETTES, AppColors } from '../constants/colors';

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  themeName: string;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: APP_COLORS,
  themeName: 'default',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const value = useMemo(() => {
    const isDark = user?.theme_preference === 'dark';
    const palette = user?.color_palette;

    let colors: AppColors;
    let themeName: string;

    if (palette && PALETTES[palette]) {
      colors = isDark ? PALETTES[palette].dark : PALETTES[palette].light;
      themeName = palette;
    } else {
      colors = isDark ? APP_COLORS_DARK : APP_COLORS;
      themeName = isDark ? 'dark' : 'default';
    }

    return { isDark, colors, themeName };
  }, [user?.theme_preference, user?.color_palette]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
