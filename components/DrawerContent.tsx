import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { APP_COLORS } from '../constants/colors';
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
    ],
  },
];

export default function DrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account-circle" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.userRole}>{user?.role === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}</Text>
      </View>

      <View style={styles.menu}>
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const isActive = pathname === item.route || (item.route === '/(drawer)' && pathname === '/');
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => router.push(item.route)}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={20}
                    color={isActive ? APP_COLORS.primary : '#FFFFFFCC'}
                  />
                  <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.primaryDark,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
  },
  avatar: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userRole: {
    fontSize: 11,
    color: '#FFFFFF99',
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
    color: '#FFFFFF66',
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
  menuItemActive: {
    backgroundColor: '#FFFFFF15',
    borderRightWidth: 3,
    borderRightColor: APP_COLORS.primary,
  },
  menuLabel: {
    fontSize: 14,
    color: '#FFFFFFCC',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF20',
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});
