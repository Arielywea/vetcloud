// Native fallback for the block editor (the Tiptap editor lives in NoteEditor.web.tsx).
// Plain notes stay editable as text; notes with headings, lists or formatting are shown
// read-only so a phone edit can never flatten their structure.
import React, { useEffect, useState } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { TYPOGRAPHY, SPACING } from '../../constants/tokens';
import { NoteEditorProps, docToText, textToDoc, isPlainDoc } from './noteDoc';

export default function NoteEditor({ docKey, initialDoc, onChange, autoFocus }: NoteEditorProps) {
  const { colors } = useTheme();
  const [text, setText] = useState(() => docToText(initialDoc));
  const plain = isPlainDoc(initialDoc);

  useEffect(() => { setText(docToText(initialDoc)); }, [docKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!plain) {
    return (
      <View>
        <Text style={[styles.hint, { color: colors.textLight }]}>Esta nota tiene formato; edítala desde la versión web.</Text>
        <Text style={[styles.body, { color: colors.text }]}>{text}</Text>
      </View>
    );
  }

  return (
    <TextInput
      style={[styles.body, styles.input, { color: colors.text }]}
      value={text}
      onChangeText={(t) => { setText(t); onChange(textToDoc(t), t); }}
      multiline
      autoFocus={autoFocus}
      placeholder="Escribe tu nota"
      placeholderTextColor={colors.textLight}
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  body: { fontSize: TYPOGRAPHY.sizes.base, lineHeight: 24 },
  input: { minHeight: 320, padding: 0 },
  hint: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.md },
});
