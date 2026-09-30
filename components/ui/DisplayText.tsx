import React from 'react';
import { Platform, StyleSheet, TextStyle, StyleProp, AccessibilityRole } from 'react-native';
import { Text } from 'react-native-paper';

interface DisplayTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  /** Page titles are headings for screen readers; pass 'text' for the wordmark */
  accessibilityRole?: AccessibilityRole;
}

// Serif display face (Cormorant Garamond on web) for page titles, the
// wordmark and patient names only — never labels, buttons or data.
// Cormorant has a small x-height, so sizes are optically enlarged ~18%
// to sit level with the Inter they replace.
export default function DisplayText({ children, style, numberOfLines, accessibilityRole = 'header' }: DisplayTextProps) {
  const flat = StyleSheet.flatten(style) || {};
  const isWeb = Platform.OS === 'web';
  const optical: TextStyle = isWeb && flat.fontSize
    ? { fontSize: Math.round(flat.fontSize * 1.18), lineHeight: Math.round(flat.fontSize * 1.18 * 1.12) }
    : {};
  const webProps: any = isWeb ? { dataSet: { font: 'display' } } : {};

  return (
    <Text
      {...webProps}
      numberOfLines={numberOfLines}
      accessibilityRole={accessibilityRole}
      style={[{ fontWeight: '600', letterSpacing: 0.2 }, flat, optical]}
    >
      {children}
    </Text>
  );
}
