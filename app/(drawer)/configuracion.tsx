import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { User, Palette, Bell, Shield, Check, AlertCircle, Eye, EyeOff, Sun, Moon, Building2 } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { apiAuthChangePassword } from '../../services/auth';
import { passwordPolicyError, PASSWORD_HINT } from '../../utils/password';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { useToast } from '../../components/ui/VToast';
import VCard from '../../components/ui/Card';
import VInput from '../../components/ui/Input';
import VButton from '../../components/ui/Button';
import DisplayText from '../../components/ui/DisplayText';

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function ConfiguracionScreen() {
  const { user, updateProfile } = useAuth();
  const { colors, onPrimaryText } = useTheme();
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [clinicName, setClinicName] = useState(user?.clinic_name || '');
  const [vetName, setVetName] = useState(user?.veterinarian_name || '');
  const [clinicPhone, setClinicPhone] = useState(user?.clinic_phone || '');
  const [clinicAddress, setClinicAddress] = useState(user?.clinic_address || '');
  const [profileError, setProfileError] = useState('');

  const [notiEmail, setNotiEmail] = useState(user?.notification_email_reminders ?? true);
  const [notiCitas, setNotiCitas] = useState(user?.notification_upcoming_appointments ?? true);
  const [notiPush, setNotiPush] = useState(user?.notification_push ?? false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // The full profile arrives after the first render (login returns a partial user)
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setClinicName(user.clinic_name || '');
    setVetName(user.veterinarian_name || '');
    setClinicPhone(user.clinic_phone || '');
    setClinicAddress(user.clinic_address || '');
    setNotiEmail(user.notification_email_reminders ?? true);
    setNotiCitas(user.notification_upcoming_appointments ?? true);
    setNotiPush(user.notification_push ?? false);
  }, [user?.id, user?.clinic_name, user?.veterinarian_name, user?.clinic_phone, user?.clinic_address]);

  const modeDark = user?.theme_preference === 'dark';

  const handleSave = async () => {
    setProfileError('');
    if (!name.trim()) { setProfileError('El nombre es obligatorio'); return; }
    if (!isEmail(email.trim())) { setProfileError('Ingresa un correo electrónico válido'); return; }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        clinic_name: clinicName.trim() || null,
        veterinarian_name: vetName.trim() || null,
        clinic_phone: clinicPhone.trim() || null,
        clinic_address: clinicAddress.trim() || null,
      });
      toast.success('Perfil actualizado');
    } catch (error: any) {
      setProfileError(error?.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // Theme and notifications save on change, so there's no half-applied state
  const savePreference = async (data: Record<string, any>, revert: () => void) => {
    try {
      await updateProfile(data);
    } catch (error: any) {
      revert();
      toast.error(error?.message || 'No se pudo guardar la preferencia');
    }
  };

  const setMode = (dark: boolean) => {
    if (dark === modeDark) return;
    savePreference({ theme_preference: dark ? 'dark' : 'light' }, () => {});
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword) {
      setPasswordError('Completa la contraseña actual y la nueva');
      return;
    }
    const policyError = passwordPolicyError(newPassword);
    if (policyError) { setPasswordError(policyError); return; }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }
    setChangingPassword(true);
    try {
      await apiAuthChangePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setPasswordError(e.message || 'No se pudo cambiar la contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  const eyeToggle = (shown: boolean, toggle: () => void) => (
    <TouchableOpacity
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      hitSlop={10}
    >
      {shown ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
    </TouchableOpacity>
  );

  const modeButton = (dark: boolean) => {
    const active = dark === modeDark;
    const Icon = dark ? Moon : Sun;
    return (
      <TouchableOpacity
        style={[styles.modeBtn, { borderColor: colors.border }, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
        onPress={() => setMode(dark)}
        accessibilityRole="radio"
        accessibilityState={{ checked: active }}
        accessibilityLabel={dark ? 'Modo oscuro' : 'Modo claro'}
      >
        <Icon size={15} color={active ? onPrimaryText.default : colors.textSecondary} />
        <Text style={[styles.modeBtnText, { color: active ? onPrimaryText.default : colors.textSecondary }]}>{dark ? 'Oscuro' : 'Claro'}</Text>
      </TouchableOpacity>
    );
  };

  const errorBox = (message: string) => (
    <View style={[styles.msgBox, { backgroundColor: alpha(colors.error, 0.08) }]} accessibilityRole="alert">
      <AlertCircle size={18} color={colors.error} />
      <Text style={[styles.msgText, { color: colors.error }]}>{message}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <DisplayText style={[styles.title, { color: colors.text }]}>Configuración</DisplayText>
      </View>

      {/* Datos personales */}
      <VCard style={styles.card}>
        <View style={styles.cardHeader}>
          <User size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Datos personales</Text>
        </View>
        <VInput label="Nombre" value={name} onChangeText={setName} />
        <VInput label="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        {user?.rut ? <VInput label="RUT" value={user.rut} editable={false} /> : null}
      </VCard>

      {/* Clínica */}
      <VCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Building2 size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Clínica</Text>
        </View>
        <Text style={[styles.cardHint, { color: colors.textSecondary }]}>
          Aparece en el encabezado de las recetas en PDF y en los correos a los tutores.
        </Text>
        <VInput label="Nombre de la clínica" value={clinicName} onChangeText={setClinicName} maxLength={200} />
        <VInput label="Médico veterinario responsable" value={vetName} onChangeText={setVetName} maxLength={200} />
        <VInput label="Teléfono" value={clinicPhone} onChangeText={setClinicPhone} keyboardType="phone-pad" maxLength={200} />
        <VInput label="Dirección" value={clinicAddress} onChangeText={setClinicAddress} maxLength={200} />

        {profileError ? errorBox(profileError) : null}
        <VButton variant="primary" onPress={handleSave} loading={saving} disabled={saving} fullWidth>
          Guardar cambios
        </VButton>
      </VCard>

      {/* Apariencia */}
      <VCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Palette size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Apariencia</Text>
        </View>
        <View style={styles.modeRow} accessibilityRole="radiogroup">
          {modeButton(false)}
          {modeButton(true)}
        </View>
        <Text style={[styles.modeHint, { color: colors.textSecondary }]}>
          {modeDark ? 'Alter: armadura negra, carmesí y oro pálido.' : 'Saber: azul real, oro antiguo y marfil.'}
        </Text>
      </VCard>

      {/* Notificaciones */}
      <VCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Bell size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Notificaciones</Text>
        </View>
        {([
          ['Recordatorios por correo', notiEmail, setNotiEmail, 'notification_email_reminders'],
          ['Citas próximas', notiCitas, setNotiCitas, 'notification_upcoming_appointments'],
          ['Notificaciones push', notiPush, setNotiPush, 'notification_push'],
        ] as const).map(([label, value, setter, field], i, all) => (
          <View key={field} style={[styles.notiRow, i < all.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={[styles.notiLabel, { color: colors.text }]}>{label}</Text>
            <Switch
              value={value}
              onValueChange={(v) => { setter(v); savePreference({ [field]: v }, () => setter(!v)); }}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.surface}
              accessibilityLabel={label}
            />
          </View>
        ))}
      </VCard>

      {/* Seguridad */}
      <VCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Shield size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Cambiar contraseña</Text>
        </View>
        <VInput
          label="Contraseña actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrentPassword}
          autoComplete="current-password"
          rightIcon={eyeToggle(showCurrentPassword, () => setShowCurrentPassword(!showCurrentPassword))}
        />
        <VInput
          label="Nueva contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          rightIcon={eyeToggle(showNewPassword, () => setShowNewPassword(!showNewPassword))}
        />
        <VInput
          label="Confirmar nueva contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showNewPassword}
          autoComplete="new-password"
        />

        {passwordError ? errorBox(passwordError) : null}
        {passwordSuccess ? (
          <View style={[styles.msgBox, { backgroundColor: alpha(colors.success, 0.08) }]} accessibilityRole="alert">
            <Check size={18} color={colors.success} />
            <Text style={[styles.msgText, { color: colors.success }]}>Contraseña cambiada</Text>
          </View>
        ) : null}

        <VButton variant="secondary" onPress={handleChangePassword} loading={changingPassword} disabled={changingPassword}>
          Cambiar contraseña
        </VButton>
      </VCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'], maxWidth: 720, width: '100%', alignSelf: 'center' },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  card: { marginBottom: SPACING.md, borderRadius: RADIUS.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  cardTitle: { fontWeight: TYPOGRAPHY.weights.bold, fontSize: TYPOGRAPHY.sizes.lg },
  cardHint: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: -SPACING.xs, marginBottom: SPACING.md },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, borderRadius: RADIUS.md, borderWidth: 1 },
  modeHint: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.sm },
  modeBtnText: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  notiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  notiLabel: { fontSize: TYPOGRAPHY.sizes.base },
  msgBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: RADIUS.md, marginBottom: 10 },
  msgText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, flex: 1 },
});
