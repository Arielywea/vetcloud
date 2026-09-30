import React, { useState, useEffect, Component, ReactNode } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View, StyleSheet, Platform, TouchableOpacity, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import CommandPalette from '../../components/layout/CommandPalette';
import VetAssistantWidget from '../../components/VetAssistantWidget';
import { useTheme } from '../../contexts/ThemeContext';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useResponsive } from '../../hooks/useResponsive';
import { SPACING } from '../../constants/tokens';
import { APP_COLORS } from '../../constants/colors';

class ErrorBoundary extends Component<{ children: ReactNode; colors?: { text: string; textSecondary: string; error: string } }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const colors = this.props.colors || APP_COLORS;
      return (
        <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ gap: 8 }}>
          <Text accessibilityRole="alert" style={{ fontSize: 18, fontWeight: 'bold', color: colors.error }}>No se pudo mostrar esta pantalla</Text>
          <Text style={{ fontSize: 14, color: colors.text }}>{this.state.error.message}</Text>
          <Text accessibilityRole="button" onPress={() => this.setState({ error: null })} style={{ fontSize: 14, color: colors.textSecondary, textDecorationLine: 'underline', marginTop: 8 }}>Reintentar</Text>
          {__DEV__ ? <Text style={{ fontSize: 12, color: colors.textSecondary, fontFamily: 'monospace' }}>{this.state.error.stack}</Text> : null}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

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

// usePathname() drops route groups: '/pacientes', not '/(drawer)/pacientes'
const SCREEN_TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/pacientes': 'Pacientes',
  '/add-paciente': 'Paciente',
  '/diseases': 'Enfermedades',
  '/add-disease': 'Nueva enfermedad',
  '/medications': 'Vademécum',
  '/surgeries': 'Cirugías',
  '/agenda': 'Agenda',
  '/hospitalizacion': 'Hospitalización',
  '/laboratorio': 'Laboratorio',
  '/inventario': 'Inventario',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
  '/notes': 'Notas personales',
  '/reminders': 'Recordatorios',
  '/fluidoterapia': 'Fluidoterapia',
  '/dosis': 'Calculadora de dosis',
  '/search': 'Búsqueda',
};

// Screens that draw their own DisplayText heading; the rest get it in the top bar
const OWN_HEADING = new Set(['/', '/pacientes', '/add-paciente', '/hospitalizacion', '/laboratorio', '/reportes', '/configuracion', '/surgeries']);

export default function DrawerLayout() {
  const { colors, isDark } = useTheme();
  const pathname = usePathname();
  const { isMobile, width } = useResponsive();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEscapeKey(sidebarOpen, () => setSidebarOpen(false));

  const isWeb = Platform.OS === 'web';

  const openCmd = React.useCallback(() => setCmdOpen(true), []);
  useCmdK(openCmd);

  const pageTitle = SCREEN_TITLES[pathname] || 'VetCloud';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sidebar — always visible on web desktop, hidden on mobile */}
      {isWeb && !isMobile && (
        <View style={styles.sidebarWrapper}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </View>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && sidebarOpen && (
        <>
          <Pressable
            style={[styles.drawerBackdrop, { backgroundColor: colors.overlay }]}
            onPress={() => setSidebarOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar menú"
          />
          <View style={[styles.drawerOverlay, { backgroundColor: colors.surface }]}>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </View>
        </>
      )}

      {/* Main content */}
      <View style={styles.content}>
        <TopBar
          onSearchPress={openCmd}
          onMenuPress={isMobile ? () => setSidebarOpen(true) : undefined}
          title={OWN_HEADING.has(pathname) ? undefined : pageTitle}
        />
        <View style={styles.screenArea}>
          <ErrorBoundary colors={{ text: colors.text, textSecondary: colors.textSecondary, error: colors.error }}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'fade',
                animationDuration: 200,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="pacientes" />
              <Stack.Screen name="add-paciente" />
              <Stack.Screen name="diseases" />
              <Stack.Screen name="add-disease" />
              <Stack.Screen name="medications" />
              <Stack.Screen name="surgeries" />
              <Stack.Screen name="agenda" />
              <Stack.Screen name="hospitalizacion" />
              <Stack.Screen name="laboratorio" />
              <Stack.Screen name="inventario" />
              <Stack.Screen name="reportes" />
              <Stack.Screen name="configuracion" />
              <Stack.Screen name="notes" />
              <Stack.Screen name="reminders" />
              <Stack.Screen name="fluidoterapia" />
              <Stack.Screen name="dosis" />
            </Stack>
          </ErrorBoundary>
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
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 90,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    zIndex: 100,
    elevation: 100,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  screenArea: {
    flex: 1,
  },
});
