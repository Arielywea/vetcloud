import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VetIconProps {
  size?: number;
  color?: string;
}

export default function VetStatAlertas({ size = 24, color = '#C9A227' }: VetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" />
      <Path d="M12 2v1" />
    </Svg>
  );
}
