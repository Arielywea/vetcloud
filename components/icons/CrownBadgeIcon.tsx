import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface CrownBadgeIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export default function CrownBadgeIcon({ size = 16, color = '#C9A227', accentColor = '#0B1D3A' }: CrownBadgeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <G>
        {/* Crown base */}
        <Path
          d="M3 12 L4 6 L8 9 L12 6 L13 12 Z"
          fill={color}
          opacity={0.9}
        />
        {/* Crown tips */}
        <Path d="M4 6 L5 3" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M8 9 L8 4" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M12 6 L11 3" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        {/* Crown jewels */}
        <Path d="M4 6 L5 3 L6 6 Z" fill={accentColor} opacity={0.6} />
        <Path d="M7.5 9 L8 5 L8.5 9 Z" fill={accentColor} opacity={0.6} />
        <Path d="M10 6 L11 3 L12 6 Z" fill={accentColor} opacity={0.6} />
      </G>
    </Svg>
  );
}