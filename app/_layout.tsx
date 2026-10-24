import { Stack, useRouter } from 'expo-router';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, ActivityIndicator, View, Text, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import DisplayText from '../components/ui/DisplayText';
import React from 'react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/ui/VToast';
import { ConfirmProvider } from '../components/ui/ConfirmDialog';
import { APP_COLORS, APP_COLORS_DARK, getTextOnPrimary } from '../constants/colors';
import LoginScreen from './auth/login';
import { installWebFonts } from '../utils/webFonts';
import DynamicIcon from '../components/ui/DynamicIcon';

// Paper names its icons after MaterialCommunityIcons; drawing them with that font downloads a
// 1.1 MB .ttf the first time one appears. DynamicIcon maps the same names to lucide.
const PAPER_SETTINGS = { icon: ({ name, size, color }: { name: string; size: number; color?: string }) => <DynamicIcon name={name} size={size} color={color} /> };

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: APP_COLORS_DARK.background, padding: 24 }}>
          <Text style={{ color: APP_COLORS_DARK.error, fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Algo salió mal</Text>
          <Text style={{ color: APP_COLORS_DARK.textSecondary, fontSize: 14, textAlign: 'center' }}>{this.state.error}</Text>
          <Text
            style={{ color: APP_COLORS_DARK.primary, fontSize: 14, marginTop: 20 }}
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
          headerTitle: () => <ChromeTitle>Enfermedad</ChromeTitle>,
          headerLeft: () => <ChromeBack fallback="/(drawer)/diseases" />,
        }}
      />
      <Stack.Screen
        name="surgery/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.chrome },
          headerTintColor: onChromeText.default,
          headerShadowVisible: false,
          headerTitle: () => <ChromeTitle>Cirugía</ChromeTitle>,
          headerLeft: () => <ChromeBack fallback="/(drawer)/surgeries" />,
        }}
      />
      <Stack.Screen
        name="consulta/[petId]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.chrome },
          headerTintColor: onChromeText.default,
          headerShadowVisible: false,
          headerTitle: () => <ChromeTitle>Consulta</ChromeTitle>,
          headerLeft: () => <ChromeBack fallback="/(drawer)/pacientes" />,
        }}
      />
      <Stack.Screen
        name="owner/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.chrome },
          headerTintColor: onChromeText.default,
          headerShadowVisible: false,
          headerTitle: () => <ChromeTitle>Tutor</ChromeTitle>,
          headerLeft: () => <ChromeBack fallback="/(drawer)/pacientes?vista=tutores" />,
        }}
      />
      <Stack.Screen
        name="pet/[id]"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.chrome },
          headerTintColor: onChromeText.default,
          headerShadowVisible: false,
          headerTitle: () => <ChromeTitle>Ficha clínica</ChromeTitle>,
          headerLeft: () => <ChromeBack fallback="/(drawer)/pacientes" />,
        }}
      />
    </Stack>
  );
}

// Detail screens: the chrome bar's title in Cormorant like every page title, and a back arrow that
// still works after a reload (no history), when the stack's own arrow disappeared.
function ChromeTitle({ children }: { children: string }) {
  const { onChromeText } = useTheme();
  return <DisplayText style={{ fontSize: 24, fontWeight: '600', color: onChromeText.default }}>{children}</DisplayText>;
}
function ChromeBack({ fallback }: { fallback: string }) {
  const router = useRouter();
  const { onChromeText } = useTheme();
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback as any))}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: 4, opacity: pressed ? 0.7 : 1 })}
    >
      <ChevronLeft size={24} color={onChromeText.default} />
    </Pressable>
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
                <ConfirmProvider>
                  <RootErrorBoundary>
                    <AppContent />
                  </RootErrorBoundary>
                  <ThemedStatusBar />
                </ConfirmProvider>
              </ToastProvider>
            </ThemedPaperProvider>
          </ThemeProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// Follows the app theme (Saber/Alter), not the OS setting
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function ThemedPaperProvider({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();

  const base = isDark ? MD3DarkTheme : MD3LightTheme;
  const paperTheme = {
    ...base,
    // Square corners like the rest of the system: Paper derives button, segmented-button and
    // input radii from this (MD3 multiplies it by up to 5; the default 4 gave 20px pills)
    roundness: 0.5,
    colors: {
      ...base.colors,
      // MD3's lavender (secondaryContainer, the elevation tint) was never part of Saber or Alter
      secondaryContainer: colors.primaryContainer,
      onSecondaryContainer: colors.text,
      elevation: {
        level0: 'transparent',
        level1: colors.surface,
        level2: colors.surface,
        level3: colors.surface,
        level4: colors.surface,
        level5: colors.surface,
      },
      primary: colors.primary,
      secondary: colors.accent,
      onSecondary: getTextOnPrimary(colors.accent).default,
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
    <PaperProvider theme={paperTheme} settings={PAPER_SETTINGS}>
      {children}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
