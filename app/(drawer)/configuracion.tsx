import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { User, Palette, Bell, Shield, Check, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { PALETTES, APP_COLORS, APP_COLORS_DARK } from '../../constants/colors';
import { apiAuthChangePassword } from '../../services/auth';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';

const PALETTE_OPTIONS = [
  { key: null, label: 'Predeterminada' },
  ...Object.keys(PALETTES).map((k) => ({ key: k, label: PALETTES[k].label })),
];

function PaletteSwatch({ colors }: { colors: typeof APP_COLORS }) {
  const swatches = [colors.primary, colors.accent, colors.info, colors.success];
  return (
    <View style={styles.swatchRow}>
      {swatches.map((c, i) => (
        <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
      ))}
    </View>
  );
}

export default function ConfiguracionScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedPalette, setSelectedPalette] = useState<string | null>(user?.color_palette || null);
  const [modeDark, setModeDark] = useState(user?.theme_preference === 'dark');

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

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || null,
        theme_preference: modeDark ? 'dark' : 'light',
        color_palette: selectedPalette,
        notification_email_reminders: notiEmail,
        notification_upcoming_appointments: notiCitas,
        notification_push: notiPush,
      });
      setSaved(true);
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const handleNotiToggle = async (field: string, value: boolean) => {
    try {
      await updateProfile({ [field]: value });
    } catch {}
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword) {
      setPasswordError('Completá ambas contraseñas');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('La nueva contraseña debe tener al menos 4 caracteres');
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
      setPasswordError(e.message || 'Error al cambiar contraseña');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
      </View>

      {/* Datos Personales */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <User size={20} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Datos Personales</Text>
          </View>
          <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} textColor={colors.text} outlineColor={colors.border} activeOutlineColor={colors.primary} />
          <TextInput label="Correo electrónico" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} textColor={colors.text} outlineColor={colors.border} activeOutlineColor={colors.primary} />
          <TextInput label="RUT" value={user?.rut || ''} mode="outlined" disabled style={styles.input} />
        </Card.Content>
      </Card>

      {/* Personalización */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Palette size={20} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Personalización</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Modo</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, !modeDark && { backgroundColor: colors.primary }, { borderColor: colors.border }]}
              onPress={() => setModeDark(false)}
            >
              <Text style={[styles.modeBtnText, { color: !modeDark ? '#FFF' : colors.textSecondary }]}>☀ Claro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, modeDark && { backgroundColor: colors.primary }, { borderColor: colors.border }]}
              onPress={() => setModeDark(true)}
            >
              <Text style={[styles.modeBtnText, { color: modeDark ? '#FFF' : colors.textSecondary }]}>🌙 Oscuro</Text>
            </TouchableOpacity>
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Paleta</Text>
          <View style={styles.paletteGrid}>
            {PALETTE_OPTIONS.map((opt, idx) => {
              const isActive = selectedPalette === opt.key;
              const paletteColors = opt.key && PALETTES[opt.key]
                ? (modeDark ? PALETTES[opt.key].dark : PALETTES[opt.key].light)
                : (modeDark ? APP_COLORS_DARK : APP_COLORS);
              return (
                <TouchableOpacity
                  key={opt.key || 'default'}
                  style={[
                    styles.paletteCard,
                    { backgroundColor: paletteColors.surface, borderColor: isActive ? colors.primary : paletteColors.border },
                    isActive && { borderWidth: 2 },
                  ]}
                  onPress={() => setSelectedPalette(opt.key)}
                >
                  {isActive && (
                    <View style={[styles.paletteCheck, { backgroundColor: colors.primary }]}>
                      <Check size={14} color="#FFF" />
                    </View>
                  )}
                  <PaletteSwatch colors={paletteColors} />
                  <Text style={[styles.paletteLabel, { color: paletteColors.text }]}>Opción {idx + 1}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* Notificaciones */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Bell size={20} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Notificaciones</Text>
          </View>
          <View style={[styles.notiRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.notiLabel, { color: colors.text }]}>Recordatorios por email</Text>
            <Switch value={notiEmail} onValueChange={(v) => { setNotiEmail(v); handleNotiToggle('notification_email_reminders', v); }} trackColor={{ false: colors.disabled, true: colors.primary }} thumbColor={colors.surface} />
          </View>
          <View style={[styles.notiRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.notiLabel, { color: colors.text }]}>Citas próximas</Text>
            <Switch value={notiCitas} onValueChange={(v) => { setNotiCitas(v); handleNotiToggle('notification_upcoming_appointments', v); }} trackColor={{ false: colors.disabled, true: colors.primary }} thumbColor={colors.surface} />
          </View>
          <View style={styles.notiRow}>
            <Text style={[styles.notiLabel, { color: colors.text }]}>Notificaciones push</Text>
            <Switch value={notiPush} onValueChange={(v) => { setNotiPush(v); handleNotiToggle('notification_push', v); }} trackColor={{ false: colors.disabled, true: colors.primary }} thumbColor={colors.surface} />
          </View>
        </Card.Content>
      </Card>

      {/* Seguridad */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Shield size={20} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
          </View>
          <View style={styles.passwordField}>
            <TextInput
              label="Contraseña actual"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              mode="outlined"
              secureTextEntry={!showCurrentPassword}
              style={styles.input}
              textColor={colors.text}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              right={<TextInput.Icon icon={() => showCurrentPassword ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />} onPress={() => setShowCurrentPassword(!showCurrentPassword)} />}
            />
          </View>
          <View style={styles.passwordField}>
            <TextInput
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={setNewPassword}
              mode="outlined"
              secureTextEntry={!showNewPassword}
              style={styles.input}
              textColor={colors.text}
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
              right={<TextInput.Icon icon={() => showNewPassword ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />} onPress={() => setShowNewPassword(!showNewPassword)} />}
            />
          </View>
          <TextInput
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            textColor={colors.text}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          {passwordError ? (
            <View style={[styles.msgBox, { backgroundColor: alpha(colors.error, 0.08) }]}>
              <AlertCircle size={18} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 13, fontWeight: '500' }}>{passwordError}</Text>
            </View>
          ) : null}

          {passwordSuccess ? (
            <View style={[styles.msgBox, { backgroundColor: alpha(colors.success, 0.08) }]}>
              <Check size={18} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 13, fontWeight: '500' }}>Contraseña cambiada correctamente</Text>
            </View>
          ) : null}

          <Button mode="outlined" onPress={handleChangePassword} loading={changingPassword} disabled={changingPassword} style={styles.passwordBtn} icon="lock-reset">
            Cambiar Contraseña
          </Button>
        </Card.Content>
      </Card>

      {/* Success Banner */}
      {saved && (
        <Card style={[styles.savedCard, { backgroundColor: alpha(colors.success, 0.08) }]}>
          <Card.Content style={styles.savedContent}>
            <Check size={20} color={colors.success} />
            <Text style={{ color: colors.success, fontWeight: '600' }}>Perfil actualizado correctamente</Text>
          </Card.Content>
        </Card>
      )}

      {/* Save Button */}
      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.saveButton} icon="content-save">
        Guardar Cambios
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  card: { marginBottom: 12, borderRadius: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontWeight: '700' },
  input: { marginBottom: 10 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  divider: { marginVertical: 12 },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  modeBtnText: { fontSize: 14, fontWeight: '600' },
  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paletteCard: { width: '30%', borderRadius: 10, borderWidth: 1, padding: 10, alignItems: 'center', position: 'relative' },
  paletteCheck: { position: 'absolute', top: 6, right: 6, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  swatchRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  swatch: { width: 16, height: 16, borderRadius: 8 },
  paletteLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  notiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  notiLabel: { fontSize: 15 },
  passwordField: { position: 'relative' },
  msgBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 8, marginBottom: 10 },
  passwordBtn: { marginTop: 4 },
  savedCard: { marginBottom: 12, borderRadius: 8 },
  savedContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButton: { marginTop: 4 },
});
