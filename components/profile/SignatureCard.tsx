import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { PenLine, Trash2, Upload } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../ui/VToast';
import VCard from '../ui/Card';
import VInput from '../ui/Input';
import VButton from '../ui/Button';
import DisplayText from '../ui/DisplayText';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { formatRut } from '../../utils/identity';
import { fileToResizedPng, pickImageFile } from '../../utils/imageResize';
import { SignatureKind, apiGetSignature, apiPutSignature, apiDeleteSignature } from '../../services/auth';

// Professional data and the scanned signature and stamp that go on prescriptions, vaccine certificates
// and visit summaries. The images are private: they are only shown here and embedded in this account's PDFs.

const SLOTS: { kind: SignatureKind; label: string }[] = [
  { kind: 'signature', label: 'Firma' },
  { kind: 'stamp', label: 'Timbre' },
];

export default function SignatureCard() {
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();
  const [rut, setRut] = useState(user?.professional_rut ? formatRut(user.professional_rut) : '');
  const [title, setTitle] = useState(user?.professional_title || '');
  const [university, setUniversity] = useState(user?.professional_university || '');
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<Record<SignatureKind, string | null>>({ signature: null, stamp: null });
  const [busy, setBusy] = useState<SignatureKind | null>(null);

  useEffect(() => {
    let cancelled = false;
    SLOTS.forEach(({ kind }) => {
      apiGetSignature(kind)
        .then((img) => { if (!cancelled) setImages((prev) => ({ ...prev, [kind]: img })); })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, []);

  const saveData = async () => {
    setSaving(true);
    try {
      await updateProfile({
        professional_rut: rut.trim() || null,
        professional_title: title.trim() || null,
        professional_university: university.trim() || null,
      });
      toast.success('Datos profesionales guardados');
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  const upload = async (kind: SignatureKind) => {
    if (Platform.OS !== 'web') { toast.error('Por ahora sube la imagen desde el navegador'); return; }
    const file = await pickImageFile();
    if (!file) return;
    setBusy(kind);
    try {
      const dataUrl = await fileToResizedPng(file);
      await apiPutSignature(kind, dataUrl);
      setImages((prev) => ({ ...prev, [kind]: dataUrl }));
      toast.success(kind === 'signature' ? 'Firma guardada' : 'Timbre guardado');
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo guardar la imagen');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (kind: SignatureKind) => {
    setBusy(kind);
    try {
      await apiDeleteSignature(kind);
      setImages((prev) => ({ ...prev, [kind]: null }));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo borrar la imagen');
    } finally {
      setBusy(null);
    }
  };

  return (
    <VCard style={styles.card}>
      <View style={styles.header}>
        <PenLine size={20} color={colors.primary} />
        <DisplayText style={[styles.title, { color: colors.text }]}>Firma y datos profesionales</DisplayText>
      </View>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Se imprimen bajo la línea de firma de las recetas, los certificados de vacunas y los resúmenes de visita. Las imágenes son privadas: solo se usan al generar tus PDF.
      </Text>

      <VInput label="RUT del profesional" value={rut} onChangeText={setRut} placeholder="12.345.678-5" maxLength={20} />
      <VInput label="Título" value={title} onChangeText={setTitle} placeholder="Médico Veterinario" maxLength={120} />
      <VInput label="Universidad" value={university} onChangeText={setUniversity} placeholder="Universidad de Chile" maxLength={120} />
      <VButton variant="secondary" onPress={saveData} loading={saving} disabled={saving}>Guardar datos</VButton>

      <View style={styles.slots}>
        {SLOTS.map(({ kind, label }) => (
          <View key={kind} style={styles.slot}>
            <Text style={[styles.slotLabel, { color: colors.text }]}>{label}</Text>
            <View style={[styles.preview, { backgroundColor: colors.background }]}>
              {images[kind] ? (
                <Image source={{ uri: images[kind] as string }} style={styles.image} resizeMode="contain" accessibilityLabel={`Vista previa de ${label.toLowerCase()}`} />
              ) : (
                <Text style={{ color: colors.textSecondary, fontSize: TYPOGRAPHY.sizes.sm }}>Sin imagen</Text>
              )}
            </View>
            <View style={styles.actions}>
              <VButton variant="secondary" onPress={() => upload(kind)} loading={busy === kind} disabled={busy !== null} icon={<Upload size={16} color={colors.primary} />}>
                {images[kind] ? 'Cambiar' : 'Subir'}
              </VButton>
              {images[kind] ? (
                <VButton variant="secondary" onPress={() => remove(kind)} disabled={busy !== null} icon={<Trash2 size={16} color={colors.error} />}>
                  Borrar
                </VButton>
              ) : null}
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Usa PNG con fondo transparente si puedes. Una firma escaneada sirve para recetas simples, pero no es firma electrónica avanzada: los medicamentos controlados suelen exigir la receta original firmada a mano.
      </Text>
    </VCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: SPACING.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  title: { fontSize: 24, fontWeight: '600' },
  hint: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 20, marginBottom: SPACING.md },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.md },
  slot: { flexGrow: 1, flexBasis: 220, gap: SPACING.sm },
  slotLabel: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.bold },
  preview: { height: 110, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  actions: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
});
