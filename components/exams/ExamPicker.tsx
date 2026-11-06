import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import VButton from '../ui/Button';
import VInput from '../ui/Input';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import { EXAM_CATALOG, EXAM_GROUPS } from '../../constants/examCatalog';

export interface ExamSelection { keys: string[]; other: string }
export const emptySelection = (): ExamSelection => ({ keys: [], other: '' });

/** Rows for POST /items/lab_exam_orders */
export function selectionToExams(sel: ExamSelection) {
  const picked = EXAM_CATALOG.filter((e) => sel.keys.includes(e.key)).map((e) => ({ exam_name: e.label, exam_type: e.type }));
  const other = sel.other.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean).map((exam_name) => ({ exam_name, exam_type: 'otro' }));
  return [...picked, ...other];
}

// Toggle chips grouped like the clinical form's complementary-exam list
export default function ExamPicker({ value, onChange }: { value: ExamSelection; onChange: (v: ExamSelection) => void }) {
  const { colors } = useTheme();
  const toggle = (key: string) => onChange({ ...value, keys: value.keys.includes(key) ? value.keys.filter((k) => k !== key) : [...value.keys, key] });
  return (
    <View>
      {EXAM_GROUPS.map((g) => (
        <View key={g} style={styles.group}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{g}</Text>
          <View style={styles.chips}>
            {EXAM_CATALOG.filter((e) => e.group === g).map((e) => (
              <VButton key={e.key} size="sm" variant={value.keys.includes(e.key) ? 'filled' : 'secondary'} onPress={() => toggle(e.key)}
                accessibilityLabel={`${e.label}${value.keys.includes(e.key) ? ', seleccionado' : ''}`}>{e.label}</VButton>
            ))}
          </View>
        </View>
      ))}
      <VInput label="Otros exámenes" value={value.other} onChangeText={(v) => onChange({ ...value, other: v })} placeholder="Separados por coma" />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginBottom: SPACING.md },
  label: { fontSize: TYPOGRAPHY.sizes.sm, marginBottom: SPACING.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
});
