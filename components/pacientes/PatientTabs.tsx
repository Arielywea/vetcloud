import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Download } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

export type TabKey = 'all' | 'active' | 'inactive';

interface PatientTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  counts: { all: number; active: number; inactive: number };
  onExport: () => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'inactive', label: 'Inactivos' },
];

export default function PatientTabs({ activeTab, onTabChange, counts, onExport }: PatientTabsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              style={[styles.tab, isActive && { borderBottomColor: colors.primary }]}
            >
              <Text style={[
                styles.tabText,
                { color: isActive ? colors.primary : colors.textSecondary },
                isActive && styles.tabTextActive,
              ]}>
                {tab.label} ({counts[tab.key]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onExport}
        activeOpacity={0.7}
        style={[styles.exportBtn, { borderColor: colors.border }]}
      >
        <Download size={16} color={colors.primary} />
        <Text style={[styles.exportText, { color: colors.primary }]}>Exportar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabs: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  tab: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  tabTextActive: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  exportText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
