import React from 'react';
import Svg, { Path, Circle, G, Ellipse } from 'react-native-svg';

interface RoundTableIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export default function RoundTableIcon({ size = 48, color = '#8896A8', accentColor = '#C9A227' }: RoundTableIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <G>
        {/* Table top - oval perspective */}
        <Ellipse cx={24} cy={20} rx={16} ry={8} fill={color} opacity={0.15} />
        <Ellipse cx={24} cy={20} rx={16} ry={8} stroke={color} strokeWidth={1.5} fill="none" opacity={0.4} />
        {/* Table legs */}
        <Path d="M12 24 L10 38" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
        <Path d="M36 24 L38 38" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
        <Path d="M24 26 L24 40" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
        {/* Gold crown on table */}
        <Path
          d="M18 16 L20 12 L24 14 L28 12 L30 16 Z"
          fill={accentColor}
          opacity={0.6}
        />
        {/* Shield emblem on table */}
        <Path
          d="M24 18 L28 20 L28 24 Q28 26 24 28 Q20 26 20 24 L20 20 Z"
          fill={accentColor}
          opacity={0.3}
        />
      </G>
    </Svg>
  );
}