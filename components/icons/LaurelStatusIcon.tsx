import React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface LaurelStatusIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
  active?: boolean;
}

export default function LaurelStatusIcon({ size = 20, color = '#10B981', accentColor = '#C9A227', active = true }: LaurelStatusIconProps) {
  const opacity = active ? 1 : 0.4;
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <G opacity={opacity}>
        {/* Left laurel branch */}
        <Path
          d="M4 14 Q2 10 4 6 Q6 8 5 10 Q4 12 6 14"
          stroke={accentColor}
          strokeWidth={1.2}
          fill={accentColor}
          opacity={0.6}
        />
        {/* Right laurel branch */}
        <Path
          d="M16 14 Q18 10 16 6 Q14 8 15 10 Q16 12 14 14"
          stroke={accentColor}
          strokeWidth={1.2}
          fill={accentColor}
          opacity={0.6}
        />
        {/* Status dot center */}
        <Circle cx={10} cy={10} r={3.5} fill={color} />
        {/* Inner highlight */}
        <Circle cx={10} cy={10} r={2} fill={color} opacity={0.6} />
      </G>
    </Svg>
  );
}