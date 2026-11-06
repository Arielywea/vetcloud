import type { NoteDoc } from '../../services/directus';

/** Legacy plain-text notes become one paragraph per line (empty lines kept as empty paragraphs). */
export function textToDoc(text: string): NoteDoc {
  const lines = (text || '').replace(/\r\n/g, '\n').split('\n');
  return {
    type: 'doc',
    content: lines.map((line) => (line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' })),
  };
}

/** Plain-text mirror of a document, one block per line; used for previews, search and the native fallback. */
export function docToText(doc: NoteDoc | null | undefined): string {
  if (!doc) return '';
  const lines: string[] = [];
  const inline = (node: any): string => {
    if (node.type === 'text') return node.text || '';
    if (node.type === 'hardBreak') return '\n';
    return (node.content || []).map(inline).join('');
  };
  const walk = (node: any, prefix = '') => {
    switch (node.type) {
      case 'paragraph':
      case 'heading':
        lines.push(prefix + inline(node));
        break;
      case 'bulletList':
      case 'orderedList':
      case 'taskList':
        (node.content || []).forEach((item: any, i: number) => {
          const mark = node.type === 'orderedList' ? `${i + 1}. ` : node.type === 'taskList' ? (item.attrs?.checked ? '[x] ' : '[ ] ') : '• ';
          (item.content || []).forEach((child: any, j: number) => walk(child, j === 0 ? prefix + mark : prefix + '   '));
        });
        break;
      case 'blockquote':
        (node.content || []).forEach((child: any) => walk(child, prefix + '> '));
        break;
      default:
        if (node.content) node.content.forEach((child: any) => walk(child, prefix));
    }
  };
  (doc.content || []).forEach((n) => walk(n));
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** True when the document only has plain paragraphs (safe to edit as plain text without losing structure). */
export function isPlainDoc(doc: NoteDoc | null | undefined): boolean {
  if (!doc) return true;
  return (doc.content || []).every(
    (n: any) => n.type === 'paragraph' && (n.content || []).every((c: any) => c.type === 'text' && !(c.marks && c.marks.length)),
  );
}

export interface NoteEditorProps {
  /** Changing it rebuilds the editor with `initialDoc` (another note, or a reload after a conflict) */
  docKey: string;
  initialDoc: NoteDoc;
  onChange: (doc: NoteDoc, text: string) => void;
  /** Focus the editor when it mounts (new notes) */
  autoFocus?: boolean;
}
