import React from 'react';
import { View, StyleSheet, Image, ImageStyle, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { RADIUS, TYPOGRAPHY } from '../../constants/tokens';

interface VAvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export default function VAvatar({ source, name, size = 40, style }: VAvatarProps) {
  const { colors } = useTheme();

  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (source) {
    return (
      <Image
        source={source}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          } as ImageStyle,
          style as ImageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryContainer,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: colors.primary,
            fontSize: size * 0.35,
          },
        ]}
      >
        {getInitials()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
