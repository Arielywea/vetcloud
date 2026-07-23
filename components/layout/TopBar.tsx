import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, Bell, Menu, Command } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';

interface TopBarProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  title?: string;
  rightContent?: React.ReactNode;
}

export default function TopBar({ onMenuPress, onSearchPress, title, rightContent }: TopBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }, SHADOWS.xs]}>
      {/* Left: hamburger (mobile) or title */}
      <View style={styles.left}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <Menu size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        )}
      </View>

      {/* Center: search trigger */}
      <TouchableOpacity
        style={[styles.searchTrigger, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
        onPress={onSearchPress}
        activeOpacity={0.7}
      >
        <Search size={16} color={colors.textLight} />
        <Text style={[styles.searchPlaceholder, { color: colors.textLight }]}>
          Buscar pacientes, citas...
        </Text>
        <View style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Command size={12} color={colors.textSecondary} />
          <Text style={[styles.shortcutText, { color: colors.textSecondary }]}>K</Text>
        </View>
      </TouchableOpacity>

      {/* Right: notifications + actions */}
      <View style={styles.right}>
        {rightContent}
        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={20} color={colors.textSecondary} />
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    gap: SPACING.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuBtn: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  searchTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    gap: SPACING.sm,
    maxWidth: 480,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  shortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    gap: 2,
  },
  shortcutText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: {
    padding: SPACING.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
