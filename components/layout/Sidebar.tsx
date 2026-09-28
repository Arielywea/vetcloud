import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { LogOut, ChevronLeft } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, alpha } from '../../constants/tokens';
import { TEXT_ON_PRIMARY, getTextOnPrimary } from '../../constants/colors';
import BeagleLogo from '../BeagleLogo';
import VetCloudIcon, { VetCloudIconName } from '../icons/VetCloudIcon';
import DisplayText from '../ui/DisplayText';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

const NAV_SECTIONS = [
  {
    title: 'CLÍNICA',
    items: [
      { label: 'Inicio', iconName: 'dashboard' as VetCloudIconName, route: '/(drawer)' },
      { label: 'Pacientes', iconName: 'pacientes' as VetCloudIconName, route: '/(drawer)/pacientes' },
      { label: 'Enfermedades', iconName: 'enfermedades' as VetCloudIconName, route: '/(drawer)/diseases' },
      { label: 'Vademécum', iconName: 'medicamentos' as VetCloudIconName, route: '/(drawer)/medications' },
      { label: 'Cirugías', iconName: 'cirugias' as VetCloudIconName, route: '/(drawer)/surgeries' },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Agenda', iconName: 'agenda' as VetCloudIconName, route: '/(drawer)/agenda' },
      { label: 'Hospitalización', iconName: 'hospitalizacion' as VetCloudIconName, route: '/(drawer)/hospitalizacion' },
      { label: 'Laboratorio', iconName: 'laboratorio' as VetCloudIconName, route: '/(drawer)/laboratorio' },
      { label: 'Inventario', iconName: 'inventario' as VetCloudIconName, route: '/(drawer)/inventario' },
    ],
  },
  {
    title: 'HERRAMIENTAS',
    items: [
      { label: 'Fluidoterapia', iconName: 'fluidoterapia' as VetCloudIconName, route: '/(drawer)/fluidoterapia' },
      { label: 'Calculadora dosis', iconName: 'dosis' as VetCloudIconName, route: '/(drawer)/dosis' },
    ],
  },
  {
    title: 'ANÁLISIS',
    items: [
      { label: 'Reportes', iconName: 'reportes' as VetCloudIconName, route: '/(drawer)/reportes' },
    ],
  },
  {
    title: 'PERSONAL',
    items: [
      { label: 'Notas', iconName: 'notas' as VetCloudIconName, route: '/(drawer)/notes' },
      { label: 'Recordatorios', iconName: 'recordatorios' as VetCloudIconName, route: '/(drawer)/reminders' },
    ],
  },
];

const BOTTOM_ITEMS = [
  { label: 'Configuración', iconName: 'configuracion' as VetCloudIconName, route: '/(drawer)/configuracion' },
];

export default function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { colors, isDark, onChromeText } = useTheme();

  // Saber: gold marks on navy. Alter: gold icons, crimson lozenge on black.
  const activeIcon = isDark ? colors.primary : colors.accent;
  const activeMark = colors.accent;

  const handleNavigate = (route: string) => {
    router.push(route as any);
    onNavigate?.();
  };

  const isActive = (route: string) => {
    if (route === '/(drawer)') return pathname === '/' || pathname === '/(drawer)';
    return pathname.startsWith(route.replace('/(drawer)', ''));
  };

  const renderItem = (item: { label: string; iconName: VetCloudIconName; route: string }) => {
    const active = isActive(item.route);
    return (
      <TouchableOpacity
        key={item.label}
        style={[styles.navItem, collapsed && styles.navItemCollapsed, active && { backgroundColor: alpha(colors.onChrome, 0.07) }]}
        onPress={() => handleNavigate(item.route)}
        activeOpacity={0.6}
        accessibilityRole="link"
        accessibilityState={{ selected: active }}
        accessibilityLabel={item.label}
      >
        {active && <View style={[styles.lozenge, { backgroundColor: activeMark }]} />}
        <VetCloudIcon name={item.iconName} size={19} color={active ? activeIcon : onChromeText.subtle} />
        {!collapsed && (
          <Text
            style={[styles.navLabel, { color: active ? onChromeText.default : onChromeText.muted, fontWeight: active ? TYPOGRAPHY.weights.semibold : '500' }]}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.chrome, width: collapsed ? 64 : 240 }]}>
      {/* Crest + wordmark */}
      <View style={[styles.logoSection, { borderBottomColor: alpha(colors.onChrome, 0.08) }, collapsed && styles.logoSectionCollapsed]}>
        <BeagleLogo size={collapsed ? 32 : 36} />
        {!collapsed && (
          <DisplayText style={[styles.wordmark, { color: onChromeText.default }]}>
            Vet<Text style={{ color: isDark ? colors.primary : colors.accent }}>Cloud</Text>
          </DisplayText>
        )}
        {onToggle && !collapsed && (
          <TouchableOpacity onPress={onToggle} style={styles.toggleBtn} accessibilityLabel="Contraer menú">
            <ChevronLeft size={18} color={onChromeText.subtle} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
        {NAV_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            {!collapsed && (
              <Text style={[styles.sectionTitle, { color: onChromeText.faint }]}>{section.title}</Text>
            )}
            {section.items.map(renderItem)}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomSection, { borderTopColor: alpha(colors.onChrome, 0.08) }]}>
        {BOTTOM_ITEMS.map(renderItem)}

        <View style={[styles.userSection, collapsed && styles.userSectionCollapsed]}>
          <View style={[styles.avatar, { borderColor: alpha(activeIcon, 0.55) }]}>
            <Text style={[styles.avatarText, { color: onChromeText.default }]}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          {!collapsed && (
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: onChromeText.default }]} numberOfLines={1}>
                {user?.name || 'Usuario'}
              </Text>
              <Text style={[styles.userRole, { color: onChromeText.subtle }]}>
                {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
              </Text>
            </View>
          )}
          {!collapsed && (
            <TouchableOpacity onPress={logout} style={styles.logoutBtn} accessibilityLabel="Cerrar sesión">
              <LogOut size={17} color={onChromeText.subtle} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    height: 72,
    borderBottomWidth: 1,
    gap: SPACING.sm + 2,
  },
  logoSectionCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  wordmark: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.4,
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
    fontSize: 10.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs + 2,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm + 2,
    paddingHorizontal: SPACING.md - 2,
    paddingVertical: SPACING.sm + 1,
    borderRadius: RADIUS.md,
    gap: SPACING.md,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  // Heraldic lozenge marking the current section
  lozenge: {
    position: 'absolute',
    left: -7,
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
  },
  navLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
    gap: SPACING.md,
  },
  userSectionCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
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
    padding: SPACING.sm,
  },
});
