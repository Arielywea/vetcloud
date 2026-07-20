import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { APP_COLORS } from '../constants/colors';
import LoginScreen from './auth/login';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { colors, isDark } = useTheme();

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
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: isDark ? '#000000' : '#FFFFFF',
          headerTitle: 'Detalle de Enfermedad',
        }}
      />
      <Stack.Screen
        name="pet/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: isDark ? '#000000' : '#FFFFFF',
          headerTitle: 'Ficha Clínica',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <ThemeProvider>
          <ThemedPaperProvider>
            <AppContent />
            <StatusBar style="auto" />
          </ThemedPaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function ThemedPaperProvider({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();

  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      primaryContainer: colors.primaryContainer,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surfaceVariant,
      error: colors.error,
      onPrimary: isDark ? '#000000' : '#FFFFFF',
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
