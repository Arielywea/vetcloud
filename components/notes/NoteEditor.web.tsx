// Block editor for personal notes (web). Tiptap/ProseMirror models the note the way Notion
// does: a tree of typed blocks, edited through transactions with undo/redo, markdown
// shortcuts (# , - , 1. , [ ] , > ) and a "/" command menu to change the block type.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent, Editor, Extension, Range } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extensions';
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { Type, Heading1, Heading2, Heading3, List, ListOrdered, ListChecks, Quote, Bold, Italic, Strikethrough, LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { NoteDoc } from '../../services/directus';
import { docToText, type NoteEditorProps } from './noteDoc';

interface BlockCommand {
  key: string;
  label: string;
  hint: string;
  keywords: string[];
  Icon: LucideIcon;
  run: (editor: Editor, range: Range) => void;
}

const COMMANDS: BlockCommand[] = [
  { key: 'text', label: 'Texto', hint: 'Párrafo normal', keywords: ['parrafo', 'texto', 'normal'], Icon: Type,
    run: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run() },
  { key: 'h1', label: 'Título 1', hint: 'Sección principal', keywords: ['titulo', 'encabezado', 'h1', '#'], Icon: Heading1,
    run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 1 }).run() },
  { key: 'h2', label: 'Título 2', hint: 'Subsección', keywords: ['titulo', 'subtitulo', 'h2', '##'], Icon: Heading2,
    run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 2 }).run() },
  { key: 'h3', label: 'Título 3', hint: 'Apartado menor', keywords: ['titulo', 'h3', '###'], Icon: Heading3,
    run: (e, r) => e.chain().focus().deleteRange(r).setNode('heading', { level: 3 }).run() },
  { key: 'bullet', label: 'Lista con viñetas', hint: 'Escribe "- " para empezar', keywords: ['lista', 'vinetas', 'puntos'], Icon: List,
    run: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run() },
  { key: 'ordered', label: 'Lista numerada', hint: 'Pasos de un protocolo', keywords: ['lista', 'numerada', 'pasos', 'protocolo'], Icon: ListOrdered,
    run: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run() },
  { key: 'task', label: 'Lista de tareas', hint: 'Casillas para marcar', keywords: ['tareas', 'checklist', 'pendientes', 'casilla', 'todo'], Icon: ListChecks,
    run: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run() },
  { key: 'quote', label: 'Cita', hint: 'Texto destacado o referencia', keywords: ['cita', 'referencia', 'destacar', 'bibliografia'], Icon: Quote,
    run: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run() },
];

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function filterCommands(query: string) {
  const q = normalize(query.trim());
  if (!q) return COMMANDS;
  return COMMANDS.filter((c) => normalize(c.label).includes(q) || c.keywords.some((k) => k.includes(q)));
}

interface MenuState {
  items: BlockCommand[];
  rect: DOMRect | null;
  index: number;
  command: (item: BlockCommand) => void;
}

interface Bubble { top: number; left: number }

