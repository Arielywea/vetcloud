import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import BeagleLogo from './BeagleLogo';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

const MENU_SECTIONS = [
  {
    title: 'CLÍNICA',
    items: [
      { label: 'Inicio', icon: 'home', route: '/(drawer)' },
      { label: 'Enfermedades', icon: 'medical-bag', route: '/(drawer)/diseases' },
      { label: 'Pacientes', icon: 'dog', route: '/(drawer)/pacientes' },
      { label: 'Buscar', icon: 'magnify', route: '/(drawer)/search' },
      { label: 'Notas', icon: 'note-text', route: '/(drawer)/notes' },
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      { label: 'Agenda', icon: 'calendar-clock', route: '/(drawer)/agenda' },
      { label: 'Recordatorios', icon: 'bell-ring', route: '/(drawer)/reminders' },
    ],
  },
  {
    title: 'CUENTA',
    items: [
      { label: 'Mi Perfil', icon: 'account-cog', route: '/(drawer)/profile' },
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

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A14' : colors.primaryDark }]}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: isDark ? colors.surfaceVariant : '#FFFFFF20' }]}>
          <BeagleLogo size={48} variant={isDark ? 'dark' : 'light'} />
        </View>
        <Text style={[styles.userName, { color: '#FFFFFF' }]}>{user?.name || 'Usuario'}</Text>
        <Text style={[styles.userRole, { color: '#FFFFFF99' }]}>
          {isDark ? 'NERV OPERATOR' : user?.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}
        </Text>
      </View>

      <View style={styles.menu}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF66' }]}>{section.title}</Text>
            {section.items.map((item) => {
              const isActive = pathname === item.route || (item.route === '/(drawer)' && pathname === '/');
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: isDark ? '#FFFFFF10' : '#FFFFFF15', borderRightWidth: 3, borderRightColor: colors.primary },
                  ]}
                  onPress={() => router.push(item.route)}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color={isActive ? colors.primary : '#FFFFFFCC'}
                  />
                  <Text style={[styles.menuLabel, { color: isActive ? '#FFFFFF' : '#FFFFFFCC', fontWeight: isActive ? '700' : '500' }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.logoutButton, { borderTopColor: '#FFFFFF20' }]} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
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
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    paddingTop: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 24,
    paddingVertical: 8,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
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
