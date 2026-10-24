import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Phone, MessageCircle, Mail, Pencil, BellOff, EyeOff, CalendarClock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useRefreshOn } from '../../hooks/useDirectus';
import { api, Appointment, DirectusPet, Owner } from '../../services/directus';
import DisplayText from '../../components/ui/DisplayText';
import VButton from '../../components/ui/Button';
import Escutcheon from '../../components/icons/Escutcheon';
import { SkeletonCard } from '../../components/ui/Skeleton';
import OwnerFormSheet from '../../components/owners/OwnerFormSheet';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/VToast';
import { SPACING, RADIUS, TYPOGRAPHY, alpha } from '../../constants/tokens';
import { calculateAge } from '../../utils/age';
import { formatPhone, formatRut, speciesLabel, STATUS_LABEL, whatsappUrl } from '../../utils/identity';

const CONTACT_LABEL: Record<string, string> = { whatsapp: 'WhatsApp', telefono: 'Llamada', correo: 'Correo' };
const longDate = (d: string) => new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

export default function OwnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, onAccentText } = useTheme();
  const { isMobile } = useResponsive();
  const { confirm } = useConfirm();
  const toast = useToast();

  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const o = await api.owners.get(id);
      setOwner(o);
      setError(null);
      const petIds = new Set((o.pets || []).map((p) => p.id));
      if (petIds.size) {
        const upcoming: Appointment[] = await api.appointments.list({ start: new Date().toISOString() });
        setAppointments(upcoming.filter((a: any) => a.pet_id && petIds.has(a.pet_id) && !['cancelada', 'completada'].includes(a.status)).slice(0, 5));
      } else setAppointments([]);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el tutor');
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useRefreshOn(['owners', 'pets', 'appointments'], load);

  const pets = (owner?.pets || []) as DirectusPet[];
  const petName = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p.name])), [pets]);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><SkeletonCard style={{ margin: SPACING.lg, width: '90%' }} /></View>;
  if (!owner) return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textSecondary }}>{error || 'Tutor no encontrado'}</Text></View>;

  const anonymized = !!owner.anonymized_at;
  const revoked = !!owner.contact_revoked_at;
  const wa = whatsappUrl(owner.phone);

  const revoke = async () => {
    const ok = await confirm({
      title: 'Revocar contacto',
      message: `${owner.name} dejará de recibir recordatorios y avisos. Los pendientes se cancelan. Sus mascotas conservan la ficha.`,
      confirmLabel: 'Revocar contacto',
      destructive: true,
    });
    if (!ok) return;
    try { await api.owners.revokeContact(owner.id); toast.success('Contacto revocado'); load(true); }
    catch (e: any) { toast.error(e?.message || 'No se pudo revocar el contacto'); }
  };
  const anonymize = async () => {
    const ok = await confirm({
      title: 'Anonimizar datos del tutor',
      message: 'Se borran el nombre, RUT, teléfono, correo y dirección. Las fichas clínicas y recetas se conservan, como exige la ley. No se puede deshacer.',
      confirmLabel: 'Anonimizar',
      destructive: true,
    });
    if (!ok) return;
    try { await api.owners.anonymize(owner.id); toast.success('Datos anonimizados'); load(true); }
    catch (e: any) { toast.error(e?.message || 'No se pudo anonimizar'); }
  };

  const contactRows: Array<[string, string | null]> = [
    ['Teléfono', formatPhone(owner.phone) || null],
    ['Correo', owner.email],
    ['Dirección', [owner.address, owner.comuna].filter(Boolean).join(', ') || null],
    ['Prefiere', owner.preferred_contact ? CONTACT_LABEL[owner.preferred_contact] : null],
    ['Otro contacto', [owner.alt_contact_name, formatPhone(owner.alt_contact_phone)].filter(Boolean).join(' · ') || null],
    ['Comunicaciones', revoked ? `Revocadas el ${longDate(owner.contact_revoked_at!)}` : owner.consent_communications_at ? `Aceptadas el ${longDate(owner.consent_communications_at)}` : 'Sin consentimiento registrado'],
  ];

  const petsPanel = (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <DisplayText style={[styles.sectionTitle, styles.inlineTitle, { color: colors.text }]}>Mascotas</DisplayText>
        {!anonymized ? (
          <VButton onPress={() => router.push({ pathname: '/(drawer)/add-paciente', params: { owner_id: owner.id } } as any)} icon={<Plus size={16} color={onAccentText.default} />}>
            Agregar mascota
          </VButton>
        ) : null}
      </View>
      {pets.length ? pets.map((p) => {
        const alive = (p.status || 'alive') === 'alive';
        const age = calculateAge(p.birth_date);
        return (
          <Pressable key={p.id} onPress={() => router.push(`/pet/${p.id}` as any)} accessibilityRole="button" accessibilityLabel={`Abrir ficha de ${p.name}`}
            style={({ pressed, hovered }: any) => [styles.petRow, { backgroundColor: pressed || hovered ? colors.surfaceVariant : colors.surface }]}>
            <Escutcheon size={40} color={alive ? colors.primary : colors.textLight} initial={p.name.charAt(0).toUpperCase()} />
            <View style={styles.grow}>
              <DisplayText style={[styles.petName, { color: alive ? colors.text : colors.textSecondary }]} numberOfLines={1}>{p.name}</DisplayText>
              <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                {[speciesLabel(p), p.breed, age !== 'N/D' ? (p.birth_date_estimated ? `${age} aprox.` : age) : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {!alive ? (
              <View style={[styles.seal, { backgroundColor: alpha(colors.textSecondary, 0.12) }]}>
                <Text style={[styles.sealText, { color: colors.textSecondary }]}>{STATUS_LABEL[p.status]}</Text>
              </View>
            ) : p.last_visit && !isMobile ? <Text style={[styles.meta, { color: colors.textSecondary }]}>Última visita {new Date(p.last_visit).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</Text> : null}
          </Pressable>
        );
      }) : (
        <View style={[styles.emptyPets, { backgroundColor: colors.surface }]}>
          <Text style={[styles.body, { color: colors.textSecondary }]}>Este tutor aún no tiene mascotas registradas.</Text>
        </View>
      )}
    </View>
  );

  const appointmentsPanel = appointments.length ? (
    <View style={styles.section}>
      <DisplayText style={[styles.sectionTitle, { color: colors.text }]}>Próximas citas</DisplayText>
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        {appointments.map((a: any) => (
          <View key={a.id} style={styles.apptRow}>
            <CalendarClock size={18} color={colors.primary} />
            <Text style={[styles.body, { color: colors.text, flex: 1 }]}>
              {new Date(a.start_time).toLocaleString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}
              {' · '}{petName[a.pet_id] || a.patient_name}{a.appointment_type ? ` · ${a.appointment_type}` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  ) : null;

  const contactPanel = (
    <View style={styles.section}>
      <DisplayText style={[styles.sectionTitle, { color: colors.text }]}>Contacto</DisplayText>
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        {contactRows.map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text style={[styles.factLabel, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.body, { color: value ? colors.text : colors.textLight }]}>{value || 'Sin registrar'}</Text>
          </View>
        ))}
        {owner.notes ? (
          <View style={styles.fact}>
            <Text style={[styles.factLabel, { color: colors.textSecondary }]}>Notas</Text>
            <Text style={[styles.body, { color: colors.text }]}>{owner.notes}</Text>
          </View>
        ) : null}
      </View>
      {!anonymized ? (
        <View style={styles.dangerRow}>
          {!revoked ? <VButton variant="ghost" size="sm" color={colors.textSecondary} onPress={revoke} icon={<BellOff size={15} color={colors.textSecondary} />}>Revocar contacto</VButton> : null}
          <VButton variant="ghost" size="sm" color={colors.error} onPress={anonymize} icon={<EyeOff size={15} color={colors.error} />}>Anonimizar datos</VButton>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Escutcheon size={64} color={anonymized ? colors.textLight : colors.primary} initial={owner.name.charAt(0).toUpperCase()} />
        <View style={styles.grow}>
          <DisplayText style={[styles.title, { color: colors.text }]} numberOfLines={2}>{owner.name}</DisplayText>
          <Text style={[styles.facts, { color: colors.textSecondary }]}>
            {[owner.rut ? `RUT ${formatRut(owner.rut)}` : null, owner.comuna, `${pets.length} mascota${pets.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </View>

      {anonymized ? (
        <View style={[styles.note, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.body, { color: colors.text }]}>Datos personales anonimizados el {longDate(owner.anonymized_at!)}. Las fichas de sus mascotas se conservan.</Text>
        </View>
      ) : !owner.rut ? (
        <View style={[styles.note, { backgroundColor: alpha(colors.warning, 0.12) }]}>
          <Text style={[styles.body, { color: colors.text, flex: 1 }]}>Falta el RUT de este tutor. Complétalo para evitar duplicados y emitir documentos.</Text>
          <VButton size="sm" variant="filled" onPress={() => setEditing(true)}>Completar RUT</VButton>
        </View>
      ) : null}

      {!anonymized ? (
        <View style={styles.actions}>
          {owner.phone ? <VButton variant="secondary" onPress={() => Linking.openURL(`tel:${owner.phone}`)} icon={<Phone size={16} color={colors.primary} />}>Llamar</VButton> : null}
          {wa ? <VButton variant="secondary" onPress={() => Linking.openURL(wa)} icon={<MessageCircle size={16} color={colors.primary} />}>WhatsApp</VButton> : null}
          {owner.email ? <VButton variant="secondary" onPress={() => Linking.openURL(`mailto:${owner.email}`)} icon={<Mail size={16} color={colors.primary} />}>Correo</VButton> : null}
          <VButton variant="ghost" onPress={() => setEditing(true)} icon={<Pencil size={16} color={colors.primary} />}>Editar</VButton>
        </View>
      ) : null}

      <View style={[styles.columns, isMobile && styles.columnsMobile]}>
        <View style={styles.main}>
          {petsPanel}
          {appointmentsPanel}
        </View>
        <View style={isMobile ? undefined : styles.side}>{contactPanel}</View>
      </View>

      <OwnerFormSheet visible={editing} owner={owner} onClose={() => setEditing(false)}
        onSaved={(o) => { setEditing(false); setOwner({ ...owner, ...o, pets: owner.pets }); toast.success('Tutor actualizado'); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING['5xl'], maxWidth: 1180, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.lg },
  grow: { flex: 1, minWidth: 0 },
  title: { fontSize: 36, lineHeight: 40, fontWeight: '600' },
  facts: { fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.xs },
  note: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.lg },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING['2xl'] },
  columns: { flexDirection: 'row', gap: SPACING['2xl'], alignItems: 'flex-start' },
  columnsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  main: { flex: 1, minWidth: 0, alignSelf: 'stretch' },
  side: { width: 340 },
  section: { marginBottom: SPACING['2xl'] },
  sectionHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 26, lineHeight: 30, fontWeight: '600', marginBottom: SPACING.md },
  inlineTitle: { marginBottom: 0 },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xs, minHeight: 64 },
  petName: { fontSize: 22, lineHeight: 26, fontWeight: '600' },
  meta: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: 1 },
  seal: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  sealText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  emptyPets: { padding: SPACING.lg, borderRadius: RADIUS.md },
  panel: { padding: SPACING.lg, borderRadius: RADIUS.md, gap: SPACING.md },
  apptRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  fact: { gap: 2 },
  factLabel: { fontSize: TYPOGRAPHY.sizes.sm },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21 },
  dangerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.sm },
});