export default function NoteEditor({ docKey, initialDoc, onChange, autoFocus }: NoteEditorProps) {
  const { colors } = useTheme();
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef<MenuState | null>(null);
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const showMenu = (next: MenuState | null) => { menuRef.current = next; setMenu(next); };

  // The suggestion plugin is created once per editor; it talks to React through refs.
  const slashCommand = useMemo(() => Extension.create({
    name: 'slashCommand',
    addProseMirrorPlugins() {
      return [
        Suggestion<BlockCommand, BlockCommand>({
          editor: this.editor,
          char: '/',
          allowSpaces: false,
          items: ({ query }) => filterCommands(query),
          command: ({ editor, range, props }) => props.run(editor, range),
          render: () => {
            const sync = (p: SuggestionProps<BlockCommand, BlockCommand>, keepIndex: boolean) => {
              const prev = menuRef.current;
              const index = keepIndex && prev ? Math.min(prev.index, Math.max(p.items.length - 1, 0)) : 0;
              showMenu({ items: p.items, rect: p.clientRect?.() ?? null, index, command: p.command });
            };
            return {
              onStart: (p) => sync(p, false),
              onUpdate: (p) => sync(p, true),
              onExit: () => showMenu(null),
              onKeyDown: ({ event }: SuggestionKeyDownProps) => {
                const m = menuRef.current;
                if (!m) return false;
                if (event.key === 'Escape') { showMenu(null); return true; }
                if (!m.items.length) return false;
                if (event.key === 'ArrowDown') { showMenu({ ...m, index: (m.index + 1) % m.items.length }); return true; }
                if (event.key === 'ArrowUp') { showMenu({ ...m, index: (m.index - 1 + m.items.length) % m.items.length }); return true; }
                if (event.key === 'Enter' || event.key === 'Tab') { m.command(m.items[m.index]); return true; }
                return false;
              },
            };
          },
        }),
      ];
    },
  }), []);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? 'end' : false,
    content: initialDoc,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        a11y: { checkboxLabel: (node, checked) => `${checked ? 'Tarea hecha' : 'Tarea pendiente'}: ${node.textContent || 'sin texto'}` },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === 'heading' ? 'Título' : 'Escribe, o pulsa "/" para elegir un bloque'),
      }),
      slashCommand,
    ],
    onUpdate: ({ editor: e }) => {
      const doc = e.getJSON() as NoteDoc;
      onChangeRef.current(doc, docToText(doc));
    },
    onSelectionUpdate: ({ editor: e }) => {
      const { from, to, empty } = e.state.selection;
      if (empty || menuRef.current) { setBubble(null); return; }
      const start = e.view.coordsAtPos(from);
      const end = e.view.coordsAtPos(to);
      setBubble({ top: Math.min(start.top, end.top) - 44, left: (start.left + end.left) / 2 });
    },
    onBlur: () => setBubble(null),
  }, [docKey]);

  // Close floating UI when the note changes
  useEffect(() => { showMenu(null); setBubble(null); }, [docKey]);

  const cssVars = {
    '--vc-text': colors.text,
    '--vc-text-2': colors.textSecondary,
    '--vc-text-3': colors.textLight,
    '--vc-primary': colors.primary,
    '--vc-tint': colors.surfaceVariant,
    '--vc-surface': colors.surface,
    '--vc-selected': colors.primaryContainer,
    '--vc-shadow': colors.cardShadow,
  } as React.CSSProperties;

  const menuPos = (() => {
    if (!menu?.rect) return null;
    const height = Math.min(menu.items.length * 48 + 12, 340);
    const below = menu.rect.bottom + 6;
    const top = below + height > window.innerHeight ? Math.max(8, menu.rect.top - height - 6) : below;
    const left = Math.min(menu.rect.left, window.innerWidth - 280);
    return { top, left };
  })();

  return (
    <div className="vc-note" style={cssVars}>
      <style>{EDITOR_CSS}</style>
      <EditorContent editor={editor} />

      {/* Floating UI goes to <body>: app containers use transforms, which would make `position: fixed` relative to them */}
      {menu && menuPos && createPortal(
        <div className="vc-float vc-menu" style={{ ...cssVars, top: menuPos.top, left: menuPos.left }} role="listbox" aria-label="Tipos de bloque">
          {menu.items.length === 0 ? (
            <div className="vc-menu-empty">Sin resultados</div>
          ) : menu.items.map((item, i) => (
            <button
              key={item.key}
              type="button"
              role="option"
              aria-selected={i === menu.index}
              className={i === menu.index ? 'vc-menu-item is-active' : 'vc-menu-item'}
              onMouseEnter={() => showMenu({ ...menu, index: i })}
              onMouseDown={(ev) => { ev.preventDefault(); menu.command(item); }}
            >
              <span className="vc-menu-icon"><item.Icon size={18} color={colors.textSecondary} /></span>
              <span className="vc-menu-text">
                <span className="vc-menu-label">{item.label}</span>
                <span className="vc-menu-hint">{item.hint}</span>
              </span>
            </button>
          ))}
        </div>,
        document.body,
      )}

      {editor && bubble && createPortal(
        <div className="vc-float vc-bubble" style={{ ...cssVars, top: Math.max(8, bubble.top), left: bubble.left }} role="toolbar" aria-label="Formato del texto">
          {([
            ['bold', 'Negrita', Bold, () => editor.chain().focus().toggleBold().run()],
            ['italic', 'Cursiva', Italic, () => editor.chain().focus().toggleItalic().run()],
            ['strike', 'Tachado', Strikethrough, () => editor.chain().focus().toggleStrike().run()],
          ] as const).map(([mark, label, Icon, run]) => {
            const active = editor.isActive(mark);
            return (
              <button
                key={mark}
                type="button"
                aria-label={label}
                aria-pressed={active}
                title={label}
                className={active ? 'vc-bubble-btn is-active' : 'vc-bubble-btn'}
                onMouseDown={(ev) => { ev.preventDefault(); run(); setBubble((b) => (b ? { ...b } : b)); }}
              >
                <Icon size={16} color={active ? colors.primary : colors.textSecondary} />
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

// Theme values arrive as CSS variables, so the sheet itself has no fixed colors.
const EDITOR_CSS = `
.vc-note, .vc-float { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; font-feature-settings: 'cv11', 'ss01'; }
.vc-note .ProseMirror { outline: none; color: var(--vc-text); font-size: 15px; line-height: 1.65; min-height: 50vh; padding-bottom: 30vh; word-break: break-word; }
.vc-note .ProseMirror > * + * { margin-top: 2px; }
.vc-note .ProseMirror p { margin: 0; padding: 3px 0; }
.vc-note .ProseMirror h1, .vc-note .ProseMirror h2, .vc-note .ProseMirror h3 { font-weight: 600; color: var(--vc-text); margin: 0; }
.vc-note .ProseMirror h1 { font-size: 24px; line-height: 1.3; padding-top: 22px; padding-bottom: 4px; }
.vc-note .ProseMirror h2 { font-size: 20px; line-height: 1.3; padding-top: 16px; padding-bottom: 2px; }
.vc-note .ProseMirror h3 { font-size: 17px; line-height: 1.35; padding-top: 12px; }
.vc-note .ProseMirror ul, .vc-note .ProseMirror ol { margin: 0; padding-left: 1.6em; }
.vc-note .ProseMirror li { padding: 1px 0; }
.vc-note .ProseMirror li p { padding: 1px 0; }
.vc-note .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 2px; }
.vc-note .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 10px; }
.vc-note .ProseMirror ul[data-type="taskList"] li > label { flex: none; padding-top: 5px; user-select: none; }
.vc-note .ProseMirror ul[data-type="taskList"] li > label input { width: 16px; height: 16px; margin: 0; accent-color: var(--vc-primary); cursor: pointer; }
.vc-note .ProseMirror ul[data-type="taskList"] li > div { flex: 1; min-width: 0; }
.vc-note .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div { color: var(--vc-text-3); text-decoration: line-through; }
.vc-note .ProseMirror blockquote { margin: 6px 0; padding: 8px 14px; background: var(--vc-tint); color: var(--vc-text-2); border-radius: 2px; }
.vc-note .ProseMirror a { color: var(--vc-primary); text-decoration: underline; text-underline-offset: 2px; }
.vc-note .ProseMirror code { background: var(--vc-tint); padding: 1px 4px; border-radius: 2px; font-size: 0.92em; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }
.vc-note .ProseMirror strong { font-weight: 600; }
.vc-note .ProseMirror .is-empty::before { content: attr(data-placeholder); color: var(--vc-text-3); float: left; height: 0; pointer-events: none; }
.vc-note .ProseMirror:not(.ProseMirror-focused) .is-empty:not(:first-child)::before { content: none; }
.vc-float { position: fixed; z-index: 1000; background: var(--vc-surface); border-radius: 3px; box-shadow: 0 12px 28px color-mix(in srgb, var(--vc-shadow) 14%, transparent), 0 2px 6px color-mix(in srgb, var(--vc-shadow) 8%, transparent); animation: vc-pop 160ms cubic-bezier(0.23, 1, 0.32, 1); }
@keyframes vc-pop { from { opacity: 0; transform: translateY(-2px) scale(0.98); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .vc-float { animation: none; } }
.vc-menu { width: 268px; max-height: 340px; overflow-y: auto; padding: 6px; }
.vc-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 8px; border: 0; background: transparent; border-radius: 2px; cursor: pointer; text-align: left; font: inherit; }
.vc-menu-item.is-active { background: var(--vc-selected); }
.vc-menu-icon { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: var(--vc-tint); border-radius: 2px; flex: none; }
.vc-menu-text { display: flex; flex-direction: column; min-width: 0; }
.vc-menu-label { font-size: 14px; color: var(--vc-text); font-weight: 500; }
.vc-menu-hint { font-size: 12px; color: var(--vc-text-3); }
.vc-menu-empty { padding: 8px 10px; font-size: 13px; color: var(--vc-text-3); }
.vc-bubble { display: flex; gap: 2px; padding: 4px; transform: translateX(-50%); animation: none; }
.vc-bubble-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 0; background: transparent; border-radius: 9999px; cursor: pointer; transition: transform 120ms ease-out; }
.vc-bubble-btn:active { transform: scale(0.97); }
.vc-bubble-btn.is-active { background: var(--vc-selected); }
`;
