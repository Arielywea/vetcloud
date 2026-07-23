import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, TextInput, Chip, Portal, Modal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useChat } from '../../hooks/useDirectus';
import { useTheme } from '../../contexts/ThemeContext';
import { ChatConversation, ChatMessage } from '../../services/directus';
import { API_URL } from '../../config';
import { authHeaders } from '../../services/auth';

export default function ChatAdminScreen() {
  const { colors } = useTheme();
  const { conversations, loading, updateConversation, agentReply, refresh } = useChat();
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'pending' | 'closed'>('all');
  const scrollRef = useRef<ScrollView>(null);

  const filtered = filter === 'all' ? conversations : conversations.filter(c => c.status === filter);
  const pendingCount = conversations.filter(c => c.status === 'pending').length;

  const openConversation = async (conv: ChatConversation) => {
    setSelected(conv);
    try {
      const res = await fetch(`${API_URL}/chat/conversations/${conv.id}`, { headers: authHeaders() });
      const json = await res.json();
      setMessages(json.data.messages || []);
    } catch (err) {
      console.error('Load messages error:', err);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selected) return;
    try {
      await agentReply(selected.id, replyText.trim());
      setReplyText('');
      const res = await fetch(`${API_URL}/chat/conversations/${selected.id}`, { headers: authHeaders() });
      const json = await res.json();
      setMessages(json.data.messages || []);
    } catch (err) {
      console.error('Reply error:', err);
    }
  };

  const handleClose = async (conv: ChatConversation) => {
    await updateConversation(conv.id, { status: 'closed' });
    if (selected?.id === conv.id) setSelected(null);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={styles.filters}>
        {(['all', 'open', 'pending', 'closed'] as const).map((f) => (
          <Chip key={f} selected={filter === f} onPress={() => setFilter(f)} compact
            style={[styles.filterChip, filter === f && { backgroundColor: colors.primary + '20' }]}
            textStyle={filter === f ? { color: colors.primary } : {}}>
            {f === 'all' ? 'Todas' : f === 'open' ? 'Abiertas' : f === 'pending' ? `Pendientes (${pendingCount})` : 'Cerradas'}
          </Chip>
        ))}
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="chat-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No hay conversaciones</Text>
        </View>
      ) : (
        filtered.map((conv) => (
          <Card key={conv.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: conv.status === 'pending' ? '#FF9800' : colors.border }]}
            onPress={() => openConversation(conv)}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={[styles.statusDot, { backgroundColor: conv.status === 'open' ? '#4CAF50' : conv.status === 'pending' ? '#FF9800' : '#999' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{conv.tutor_name || 'Anónimo'}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    {conv.pet_name || 'Sin mascota'} — {new Date(conv.updated_at).toLocaleDateString('es-CL')}
                  </Text>
                </View>
                <Chip compact style={{ height: 24 }}
                  textStyle={{ fontSize: 11, color: conv.status === 'open' ? '#2E7D32' : conv.status === 'pending' ? '#E65100' : '#666' }}>
                  {conv.status === 'open' ? 'Abierta' : conv.status === 'pending' ? 'Pendiente' : 'Cerrada'}
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))
      )}

      {/* Detail modal */}
      <Portal>
        <Modal visible={!!selected} onDismiss={() => setSelected(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          {selected && (
            <>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selected.tutor_name || 'Anónimo'}</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    {selected.pet_name || 'Sin mascota'} | {selected.tutor_email || 'Sin email'} | {selected.tutor_phone || 'Sin teléfono'}
                  </Text>
                </View>
                <Button compact mode="outlined" onPress={() => handleClose(selected)} icon="check">
                  Cerrar
                </Button>
              </View>

              <ScrollView ref={scrollRef} style={styles.messagesContainer}>
                {messages.map((msg) => (
                  <View key={msg.id} style={[styles.messageRow, msg.sender === 'agent' && styles.agentRow]}>
                    <MaterialCommunityIcons
                      name={msg.sender === 'user' ? 'account' : msg.sender === 'bot' ? 'robot' : 'doctor'}
                      size={16} color={msg.sender === 'agent' ? '#4CAF50' : '#FF8F00'}
                    />
                    <View style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : msg.sender === 'agent' ? styles.agentBubble : styles.botBubble]}>
                      <Text style={[styles.senderLabel, { color: msg.sender === 'agent' ? '#4CAF50' : '#FF8F00' }]}>
                        {msg.sender === 'user' ? 'Tutor' : msg.sender === 'bot' ? 'Bot' : 'Agente'}
                        {msg.intent ? ` (${msg.intent})` : ''}
                      </Text>
                      <Text style={styles.messageText}>{msg.message}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.replyRow}>
                <TextInput value={replyText} onChangeText={setReplyText} placeholder="Responder como agente..." mode="outlined" dense style={styles.replyInput}
                  onSubmitEditing={handleReply} />
                <Button mode="contained" onPress={handleReply} disabled={!replyText.trim()} icon="send" style={styles.replyBtn}>
                  Enviar
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  filterChip: { marginBottom: 4 },
  loadingText: { textAlign: 'center', color: '#999', marginTop: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 15 },
  card: { marginBottom: 10, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  modal: { margin: 16, padding: 0, borderRadius: 16, maxHeight: '85%', flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e0e0e0', gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSubtitle: { fontSize: 12, marginTop: 4 },
  messagesContainer: { flex: 1, padding: 12, maxHeight: 350 },
  messageRow: { flexDirection: 'row', gap: 8, marginBottom: 12, alignItems: 'flex-start' },
  agentRow: { justifyContent: 'flex-end' },
  messageBubble: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1 },
  userBubble: { backgroundColor: '#FFF8E1', borderColor: '#FFE082' },
  botBubble: { backgroundColor: '#f5f5f5', borderColor: '#e0e0e0' },
  agentBubble: { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
  senderLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  messageText: { fontSize: 13, lineHeight: 18, color: '#333' },
  replyRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0', gap: 8, alignItems: 'center' },
  replyInput: { flex: 1 },
  replyBtn: { borderRadius: 20 },
});
