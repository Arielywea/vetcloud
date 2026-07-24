import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VetIconProps {
  size?: number;
  color?: string;
}

export default function VetLaboratorio({ size = 24, color = '#C9A227' }: VetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 3h6M10 3v6.5L5 17.5c-.8 1.4.2 3 1.8 3h10.4c1.6 0 2.6-1.6 1.8-3L14 9.5V3" />
      <Path d="M7 15h10" />
    </Svg>
  );
}
