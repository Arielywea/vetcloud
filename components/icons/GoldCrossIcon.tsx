import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface GoldCrossIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export default function GoldCrossIcon({ size = 24, color = '#C9A227', accentColor = '#0B1D3A' }: GoldCrossIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Outer shield circle */}
        <Path
          d="M12 2 Q20 2 22 10 Q22 18 12 22 Q2 18 2 10 Q2 2 12 2"
          fill={accentColor}
          opacity={0.1}
        />
        <Path
          d="M12 2 Q20 2 22 10 Q22 18 12 22 Q2 18 2 10 Q2 2 12 2"
          stroke={color}
          strokeWidth={1}
          fill="none"
          opacity={0.4}
        />
        {/* Vertical cross bar */}
        <Path
          d="M12 6 L12 18"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Horizontal cross bar */}
        <Path
          d="M6 12 L18 12"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {/* Gold accent dots at cross ends */}
        <Path d="M12 5 Q14 5 12 6 Q10 5 12 5" fill={color} />
        <Path d="M12 19 Q14 19 12 18 Q10 19 12 19" fill={color} />
        <Path d="M5 12 Q5 10 6 12 Q5 14 5 12" fill={color} />
        <Path d="M19 12 Q19 10 18 12 Q19 14 19 12" fill={color} />
      </G>
    </Svg>
  );
}