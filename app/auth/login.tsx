import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { User, Lock, AlertCircle, LogIn, Eye, EyeOff, Mail, Building, UserPlus, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, alpha } from '../../constants/tokens';
import { TEXT_ON_PRIMARY } from '../../constants/colors';
import BeagleLogo from '../../components/BeagleLogo';
import VInput from '../../components/ui/Input';
import VButton from '../../components/ui/Button';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const { colors } = useTheme();
  const [view, setView] = useState<'login' | 'register'>('login');

  // Login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgType, setRegOrgType] = useState<'solo' | 'clinic'>('solo');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) { setError('Ingresa tu usuario o correo y contraseña'); return; }
    setLoading(true); setError('');
    try { await login(identifier.trim(), password); } catch (e: any) { setError(e.message || 'Error al iniciar sesión'); } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Usuario, correo y contraseña son requeridos');
      return;
    }
    if (regUsername.trim().length < 3) { setError('El usuario debe tener al menos 3 caracteres'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) { setError('Formato de correo invalido'); return; }
    if (regPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setLoading(true); setError('');
    try {
      await register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        org_name: regOrgName.trim() || undefined,
        org_type: regOrgType,
      });
    } catch (e: any) {
      setError(e.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  const switchView = (v: 'login' | 'register') => { setView(v); setError(''); };

  // ─── REGISTER VIEW ────────────────────────────────────
  if (view === 'register') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={[styles.logoCircle, { backgroundColor: alpha('#FFFFFF', 0.1) }]}>
            <BeagleLogo size={48} variant="light" />
          </View>
          <Text style={styles.logoTitle}>Crear Cuenta</Text>
          <Text style={styles.logoSubtitle}>Registrate para probar VetCloud</Text>
        </View>

        <ScrollView style={styles.formSection} contentContainerStyle={styles.formContent}>
          <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.lg]}>
            <VInput label="Usuario *" placeholder="mi.usuario" value={regUsername} onChangeText={setRegUsername} leftIcon={<User size={18} color={colors.primary} />} autoCapitalize="none" />
            <VInput label="Correo electronico *" placeholder="correo@ejemplo.com" value={regEmail} onChangeText={setRegEmail} leftIcon={<Mail size={18} color={colors.primary} />} keyboardType="email-address" autoCapitalize="none" />
            <VInput label="Contrasena *" placeholder="Minimo 6 caracteres" value={regPassword} onChangeText={setRegPassword} secureTextEntry={!showPassword} leftIcon={<Lock size={18} color={colors.primary} />}
              rightIcon={<View style={{ padding: 4 }}>{showPassword ? <EyeOff size={18} color={colors.textSecondary} onPress={() => setShowPassword(false)} /> : <Eye size={18} color={colors.textSecondary} onPress={() => setShowPassword(true)} />}</View>} />
            <VInput label="Nombre de la clinica (opcional)" placeholder="Mi Clinica Veterinaria" value={regOrgName} onChangeText={setRegOrgName} leftIcon={<Building size={18} color={colors.primary} />} />

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipo de negocio</Text>
            <View style={styles.orgTypeRow}>
              <TouchableOpacity style={[styles.orgTypeBtn, { borderColor: regOrgType === 'solo' ? colors.primary : colors.border, backgroundColor: regOrgType === 'solo' ? colors.primaryContainer : 'transparent' }]} onPress={() => setRegOrgType('solo')}>
                <User size={20} color={regOrgType === 'solo' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.orgTypeLabel, { color: regOrgType === 'solo' ? colors.primary : colors.textSecondary }]}>Independiente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.orgTypeBtn, { borderColor: regOrgType === 'clinic' ? colors.primary : colors.border, backgroundColor: regOrgType === 'clinic' ? colors.primaryContainer : 'transparent' }]} onPress={() => setRegOrgType('clinic')}>
                <Building size={20} color={regOrgType === 'clinic' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.orgTypeLabel, { color: regOrgType === 'clinic' ? colors.primary : colors.textSecondary }]}>Clinica</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '12' }]}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <VButton onPress={handleRegister} loading={loading} disabled={loading} fullWidth icon={<UserPlus size={18} color={TEXT_ON_PRIMARY.light.default} />}>
              Crear Cuenta
            </VButton>
          </View>

          <TouchableOpacity onPress={() => switchView('login')} style={styles.backLink}>
            <ArrowLeft size={16} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Volver al login</Text>
          </TouchableOpacity>

          <Text style={[styles.footer, { color: colors.textLight }]}>VetCloud (c) 2026</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── LOGIN VIEW ───────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={[styles.logoCircle, { backgroundColor: alpha('#FFFFFF', 0.1) }]}>
          <BeagleLogo size={64} variant="light" />
        </View>
        <Text style={styles.logoTitle}>VetCloud</Text>
        <Text style={styles.logoSubtitle}>Sistema de Gestion Veterinaria</Text>
      </View>

      <View style={styles.formSection}>
        <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.lg]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Iniciar Sesion</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Ingresa tus credenciales para acceder</Text>

          <VInput label="Usuario o correo" placeholder="usuario o correo@ejemplo.com" value={identifier} onChangeText={setIdentifier} leftIcon={<User size={18} color={colors.primary} />} autoCapitalize="none" keyboardType="email-address" />
          <VInput label="Contrasena" placeholder="Ingresa tu contrasena" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} leftIcon={<Lock size={18} color={colors.primary} />}
            rightIcon={<View style={{ padding: 4 }}>{showPassword ? <EyeOff size={18} color={colors.textSecondary} onPress={() => setShowPassword(false)} /> : <Eye size={18} color={colors.textSecondary} onPress={() => setShowPassword(true)} />}</View>} />

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '12' }]}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <VButton onPress={handleLogin} loading={loading} disabled={loading} fullWidth icon={<LogIn size={18} color={TEXT_ON_PRIMARY.light.default} />}>
            Ingresar
          </VButton>
        </View>

        <TouchableOpacity onPress={() => switchView('register')} style={styles.registerLink}>
          <Text style={[styles.registerText, { color: colors.primary }]}>
            No tenes cuenta? <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>Crear cuenta de prueba</Text>
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.textLight }]}>VetCloud (c) 2026</Text>
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
  formContent: { paddingTop: SPACING.xl, paddingBottom: SPACING['2xl'] },
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
  sectionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orgTypeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  orgTypeBtn: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
  },
  orgTypeLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: 'center',
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
  registerLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  registerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  backText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  footer: { textAlign: 'center', fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING['2xl'] },
});
