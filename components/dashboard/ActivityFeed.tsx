import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  text: string;
  time: string;
}

interface ActivityFeedProps {
  items?: ActivityItem[];
}

export default function ActivityFeed({ items = [] }: ActivityFeedProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Clock size={18} color={colors.accent} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Actividad Reciente</Text>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>Sin actividad reciente</Text>
        </View>
      ) : (
        items.map((item, idx) => (
          <View
            key={item.id}
            style={[
              styles.activityRow,
              idx < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.activityIcon, { backgroundColor: item.iconBg }]}>
              {item.icon}
            </View>
            <Text style={[styles.activityText, { color: colors.text }]} numberOfLines={2}>
              {item.text}
            </Text>
            <Text style={[styles.activityTime, { color: colors.textLight }]}>{item.time}</Text>
          </View>
        ))
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
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  activityTime: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  emptyState: {
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
