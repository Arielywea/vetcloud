import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Package, Syringe, ClipboardCheck, Square, SquareCheck, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotices } from '../../hooks/useNotices';
import { AutomationRule, ClinicNotice, api } from '../../services/directus';
import PageHeader from '../../components/ui/PageHeader';
import DisplayText from '../../components/ui/DisplayText';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VEmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/VToast';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

const KIND_ICON = { low_stock: Package, vaccines_overdue: Syringe, discharge_checklist: ClipboardCheck } as const;

export default function AvisosScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { notices, loading } = useNotices();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadRules = useCallback(async () => {
    try { setRules(await api.automationRules.list()); } catch (err: any) { toast.error(err?.message || 'No se pudieron cargar las reglas'); }
  }, [toast]);
  useEffect(() => { loadRules(); }, [loadRules]);

  const setStatus = async (n: ClinicNotice, status: 'done' | 'dismissed') => {
    setBusyId(n.id);
    try { await api.notices.update(n.id, { status }); }
    catch (err: any) { toast.error(err?.message || 'No se pudo actualizar el aviso'); }
    finally { setBusyId(null); }
  };

  const toggleStep = async (n: ClinicNotice, index: number) => {
    if (!n.checklist) return;
    const checklist = n.checklist.map((c, i) => (i === index ? { ...c, done: !c.done } : c));
    try { await api.notices.update(n.id, { checklist }); }
    catch (err: any) { toast.error(err?.message || 'No se pudo guardar el paso'); }
  };

  const toggleRule = async (rule: AutomationRule, enabled: boolean) => {
    setRules((rs) => rs.map((r) => (r.key === rule.key ? { ...r, enabled } : r)));
    try { await api.automationRules.setEnabled(rule.key, enabled); }
    catch (err: any) {
      setRules((rs) => rs.map((r) => (r.key === rule.key ? { ...r, enabled: !enabled } : r)));
      toast.error(err?.message || 'No se pudo cambiar la regla');
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.screen}>
      <PageHeader title="Avisos" subtitle="Lo que la clínica debe atender, detectado por reglas que puedes apagar" />

      {!loading && notices.length === 0 ? (
        <VEmptyState
          icon={<CheckCircle2 size={32} color={colors.textLight} />}
          title="Todo al día"
          description="Cuando una regla detecte algo que atender, aparecerá aquí."
          variant="data"
        />
      ) : notices.map((n) => {
        const Icon = KIND_ICON[n.kind] || ClipboardCheck;
        return (
          <VCard key={n.id} style={styles.notice}>
            <View style={styles.noticeHead}>
              <Icon size={20} color={colors.primary} />
              <View style={styles.noticeText}>
                <Text style={[styles.noticeTitle, { color: colors.text }]}>{n.title}</Text>
                {n.body ? <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>{n.body}</Text> : null}
              </View>
            </View>
            {n.checklist ? (
              <View style={styles.steps}>
                {n.checklist.map((c, i) => (
                  <TouchableOpacity key={i} style={styles.step} onPress={() => toggleStep(n, i)} accessibilityRole="checkbox" accessibilityState={{ checked: c.done }} aria-checked={c.done} accessibilityLabel={c.text}>
                    {c.done ? <SquareCheck size={20} color={colors.primary} /> : <Square size={20} color={colors.textLight} />}
                    <Text style={[styles.stepText, { color: c.done ? colors.textLight : colors.text }, c.done && styles.stepDone]}>{c.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            <View style={styles.actions}>
              {n.link ? <VButton size="sm" variant="secondary" onPress={() => router.push(n.link as any)}>Abrir</VButton> : null}
              <VButton size="sm" variant="secondary" loading={busyId === n.id} disabled={busyId === n.id} onPress={() => setStatus(n, 'done')}>Marcar como hecho</VButton>
              <VButton size="sm" variant="ghost" disabled={busyId === n.id} onPress={() => setStatus(n, 'dismissed')}>Descartar</VButton>
            </View>
          </VCard>
        );
      })}

      <View style={[styles.rules, { backgroundColor: colors.surface }]}>
        <DisplayText style={[styles.rulesTitle, { color: colors.text }]}>Reglas automáticas</DisplayText>
        <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>Cada regla revisa los datos de la clínica y deja un aviso aquí. Apagar una regla quita sus avisos.</Text>
        {rules.map((r) => (
          <View key={r.key} style={styles.rule}>
            <View style={styles.noticeText}>
              <Text style={[styles.noticeTitle, { color: colors.text }]}>{r.title}</Text>
              <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>{r.description}</Text>
            </View>
            <Switch
              value={r.enabled}
              onValueChange={(v) => toggleRule(r, v)}
              trackColor={{ false: colors.disabled, true: colors.primary }}
              thumbColor={colors.surface}
              accessibilityLabel={`Regla: ${r.title}`}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: SPACING.lg, paddingBottom: SPACING['3xl'], maxWidth: 860, width: '100%', alignSelf: 'center' },
  notice: { marginBottom: SPACING.md },
  noticeHead: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  noticeText: { flex: 1, minWidth: 0 },
  noticeTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  noticeBody: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 20, marginTop: 2 },
  steps: { marginTop: SPACING.md, gap: SPACING.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 36 },
  stepText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md },
  stepDone: { textDecorationLine: 'line-through' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  rules: { padding: SPACING.xl, marginTop: SPACING.xl, gap: SPACING.md },
  rulesTitle: { fontSize: 24, lineHeight: 28, fontWeight: '600' },
  rule: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, paddingTop: SPACING.sm },
});
