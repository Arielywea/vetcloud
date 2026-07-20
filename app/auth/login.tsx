import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { APP_COLORS } from '../../constants/colors';

export default function LoginScreen() {
  const { login } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text variant="headlineLarge" style={styles.title}>VetCloud</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Inicia sesión con tu RUT</Text>

        <TextInput
          label="RUT (12345678-9)"
          value={rut}
          onChangeText={setRut}
          mode="outlined"
          style={styles.input}
          keyboardType="default"
          autoCapitalize="none"
        />

        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
          buttonColor={APP_COLORS.primary}
        >
          Ingresar
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontWeight: '800', color: APP_COLORS.primary, textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: APP_COLORS.textSecondary, marginBottom: 32 },
  input: { marginBottom: 16, backgroundColor: APP_COLORS.surface },
  error: { color: APP_COLORS.error, textAlign: 'center', marginBottom: 12 },
  button: { marginTop: 8, paddingVertical: 4 },
});
