import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { PALETTES, APP_COLORS, APP_COLORS_DARK } from '../../constants/colors';
import { apiAuthChangePassword } from '../../services/auth';

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

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { colors, isDark, themeName } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [clinicName, setClinicName] = useState(user?.clinic_name || '');
  const [vetName, setVetName] = useState(user?.veterinarian_name || '');
  const [clinicPhone, setClinicPhone] = useState(user?.clinic_phone || '');
  const [clinicAddress, setClinicAddress] = useState(user?.clinic_address || '');

  const [selectedPalette, setSelectedPalette] = useState<string | null>(user?.color_palette || null);
  const [modeDark, setModeDark] = useState(user?.theme_preference === 'dark');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || null,
        clinic_name: clinicName.trim() || null,
        veterinarian_name: vetName.trim() || null,
        clinic_phone: clinicPhone.trim() || null,
        clinic_address: clinicAddress.trim() || null,
        theme_preference: modeDark ? 'dark' : 'light',
        color_palette: selectedPalette,
      });
      setSaved(true);
    } catch (e) {
      // error handled by hook
    } finally {
      setSaving(false);
    }
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
      {/* Datos Personales */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account-circle" size={24} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Datos Personales</Text>
          </View>
          <TextInput label="Nombre" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
          <TextInput label="Correo electrónico" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
          <TextInput label="RUT" value={user?.rut || ''} mode="outlined" disabled style={styles.input} />
        </Card.Content>
      </Card>

      {/* Datos de la Clínica */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="hospital-box-outline" size={24} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Datos de la Clínica</Text>
          </View>
          <TextInput label="Nombre de la clínica" value={clinicName} onChangeText={setClinicName} mode="outlined" style={styles.input} />
          <TextInput label="Nombre del veterinario" value={vetName} onChangeText={setVetName} mode="outlined" style={styles.input} />
          <TextInput label="Teléfono" value={clinicPhone} onChangeText={setClinicPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
          <TextInput label="Dirección" value={clinicAddress} onChangeText={setClinicAddress} mode="outlined" multiline style={styles.input} />
        </Card.Content>
      </Card>

      {/* Personalización */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="palette-outline" size={24} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Personalización</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Modo</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, !modeDark && { backgroundColor: colors.primary }, { borderColor: colors.border }]}
              onPress={() => setModeDark(false)}
            >
              <MaterialCommunityIcons name="white-balance-sunny" size={18} color={!modeDark ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.modeBtnText, { color: !modeDark ? '#FFF' : colors.textSecondary }]}>Claro</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, modeDark && { backgroundColor: colors.primary }, { borderColor: colors.border }]}
              onPress={() => setModeDark(true)}
            >
              <MaterialCommunityIcons name="moon-waning-crescent" size={18} color={modeDark ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.modeBtnText, { color: modeDark ? '#FFF' : colors.textSecondary }]}>Oscuro</Text>
            </TouchableOpacity>
          </View>

          <Divider style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tema</Text>
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
                      <MaterialCommunityIcons name="check" size={14} color="#FFF" />
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

      {/* Cambiar Contraseña */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="lock-outline" size={24} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
          </View>
          <TextInput label="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} mode="outlined" secureTextEntry style={styles.input} />
          <TextInput label="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} mode="outlined" secureTextEntry style={styles.input} />
          <TextInput label="Confirmar nueva contraseña" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry style={styles.input} />

          {passwordError ? (
            <View style={[styles.msgBox, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#E53935" />
              <Text style={{ color: '#E53935', fontSize: 13, fontWeight: '500' }}>{passwordError}</Text>
            </View>
          ) : null}

          {passwordSuccess ? (
            <View style={[styles.msgBox, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#43A047" />
              <Text style={{ color: '#43A047', fontSize: 13, fontWeight: '500' }}>Contraseña cambiada correctamente</Text>
            </View>
          ) : null}

          <Button mode="outlined" onPress={handleChangePassword} loading={changingPassword} disabled={changingPassword} style={styles.passwordBtn} icon="lock-reset">
            Cambiar Contraseña
          </Button>
        </Card.Content>
      </Card>

      {saved && (
        <Card style={[styles.savedCard, { backgroundColor: '#E8F5E9' }]}>
          <Card.Content style={styles.savedContent}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#43A047" />
            <Text style={{ color: '#43A047', fontWeight: '600' }}>Perfil actualizado correctamente</Text>
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={styles.saveButton} icon="content-save">
        Guardar Cambios
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
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
  msgBox: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 8, marginBottom: 10 },
  passwordBtn: { marginTop: 4 },
  savedCard: { marginBottom: 12, borderRadius: 8 },
  savedContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButton: { marginTop: 4 },
});
