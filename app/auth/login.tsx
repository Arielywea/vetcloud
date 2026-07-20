import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { APP_COLORS } from '../../constants/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!rut.trim() || !password.trim()) {
      setError('Ingresa RUT y contraseña');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(rut.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bgPrimary}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="stethoscope" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.logoTitle}>VetCloud</Text>
          <Text style={styles.logoSubtitle}>Sistema de Gestión Veterinaria</Text>
        </View>
      </View>

      <View style={styles.cardSection}>
        <View style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSubtitle}>Ingresa tus credenciales para acceder</Text>

          <TextInput
            label="RUT"
            placeholder="12345678-9"
            value={rut}
            onChangeText={setRut}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" color={APP_COLORS.primary} />}
            outlineColor={APP_COLORS.border}
            activeOutlineColor={APP_COLORS.primary}
          />

          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" color={APP_COLORS.primary} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                color={APP_COLORS.textSecondary}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineColor={APP_COLORS.border}
            activeOutlineColor={APP_COLORS.primary}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={APP_COLORS.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={APP_COLORS.primary}
            contentStyle={{ paddingVertical: 6 }}
          >
            Ingresar
          </Button>
        </View>

        <Text style={styles.footer}>VetCloud © 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  bgPrimary: {
    backgroundColor: APP_COLORS.primary,
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF25',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#FFFFFFCC',
    marginTop: 4,
  },
  cardSection: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    padding: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontWeight: '700',
    color: APP_COLORS.text,
    fontSize: 20,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: APP_COLORS.surface,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    color: APP_COLORS.error,
    fontSize: 13,
    flex: 1,
  },
  button: {
    marginTop: 4,
    borderRadius: 10,
  },
  footer: {
    textAlign: 'center',
    color: APP_COLORS.textLight,
    fontSize: 12,
    marginTop: 24,
  },
});
