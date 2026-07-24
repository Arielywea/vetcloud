import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface BeagleLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export default function BeagleLogo({ size = 88 }: BeagleLogoProps) {
  return (
    <Image
      source={require('../assets/logo.png')}
      style={{ width: size, height: size } as ImageStyle}
      resizeMode="contain"
    />
  );
}
