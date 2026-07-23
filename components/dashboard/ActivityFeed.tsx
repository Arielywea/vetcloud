import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { User, CheckCircle, Calendar } from 'lucide-react-native';
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

const DEFAULT_ITEMS: ActivityItem[] = [
  {
    id: '1',
    icon: <User size={14} color="#3B82F6" />,
    iconColor: '#3B82F6',
    iconBg: '#3B82F618',
    text: 'Se creó el paciente "Luna"',
    time: 'Hace 2 horas',
  },
  {
    id: '2',
    icon: <CheckCircle size={14} color="#10B981" />,
    iconColor: '#10B981',
    iconBg: '#10B98118',
    text: 'Se actualizó el inventario de vacunas',
    time: 'Hace 5 horas',
  },
  {
    id: '3',
    icon: <Calendar size={14} color="#F59E0B" />,
    iconColor: '#F59E0B',
    iconBg: '#F59E0B18',
    text: 'Nueva cita programada para "Max"',
    time: 'Hace 1 día',
  },
];

export default function ActivityFeed({ items = DEFAULT_ITEMS }: ActivityFeedProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.xs]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🕐</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Actividad Reciente</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={[styles.viewAll, { color: colors.primary }]}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      {items.map((item, idx) => (
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
      ))}
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
});
