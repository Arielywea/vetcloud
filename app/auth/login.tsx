import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { User, Lock, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, alpha } from '../../constants/tokens';
import { TEXT_ON_PRIMARY } from '../../constants/colors';
import BeagleLogo from '../../components/BeagleLogo';
import VInput from '../../components/ui/Input';
import VButton from '../../components/ui/Button';

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
    const rutClean = rut.replace(/\./g, '-').trim();
    if (!/^\d{7,8}-[\dkK]$/.test(rutClean)) { setError('Formato de RUT inválido (ej: 12345678-9)'); return; }
    setLoading(true); setError('');
    try { await login(rutClean, password); } catch (e: any) { setError(e.message || 'Error al iniciar sesión'); } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={[styles.logoCircle, { backgroundColor: alpha('#FFFFFF', 0.1) }]}>
          <BeagleLogo size={64} variant="light" />
        </View>
        <Text style={styles.logoTitle}>VetCloud</Text>
        <Text style={styles.logoSubtitle}>Sistema de Gestión Veterinaria</Text>
      </View>

      {/* Form */}
      <View style={styles.formSection}>
        <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.lg]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Iniciar Sesión</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Ingresa tus credenciales para acceder</Text>

          <VInput
            label="RUT"
            placeholder="12345678-9"
            value={rut}
            onChangeText={setRut}
            leftIcon={<User size={18} color={colors.primary} />}
            accessibilityLabel="RUT del usuario"
          />

          <VInput
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={18} color={colors.primary} />}
            accessibilityLabel="Contraseña"
            rightIcon={
              <View style={{ padding: 4 }}>
                {showPassword ? (
                  <EyeOff size={18} color={colors.textSecondary} onPress={() => setShowPassword(false)} />
                ) : (
                  <Eye size={18} color={colors.textSecondary} onPress={() => setShowPassword(true)} />
                )}
              </View>
            }
          />

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '12' }]}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <VButton
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            fullWidth
            icon={<LogIn size={18} color={TEXT_ON_PRIMARY.light.default} />}
          >
            Ingresar
          </VButton>
        </View>

        <Text style={[styles.footer, { color: colors.textLight }]}>VetCloud © 2026</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoTitle: { fontSize: TYPOGRAPHY.sizes['4xl'], fontWeight: TYPOGRAPHY.weights.bold, color: TEXT_ON_PRIMARY.light.default },
  logoSubtitle: { fontSize: TYPOGRAPHY.sizes.md, color: TEXT_ON_PRIMARY.light.muted, marginTop: SPACING.xs },
  formSection: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xl },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    marginBottom: SPACING['2xl'],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  errorText: { fontSize: TYPOGRAPHY.sizes.sm, flex: 1 },
  footer: { textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING['2xl'] },
});
