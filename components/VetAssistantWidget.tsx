import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { Bot, X, Calendar, Syringe, HelpCircle, Send } from 'lucide-react-native';
import { useAssistant } from '../hooks/useDirectus';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './ui/VToast';
import { api } from '../services/directus';
import { SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/tokens';

export default function VetAssistantWidget() {
  const { messages, loading, sendMessage } = useAssistant();
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  // Drafts already saved (message index), so a second tap doesn't duplicate the prescription
  const [savedRx, setSavedRx] = useState<Record<number, 'saving' | 'saved'>>({});
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const { colors, onPrimaryText, onAccentText } = useTheme();

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  const saveRx = async (msgIdx: number, payload: { petId?: string; petName?: string; body?: string }) => {
    if (savedRx[msgIdx]) return;
    if (!payload?.petId || !payload.body) {
      toast.error('Indica el paciente: "receta para Rocky: …"');
      return;
    }
    setSavedRx((s) => ({ ...s, [msgIdx]: 'saving' }));
    try {
      await api.prescriptions.create({
        pet_id: payload.petId,
        prescription_body: payload.body,
        veterinarian_name: user?.veterinarian_name || null,
      });
      setSavedRx((s) => ({ ...s, [msgIdx]: 'saved' }));
      toast.success(`Receta guardada en la ficha de ${payload.petName || 'el paciente'}`);
    } catch (e: any) {
      setSavedRx((s) => { const { [msgIdx]: _, ...rest } = s; return rest; });
      toast.error(e?.message || 'No se pudo guardar la receta');
    }
  };

  const handleAction = (action: string, payload: any, msgIdx: number) => {
    switch (action) {
      case 'save_rx': saveRx(msgIdx, payload); break;
      case 'view_history': setVisible(false); router.push(`/pet/${payload.petId}`); break;
      case 'view_disease': setVisible(false); router.push(`/disease/${payload.diseaseId}`); break;
      case 'create_rx': setVisible(false); router.push(`/pet/${payload.petId}`); break;
      case 'create_appointment': setVisible(false); router.push('/(drawer)/agenda'); break;
      case 'create_reminder': setVisible(false); router.push('/(drawer)/reminders'); break;
      case 'create_note': setVisible(false); router.push('/(drawer)/notes'); break;
      case 'quick_query': sendMessage(payload.query); break;
      case 'list_drugs': sendMessage('dosis amoxicilina'); break;
    }
  };

  return (
    <>
      <Pressable style={[styles.fab, { backgroundColor: colors.accent, ...SHADOWS.lg }]} onPress={() => setVisible(true)} accessibilityRole="button" accessibilityLabel="Abrir asistente">
        <Bot size={28} color={onAccentText.default} />
      </Pressable>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={[styles.panel, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Bot size={22} color={colors.accent} />
            <Text style={[styles.headerTitle, { color: onPrimaryText.default }]}>Asistente VetCloud</Text>
            <TouchableOpacity onPress={() => setVisible(false)} accessibilityRole="button" accessibilityLabel="Cerrar asistente" hitSlop={10}><X size={20} color={onPrimaryText.default} /></TouchableOpacity>
          </View>

          <ScrollView ref={scrollRef} style={[styles.messagesContainer, { backgroundColor: colors.background }]} contentContainerStyle={styles.messagesContent}>
            {messages.length === 0 && (
              <View style={styles.welcomeContainer}>
                <Bot size={48} color={colors.accent} />
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>¡Hola Doctor!</Text>
                <Text style={[styles.welcomeDesc, { color: colors.textSecondary }]}>Escriba su consulta en lenguaje natural.</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]} onPress={() => sendMessage('qué tengo hoy')}>
                    <Calendar size={18} color={colors.accent} />
                    <Text style={[styles.quickBtnText, { color: colors.accent }]}>Mi día</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]} onPress={() => sendMessage('vacunas pendientes')}>
                    <Syringe size={18} color={colors.accent} />
                    <Text style={[styles.quickBtnText, { color: colors.accent }]}>Vacunas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.quickBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]} onPress={() => sendMessage('ayuda')}>
                    <HelpCircle size={18} color={colors.accent} />
                    <Text style={[styles.quickBtnText, { color: colors.accent }]}>Ayuda</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {messages.map((msg, idx) => (
              <View key={idx} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.assistantBubble]}>
                {msg.sender === 'assistant' && <Bot size={16} color={colors.accent} style={{ marginRight: 6, marginTop: 2 }} />}
                <View style={[styles.messageBox, msg.sender === 'user' ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 }]}>
                  <Text style={{ fontSize: TYPOGRAPHY.sizes.md, lineHeight: 21, color: msg.sender === 'user' ? onPrimaryText.default : colors.text }}>{msg.text}</Text>
                  {msg.actions && msg.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      {msg.actions.map((act: any, aIdx: number) => {
                        const rxState = act.action === 'save_rx' ? savedRx[idx] : undefined;
                        const label = rxState === 'saved' ? 'Receta guardada' : rxState === 'saving' ? 'Guardando…' : act.label;
                        return (
                          <TouchableOpacity
                            key={aIdx}
                            disabled={!!rxState}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !!rxState }}
                            style={[styles.actionBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30', opacity: rxState ? 0.6 : 1 }]}
                            onPress={() => handleAction(act.action, act.payload, idx)}
                          >
                            <Text style={[styles.actionBtnText, { color: colors.text }]}>{label}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            ))}

            {loading && (
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <Bot size={16} color={colors.accent} style={{ marginRight: 6 }} />
                <View style={[styles.messageBox, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 }]}>
                  <Text style={{ color: colors.textLight, fontStyle: 'italic' }}>Pensando...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escriba su consulta..."
              placeholderTextColor={colors.textLight}
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} disabled={!inputText.trim() || loading} accessibilityRole="button" accessibilityLabel="Enviar consulta" hitSlop={10}>
              <Send size={20} color={inputText.trim() ? colors.accent : colors.textLight} />
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', left: SPACING.lg, bottom: SPACING.lg, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 420, maxWidth: '90%', borderTopRightRadius: RADIUS.xl, borderBottomRightRadius: RADIUS.xl, overflow: 'hidden', margin: 0, padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, paddingTop: SPACING.xl, gap: SPACING.sm + 2 },
  headerTitle: { flex: 1, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: SPACING.md + 2, paddingBottom: SPACING.sm + 2 },
  welcomeContainer: { alignItems: 'center', paddingVertical: SPACING['4xl'] + SPACING.xl },
  welcomeTitle: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold, marginTop: SPACING.sm + 4 },
  welcomeDesc: { fontSize: TYPOGRAPHY.sizes.md, marginTop: SPACING.sm - 2, textAlign: 'center' },
  quickActions: { flexDirection: 'row', gap: SPACING.sm + 4, marginTop: SPACING['2xl'] + SPACING.sm },
  quickBtn: { alignItems: 'center', paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.xl - SPACING.xs, borderRadius: RADIUS.lg, borderWidth: 1, minWidth: 90 },
  quickBtnText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold, marginTop: SPACING.sm - 2 },
  messageBubble: { flexDirection: 'row', marginBottom: SPACING.sm + 4, maxWidth: '100%' },
  userBubble: { justifyContent: 'flex-end' },
  assistantBubble: { justifyContent: 'flex-start' },
  messageBox: { borderRadius: RADIUS.md + 2, padding: SPACING.sm + 4, maxWidth: '88%' },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm - 2, marginTop: SPACING.sm + 2 },
  actionBtn: { paddingVertical: SPACING.sm - 1, paddingHorizontal: SPACING.sm + 4, borderRadius: RADIUS.full, borderWidth: 1 },
  actionBtnText: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: TYPOGRAPHY.weights.semibold },
  inputRow: { padding: SPACING.sm + 2, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  input: { flex: 1, borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: TYPOGRAPHY.sizes.md },
});
