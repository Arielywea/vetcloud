import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { APP_COLORS } from '../constants/colors';

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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: APP_COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
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
              headerTitle: 'Detalle de Mascota',
            }}
          />
        </Stack>
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
