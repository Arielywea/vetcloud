import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle2, LinkIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { DirectusPet, PublicAnamnesisInfo, publicAnamnesis } from '../../services/directus';
import RemoteAnamnesis, { RemoteForm, emptyRemote } from '../../components/consulta/RemoteAnamnesis';
import DisplayText from '../../components/ui/DisplayText';
import VButton from '../../components/ui/Button';
import Escutcheon from '../../components/icons/Escutcheon';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../constants/tokens';

// Public page: the tutor answers the remote anamnesis from a link, with no account.
// Answers wait for the vet to review them; nothing reaches the ficha by itself.

type Phase = 'loading' | 'form' | 'sent' | 'closed';

const draftKey = (token: string) => `vetcloud_anamnesis_draft:${token}`;

export default function PublicAnamnesisScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { colors, onChromeText } = useTheme();
  const { isMobile } = useResponsive();
  const [phase, setPhase] = useState<Phase>('loading');
  const [info, setInfo] = useState<PublicAnamnesisInfo | null>(null);
  const [closedMessage, setClosedMessage] = useState('');
  const [form, setForm] = useState<RemoteForm>(emptyRemote());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const data = await publicAnamnesis.get(token);
        if (!alive) return;
        setInfo(data);
        try {
          const saved = await AsyncStorage.getItem(draftKey(token));
          if (saved && alive) setForm({ ...emptyRemote(), ...JSON.parse(saved) });
        } catch { /* a draft that cannot be read is simply not restored */ }
        setPhase('form');
      } catch (err: any) {
        if (!alive) return;
        setClosedMessage(err?.message || 'No pudimos abrir este formulario.');
        setPhase('closed');
      }
    })();
    return () => { alive = false; };
  }, [token]);

  // The form is long: keep what was typed in case the page reloads or the phone locks
  const change = useCallback((next: RemoteForm) => {
    setForm(next);
    setError('');
    if (!token) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => { AsyncStorage.setItem(draftKey(token), JSON.stringify(next)).catch(() => {}); }, 600);
  }, [token]);

  const submit = async () => {
    if (!token || sending) return;
    setSending(true);
    setError('');
    try {
      await publicAnamnesis.submit(token, form);
      if (draftTimer.current) clearTimeout(draftTimer.current);
      AsyncStorage.removeItem(draftKey(token)).catch(() => {});
      setPhase('sent');
    } catch (err: any) {
      setError(err?.message || 'No pudimos enviar las respuestas. Inténtelo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  // The link is private: keep it out of search results and name the tab for what it is
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const previousTitle = document.title;
    document.title = 'Antecedentes del paciente';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.title = previousTitle; meta.remove(); };
  }, []);

  const clinic = info?.clinic_name || 'La clínica';
  const pet = info ? ({ ...info.pet } as unknown as DirectusPet) : null;

  if (phase === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (phase === 'closed' || phase === 'sent' || !pet) {
    const sent = phase === 'sent';
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.notice, { backgroundColor: colors.surface }]}>
          {sent ? <CheckCircle2 size={36} color={colors.success} /> : <LinkIcon size={32} color={colors.textLight} />}
          <DisplayText style={[styles.noticeTitle, { color: colors.text }]}>{sent ? 'Respuestas enviadas' : 'No se puede abrir el formulario'}</DisplayText>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            {sent ? `Gracias. ${clinic} revisará las respuestas antes de la consulta. Ya puede cerrar esta página.` : closedMessage}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.page, isMobile && styles.pageMobile]} keyboardShouldPersistTaps="handled">
      <View style={styles.column}>
        <View style={styles.head}>
          <Escutcheon size={48} color={colors.chrome} initial={(pet.name || '?').charAt(0).toUpperCase()} initialColor={onChromeText.default} filled />
          <View style={styles.headText}>
            <Text style={[styles.clinic, { color: colors.textSecondary }]}>{info?.clinic_name || 'Formulario de antecedentes'}</Text>
            <DisplayText style={[styles.title, { color: colors.text }]}>Antecedentes de {pet.name}</DisplayText>
          </View>
        </View>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Estas preguntas ayudan al veterinario a conocer mejor a {pet.name} antes de la consulta y ahorran tiempo ese día. Responda lo que sepa; lo que no recuerde puede dejarlo en blanco.
        </Text>

        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <RemoteAnamnesis pet={pet} value={form} onChange={change} vaccinations={[]} forTutor />
        </View>

        {error ? <Text style={[styles.error, { color: colors.error }]} accessibilityLiveRegion="polite">{error}</Text> : null}
        <View style={styles.actions}>
          <VButton onPress={submit} loading={sending} disabled={sending}>Enviar respuestas</VButton>
        </View>
        <Text style={[styles.privacy, { color: colors.textLight }]}>Sus respuestas solo las ve la clínica. Puede enviarlas una sola vez.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  page: { padding: SPACING['3xl'], alignItems: 'center' },
  pageMobile: { padding: SPACING.lg },
  column: { width: '100%', maxWidth: 760 },
  head: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg },
  headText: { flex: 1, minWidth: 0 },
  clinic: { fontSize: TYPOGRAPHY.sizes.sm },
  title: { fontSize: 32, lineHeight: 36, fontWeight: '600' },
  intro: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 22, marginBottom: SPACING.xl },
  panel: { padding: SPACING.xl, borderRadius: RADIUS.md },
  error: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.lg },
  actions: { marginTop: SPACING.xl, alignItems: 'flex-start' },
  privacy: { fontSize: TYPOGRAPHY.sizes.sm, marginTop: SPACING.md },
  notice: { width: '100%', maxWidth: 440, padding: SPACING['2xl'], borderRadius: RADIUS.md, alignItems: 'center', gap: SPACING.md },
  noticeTitle: { fontSize: 26, lineHeight: 30, textAlign: 'center' },
  noticeText: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 22, textAlign: 'center' },
});
