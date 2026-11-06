import React from 'react';
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DisplayText from '../ui/DisplayText';
import { LegalDoc } from '../../constants/legal';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';

// Public, read-only page for Términos / Política de privacidad (no session needed).
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const { colors } = useTheme();
  const back = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.history.length > 1) window.history.back();
      else window.location.assign('/');
    }
  };
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.wrap}>
      <View style={styles.column}>
        <TouchableOpacity onPress={back} style={styles.back} accessibilityRole="link">
          <ArrowLeft size={16} color={colors.primary} />
          <Text style={{ color: colors.primary }}>Volver</Text>
        </TouchableOpacity>
        <DisplayText style={[styles.title, { color: colors.text }]}>{doc.title}</DisplayText>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{doc.intro}</Text>
        {doc.sections.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={[styles.heading, { color: colors.text }]}>{s.title}</Text>
            {s.body.map((p, i) => (
              <Text key={i} style={[styles.body, { color: colors.textSecondary }]}>{p}</Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', padding: SPACING.lg },
  column: { width: '100%', maxWidth: 720, gap: SPACING.md, paddingVertical: SPACING.lg },
  back: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  title: { fontSize: 34, fontWeight: '600' },
  section: { gap: SPACING.sm, marginTop: SPACING.sm },
  heading: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold },
  body: { fontSize: TYPOGRAPHY.sizes.md, lineHeight: 24 },
});
