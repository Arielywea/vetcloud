import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import BeagleLogo from '../../components/BeagleLogo';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors } = useTheme();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!rut.trim() || !password.trim()) { setError('Ingresa RUT y contraseña'); return; }
    setLoading(true); setError('');
    try { await login(rut.trim(), password); } catch (e: any) { setError(e.message || 'Error al iniciar sesión'); } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.bgPrimary, { backgroundColor: colors.primary }]}>
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: '#FFFFFF25' }]}>
            <BeagleLogo size={64} variant="light" />
          </View>
          <Text style={styles.logoTitle}>VetCloud</Text>
          <Text style={styles.logoSubtitle}>Sistema de Gestión Veterinaria</Text>
        </View>
      </View>
      <View style={styles.cardSection}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Iniciar Sesión</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Ingresa tus credenciales para acceder</Text>
          <TextInput
            label="RUT" placeholder="12345678-9" value={rut} onChangeText={setRut} mode="outlined" style={styles.input}
            left={<TextInput.Icon icon="account" color={colors.primary} />}
            outlineColor={colors.border} activeOutlineColor={colors.primary}
          />
          <TextInput
            label="Contraseña" value={password} onChangeText={setPassword} mode="outlined" style={styles.input}
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" color={colors.primary} />}
            right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} color={colors.textSecondary} onPress={() => setShowPassword(!showPassword)} />}
            outlineColor={colors.border} activeOutlineColor={colors.primary}
          />
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}
          <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading} style={styles.button} buttonColor={colors.primary} contentStyle={{ paddingVertical: 6 }}>
            Ingresar
          </Button>
        </View>
        <Text style={[styles.footer, { color: colors.textLight }]}>VetCloud © 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgPrimary: { paddingTop: 80, paddingBottom: 60, paddingHorizontal: 24, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  logoSection: { alignItems: 'center' },
  logoCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  logoSubtitle: { fontSize: 14, color: '#FFFFFFCC', marginTop: 4 },
  cardSection: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  card: { borderRadius: 16, padding: 28, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontWeight: '700', fontSize: 20, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, marginBottom: 24 },
  input: { marginBottom: 16 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, padding: 10, borderRadius: 8 },
  errorText: { fontSize: 13, flex: 1 },
  button: { marginTop: 4, borderRadius: 10 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
