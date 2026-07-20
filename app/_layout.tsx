import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { APP_COLORS } from '../constants/colors';
import LoginScreen from './auth/login';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: APP_COLORS.primary,
    primaryContainer: '#B2EBF2',
    secondary: APP_COLORS.accent,
    secondaryContainer: '#FFE0DB',
    background: APP_COLORS.background,
    surface: APP_COLORS.surface,
    surfaceVariant: APP_COLORS.surfaceVariant,
    error: APP_COLORS.error,
    onPrimary: '#FFFFFF',
    onBackground: APP_COLORS.text,
    onSurface: APP_COLORS.text,
    outline: APP_COLORS.border,
  },
};

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLORS.background }}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
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
        contentStyle: { backgroundColor: APP_COLORS.background },
      }}
    >
      <Stack.Screen name="(drawer)" />
      <Stack.Screen
        name="disease/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: APP_COLORS.primary },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Detalle de Enfermedad',
        }}
      />
      <Stack.Screen
        name="pet/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: APP_COLORS.primary },
          headerTintColor: '#FFFFFF',
          headerTitle: 'Ficha Clínica',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <StatusBar style="auto" />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
