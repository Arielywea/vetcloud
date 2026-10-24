import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import FormSheet from '../ui/FormSheet';
import VInput from '../ui/Input';
import VButton from '../ui/Button';
import Segmented from '../ui/Segmented';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';
import { api, Owner, OwnerInput } from '../../services/directus';
import { canonRut, formatPhone, formatRut, validRut } from '../../utils/identity';

interface OwnerFormSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Edit this tutor; without it the sheet registers a new one */
  owner?: Owner | null;
  /** Prefill for a new tutor (e.g. the name typed in the agenda) */
  initialName?: string;
  onSaved: (owner: Owner) => void;
}

const CONTACT_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telefono', label: 'Llamada' },
  { value: 'correo', label: 'Correo' },
] as const;
type Contact = (typeof CONTACT_OPTIONS)[number]['value'];

export default function OwnerFormSheet({ visible, onClose, owner, initialName, onSaved }: OwnerFormSheetProps) {
  const { colors, onPrimaryText } = useTheme();
  const router = useRouter();
  const isEdit = !!owner;

  const [rut, setRut] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [comuna, setComuna] = useState('');
  const [contact, setContact] = useState<Contact | null>(null);
  const [altName, setAltName] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Live check: the RUT is valid and whether that tutor is already registered
  const [duplicate, setDuplicate] = useState<{ id: string; name: string } | null>(null);
  const checkSeq = useRef(0);

  useEffect(() => {
    if (!visible) return;
    setRut(owner?.rut ? formatRut(owner.rut) : '');
    setName(owner?.name || initialName || '');
    setPhone(owner?.phone ? formatPhone(owner.phone) : '');
    setEmail(owner?.email || '');
    setAddress(owner?.address || '');
    setComuna(owner?.comuna || '');
    setContact(owner?.preferred_contact || null);
    setAltName(owner?.alt_contact_name || '');
    setAltPhone(owner?.alt_contact_phone ? formatPhone(owner.alt_contact_phone) : '');
    setConsent(!!owner?.consent_communications_at);
    setNotes(owner?.notes || '');
    setError(null);
    setDuplicate(null);
  }, [visible, owner, initialName]);

  const rutComplete = (canonRut(rut) || '').length >= 9;
  const rutValid = validRut(rut);
  const rutError = rut.trim() && rutComplete && !rutValid ? 'El dígito verificador no corresponde a este RUT' : undefined;

  useEffect(() => {
    const canon = canonRut(rut);
    if (!visible || !canon || !validRut(canon) || canon === owner?.rut) { setDuplicate(null); return; }
    const seq = ++checkSeq.current;
    const t = setTimeout(async () => {
      try {
        const r = await api.owners.checkRut(canon);
        if (seq === checkSeq.current) setDuplicate(r.owner && r.owner.id !== owner?.id ? r.owner : null);
      } catch { /* the save still checks */ }
    }, 300);
    return () => clearTimeout(t);
  }, [rut, visible, owner]);

  const submit = async () => {
    if (!rutValid) { setError('Ingresa un RUT válido, con su dígito verificador (ej. 12.345.678-5)'); return; }
    if (!name.trim()) { setError('El nombre del tutor es obligatorio'); return; }
    if (duplicate) { setError(`Este RUT ya es de ${duplicate.name}. Abre su ficha en vez de crear otro tutor.`); return; }
    const data: OwnerInput = {
      rut: canonRut(rut),
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      comuna: comuna.trim() || null,
      preferred_contact: contact,
      alt_contact_name: altName.trim() || null,
      alt_contact_phone: altPhone.trim() || null,
      notes: notes.trim() || null,
    };
    // Only send consent when it changes, so editing does not restamp the original date
    if (!isEdit || consent !== !!owner?.consent_communications_at) data.consent_communications_at = consent;
    setSaving(true);
    setError(null);
    try {
      const saved = isEdit ? await api.owners.update(owner!.id, data) : await api.owners.create(data);
      onSaved(saved);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el tutor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSheet
      visible={visible}
      title={isEdit ? 'Editar tutor' : 'Nuevo tutor'}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={isEdit ? 'Guardar cambios' : 'Registrar tutor'}
      submitting={saving}
      error={error}
    >
      <VInput
        label="RUT"
        value={rut}
        onChangeText={(v) => { setRut(v); setError(null); }}
        onBlur={() => { if (validRut(rut)) setRut(formatRut(rut)); }}
        placeholder="12.345.678-5"
        autoCapitalize="characters"
        autoFocus={!isEdit}
        error={rutError}
        hint={rutValid ? 'RUT válido' : 'Con o sin puntos; el dígito verificador se comprueba'}
      />
      {duplicate ? (
        <View style={[styles.duplicate, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.duplicateText, { color: colors.text }]}>
            Este tutor ya está registrado: <Text style={{ fontWeight: TYPOGRAPHY.weights.semibold }}>{duplicate.name}</Text>
          </Text>
          <VButton size="sm" variant="filled" onPress={() => { onClose(); router.push(`/owner/${duplicate.id}` as any); }}>Abrir ficha</VButton>
        </View>
      ) : null}
      <VInput label="Nombre completo" value={name} onChangeText={setName} placeholder="Nombre y apellidos" autoCapitalize="words" />
      <View style={styles.pair}>
        <VInput containerStyle={styles.half} label="Teléfono" value={phone} onChangeText={setPhone} onBlur={() => phone.trim() && setPhone(formatPhone(phone))} placeholder="+56 9 1234 5678" keyboardType="phone-pad" />
        <VInput containerStyle={styles.half} label="Correo" value={email} onChangeText={setEmail} placeholder="nombre@correo.cl" keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={styles.pair}>
        <VInput containerStyle={styles.half} label="Dirección" value={address} onChangeText={setAddress} placeholder="Calle y número" />
        <VInput containerStyle={styles.half} label="Comuna" value={comuna} onChangeText={setComuna} placeholder="Comuna" autoCapitalize="words" />
      </View>

      <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Prefiere que lo contacten por</Text>
      <Segmented label="Contacto preferido" options={CONTACT_OPTIONS} value={contact} onChange={setContact} size="sm" style={styles.segment} />

      <Pressable
        onPress={() => setConsent(!consent)}
        style={styles.consent}
        accessibilityRole="checkbox"
        aria-checked={consent}
        accessibilityLabel="Acepta recibir recordatorios y avisos de la clínica"
      >
        <View style={[styles.box, { borderColor: consent ? colors.primary : colors.border, backgroundColor: consent ? colors.primary : 'transparent' }]}>
          {consent ? <Check size={14} color={onPrimaryText.default} strokeWidth={3} /> : null}
        </View>
        <Text style={[styles.consentText, { color: colors.text }]}>Acepta recibir recordatorios y avisos de la clínica</Text>
      </Pressable>

      <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>Otro contacto (opcional)</Text>
      <View style={styles.pair}>
        <VInput containerStyle={styles.half} value={altName} onChangeText={setAltName} placeholder="Nombre" accessibilityLabel="Nombre del otro contacto" autoCapitalize="words" />
        <VInput containerStyle={styles.half} value={altPhone} onChangeText={setAltPhone} onBlur={() => altPhone.trim() && setAltPhone(formatPhone(altPhone))} placeholder="Teléfono" accessibilityLabel="Teléfono del otro contacto" keyboardType="phone-pad" />
      </View>
      <VInput label="Notas" value={notes} onChangeText={setNotes} placeholder="Horario para llamar, quién retira a la mascota…" multiline />
    </FormSheet>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', flexWrap: 'wrap', columnGap: SPACING.md },
  half: { flexGrow: 1, flexBasis: 200 },
  duplicate: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm, padding: SPACING.md, borderRadius: RADIUS.md, marginTop: -SPACING.sm, marginBottom: SPACING.lg },
  duplicateText: { fontSize: TYPOGRAPHY.sizes.md, flexShrink: 1 },
  groupLabel: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.sm },
  segment: { marginBottom: SPACING.lg },
  consent: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 40, marginBottom: SPACING.lg },
  box: { width: 20, height: 20, borderRadius: RADIUS.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  consentText: { fontSize: TYPOGRAPHY.sizes.md, flexShrink: 1 },
});
