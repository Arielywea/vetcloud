import React from 'react';
import { View, StyleSheet, Image, Pressable, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { AlertTriangle, Phone, MessageCircle, Pencil } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { DirectusPet, PetAlert } from '../../services/directus';
import DisplayText from '../ui/DisplayText';
import VButton from '../ui/Button';
import IconButton from '../ui/IconButton';
import Escutcheon from '../icons/Escutcheon';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { calculateAge } from '../../utils/age';
import { formatPhone, speciesLabel, STATUS_LABEL, whatsappUrl } from '../../utils/identity';
import { formatDay } from '../../utils/vaccinePlan';

interface ChartHeaderProps {
  pet: DirectusPet;
  onEdit: () => void;
  onChangeStatus: () => void;
}

const REPRO: Record<string, string> = { intacto: 'entero', castrado: 'castrado', esterilizado: 'esterilizada', gestante: 'gestante' };
const ALERT_PREFIX: Record<PetAlert['type'], string> = { allergy: 'Alergia', bites: '', chronic: 'Crónico', other: '' };

/** Alerts stored on the pet; older pets only have the allergy list */
export function petAlerts(pet: DirectusPet): PetAlert[] {
  if (Array.isArray(pet.alerts) && pet.alerts.length) return pet.alerts;
  return (pet.allergies || []).map((text) => ({ type: 'allergy' as const, text }));
}

// Who the patient is and what must not be missed, in one band: identity, tutor, status and alerts.
export default function ChartHeader({ pet, onEdit, onChangeStatus }: ChartHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const alive = (pet.status || 'alive') === 'alive';
  const age = calculateAge(pet.birth_date);
  const tutor = pet.owner_name || pet.tutor_name;
  const phone = pet.owner_phone || pet.phone;
  const wa = whatsappUrl(phone);
  const alerts = petAlerts(pet);
  const sex = pet.sex ? `${pet.sex === 'macho' ? 'Macho' : 'Hembra'}${pet.reproductive_status && REPRO[pet.reproductive_status] ? ` ${pet.sex === 'hembra' && pet.reproductive_status === 'intacto' ? 'entera' : REPRO[pet.reproductive_status]}` : ''}` : null;
  const facts = [speciesLabel(pet), pet.breed, sex, age !== 'N/D' ? (pet.birth_date_estimated ? `${age} (aprox.)` : age) : null].filter(Boolean).join(' · ');

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface }]}>
      <View style={[styles.row, isMobile && styles.rowMobile]}>
        {pet.photo ? (
          <Image source={{ uri: pet.photo }} style={[styles.photo, { backgroundColor: colors.surfaceVariant }]} accessibilityLabel={`Foto de ${pet.name}`} />
        ) : (
          <Escutcheon size={72} color={alive ? colors.primary : colors.textLight} initial={pet.name.charAt(0).toUpperCase()} />
        )}
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <DisplayText style={[styles.name, { color: alive ? colors.text : colors.textSecondary }]} numberOfLines={2}>{pet.name}</DisplayText>
            {!alive ? (
              <Pressable onPress={onChangeStatus} accessibilityRole="button" accessibilityLabel={`Estado: ${STATUS_LABEL[pet.status]}. Cambiar`}
                style={[styles.seal, { backgroundColor: alpha(colors.textSecondary, 0.14) }]}>
                <Text style={[styles.sealText, { color: colors.textSecondary }]}>
                  {STATUS_LABEL[pet.status]}{pet.status === 'deceased' && pet.deceased_at ? ` el ${formatDay(pet.deceased_at)}` : ''}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.facts, { color: colors.textSecondary }]}>{facts}</Text>
          {pet.id_number || pet.registry_number ? (
            <Text style={[styles.small, { color: colors.textSecondary }]}>
              {[pet.id_number ? `Microchip ${pet.id_number}` : null, pet.registry_number ? `Registro ${pet.registry_number}` : null].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
        <View style={[styles.tutor, isMobile && styles.tutorMobile]}>
          <Text style={[styles.small, { color: colors.textSecondary }]}>Tutor</Text>
          {tutor ? (
            <Pressable onPress={() => pet.owner_id && router.push(`/owner/${pet.owner_id}` as any)} disabled={!pet.owner_id} accessibilityRole="link" accessibilityLabel={`Abrir ficha del tutor ${tutor}`}>
              {({ hovered }: any) => <Text style={[styles.tutorName, { color: colors.primary, textDecorationLine: hovered ? 'underline' : 'none' }]} numberOfLines={1}>{tutor}</Text>}
            </Pressable>
          ) : <Text style={[styles.tutorName, { color: colors.textLight }]}>Sin tutor</Text>}
          {phone ? <Text style={[styles.small, { color: colors.textSecondary }]}>{formatPhone(phone)}</Text> : null}
          <View style={styles.contact}>
            {phone ? <IconButton icon={<Phone size={18} color={colors.primary} />} onPress={() => { Linking.openURL(`tel:${phone}`); }} label={`Llamar a ${tutor || 'el tutor'}`} /> : null}
            {wa ? <IconButton icon={<MessageCircle size={18} color={colors.primary} />} onPress={() => { Linking.openURL(wa); }} label={`WhatsApp a ${tutor || 'el tutor'}`} /> : null}
            <VButton size="sm" variant="ghost" onPress={onEdit} icon={<Pencil size={15} color={colors.primary} />}>Editar</VButton>
            {alive ? <VButton size="sm" variant="ghost" color={colors.textSecondary} onPress={onChangeStatus}>Estado</VButton> : null}
          </View>
        </View>
      </View>
      {alerts.length ? (
        <View style={[styles.alerts, { backgroundColor: alpha(colors.error, 0.09) }]} accessibilityRole="alert">
          <AlertTriangle size={18} color={colors.error} />
          <View style={styles.alertList}>
            {alerts.map((a, i) => (
              <Text key={i} style={[styles.alert, { color: colors.text }]}>
                {ALERT_PREFIX[a.type] ? <Text style={{ color: colors.error, fontWeight: TYPOGRAPHY.weights.semibold }}>{ALERT_PREFIX[a.type]}: </Text> : null}
                <Text style={a.type === 'bites' ? { color: colors.error, fontWeight: TYPOGRAPHY.weights.semibold } : undefined}>{a.text}</Text>
              </Text>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: SPACING.xl, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl },
  rowMobile: { flexWrap: 'wrap', gap: SPACING.md },
  photo: { width: 88, height: 88, borderRadius: RADIUS.md },
  identity: { flex: 1, minWidth: 200 },
  nameRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: SPACING.md, rowGap: SPACING.xs },
  name: { fontSize: 40, lineHeight: 44, fontWeight: '600' },
  seal: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  sealText: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold },
  facts: { fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.xs },
  small: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 2 },
  tutor: { minWidth: 220, maxWidth: 300 },
  tutorMobile: { minWidth: 0, maxWidth: undefined, width: '100%' },
  tutorName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.semibold },
  contact: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm, marginLeft: -SPACING.xs },
  alerts: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, marginTop: SPACING.lg },
  alertList: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.lg, rowGap: SPACING.xs },
  alert: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 20 },
});
