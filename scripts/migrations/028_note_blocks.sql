-- Notas con editor de bloques (Tiptap/ProseMirror).
-- blocks: documento JSON del editor ({ type: 'doc', content: [...] }). NULL = nota antigua de texto plano;
--         el cliente la convierte en párrafos al abrirla.
-- content: se mantiene como copia en texto plano para la vista previa y la búsqueda.
-- version: se incrementa en cada guardado; el cliente la envía para detectar ediciones simultáneas (409).
ALTER TABLE personal_notes ADD COLUMN IF NOT EXISTS blocks JSONB;
ALTER TABLE personal_notes ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
