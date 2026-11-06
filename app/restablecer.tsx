import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { apiResetPassword } from '../services/auth';
import { passwordPolicyError, PASSWORD_HINT } from '../utils/password';
import DisplayText from '../components/ui/DisplayText';
import VInput from '../components/ui/Input';
import VButton from '../components/ui/Button';
import Escutcheon from '../components/icons/Escutcheon';
import { SPACING, TYPOGRAPHY } from '../constants/tokens';

// Public page: the link in the recovery email lands here (/restablecer?token=...), with no session.

export default function RestablecerScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const { colors, onAccentText } = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const policy = passwordPolicyError(password);
    if (policy) { setError(policy); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true); setError('');
    try {
      await apiResetPassword(String(token), password);
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => { router.replace('/'); };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.wrap}>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Escutcheon size={44} color={colors.accent} />
        <DisplayText style={[styles.title, { color: colors.text }]}>Nueva contraseña</DisplayText>
        {!token ? (
          <Text style={{ color: colors.textSecondary }}>Este enlace no es válido. Pide uno nuevo desde «¿Olvidaste tu contraseña?».</Text>
        ) : done ? (
          <>
            <View style={styles.row}>
              <CheckCircle2 size={18} color={colors.success} />
              <Text style={{ color: colors.text }}>Tu contraseña cambió. Ya puedes iniciar sesión.</Text>
            </View>
            <VButton onPress={goLogin} fullWidth>Ir a iniciar sesión</VButton>
          </>
        ) : (
          <>
            <Text style={{ color: colors.textSecondary }}>{PASSWORD_HINT}</Text>
            <VInput label="Contraseña nueva" secureTextEntry autoComplete="new-password" value={password} onChangeText={setPassword} leftIcon={<Lock size={18} color={colors.primary} />} />
            <VInput label="Repite la contraseña" secureTextEntry autoComplete="new-password" value={confirm} onChangeText={setConfirm} onSubmitEditing={submit} returnKeyType="go" leftIcon={<Lock size={18} color={colors.primary} />} />
            {error ? (
              <View style={[styles.error, { backgroundColor: colors.error + '12' }]}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={{ color: colors.error, flex: 1 }}>{error}</Text>
              </View>
            ) : null}
            <VButton onPress={submit} loading={loading} disabled={loading} fullWidth icon={<Lock size={18} color={onAccentText.default} />}>
              Cambiar contraseña
            </VButton>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  card: { width: '100%', maxWidth: 420, padding: SPACING.xl, gap: SPACING.md },
  title: { fontSize: 28, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  error: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm },
});
