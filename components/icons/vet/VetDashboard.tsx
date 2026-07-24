import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VetIconProps {
  size?: number;
  color?: string;
}

export default function VetDashboard({ size = 24, color = '#C9A227' }: VetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
      <Path d="M9 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S11.33 13 10.5 13 9 12.33 9 11.5z" />
      <Path d="M14 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
      <Path d="M10 15c0-.83.67-1.5 1.5-1.5S13 14.17 13 15s-.67 1.5-1.5 1.5S10 15.83 10 15z" />
      <Path d="M12 15c0-.83.67-1.5 1.5-1.5S15 14.17 15 15s-.67 1.5-1.5 1.5S12 15.83 12 15z" />
      <Path d="M10.5 18c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1z" />
    </Svg>
  );
}
