import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import DynamicIcon from './ui/DynamicIcon';
import { useTheme } from '../contexts/ThemeContext';

export type ClinicalTabType = 'historial' | 'consultas' | 'vacunas' | 'cirugias' | 'recetas';

interface ClinicalTabsProps {
  activeTab: ClinicalTabType;
  onTabChange: (tab: ClinicalTabType) => void;
  counts?: Record<ClinicalTabType, number>;
}

const TABS: { key: ClinicalTabType; label: string; icon: string }[] = [
  { key: 'historial', label: 'Historial', icon: 'history' },
  { key: 'consultas', label: 'Consultas', icon: 'stethoscope' },
  { key: 'vacunas', label: 'Vacunas', icon: 'needle' },
  { key: 'cirugias', label: 'Cirugias', icon: 'scissors-cutting' },
  { key: 'recetas', label: 'Recetas', icon: 'file-document-outline' },
];

export default function ClinicalTabs({ activeTab, onTabChange, counts }: ClinicalTabsProps) {
  const { colors } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {TABS.map((tab) => {
        const count = counts?.[tab.key] ?? 0;
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.tab,
              { backgroundColor: colors.surface, borderColor: colors.border },
              isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <DynamicIcon
              name={tab.icon as any}
              size={14}
              color={isActive ? '#FFFFFF' : '#C9A227'}
            />
            <Text style={[
              styles.tabText,
              { color: colors.textSecondary },
              isActive && { color: '#FFFFFF' },
            ]}>
              {tab.label}
            </Text>
            {count > 0 && (
              <View style={[
                styles.badge,
                { backgroundColor: colors.surfaceVariant },
                isActive && { backgroundColor: '#FFFFFF30' },
              ]}>
                <Text style={[
                  styles.badgeText,
                  { color: colors.textSecondary },
                  isActive && { color: '#FFFFFF' },
                ]}>{count}</Text>
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
    borderRadius: 10,
    marginRight: 8, borderWidth: 1,
    gap: 6,
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  badge: {
    borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
});