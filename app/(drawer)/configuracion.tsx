import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { User, Palette, Bell, Shield, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { PALETTES } from '../../constants/colors';
import VCard from '../../components/ui/Card';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();

  const [notiEmail, setNotiEmail] = useState(user?.notification_email_reminders ?? true);
  const [notiCitas, setNotiCitas] = useState(user?.notification_upcoming_appointments ?? true);
  const [notiPush, setNotiPush] = useState(user?.notification_push ?? false);

  const handleNotiToggle = async (field: string, value: boolean) => {
    try {
      await updateProfile({ [field]: value });
    } catch {}
  };

  const themeLabel = user?.theme_preference === 'dark' ? 'Oscuro' : 'Claro';
  const paletteLabel = user?.color_palette && PALETTES[user?.color_palette]
    ? PALETTES[user.color_palette].label
    : 'Predeterminada';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
      </View>

      {/* Perfil */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Perfil</Text>
        </View>
        <VCard style={styles.sectionCard} padding={0}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/profile')}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Editar perfil</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{user?.name || 'Usuario'}</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
        </VCard>
      </View>

      {/* Apariencia */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Palette size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
        </View>
        <VCard style={styles.sectionCard} padding={0}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/profile')}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Tema</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{themeLabel}</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/profile')}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Paleta de colores</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{paletteLabel}</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
        </VCard>
      </View>

      {/* Notificaciones */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notificaciones</Text>
        </View>
        <VCard style={styles.sectionCard} padding={0}>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Recordatorios por email</Text>
            </View>
            <Switch
              value={notiEmail}
              onValueChange={(v) => { setNotiEmail(v); handleNotiToggle('notification_email_reminders', v); }}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Citas próximas</Text>
            </View>
            <Switch
              value={notiCitas}
              onValueChange={(v) => { setNotiCitas(v); handleNotiToggle('notification_upcoming_appointments', v); }}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Notificaciones push</Text>
            </View>
            <Switch
              value={notiPush}
              onValueChange={(v) => { setNotiPush(v); handleNotiToggle('notification_push', v); }}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </VCard>
      </View>

      {/* Seguridad */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Seguridad</Text>
        </View>
        <VCard style={styles.sectionCard} padding={0}>
          <TouchableOpacity
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push('/(drawer)/profile')}
          >
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Cambiar contraseña</Text>
            </View>
            <ChevronRight size={18} color={colors.textLight} />
          </TouchableOpacity>
        </VCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, paddingBottom: SPACING['4xl'] },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: TYPOGRAPHY.weights.bold },
  section: { marginBottom: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold },
  sectionCard: { padding: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: TYPOGRAPHY.sizes.md },
  rowSub: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.xs },
  divider: { height: 1, marginHorizontal: SPACING.xl },
});
