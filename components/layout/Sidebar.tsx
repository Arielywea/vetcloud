import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { LogOut, ChevronLeft } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/tokens';
import BeagleLogo from '../BeagleLogo';
import { VetDashboard, VetPacientes, VetEnfermedades, VetAgenda, VetHospitalizacion, VetLaboratorio, VetInventario, VetReportes, VetConfiguracion } from '../icons/vet';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}

const NAV_SECTIONS = [
  {
    title: 'CLÍNICA',
    items: [
      { label: 'Inicio', icon: VetDashboard, route: '/(drawer)' },
      { label: 'Pacientes', icon: VetPacientes, route: '/(drawer)/pacientes' },
      { label: 'Enfermedades', icon: VetEnfermedades, route: '/(drawer)/diseases' },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Agenda', icon: VetAgenda, route: '/(drawer)/agenda' },
      { label: 'Hospitalización', icon: VetHospitalizacion, route: '/(drawer)/hospitalizacion' },
      { label: 'Laboratorio', icon: VetLaboratorio, route: '/(drawer)/laboratorio' },
      { label: 'Inventario', icon: VetInventario, route: '/(drawer)/inventario' },
    ],
  },
  {
    title: 'ANÁLISIS',
    items: [
      { label: 'Reportes', icon: VetReportes, route: '/(drawer)/reportes' },
    ],
  },
];

const BOTTOM_ITEMS = [
  { label: 'Configuración', icon: VetConfiguracion, route: '/(drawer)/configuracion' },
];

export default function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { colors, spacing, radius, typography, shadows } = useTheme();

  const sidebarBg = colors.primary;
  const textColor = '#FFFFFF';
  const mutedText = '#FFFFFF99';
  const activeIndicator = colors.accent;

  const handleNavigate = (route: string) => {
    router.push(route as any);
    onNavigate?.();
  };

  const isActive = (route: string) => {
    if (route === '/(drawer)') return pathname === '/' || pathname === '/(drawer)';
    return pathname.startsWith(route);
  };

  return (
    <View style={[styles.container, { backgroundColor: sidebarBg, ...shadows.sm }]}>
      {/* Logo */}
      <View style={[styles.logoSection, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
        <View style={styles.logoWrap}>
          <BeagleLogo size={48} variant="light" />
        </View>
        {!collapsed && (
          <View style={styles.logoText}>
            <Text style={[styles.logoVet, { color: textColor }]}>Vet</Text>
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}><View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent + '80' }} /><Text style={[styles.sectionTitle, { color: mutedText }]}>{section.title}</Text></View>
            )}
            {section.items.map((item) => {
              const active = isActive(item.route);
              const Icon = item.icon;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.navItem,
                    active && {
                      backgroundColor: 'rgba(201,162,39,0.12)',
                      borderLeftColor: activeIndicator,
                    },
                    !active && { borderLeftColor: 'transparent' },
                  ]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <Icon size={20} color={active ? activeIndicator : mutedText} />
                  {!collapsed && (
                    <Text
                      style={[
                        styles.navLabel,
                        {
                          color: active ? textColor : '#FFFFFFCC',
                          fontWeight: active ? TYPOGRAPHY.weights.semibold : TYPOGRAPHY.weights.regular,
                        },
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
      <View style={[styles.bottomSection, { borderTopColor: '#C9A22730' }]}>
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.route);
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.navItem,
                active && {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderLeftColor: activeIndicator,
                },
                !active && { borderLeftColor: 'transparent' },
              ]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <Icon size={20} color={active ? activeIndicator : mutedText} />
              {!collapsed && (
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: active ? textColor : '#FFFFFFCC',
                      fontWeight: active ? TYPOGRAPHY.weights.semibold : TYPOGRAPHY.weights.regular,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* User + Logout */}
        <View style={[styles.userSection, { borderTopColor: '#C9A22730' }]}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={[styles.avatarText, { color: textColor }]}>
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
            <LogOut size={18} color="#FF8A8A" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: '#C9A227',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl + 4,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  logoWrap: {
    width: 52,
    height: 52,
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
    paddingTop: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.md + 2,
    borderLeftWidth: 3,
    marginLeft: 0,
  },
  navLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
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
    padding: SPACING.sm,
  },
});
