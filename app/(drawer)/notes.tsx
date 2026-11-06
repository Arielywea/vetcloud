import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { StickyNote, Plus, Trash2, ArrowLeft, Search } from 'lucide-react-native';
import { useNotes } from '../../hooks/useDirectus';
import { DirectusNote, NoteDoc, api } from '../../services/directus';
import { useTheme } from '../../contexts/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import PageHeader from '../../components/ui/PageHeader';
import VButton from '../../components/ui/Button';
import VIconButton from '../../components/ui/IconButton';
import VEmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/VToast';
import { useConfirm } from '../../components/ui/ConfirmDialog';
import NoteEditor from '../../components/notes/NoteEditor';
import { textToDoc } from '../../components/notes/noteDoc';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/tokens';

const UNTITLED = 'Sin título';
const SAVE_DELAY_MS = 800;
const RETRY_DELAY_MS = 5000;

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
type NotePatch = Partial<{ title: string; tags: string[]; blocks: NoteDoc; content: string }>;

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const parseTags = (s: string) => [...new Set(s.split(',').map((t) => t.trim()).filter(Boolean))];
const displayFont: any = Platform.OS === 'web' ? { dataSet: { font: 'display' } } : {};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function NotesScreen() {
  const { notes, loading, refresh } = useNotes();
  const { colors, onAccentText } = useTheme();
  const { isDesktop } = useResponsive();
  const toast = useToast();
  const { confirm } = useConfirm();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [seed, setSeed] = useState<{ key: string; doc: NoteDoc } | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [freshId, setFreshId] = useState<string | null>(null);

  // Autosave: edits accumulate in `pending` and go out as one PATCH after a pause in typing.
  // Saves run one after another; each sends the version it last saw so a concurrent edit
  // elsewhere comes back as 409 instead of being silently overwritten.
  const currentId = useRef<string | null>(null);
  const pending = useRef<NotePatch>({});
  const versions = useRef<Record<string, number>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const nonce = useRef(0);

  const loadIntoEditor = useCallback((note: DirectusNote) => {
    currentId.current = note.id;
    if (note.version != null) versions.current[note.id] = note.version;
    setTitle(note.title === UNTITLED ? '' : note.title);
    setTagsText((note.tags || []).join(', '));
    nonce.current += 1;
    setSeed({ key: `${note.id}:${nonce.current}`, doc: note.blocks || textToDoc(note.content) });
  }, []);

  const flush = useCallback((): Promise<void> => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    const id = currentId.current;
    const patch = pending.current;
    if (!id || !Object.keys(patch).length) return queue.current;
    pending.current = {};
    queue.current = queue.current.then(async () => {
      if (currentId.current === id) setSaveState('saving');
      try {
        const saved: DirectusNote = await api.notes.update(id, { ...patch, version: versions.current[id] });
        if (saved?.version != null) versions.current[id] = saved.version;
        if (currentId.current === id) setSaveState(Object.keys(pending.current).length ? 'dirty' : 'saved');
      } catch (err: any) {
        if (err?.status === 409) {
          // Someone saved this note elsewhere: show their version
          toast.error(err.message);
          const fresh: DirectusNote[] = await api.notes.list().catch(() => []);
          const latest = fresh.find((n) => n.id === id);
          if (latest && currentId.current === id) { pending.current = {}; loadIntoEditor(latest); setSaveState('saved'); }
          return;
        }
        if (currentId.current === id) {
          pending.current = { ...patch, ...pending.current };
          setSaveState('error');
          if (!err?.status || err.status >= 500) timer.current = setTimeout(() => { flush(); }, RETRY_DELAY_MS);
          else toast.error(err.message || 'No se pudo guardar la nota');
        }
      }
    });
    return queue.current;
  }, [loadIntoEditor, toast]);

  const schedule = useCallback((patch: NotePatch) => {
    pending.current = { ...pending.current, ...patch };
    setSaveState('dirty');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { flush(); }, SAVE_DELAY_MS);
  }, [flush]);

  // Save before leaving the screen; warn on tab close while a save is pending
  useEffect(() => {
    if (Platform.OS !== 'web') return () => { flush(); };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length) { flush(); e.preventDefault(); }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => { window.removeEventListener('beforeunload', onBeforeUnload); flush(); };
  }, [flush]);

  const openNote = async (note: DirectusNote) => {
    if (note.id === currentId.current) return;
    await flush();
    setFreshId(null);
    setSaveState('idle');
    setSelectedId(note.id);
    loadIntoEditor(note);
  };

  const closeNote = async () => {
    await flush();
    currentId.current = null;
    setSelectedId(null);
    setSeed(null);
  };

  const createNote = async () => {
    try {
      await flush();
      const created: DirectusNote = await api.notes.create({ title: '', content: '', tags: [], blocks: { type: 'doc', content: [{ type: 'paragraph' }] } });
      setFreshId(created.id);
      setSaveState('idle');
      setSelectedId(created.id);
      loadIntoEditor(created);
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo crear la nota');
    }
  };

  const deleteNote = async () => {
    const id = selectedId;
    if (!id) return;
    const ok = await confirm({ title: 'Eliminar nota', message: `Se eliminará "${title || UNTITLED}". Esta acción no se puede deshacer.`, confirmLabel: 'Eliminar', destructive: true });
    if (!ok) return;
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    pending.current = {};
    await queue.current;
    try {
      await api.notes.delete(id);
      currentId.current = null;
      setSelectedId(null);
      setSeed(null);
      toast.success('Nota eliminada');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo eliminar la nota');
    }
  };

  const onEditorChange = useCallback((doc: NoteDoc, text: string) => {
    schedule({ blocks: doc, content: text });
  }, [schedule]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return notes;
    return notes.filter((n) => normalize([n.title, n.content, ...(n.tags || [])].join(' ')).includes(q));
  }, [notes, query]);

  const saveLabel = { idle: '', dirty: 'Cambios sin guardar', saving: 'Guardando…', saved: 'Guardado', error: 'Sin conexión, reintentando' }[saveState];

  const list = (
    <View style={[styles.listPanel, isDesktop && styles.listPanelWide, { backgroundColor: colors.surface }]}>
      <View style={[styles.search, { borderColor: colors.border }]}>
        <Search size={16} color={colors.textLight} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar en notas"
          placeholderTextColor={colors.textLight}
          accessibilityLabel="Buscar en notas"
        />
      </View>
      {visible.length === 0 ? (
        <Text style={[styles.listEmpty, { color: colors.textLight }]}>{query ? 'Ninguna nota coincide' : 'Aún no hay notas'}</Text>
      ) : visible.map((n) => {
        const active = n.id === selectedId;
        const shownTitle = active ? (title || UNTITLED) : n.title;
        const preview = (n.content || '').replace(/\s+/g, ' ').trim();
        return (
          <TouchableOpacity
            key={n.id}
            onPress={() => openNote(n)}
            style={[styles.item, active && { backgroundColor: colors.primaryContainer }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Abrir nota ${shownTitle}`}
          >
            <Text numberOfLines={1} style={[styles.itemTitle, { color: colors.text }]}>{shownTitle}</Text>
            {!!preview && <Text numberOfLines={2} style={[styles.itemPreview, { color: colors.textSecondary }]}>{preview}</Text>}
            <Text style={[styles.itemDate, { color: colors.textLight }]}>{formatDate(n.updated_at || n.created_at)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // A just-created note may not be in the list yet; the editor only needs its id and seed
  const editor = seed && selectedId ? (
    <ScrollView style={[styles.editorPanel, { backgroundColor: colors.surface }]} contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
      <View style={styles.editorBar}>
        {!isDesktop && (
          <VIconButton icon={<ArrowLeft size={20} color={colors.text} />} label="Volver a la lista de notas" onPress={closeNote} />
        )}
        <Text style={[styles.saveState, { color: saveState === 'error' ? colors.error : colors.textLight }]} accessibilityLiveRegion="polite">{saveLabel}</Text>
        <VIconButton icon={<Trash2 size={18} color={colors.error} />} label="Eliminar nota" onPress={deleteNote} />
      </View>
      <View style={styles.page}>
        <TextInput
          {...displayFont}
          key={`title:${seed.key}`}
          style={[styles.titleInput, { color: colors.text }]}
          value={title}
          onChangeText={(t) => { setTitle(t); schedule({ title: t.trim() }); }}
          placeholder={UNTITLED}
          placeholderTextColor={colors.textLight}
          autoFocus={freshId === selectedId}
          accessibilityLabel="Título de la nota"
        />
        <TextInput
          style={[styles.tagsInput, { color: colors.textSecondary }]}
          value={tagsText}
          onChangeText={(t) => { setTagsText(t); schedule({ tags: parseTags(t) }); }}
          placeholder="Etiquetas, separadas por coma"
          placeholderTextColor={colors.textLight}
          accessibilityLabel="Etiquetas de la nota"
        />
        <NoteEditor docKey={seed.key} initialDoc={seed.doc} onChange={onEditorChange} />
      </View>
    </ScrollView>
  ) : null;

  const header = (
    <PageHeader
      title="Notas personales"
      subtitle="Protocolos, recordatorios y observaciones propias"
      actions={<VButton onPress={createNote} icon={<Plus size={16} color={onAccentText.default} />}>Nueva nota</VButton>}
    />
  );

  if (!loading && notes.length === 0) {
    return (
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.screen}>
        {header}
        <VEmptyState
          icon={<StickyNote size={32} color={colors.textLight} />}
          title="No tienes notas guardadas"
          description="Crea notas para guardar protocolos, observaciones o recordatorios"
          variant="data"
        />
      </ScrollView>
    );
  }

  if (!isDesktop) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {editor || (
          <ScrollView contentContainerStyle={styles.screen}>
            {header}
            {list}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.screen, { backgroundColor: colors.background }]}>
      {header}
      <View style={styles.columns}>
        <ScrollView style={styles.listScroll}>{list}</ScrollView>
        {editor || (
          <View style={[styles.editorPanel, styles.placeholder, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textLight, fontSize: TYPOGRAPHY.sizes.base }}>Elige una nota o crea una nueva</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: { padding: SPACING.lg, paddingBottom: SPACING['3xl'] },
  columns: { flex: 1, flexDirection: 'row', gap: SPACING.lg, minHeight: 0 },
  listScroll: { width: 320, flexGrow: 0, flexShrink: 0 },
  listPanel: { padding: SPACING.sm, borderRadius: RADIUS.md },
  listPanelWide: { minHeight: '100%' },
  search: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderWidth: 1, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchInput: { flex: 1, paddingVertical: SPACING.sm, fontSize: TYPOGRAPHY.sizes.md },
  listEmpty: { padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.md },
  item: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm },
  itemTitle: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold },
  itemPreview: { fontSize: TYPOGRAPHY.sizes.sm, lineHeight: 18, marginTop: 2 },
  itemDate: { fontSize: TYPOGRAPHY.sizes.xs, marginTop: SPACING.xs },
  editorPanel: { flex: 1, borderRadius: RADIUS.md },
  editorContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING['3xl'] },
  editorBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, minHeight: 44 },
  saveState: { flex: 1, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'right' },
  page: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingTop: SPACING.md },
  titleInput: { fontSize: 38, lineHeight: 44, fontWeight: '600', padding: 0, marginBottom: SPACING.xs },
  tagsInput: { fontSize: TYPOGRAPHY.sizes.md, padding: 0, paddingVertical: SPACING.xs, marginBottom: SPACING.xl },
  placeholder: { alignItems: 'center', justifyContent: 'center', minHeight: 320 },
});
