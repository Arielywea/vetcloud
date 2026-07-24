import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VetIconProps {
  size?: number;
  color?: string;
}

export default function VetEnfermedades({ size = 24, color = '#C9A227' }: VetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  );
}
