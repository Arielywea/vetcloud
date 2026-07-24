import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface VetIconProps {
  size?: number;
  color?: string;
}

export default function VetStatCitas({ size = 24, color = '#C9A227' }: VetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="18" rx="2" />
      <Path d="M16 2v4M8 2v4M3 10h18" />
      <Path d="M9 16l2 2 4-4" />
    </Svg>
  );
}
