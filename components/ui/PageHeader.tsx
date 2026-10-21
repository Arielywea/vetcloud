import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../constants/tokens';
import DisplayText from './DisplayText';

interface PageHeaderProps {
  title: string;
  /** One line of context: a count, what the page is for */
  subtitle?: string;
  /** The page's primary action (and at most one or two secondary ones), right-aligned */
  actions?: React.ReactNode;
}

// One heading pattern for every page: the title in Cormorant like a chapter of the codex, a line
// of context, and the page's own actions. Creating lives here, never in a floating button.
export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <DisplayText style={[styles.title, { color: colors.text }]} numberOfLines={2}>{title}</DisplayText>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: SPACING.md, marginBottom: SPACING.xl },
  text: { flexGrow: 1, flexShrink: 1, minWidth: 220 },
  title: { fontSize: 36, lineHeight: 40, fontWeight: '600' },
  subtitle: { fontSize: TYPOGRAPHY.sizes.base, marginTop: SPACING.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
});
