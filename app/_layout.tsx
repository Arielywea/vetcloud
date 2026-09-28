import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/ui/VToast';
import { APP_COLORS } from '../constants/colors';
import LoginScreen from './auth/login';
import { installWebFonts } from '../utils/webFonts';

installWebFonts();

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F', padding: 24 }}>
          <Text style={{ color: '#F0707A', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Algo salió mal</Text>
          <Text style={{ color: '#ABA5B3', fontSize: 14, textAlign: 'center' }}>{this.state.error}</Text>
          <Text
            style={{ color: '#D9B45B', fontSize: 14, marginTop: 20 }}
            onPress={() => this.setState({ hasError: false, error: '' })}
          >
            Reintentar
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { colors, onChromeText } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(drawer)" />
      <Stack.Screen
        name="disease/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.chrome },
          headerTintColor: onChromeText.default,
          headerShadowVisible: false,
          headerTitle: 'Detalle de Enfermedad',
        }}
      />
      <Stack.Screen
        name="pet/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.chrome },
          headerTintColor: onChromeText.default,
          headerShadowVisible: false,
          headerTitle: 'Ficha Clínica',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <AuthProvider>
          <ThemeProvider>
            <ThemedPaperProvider>
              <ToastProvider>
                <RootErrorBoundary>
                  <AppContent />
                </RootErrorBoundary>
                <StatusBar style="auto" />
              </ToastProvider>
            </ThemedPaperProvider>
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function ThemedPaperProvider({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();

  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      secondary: colors.accent,
      onSecondary: isDark ? '#FFFFFF' : '#0A1733',
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surfaceVariant,
      error: colors.error,
      onPrimary: colors.onPrimary,
      primaryContainer: colors.primaryContainer,
      onPrimaryContainer: colors.text,
      onSurfaceVariant: colors.textSecondary,
      outlineVariant: colors.border,
      onBackground: colors.text,
      onSurface: colors.text,
      outline: colors.border,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      {children}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
