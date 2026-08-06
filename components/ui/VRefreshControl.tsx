import React from 'react';
import { RefreshControl, RefreshControlProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// ─────────────────────────────────────────────────────────
// VRefreshControl — themed pull-to-refresh wrapper
// ─────────────────────────────────────────────────────────

interface VRefreshControlProps extends Omit<RefreshControlProps, 'tintColor' | 'colors'> {
  onRefresh: () => void;
  refreshing: boolean;
}

export default function VRefreshControl({
  onRefresh,
  refreshing,
  ...props
}: VRefreshControlProps) {
  const { colors } = useTheme();

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={colors.primary}
      colors={[colors.primary]}
      progressBackgroundColor={colors.surface}
      {...props}
    />
  );
}
