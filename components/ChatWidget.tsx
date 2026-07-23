import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../config';

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  intent?: string;
  created_at: string;
}

export default function ChatWidget() {
  const [visible, setVisible] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [started, setStarted] = useState(false);
  const [tutorName, setTutorName] = useState('');
  const [petName, setPetName] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const startChat = async () => {
    if (!tutorName.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutor_name: tutorName.trim(), pet_name: petName.trim() || null }),
      });
      const json = await res.json();
      const conv = json.data;
      setConversationId(conv.id);
      setMessages(conv.messages || []);
      setStarted(true);
    } catch (err) {
      console.error('Chat start error:', err);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !conversationId) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json();
      setMessages(json.data.messages);
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <IconButton
        icon="chat"
        size={28}
        style={styles.fab}
        iconColor="#fff"
        onPress={() => setVisible(true)}
      />

      {/* Chat Modal */}
      <Portal>
        <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <MaterialCommunityIcons name="chat" size={20} color="#FF8F00" />
              <Text style={styles.headerTitle}>VetCloud Asistente</Text>
              <IconButton icon="close" size={20} onPress={() => setVisible(false)} style={{ margin: 0 }} />
            </View>

            {!started ? (
              /* Start form */
              <View style={styles.startForm}>
                <Text style={styles.startTitle}>¿En qué puedo ayudarle?</Text>
                <Text style={styles.startDesc}>Pregunte por horarios, citas, precios, vacunas o emergencias.</Text>
                <TextInput label="Su nombre *" value={tutorName} onChangeText={setTutorName} mode="outlined" style={styles.input} />
                <TextInput label="Nombre de su mascota (opcional)" value={petName} onChangeText={setPetName} mode="outlined" style={styles.input} />
                <Button mode="contained" onPress={startChat} loading={sending} disabled={!tutorName.trim() || sending} style={styles.startButton}>
                  Iniciar conversación
                </Button>
              </View>
            ) : (
              /* Chat messages */
              <>
                <ScrollView ref={scrollRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
                  {messages.map((msg) => (
                    <View key={msg.id} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                      {msg.sender !== 'user' && <MaterialCommunityIcons name="robot" size={16} color="#FF8F00" style={{ marginRight: 6, marginTop: 2 }} />}
                      <View style={[styles.messageBox, msg.sender === 'user' ? styles.userBox : styles.botBox]}>
                        <Text style={[styles.messageText, msg.sender === 'user' ? styles.userText : styles.botText]}>
                          {msg.message}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {/* Input */}
                <View style={styles.inputRow}>
                  <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Escriba su mensaje..."
                    mode="outlined"
                    style={styles.chatInput}
                    dense
                    onSubmitEditing={sendMessage}
                    right={
                      <TextInput.Icon
                        icon="send"
                        onPress={sendMessage}
                        disabled={!inputText.trim() || sending}
                      />
                    }
                  />
                </View>
              </>
            )}
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#FF8F00',
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modal: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    left: undefined,
    width: 380,
    maxHeight: 520,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FF8F00',
    gap: 8,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  startForm: { padding: 20, alignItems: 'center' },
  startTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  startDesc: { fontSize: 13, color: '#666', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', marginBottom: 12 },
  startButton: { width: '100%', marginTop: 4, borderRadius: 8 },
  messagesContainer: { flex: 1, backgroundColor: '#f9f9f9' },
  messagesContent: { padding: 12, paddingBottom: 8 },
  messageBubble: { flexDirection: 'row', marginBottom: 10 },
  userBubble: { justifyContent: 'flex-end' },
  botBubble: { justifyContent: 'flex-start' },
  messageBox: { maxWidth: '80%', borderRadius: 12, padding: 10 },
  userBox: { backgroundColor: '#FF8F00', borderBottomRightRadius: 4 },
  botBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  botText: { color: '#333' },
  inputRow: { padding: 8, borderTopWidth: 1, borderTopColor: '#e0e0e0', backgroundColor: '#fff' },
  chatInput: { backgroundColor: '#fff' },
});
