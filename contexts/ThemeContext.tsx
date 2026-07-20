import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { APP_COLORS, APP_COLORS_DARK, AppColors } from '../constants/colors';

interface ThemeContextType {
  isDark: boolean;
  colors: AppColors;
  themeName: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: APP_COLORS,
  themeName: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const value = useMemo(() => {
    const isDark = user?.theme_preference === 'dark';
    return {
      isDark,
      colors: isDark ? APP_COLORS_DARK : APP_COLORS,
      themeName: (isDark ? 'dark' : 'light') as 'light' | 'dark',
    };
  }, [user?.theme_preference]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
