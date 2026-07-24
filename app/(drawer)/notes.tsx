import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Text, Modal, Portal } from 'react-native-paper';
import { StickyNote, Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react-native';
import { useNotes } from '../../hooks/useDirectus';
import { DirectusNote, api } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, RADIUS, SHADOWS } from '../../constants/tokens';
import VCard from '../../components/ui/Card';
import VButton from '../../components/ui/Button';
import VEmptyState from '../../components/ui/EmptyState';

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
      resetForm(); setShowModal(false);
    } catch {}
  };

  const handleEdit = (note: DirectusNote) => {
    setEditingNote(note); setTitle(note.title); setContent(note.content); setTags(note.tags ? note.tags.join(', ') : ''); setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.notes.delete(deleteTarget.id); setRefreshKey(k => k + 1); refresh(); } catch {} finally { setDeleteTarget(null); }
  };

  const renderNote = ({ item }: { item: DirectusNote }) => {
    const date = new Date(item.updated_at || item.created_at);
    const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return (
      <VCard style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <Text variant="titleMedium" style={[styles.noteTitle, { color: colors.text }]}>{item.title}</Text>
          <View style={styles.noteActions}>
            <TouchableOpacity onPress={() => handleEdit(item)}><Pencil size={16} color={colors.primary} /></TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteTarget(item)}><Trash2 size={16} color={colors.error} /></TouchableOpacity>
          </View>
        </View>
        <Text variant="bodyMedium" style={[styles.noteContent, { color: colors.textSecondary }]} numberOfLines={3}>{item.content}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag, i) => (
              <View key={i} style={[styles.tagChip, { backgroundColor: colors.primaryContainer }]}>
                <Text style={{ fontSize: 11, color: colors.primary }}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text variant="bodySmall" style={[styles.noteDate, { color: colors.textLight }]}>{dateStr}</Text>
      </VCard>
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
          <VEmptyState
            icon={<StickyNote size={32} color={colors.textLight} />}
            title="No tienes notas guardadas"
            description="Crea notas para guardar observaciones o recordatorios"
          />
        }
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, ...SHADOWS.lg }]} onPress={() => { resetForm(); setShowModal(true); }}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <Portal>
        <Modal visible={showModal} onDismiss={() => { setShowModal(false); resetForm(); }} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: colors.text }]}>{editingNote ? 'Editar Nota' : 'Nueva Nota'}</Text>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Título *</Text>
          <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={title} onChangeText={setTitle} placeholder="Título" placeholderTextColor={colors.textLight} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Contenido *</Text>
          <RNTextInput style={[styles.input, styles.contentInput, { borderColor: colors.border, color: colors.text }]} value={content} onChangeText={setContent} multiline numberOfLines={6} placeholder="Contenido" placeholderTextColor={colors.textLight} />
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Etiquetas (separadas por coma)</Text>
          <RNTextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} value={tags} onChangeText={setTags} placeholder="tag1, tag2" placeholderTextColor={colors.textLight} />
          <View style={styles.modalActions}>
            <VButton variant="secondary" onPress={() => { setShowModal(false); resetForm(); }}>Cancelar</VButton>
            <VButton variant="primary" onPress={handleSave}>{editingNote ? 'Guardar' : 'Crear'}</VButton>
          </View>
        </Modal>
      </Portal>

      <Portal>
        <Modal visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)} contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}>
          <AlertTriangle size={32} color={colors.error} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Text variant="titleMedium" style={{ textAlign: 'center', color: colors.text }}>Eliminar nota</Text>
          <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 4 }}>¿Estás seguro de eliminar "{deleteTarget?.title}"?</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <VButton variant="secondary" onPress={() => setDeleteTarget(null)} style={{ flex: 1 }}>Cancelar</VButton>
            <VButton variant="danger" onPress={confirmDelete} style={{ flex: 1 }}>Eliminar</VButton>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: SPACING.lg, paddingBottom: 80 },
  noteCard: { marginBottom: SPACING.md },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  noteTitle: { fontWeight: '700', flex: 1, marginRight: SPACING.sm },
  noteActions: { flexDirection: 'row', gap: SPACING.md },
  noteContent: { marginTop: SPACING.sm, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm, gap: 4 },
  tagChip: { height: 24, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  noteDate: { marginTop: SPACING.sm, fontSize: 11 },
  fab: { position: 'absolute', right: 16, bottom: 16, width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modal: { padding: 20, margin: 20, borderRadius: RADIUS.lg, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: SPACING.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: SPACING.xs },
  input: { borderWidth: 1, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, fontSize: 14 },
  contentInput: { minHeight: 120, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: SPACING.sm, gap: SPACING.sm },
});
