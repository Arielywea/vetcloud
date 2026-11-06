import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { User, Lock, AlertCircle, LogIn, Eye, EyeOff, Mail, Building, UserPlus, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY, SHADOWS, alpha } from '../../constants/tokens';
import DisplayText from '../../components/ui/DisplayText';
import BeagleLogo from '../../components/BeagleLogo';
import VInput from '../../components/ui/Input';
import VButton from '../../components/ui/Button';
import { passwordPolicyError, PASSWORD_HINT } from '../../utils/password';
import { apiForgotPassword } from '../../services/auth';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const { colors, isDark, onChromeText, onAccentText } = useTheme();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

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

  // Forgot-password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) { setError('Formato de correo inválido'); return; }
    const policyError = passwordPolicyError(regPassword);
    if (policyError) { setError(policyError); return; }

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

  const switchView = (v: 'login' | 'register' | 'forgot') => { setView(v); setError(''); };

  // ─── REGISTER VIEW ────────────────────────────────────
  if (view === 'register') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: colors.chrome }]}>
          <BeagleLogo size={64} />
          <DisplayText style={[styles.logoTitle, { color: onChromeText.default }]}>Crear cuenta</DisplayText>
          <Text style={[styles.logoSubtitle, { color: onChromeText.muted }]}>Regístrate para probar Vet Avalon</Text>
        </View>

        <ScrollView style={styles.formSection} contentContainerStyle={styles.formContent}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <VInput label="Usuario *" placeholder="mi.usuario" value={regUsername} onChangeText={setRegUsername} leftIcon={<User size={18} color={colors.primary} />} autoCapitalize="none" />
            <VInput label="Correo electrónico *" placeholder="correo@ejemplo.com" value={regEmail} onChangeText={setRegEmail} leftIcon={<Mail size={18} color={colors.primary} />} keyboardType="email-address" autoCapitalize="none" />
            <VInput label="Contraseña *" autoComplete="new-password" hint={PASSWORD_HINT} value={regPassword} onChangeText={setRegPassword} secureTextEntry={!showPassword} leftIcon={<Lock size={18} color={colors.primary} />}
              rightIcon={<View style={{ padding: 4 }}>{showPassword ? <EyeOff size={18} color={colors.textSecondary} onPress={() => setShowPassword(false)} /> : <Eye size={18} color={colors.textSecondary} onPress={() => setShowPassword(true)} />}</View>} />
            <VInput label="Nombre de la clínica (opcional)" onSubmitEditing={handleRegister} returnKeyType="go" placeholder="Mi clínica veterinaria" value={regOrgName} onChangeText={setRegOrgName} leftIcon={<Building size={18} color={colors.primary} />} />

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipo de negocio</Text>
            <View style={styles.orgTypeRow}>
              <TouchableOpacity style={[styles.orgTypeBtn, { borderColor: regOrgType === 'solo' ? colors.primary : colors.border, backgroundColor: regOrgType === 'solo' ? colors.primaryContainer : 'transparent' }]} onPress={() => setRegOrgType('solo')}>
                <User size={20} color={regOrgType === 'solo' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.orgTypeLabel, { color: regOrgType === 'solo' ? colors.primary : colors.textSecondary }]}>Independiente</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.orgTypeBtn, { borderColor: regOrgType === 'clinic' ? colors.primary : colors.border, backgroundColor: regOrgType === 'clinic' ? colors.primaryContainer : 'transparent' }]} onPress={() => setRegOrgType('clinic')}>
                <Building size={20} color={regOrgType === 'clinic' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.orgTypeLabel, { color: regOrgType === 'clinic' ? colors.primary : colors.textSecondary }]}>Clínica</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: colors.error + '12' }]}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <VButton onPress={handleRegister} loading={loading} disabled={loading} fullWidth icon={<UserPlus size={18} color={onAccentText.default} />}>
              Crear Cuenta
            </VButton>
          </View>

          <TouchableOpacity onPress={() => switchView('login')} style={styles.backLink}>
            <ArrowLeft size={16} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Volver al login</Text>
          </TouchableOpacity>

          <Text style={[styles.footer, { color: colors.textLight }]}>© 2026 Vet Avalon</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── FORGOT PASSWORD VIEW ─────────────────────────────
  if (view === 'forgot') {
    const handleForgot = async () => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) { setError('Ingresa un correo válido'); return; }
      setLoading(true); setError('');
      try { await apiForgotPassword(forgotEmail.trim()); setForgotSent(true); }
      catch (e: any) { setError(e.message || 'No se pudo enviar el correo'); }
      finally { setLoading(false); }
    };
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { backgroundColor: colors.chrome }]}>
          <BeagleLogo size={88} />
          <DisplayText style={[styles.logoTitle, { color: onChromeText.default }]}>
            Vet <Text style={{ color: isDark ? colors.primary : colors.accent }}>Avalon</Text>
          </DisplayText>
        </View>
        <View style={styles.formSection}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <DisplayText style={[styles.cardTitle, { color: colors.text }]}>Recuperar contraseña</DisplayText>
            {forgotSent ? (
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Si ese correo tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva. Vale 1 hora. Revisa también la carpeta de spam.
              </Text>
            ) : (
              <>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Te enviaremos un enlace al correo con que te registraste</Text>
                <VInput label="Correo" autoComplete="email" placeholder="correo@ejemplo.com" value={forgotEmail} onChangeText={setForgotEmail} onSubmitEditing={handleForgot} returnKeyType="go" leftIcon={<Mail size={18} color={colors.primary} />} autoCapitalize="none" keyboardType="email-address" />
                {error ? (
                  <View style={[styles.errorContainer, { backgroundColor: colors.error + '12' }]}>
                    <AlertCircle size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                  </View>
                ) : null}
                <VButton onPress={handleForgot} loading={loading} disabled={loading} fullWidth icon={<Mail size={18} color={onAccentText.default} />}>
                  Enviar enlace
                </VButton>
              </>
            )}
          </View>
          <TouchableOpacity onPress={() => { setForgotSent(false); switchView('login'); }} style={styles.backLink}>
            <ArrowLeft size={16} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Volver al login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ─── LOGIN VIEW ───────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: colors.chrome }]}>
        <BeagleLogo size={88} />
        <DisplayText style={[styles.logoTitle, { color: onChromeText.default }]}>
          Vet <Text style={{ color: isDark ? colors.primary : colors.accent }}>Avalon</Text>
        </DisplayText>
        <View style={styles.taglineRow}>
          <Text style={[styles.logoSubtitle, { color: onChromeText.muted }]}>Gestión clínica veterinaria</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <DisplayText style={[styles.cardTitle, { color: colors.text }]}>Iniciar sesión</DisplayText>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Ingresa tus credenciales para acceder</Text>

          <VInput label="Usuario o correo" autoComplete="username" returnKeyType="next" placeholder="usuario o correo@ejemplo.com" value={identifier} onChangeText={setIdentifier} leftIcon={<User size={18} color={colors.primary} />} autoCapitalize="none" keyboardType="email-address" />
          <VInput label="Contraseña" placeholder="Ingresa tu contraseña" value={password} onChangeText={setPassword} onSubmitEditing={handleLogin} returnKeyType="go" autoComplete="current-password" secureTextEntry={!showPassword} leftIcon={<Lock size={18} color={colors.primary} />}
            rightIcon={<View style={{ padding: 4 }}>{showPassword ? <EyeOff size={18} color={colors.textSecondary} onPress={() => setShowPassword(false)} /> : <Eye size={18} color={colors.textSecondary} onPress={() => setShowPassword(true)} />}</View>} />

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '12' }]}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <VButton onPress={handleLogin} loading={loading} disabled={loading} fullWidth icon={<LogIn size={18} color={onAccentText.default} />}>
            Ingresar
          </VButton>

          <TouchableOpacity onPress={() => switchView('forgot')} style={{ alignSelf: 'center', paddingTop: SPACING.md }} accessibilityRole="link">
            <Text style={{ color: colors.primary, fontSize: TYPOGRAPHY.sizes.sm }}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => switchView('register')} style={styles.registerLink}>
          <Text style={[styles.registerText, { color: colors.primary }]}>
            ¿No tienes cuenta? <Text style={{ fontWeight: TYPOGRAPHY.weights.bold }}>Crear cuenta de prueba</Text>
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: colors.textLight }]}>© 2026 Vet Avalon</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 88,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoTitle: { fontSize: 36, fontWeight: '600', letterSpacing: 0.6, marginTop: SPACING.xs },
  logoSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, letterSpacing: 0.3 },
  formSection: { flex: 1, paddingHorizontal: SPACING.lg, marginTop: -56, width: '100%', maxWidth: 440, alignSelf: 'center' },
  formContent: { paddingTop: SPACING.xl, paddingBottom: SPACING['2xl'] },
  card: {
    borderRadius: 3,
    padding: SPACING['2xl'],
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: '600',
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
