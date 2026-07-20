import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, FAB, Portal, Modal, Dialog, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNotes } from '../../hooks/useDirectus';
import { DirectusNote, api } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';

export default function NotesScreen() {
  const { notes, loading, addNote, updateNote, refresh } = useNotes();
  const { colors } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<DirectusNote | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DirectusNote | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const resetForm = () => { setTitle(''); setContent(''); setTags(''); setEditingNote(null); };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, { title: title.trim(), content: content.trim(), tags: tagList, updated_at: new Date().toISOString() });
      } else {
        await addNote({ title: title.trim(), content: content.trim(), tags: tagList, disease_id: null, pet_id: null });
      }
      resetForm();
      setShowModal(false);
    } catch (error) {}
  };

  const handleEdit = (note: DirectusNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags ? note.tags.join(', ') : '');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.notes.delete(deleteTarget.id); setRefreshKey(k => k + 1); refresh(); } catch {} finally { setDeleteTarget(null); }
  };

  const renderNote = ({ item }: { item: DirectusNote }) => {
    const date = new Date(item.updated_at || item.created_at);
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return (
      <Card style={[styles.noteCard, { backgroundColor: colors.surface }]}>
        <Card.Content>
          <View style={styles.noteHeader}>
            <Text variant="titleMedium" style={[styles.noteTitle, { color: colors.text }]}>{item.title}</Text>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                <MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteTarget(item)} style={styles.actionButton}>
                <MaterialCommunityIcons name="delete" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
          <Text variant="bodyMedium" style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>{item.content}</Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.map((tag, i) => (
                <Chip key={i} compact style={[styles.tagChip, { backgroundColor: colors.primaryContainer }]} textStyle={{ fontSize: 11, color: colors.primary }}>{tag}</Chip>
              ))}
            </View>
          )}
          <Text variant="bodySmall" style={[styles.noteDate, { color: colors.textLight }]}>{dateStr}</Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        extraData={refreshKey}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="note-text-outline" size={64} color={colors.textLight} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tienes notas guardadas</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Crea notas para guardar observaciones o recordatorios</Text>
          </View>
        }
      />
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => { resetForm(); setShowModal(true); }} color="#FFFFFF" />
      <Portal>
        <Modal visible={showModal} onDismiss={() => { setShowModal(false); resetForm(); }} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</Text>
          <TextInput label="Título *" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
          <TextInput label="Contenido *" value={content} onChangeText={setContent} mode="outlined" multiline numberOfLines={6} style={[styles.input, styles.contentInput]} />
          <TextInput label="Etiquetas (separadas por coma)" value={tags} onChangeText={setTags} mode="outlined" style={styles.input} />
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => { setShowModal(false); resetForm(); }} style={[styles.cancelButton, { borderColor: colors.border }]}>Cancelar</Button>
            <Button mode="contained" onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>{editingNote ? 'Guardar' : 'Crear'}</Button>
          </View>
        </Modal>
      </Portal>
      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title style={styles.dialogTitle}>Eliminar nota</Dialog.Title>
          <Dialog.Content><Text variant="bodyMedium">¿Estás seguro de eliminar "{deleteTarget?.title}"?</Text></Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button onPress={confirmDelete} textColor={colors.error}>Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 80 },
  noteCard: { marginBottom: 10, borderRadius: 12, elevation: 1 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  noteTitle: { fontWeight: '700', flex: 1, marginRight: 8 },
  noteActions: { flexDirection: 'row' },
  actionButton: { padding: 4, marginLeft: 4 },
  noteContent: { marginTop: 8, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 4 },
  tagChip: { height: 24 },
  noteDate: { marginTop: 8, fontSize: 11 },
  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { marginTop: 8, textAlign: 'center', lineHeight: 20 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  modalContent: { padding: 20, margin: 20, borderRadius: 16, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 16 },
  input: { marginBottom: 12 },
  contentInput: { minHeight: 120 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  cancelButton: {},
  saveButton: {},
  dialogTitle: { textAlign: 'center' },
});
