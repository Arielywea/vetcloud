import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Home, Activity, PawPrint, Search, StickyNote, Calendar, Bell, UserCircle, LogOut } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import BeagleLogo from './BeagleLogo';

const MENU_SECTIONS = [
  {
    title: 'CLÍNICA',
    items: [
      { label: 'Inicio', icon: Home, route: '/(drawer)' },
      { label: 'Pacientes', icon: PawPrint, route: '/(drawer)/pacientes' },
      { label: 'Enfermedades', icon: Activity, route: '/(drawer)/diseases' },
      { label: 'Buscar', icon: Search, route: '/(drawer)/search' },
      { label: 'Notas', icon: StickyNote, route: '/(drawer)/notes' },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Agenda', icon: Calendar, route: '/(drawer)/agenda' },
      { label: 'Recordatorios', icon: Bell, route: '/(drawer)/reminders' },
    ],
  },
  {
    title: 'CUENTA',
    items: [
      { label: 'Mi Perfil', icon: UserCircle, route: '/(drawer)/profile' },
    ],
  },
];

export default function DrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  const sidebarBg = isDark ? '#0B1120' : colors.primary;
  const activeBg = isDark ? '#FFFFFF10' : '#FFFFFF18';
  const textColor = '#FFFFFF';
  const mutedText = '#FFFFFF80';
  const activeIndicator = colors.accent;

  return (
    <View style={[styles.container, { backgroundColor: sidebarBg }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoWrap, { backgroundColor: isDark ? '#FFFFFF10' : '#FFFFFF15' }]}>
          <BeagleLogo size={48} variant={isDark ? 'dark' : 'light'} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.userName, { color: textColor }]}>{user?.name || 'Usuario'}</Text>
          <Text style={[styles.userRole, { color: mutedText }]}>
            {user?.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
          </Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: mutedText }]}>{section.title}</Text>
            {section.items.map((item) => {
              const isActive = pathname === item.route || (item.route === '/(drawer)' && pathname === '/');
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: activeBg, borderLeftWidth: 3, borderLeftColor: activeIndicator },
                  ]}
                  onPress={() => router.push(item.route)}
                  activeOpacity={0.7}
                >
                  <IconComponent size={20} color={isActive ? activeIndicator : mutedText} />
                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: isActive ? textColor : '#FFFFFFCC',
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderTopColor: '#FFFFFF15' }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <LogOut size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF15',
    gap: 14,
  },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 1,
  },
  menu: {
    flex: 1,
    paddingTop: 12,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 24,
    paddingVertical: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 13,
    gap: 14,
  },
  menuLabel: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});
