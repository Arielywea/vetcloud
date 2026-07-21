import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [clinicName, setClinicName] = useState(user?.clinic_name || '');
  const [vetName, setVetName] = useState(user?.veterinarian_name || '');
  const [clinicPhone, setClinicPhone] = useState(user?.clinic_phone || '');
  const [clinicAddress, setClinicAddress] = useState(user?.clinic_address || '');
  const [smtpEmail, setSmtpEmail] = useState(user?.smtp_email || '');
  const [smtpPassword, setSmtpPassword] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data: Record<string, any> = {
        name: name.trim(),
        email: email.trim() || null,
        clinic_name: clinicName.trim() || null,
        veterinarian_name: vetName.trim() || null,
        clinic_phone: clinicPhone.trim() || null,
        clinic_address: clinicAddress.trim() || null,
        smtp_email: smtpEmail.trim() || null,
      };
      if (smtpPassword.trim()) {
        data.smtp_password = smtpPassword.trim();
      }
      await updateProfile(data);
      setSaved(true);
      setSmtpPassword('');
    } catch (e) {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* User info */}
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

      {/* Clinic info */}
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

      {/* SMTP config */}
      <Card style={[styles.card, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="email-outline" size={24} color={colors.primary} />
            <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.text }]}>Configuración de Correo</Text>
          </View>
          <Text variant="bodySmall" style={[styles.hint, { color: colors.textSecondary }]}>
            Configura tu correo Gmail para enviar recetas. Necesitas una contraseña de aplicación de Google.
          </Text>
          <TextInput label="Correo Gmail" value={smtpEmail} onChangeText={setSmtpEmail} mode="outlined" keyboardType="email-address" style={styles.input} />
          <TextInput label="Contraseña de aplicación" value={smtpPassword} onChangeText={setSmtpPassword} mode="outlined" secureTextEntry style={styles.input} placeholder="abcd efgh ijkl mnop" />
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
  hint: { fontSize: 12, marginBottom: 10, lineHeight: 18 },
  savedCard: { marginBottom: 12, borderRadius: 8 },
  savedContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveButton: { marginTop: 4 },
});
