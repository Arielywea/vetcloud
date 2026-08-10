import React from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Search, Bell, Menu, Command, Plus, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import { TEXT_ON_PRIMARY } from '../../constants/colors';

interface TopBarProps {
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  title?: string;
  rightContent?: React.ReactNode;
}

export default function TopBar({ onMenuPress, onSearchPress, title, rightContent }: TopBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }, SHADOWS.xs, isMobile && styles.containerMobile]}>
      {/* Left: hamburger (mobile) or nothing */}
      <View style={styles.left}>
        {onMenuPress && (
          <TouchableOpacity onPress={onMenuPress} style={[styles.menuBtn, isMobile && styles.menuBtnMobile]}>
            <Menu size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {title && (
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        )}
      </View>

      {/* Center: search trigger — hidden on mobile */}
      {!isMobile && (
        <TouchableOpacity
          style={[styles.searchTrigger, { backgroundColor: colors.surfaceVariant, borderColor: colors.border + '80' }]}
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Search size={16} color={colors.textLight} />
          <Text style={[styles.searchPlaceholder, { color: colors.textLight }]}>
            Buscar pacientes, propietarios, citas...
          </Text>
          <View style={[styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Command size={12} color={colors.textSecondary} />
            <Text style={[styles.shortcutText, { color: colors.textSecondary }]}>K</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Right: notifications + calendar + new patient */}
      <View style={styles.right}>
        {rightContent}
        <TouchableOpacity style={[styles.iconBtn, isMobile && styles.iconBtnMobile]}>
          <Bell size={20} color={colors.textSecondary} />
          <View style={[styles.badge, { backgroundColor: colors.error }]}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
        {!isMobile && (
          <TouchableOpacity style={[styles.iconBtn, isMobile && styles.iconBtnMobile]}>
            <Calendar size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {!isMobile && (
          <TouchableOpacity
            style={[styles.newPatientBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push('/(drawer)/add-paciente')}
            activeOpacity={0.7}
          >
            <Plus size={18} color={TEXT_ON_PRIMARY.light.default} />
            <Text style={[styles.newPatientText, { color: colors.primaryDark }]}>
              Nuevo Paciente
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    gap: SPACING.lg,
  },
  containerMobile: {
    height: 56,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  menuBtn: {
    padding: SPACING.sm,
  },
  menuBtnMobile: {
    padding: SPACING.md,
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
    maxWidth: 600,
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
  iconBtnMobile: {
    padding: SPACING.md,
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
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  newPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  newPatientText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
