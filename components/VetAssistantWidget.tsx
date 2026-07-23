import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Text, TextInput, IconButton, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAssistant } from '../hooks/useDirectus';
import { useRouter } from 'expo-router';

export default function VetAssistantWidget() {
  const { messages, loading, sendMessage, clearMessages } = useAssistant();
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

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
      case 'view_history':
        router.push(`/pet/${payload.petId}`);
        break;
      case 'view_disease':
        router.push(`/disease/${payload.diseaseId}`);
        break;
      case 'create_rx':
        router.push(`/pet/${payload.petId}`);
        break;
      case 'create_appointment':
        router.push('/(drawer)/agenda');
        break;
      case 'create_reminder':
        router.push('/(drawer)/reminders');
        break;
      case 'create_note':
        router.push('/(drawer)/notes');
        break;
      case 'quick_query':
        sendMessage(payload.query);
        break;
      case 'list_drugs':
        sendMessage('dosis amoxicilina');
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* FAB — bottom left */}
      <Pressable style={styles.fab} onPress={() => setVisible(true)}>
        <MaterialCommunityIcons name="robot" size={28} color="#fff" />
      </Pressable>

      {/* Panel lateral */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.panel}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="robot" size={22} color="#FF8F00" />
            <Text style={styles.headerTitle}>Asistente VetCloud</Text>
            <IconButton icon="close" size={20} iconColor="#fff" onPress={() => setVisible(false)} style={{ margin: 0 }} />
          </View>

          {/* Messages */}
          <ScrollView ref={scrollRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
            {messages.length === 0 && (
              <View style={styles.welcomeContainer}>
                <MaterialCommunityIcons name="robot-happy" size={48} color="#FF8F00" />
                <Text style={styles.welcomeTitle}>¡Hola Doctor!</Text>
                <Text style={styles.welcomeDesc}>Escriba su consulta en lenguaje natural.</Text>
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickBtn} onPress={() => sendMessage('qué tengo hoy')}>
                    <MaterialCommunityIcons name="calendar-today" size={18} color="#FF8F00" />
                    <Text style={styles.quickBtnText}>Mi día</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickBtn} onPress={() => sendMessage('vacunas pendientes')}>
                    <MaterialCommunityIcons name="needle" size={18} color="#FF8F00" />
                    <Text style={styles.quickBtnText}>Vacunas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickBtn} onPress={() => sendMessage('ayuda')}>
                    <MaterialCommunityIcons name="help-circle" size={18} color="#FF8F00" />
                    <Text style={styles.quickBtnText}>Ayuda</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {messages.map((msg, idx) => (
              <View key={idx} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.assistantBubble]}>
                {msg.sender === 'assistant' && (
                  <MaterialCommunityIcons name="robot" size={16} color="#FF8F00" style={{ marginRight: 6, marginTop: 2 }} />
                )}
                <View style={[styles.messageBox, msg.sender === 'user' ? styles.userBox : styles.assistantBox]}>
                  <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.assistantText]}>
                    {msg.text}
                  </Text>
                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <View style={styles.actionsContainer}>
                      {msg.actions.map((act: any, aIdx: number) => (
                        <TouchableOpacity key={aIdx} style={styles.actionBtn} onPress={() => handleAction(act.action, act.payload)}>
                          <Text style={styles.actionBtnText}>{act.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}

            {loading && (
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <MaterialCommunityIcons name="robot" size={16} color="#FF8F00" style={{ marginRight: 6 }} />
                <View style={[styles.messageBox, styles.assistantBox]}>
                  <Text style={styles.loadingDots}>Pensando...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escriba su consulta..."
              mode="outlined"
              dense
              style={styles.input}
              onSubmitEditing={handleSend}
              right={
                <TextInput.Icon
                  icon="send"
                  onPress={handleSend}
                  disabled={!inputText.trim() || loading}
                  color="#FF8F00"
                />
              }
            />
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8F00',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 420,
    maxWidth: '90%',
    backgroundColor: '#fff',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    margin: 0,
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#1a1a2e',
    gap: 10,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700' },
  messagesContainer: { flex: 1, backgroundColor: '#f8f8f8' },
  messagesContent: { padding: 14, paddingBottom: 8 },
  welcomeContainer: { alignItems: 'center', paddingVertical: 40 },
  welcomeTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 12 },
  welcomeDesc: { fontSize: 14, color: '#666', marginTop: 6, textAlign: 'center' },
  quickActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  quickBtn: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    minWidth: 90,
  },
  quickBtnText: { fontSize: 12, color: '#FF8F00', fontWeight: '600', marginTop: 6 },
  messageBubble: { flexDirection: 'row', marginBottom: 12, maxWidth: '100%' },
  userBubble: { justifyContent: 'flex-end' },
  assistantBubble: { justifyContent: 'flex-start' },
  messageBox: { borderRadius: 14, padding: 12, maxWidth: '88%' },
  userBox: { backgroundColor: '#FF8F00', borderBottomRightRadius: 4 },
  assistantBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e8e8e8', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 21 },
  userText: { color: '#fff' },
  assistantText: { color: '#333' },
  loadingDots: { color: '#999', fontStyle: 'italic' },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  actionBtn: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  actionBtnText: { fontSize: 12, color: '#FF8F00', fontWeight: '600' },
  inputRow: { padding: 10, borderTopWidth: 1, borderTopColor: '#e8e8e8', backgroundColor: '#fff' },
  input: { backgroundColor: '#fff' },
});
