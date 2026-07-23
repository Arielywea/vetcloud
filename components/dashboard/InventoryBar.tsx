import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

interface InventoryItem {
  label: string;
  percentage: number;
  icon: string;
}

interface InventoryBarProps {
  items?: InventoryItem[];
}

export default function InventoryBar({ items = [] }: InventoryBarProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const getBarColor = (pct: number) => {
    if (pct >= 80) return colors.success;
    if (pct >= 50) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>📦</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Inventario</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(drawer)/inventario')}
          activeOpacity={0.7}
        >
          <Text style={[styles.viewAll, { color: colors.primary }]}>Ver inventario completo →</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>Inventario vacío</Text>
        </View>
      ) : (
        <View style={styles.itemsGrid}>
          {items.map((item) => (
            <View key={item.label} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
                <Text style={[styles.itemPct, { color: colors.textSecondary }]}>{item.percentage}%</Text>
              </View>
              <View style={[styles.barBg, { backgroundColor: colors.surfaceVariant }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: getBarColor(item.percentage),
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerEmoji: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  viewAll: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.lg,
  },
  item: {
    width: '47%',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  itemIcon: {
    fontSize: 14,
  },
  itemLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  itemPct: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
