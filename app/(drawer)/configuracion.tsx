import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Text } from 'react-native-paper';
import { User, Building2, Palette, Bell, Shield, ChevronRight, Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import VCard from '../../components/ui/Card';

export default function ConfiguracionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();

  const sections = [
    {
      title: 'Perfil',
      icon: <User size={20} color={colors.primary} />,
      items: [
        { label: 'Editar perfil', sub: user?.name || 'Usuario', route: '/(drawer)/profile' },
        { label: 'Foto de perfil', sub: 'Cambiar foto', icon: <Camera size={16} color={colors.textSecondary} /> },
      ],
    },
    {
      title: 'Clínica',
      icon: <Building2 size={20} color={colors.primary} />,
      items: [
        { label: 'Nombre', sub: 'VetCloud Vet' },
        { label: 'Dirección', sub: 'Av. Principal 1234' },
        { label: 'Teléfono', sub: '+56 9 1234 5678' },
      ],
    },
    {
      title: 'Apariencia',
      icon: <Palette size={20} color={colors.primary} />,
      items: [
        { label: 'Tema', sub: 'Claro' },
        { label: 'Paleta de colores', sub: 'Personalizar colores' },
      ],
    },
    {
      title: 'Notificaciones',
      icon: <Bell size={20} color={colors.primary} />,
      items: [
        { label: 'Recordatorios por email', toggle: true, value: true },
        { label: 'Citas próximas', toggle: true, value: true },
        { label: 'Notificaciones push', toggle: true, value: false },
      ],
    },
    {
      title: 'Seguridad',
      icon: <Shield size={20} color={colors.primary} />,
      items: [
        { label: 'Cambiar contraseña', sub: 'Último cambio hace 30 días' },
        { label: 'Autenticación de dos factores', sub: 'Deshabilitada' },
      ],
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Configuración</Text>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <View style={styles.sectionHeader}>
            {section.icon}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
          </View>
          <VCard style={styles.sectionCard} padding={0}>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.row,
                  idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
                activeOpacity={item.route ? 0.7 : 1}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={styles.rowContent}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                  {item.sub && (
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                  )}
                </View>
                {item.toggle !== undefined ? (
                  <Switch
                    value={item.value}
                    trackColor={{ false: colors.disabled, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                ) : item.icon ? (
                  item.icon
                ) : item.route ? (
                  <ChevronRight size={18} color={colors.textLight} />
                ) : null}
              </TouchableOpacity>
            ))}
          </VCard>
        </View>
      ))}
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
});
