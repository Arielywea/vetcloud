import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface PawShieldIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export default function PawShieldIcon({ size = 80, color = '#0B1D3A', accentColor = '#C9A227' }: PawShieldIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <G>
        {/* Shield body */}
        <Path
          d="M40 4 L68 16 L68 40 Q68 60 40 76 Q12 60 12 40 L12 16 Z"
          fill={color}
          opacity={0.9}
        />
        {/* Shield inner border */}
        <Path
          d="M40 8 L64 18 L64 40 Q64 57 40 72 Q16 57 16 40 L16 18 Z"
          stroke={accentColor}
          strokeWidth={1.5}
          fill="none"
          opacity={0.6}
        />
        {/* Paw pad - center */}
        <Circle cx={40} cy={38} r={8} fill={accentColor} opacity={0.9} />
        {/* Paw pad - top left */}
        <Circle cx={30} cy={28} r={4.5} fill={accentColor} opacity={0.8} />
        {/* Paw pad - top right */}
        <Circle cx={50} cy={28} r={4.5} fill={accentColor} opacity={0.8} />
        {/* Paw pad - bottom left */}
        <Circle cx={26} cy={40} r={3.5} fill={accentColor} opacity={0.7} />
        {/* Paw pad - bottom right */}
        <Circle cx={54} cy={40} r={3.5} fill={accentColor} opacity={0.7} />
        {/* Shield top accent line */}
        <Path
          d="M20 16 L40 8 L60 16"
          stroke={accentColor}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}