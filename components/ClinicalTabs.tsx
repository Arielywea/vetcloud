import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { APP_COLORS } from '../constants/colors';

export type ClinicalTabType = 'historial' | 'consultas' | 'vacunas' | 'cirugias';

interface ClinicalTabsProps {
  activeTab: ClinicalTabType;
  onTabChange: (tab: ClinicalTabType) => void;
  counts?: Record<ClinicalTabType, number>;
}

const TABS: { key: ClinicalTabType; label: string; icon: string }[] = [
  { key: 'historial', label: 'Historial', icon: 'history' },
  { key: 'consultas', label: 'Consultas', icon: 'stethoscope' },
  { key: 'vacunas', label: 'Vacunas', icon: 'needle' },
  { key: 'cirugias', label: 'Cirugías', icon: 'scissors-cutting' },
];

export default function ClinicalTabs({ activeTab, onTabChange, counts }: ClinicalTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {TABS.map((tab) => {
        const count = counts?.[tab.key] ?? 0;
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
            {count > 0 && (
              <View style={[styles.badge, isActive && styles.activeBadge]}>
                <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 0, paddingHorizontal: 12, marginBottom: 12 },
  tab: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, backgroundColor: APP_COLORS.surface,
    marginRight: 8, borderWidth: 1, borderColor: APP_COLORS.border,
    gap: 6,
  },
  activeTab: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: APP_COLORS.textSecondary },
  activeTabText: { color: '#FFFFFF' },
  badge: {
    backgroundColor: APP_COLORS.surfaceVariant,
    borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  activeBadge: { backgroundColor: '#FFFFFF30' },
  badgeText: { fontSize: 11, fontWeight: '700', color: APP_COLORS.textSecondary },
  activeBadgeText: { color: '#FFFFFF' },
});
