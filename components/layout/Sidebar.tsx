import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import {
  Home, PawPrint, Activity, Calendar, Heart, FlaskConical,
  Package, BarChart3, Settings, LogOut, ChevronLeft,
} from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import BeagleLogo from '../BeagleLogo';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

const NAV_SECTIONS = [
  {
    title: 'CLÍNICA',
    items: [
      { label: 'Inicio', icon: Home, route: '/(drawer)' },
      { label: 'Pacientes', icon: PawPrint, route: '/(drawer)/pacientes' },
      { label: 'Enfermedades', icon: Activity, route: '/(drawer)/diseases' },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Agenda', icon: Calendar, route: '/(drawer)/agenda' },
      { label: 'Hospitalización', icon: Heart, route: '/(drawer)/hospitalizacion' },
      { label: 'Laboratorio', icon: FlaskConical, route: '/(drawer)/laboratorio' },
      { label: 'Inventario', icon: Package, route: '/(drawer)/inventario' },
    ],
  },
  {
    title: 'ANÁLISIS',
    items: [
      { label: 'Reportes', icon: BarChart3, route: '/(drawer)/reportes' },
    ],
  },
];

const BOTTOM_ITEMS = [
  { label: 'Configuración', icon: Settings, route: '/(drawer)/configuracion' },
];

export default function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { colors, isDark, spacing, radius, typography, shadows } = useTheme();

  const sidebarBg = isDark ? colors.surface : colors.surface;
  const activeBg = isDark ? colors.primaryContainer : colors.primaryContainer;
  const activeBorder = colors.primary;
  const textColor = colors.text;
  const mutedText = colors.textSecondary;
  const hoverBg = colors.surfaceVariant;

  const handleNavigate = (route: string) => {
    router.push(route as any);
    onNavigate?.();
  };

  const isActive = (route: string) => {
    if (route === '/(drawer)') return pathname === '/' || pathname === '/(drawer)';
    return pathname.startsWith(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: sidebarBg, borderRightColor: colors.border }]}>
      {/* Logo */}
      <View style={[styles.logoSection, { borderBottomColor: colors.border }]}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primaryContainer }]}>
          <BeagleLogo size={32} variant={isDark ? 'dark' : 'light'} />
        </View>
        {!collapsed && (
          <View style={styles.logoText}>
            <Text style={[styles.logoVet, { color: colors.primary }]}>Vet</Text>
            <Text style={[styles.logoCloud, { color: colors.accent }]}>Cloud</Text>
          </View>
        )}
        {onToggle && (
          <TouchableOpacity onPress={onToggle} style={styles.toggleBtn}>
            <ChevronLeft size={18} color={mutedText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Navigation */}
      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {NAV_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            {!collapsed && (
              <Text style={[styles.sectionTitle, { color: mutedText }]}>{section.title}</Text>
            )}
            {section.items.map((item) => {
              const active = isActive(item.route);
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.navItem,
                    active && { backgroundColor: activeBg, borderLeftColor: activeBorder },
                    !active && { borderLeftColor: 'transparent' },
                  ]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <Icon
                    size={20}
                    color={active ? colors.primary : mutedText}
                  />
                  {!collapsed && (
                    <Text
                      style={[
                        styles.navLabel,
                        { color: active ? colors.primary : textColor },
                        active && styles.navLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.navItem,
                active && { backgroundColor: activeBg, borderLeftColor: activeBorder },
                !active && { borderLeftColor: 'transparent' },
              ]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <Icon size={20} color={active ? colors.primary : mutedText} />
              {!collapsed && (
                <Text
                  style={[
                    styles.navLabel,
                    { color: active ? colors.primary : textColor },
                    active && styles.navLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* User + Logout */}
        <View style={[styles.userSection, { borderTopColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          {!collapsed && (
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
                {user?.name || 'Usuario'}
              </Text>
              <Text style={[styles.userRole, { color: mutedText }]}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    borderRightWidth: 1,
    flex: 1,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  logoVet: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  logoCloud: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  toggleBtn: {
    padding: SPACING.xs,
  },
  navScroll: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.md,
    borderLeftWidth: 3,
    marginLeft: 0,
  },
  navLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  navLabelActive: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  userRole: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  logoutBtn: {
    padding: SPACING.xs,
  },
});
