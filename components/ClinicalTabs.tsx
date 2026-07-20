import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { APP_COLORS } from '../constants/colors';

export type ClinicalTabType = 'historial' | 'consultas' | 'vacunas' | 'cirugias';

interface ClinicalTabsProps {
  activeTab: ClinicalTabType;
  onTabChange: (tab: ClinicalTabType) => void;
}

const TABS: { key: ClinicalTabType; label: string }[] = [
  { key: 'historial', label: 'Historial' },
  { key: 'consultas', label: 'Consultas' },
  { key: 'vacunas', label: 'Vacunas' },
  { key: 'cirugias', label: 'Cirugías' },
];

export default function ClinicalTabs({ activeTab, onTabChange }: ClinicalTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          onPress={() => onTabChange(tab.key)}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: APP_COLORS.surfaceVariant,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: APP_COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
});
