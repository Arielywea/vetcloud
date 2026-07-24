import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface VetIconProps {
  size?: number;
  color?: string;
}

export default function VetPacientes({ size = 24, color = '#C9A227' }: VetIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M11 18c-4.42 0-8-2.69-8-6s3.58-6 8-6 8 2.69 8 6-3.58 6-8 6z" />
      <Path d="M8.5 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
      <Path d="M13.5 10.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z" />
      <Path d="M11 14c0-.55.45-1 1-1s1 .45 1 1" />
    </Svg>
  );
}
