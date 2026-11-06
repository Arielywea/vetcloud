import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Share, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { Send, Copy, MessageCircle, Download, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../ui/VToast';
import { useConfirm } from '../ui/ConfirmDialog';
import VButton from '../ui/Button';
import { AnamnesisForm, anamnesisLink, api } from '../../services/directus';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../constants/tokens';

// Lets the vet send the remote anamnesis to the tutor as a link (answered before the visit),
// follow its status, and bring the answers into the consultation for review.

const day = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });

async function copyText(text: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    await Share.share({ message: text });
    return true;
  } catch {
    return false;
  }
}

interface Props {
  petId: string;
  petName: string;
  /** Called with the tutor's answers when the vet chooses to import them (the consultation shows them for review) */
  onImport?: (answers: Record<string, any>) => void;
}

export default function TutorAnamnesisLink({ petId, petName, onImport }: Props) {
  const { colors, onAccentText } = useTheme();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [form, setForm] = useState<AnamnesisForm | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const rows = await api.anamnesisForms.forPet(petId);
      setForm(rows[0] || null);
    } catch {
      setForm(null);
    } finally {
      setLoaded(true);
    }
  }, [petId]);

  useEffect(() => { load(); }, [load]);

  const expired = !!form && form.status === 'pendiente' && new Date(form.expires_at) < new Date();
  const link = form ? anamnesisLink(form.token) : '';

  const create = async () => {
    setBusy(true);
    try {
      const created = await api.anamnesisForms.create(petId);
      setForm(created);
      toast.success('Formulario creado: copia el enlace y envíaselo al tutor');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo crear el formulario');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (await copyText(link)) toast.success('Enlace copiado');
    else toast.error('No se pudo copiar el enlace');
  };

  const whatsapp = () => {
    const text = `Hola, para la consulta de ${petName} necesitamos conocer sus antecedentes. Puede responder este formulario cuando le acomode: ${link}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (Platform.OS === 'web') window.open(url, '_blank', 'noopener');
    else Linking.openURL(url).catch(() => toast.error('No se pudo abrir WhatsApp'));
  };

  const cancel = async () => {
    if (!form) return;
    if (!await confirm({ title: 'Cancelar el enlace', message: 'El tutor ya no podrá responder con este enlace.', confirmLabel: 'Cancelar enlace', destructive: true })) return;
    try {
      await api.anamnesisForms.cancel(form.id);
      setForm(null);
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo cancelar el enlace');
    }
  };

  const importAnswers = async () => {
    if (!form?.answers || !onImport) return;
    onImport(form.answers);
    try {
      await api.anamnesisForms.markImported(form.id);
      setForm({ ...form, status: 'importado', imported_at: new Date().toISOString() });
    } catch { /* the answers are already in the form; the status is only a label */ }
    toast.success('Respuestas del tutor cargadas: revísalas antes de guardar');
  };

  if (!loaded) return null;

  const status = !form || form.status === 'cancelado' || expired ? 'none' : form.status;
  const text = {
    none: expired ? 'El enlace anterior venció.' : 'Envía los antecedentes al tutor como formulario y llega con las respuestas hechas.',
    pendiente: form ? `Formulario enviado. Esperando al tutor; el enlace vence el ${day(form.expires_at)}.` : '',
    respondido: form?.submitted_at ? `El tutor respondió el ${day(form.submitted_at)}. Revisa las respuestas e impórtalas.` : '',
    importado: form?.imported_at ? `Respuestas del tutor importadas el ${day(form.imported_at)}.` : '',
  }[status];

  return (
    <View style={[styles.box, { backgroundColor: colors.surfaceVariant }]}>
      <Text style={[styles.text, { color: colors.text }]} accessibilityLiveRegion="polite">{text}</Text>
      <View style={styles.actions}>
        {status === 'respondido' && onImport ? (
          <VButton size="sm" icon={<Download size={14} color={onAccentText.default} />} onPress={importAnswers}>Importar respuestas</VButton>
        ) : null}
        {status === 'pendiente' ? (
          <>
            <VButton size="sm" variant="secondary" icon={<Copy size={14} color={colors.primary} />} onPress={copy}>Copiar enlace</VButton>
            <VButton size="sm" variant="secondary" icon={<MessageCircle size={14} color={colors.primary} />} onPress={whatsapp}>WhatsApp</VButton>
            <VButton size="sm" variant="ghost" icon={<X size={14} color={colors.textSecondary} />} onPress={cancel}>Cancelar</VButton>
          </>
        ) : null}
        {status === 'none' || status === 'importado' || status === 'respondido' ? (
          <VButton size="sm" variant={status === 'none' ? 'primary' : 'ghost'} icon={<Send size={14} color={status === 'none' ? onAccentText.default : colors.textSecondary} />} loading={busy} disabled={busy} onPress={create}>
            {status === 'none' ? 'Enviar formulario al tutor' : 'Nuevo formulario'}
          </VButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg, gap: SPACING.sm },
  text: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
});
