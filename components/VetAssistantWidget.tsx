import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable, TextInput } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { Bot, X, Calendar, Syringe, HelpCircle, Send } from 'lucide-react-native';
import { useAssistant } from '../hooks/useDirectus';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../constants/tokens';

export default function VetAssistantWidget() {
  const { messages, loading, sendMessage, clearMessages } = useAssistant();
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { colors } = useTheme();

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

  const handleAction = (action: string, payload?: any) => {
    switch (action) {
      case 'view_history': router.push(`/pet/${payload.petId}`); break;
      case 'view_disease': router.push(`/disease/${payload.diseaseId}`); break;
      case 'create_rx': router.push(`/pet/${payload.petId}`); break;
      case 'create_appointment': router.push('/(drawer)/agenda'); break;
      case 'create_reminder': router.push('/(drawer)/reminders'); break;
      case 'create_note': router.push('/(drawer)/notes'); break;
      case 'quick_query': sendMessage(payload.query); break;
      case 'list_drugs': sendMessage('dosis amoxicilina'); break;
    }
  };

  return (
    <>
      <Pressable style={[styles.fab, { backgroundColor: colors.accent, ...SHADOWS.lg }]} onPress={() => setVisible(true)}>
        <Bot size={28} color="#fff" />
      </Pressable>

      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={[styles.panel, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Bot size={22} color={colors.accent} />
            <Text style={[styles.headerTitle, { color: colors.surface }]}>Asistente VetCloud</Text>
            <TouchableOpacity onPress={() => setVisible(false)}><X size={20} color="#fff" /></TouchableOpacity>
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
                  <Text style={{ fontSize: 14, lineHeight: 21, color: msg.sender === 'user' ? '#fff' : colors.text }}>{msg.text}</Text>
                  {msg.actions && msg.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      {msg.actions.map((act: any, aIdx: number) => (
                        <TouchableOpacity key={aIdx} style={[styles.actionBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }]} onPress={() => handleAction(act.action, act.payload)}>
                          <Text style={[styles.actionBtnText, { color: colors.accent }]}>{act.label}</Text>
                        </TouchableOpacity>
                      ))}
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
            <TouchableOpacity onPress={handleSend} disabled={!inputText.trim() || loading}>
              <Send size={20} color={inputText.trim() ? colors.accent : colors.textLight} />
            </TouchableOpacity>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', left: 16, bottom: 16, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  panel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 420, maxWidth: '90%', borderTopRightRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden', margin: 0, padding: 0 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, gap: 10 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 14, paddingBottom: 8 },
  welcomeContainer: { alignItems: 'center', paddingVertical: 40 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', marginTop: 12 },
  welcomeDesc: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  quickActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  quickBtn: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, borderRadius: RADIUS.lg, borderWidth: 1, minWidth: 90 },
  quickBtnText: { fontSize: 12, fontWeight: '600', marginTop: 6 },
  messageBubble: { flexDirection: 'row', marginBottom: 12, maxWidth: '100%' },
  userBubble: { justifyContent: 'flex-end' },
  assistantBubble: { justifyContent: 'flex-start' },
  messageBox: { borderRadius: 14, padding: 12, maxWidth: '88%' },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  actionBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },
  inputRow: { padding: 10, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.sm, fontSize: 14 },
});
