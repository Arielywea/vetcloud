import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface SwordPawIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export default function SwordPawIcon({ size = 24, color = '#3B82F6', accentColor = '#C9A227' }: SwordPawIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Sword blade */}
        <Path
          d="M12 2 L14 10 L12 22 L10 10 Z"
          fill={color}
          opacity={0.8}
        />
        {/* Sword guard */}
        <Path
          d="M8 10 L16 10"
          stroke={accentColor}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Sword handle */}
        <Path
          d="M12 14 L12 18"
          stroke={accentColor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Paw print on blade */}
        <Circle cx={12} cy={7} r={2} fill={accentColor} opacity={0.9} />
        <Circle cx={9.5} cy={5} r={1.2} fill={accentColor} opacity={0.8} />
        <Circle cx={14.5} cy={5} r={1.2} fill={accentColor} opacity={0.8} />
      </G>
    </Svg>
  );
}