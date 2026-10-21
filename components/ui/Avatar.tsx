import React from 'react';
import { View, Image, ImageStyle, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS } from '../../constants/tokens';
import Escutcheon from '../icons/Escutcheon';

interface VAvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

// A patient's mark: their photo when there is one, otherwise a shield bearing their initial
// (the round initial avatar was the template default; the shield belongs to this clinic's crest).
export default function VAvatar({ source, name, size = 40, style }: VAvatarProps) {
  const { colors } = useTheme();

  if (source) {
    return (
      <Image
        source={source}
        style={[{ width: size, height: size, borderRadius: RADIUS.sm } as ImageStyle, style as ImageStyle]}
      />
    );
  }

  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
      <Escutcheon size={size} color={colors.primary} initial={initial} initialColor={colors.primary} />
    </View>
  );
}
