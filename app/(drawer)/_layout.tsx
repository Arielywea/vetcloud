import React, { useState, useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import CommandPalette from '../../components/layout/CommandPalette';
import VetAssistantWidget from '../../components/VetAssistantWidget';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING } from '../../constants/tokens';

function useCmdK(onOpen: () => void) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onOpen]);
}

const SCREEN_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/(drawer)': 'Inicio',
  '/(drawer)/pacientes': 'Pacientes',
  '/(drawer)/add-paciente': 'Nuevo Paciente',
  '/(drawer)/diseases': 'Enfermedades',
  '/(drawer)/agenda': 'Agenda',
  '/(drawer)/hospitalizacion': 'Hospitalización',
  '/(drawer)/laboratorio': 'Laboratorio',
  '/(drawer)/inventario': 'Inventario',
  '/(drawer)/reportes': 'Reportes',
  '/(drawer)/configuracion': 'Configuración',
  '/(drawer)/profile': 'Mi Perfil',
};

export default function DrawerLayout() {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openCmd = React.useCallback(() => setCmdOpen(true), []);
  useCmdK(openCmd);

  const pageTitle = SCREEN_TITLES[pathname] || 'VetCloud';
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sidebar — always visible on web, hidden on mobile */}
      {isWeb && (
        <View style={styles.sidebarWrapper}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </View>
      )}

      {/* Main content */}
      <View style={styles.content}>
        <TopBar
          onSearchPress={openCmd}
          title={isWeb ? undefined : pageTitle}
          rightContent={
            isWeb ? undefined : undefined
          }
        />
        <View style={styles.screenArea}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="pacientes" />
            <Stack.Screen name="add-paciente" />
            <Stack.Screen name="diseases" />
            <Stack.Screen name="add-disease" />
            <Stack.Screen name="agenda" />
            <Stack.Screen name="hospitalizacion" />
            <Stack.Screen name="laboratorio" />
            <Stack.Screen name="inventario" />
            <Stack.Screen name="reportes" />
            <Stack.Screen name="configuracion" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="reminders" />
          </Stack>
        </View>
      </View>

      {/* Command Palette */}
      <CommandPalette visible={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* VetAssistant FAB */}
      <VetAssistantWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarWrapper: {
    width: 240,
  },
  content: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
});
