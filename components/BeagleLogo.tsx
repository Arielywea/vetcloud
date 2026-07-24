import React from 'react';
import Svg, { Path, Ellipse, G } from 'react-native-svg';

interface BeagleLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export default function BeagleLogo({ size = 88, variant = 'light' }: BeagleLogoProps) {
  const isDark = variant === 'dark';
  const primary = isDark ? '#C9D6E8' : '#0B1D3A';
  const secondary = '#C9A227';
  const interior = '#FFFFFF';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Crown — 5 geometric points */}
        <Path
          d="M 3.5 7 L 5.5 2.5 L 8 5.5 L 12 0.5 L 16 5.5 L 18.5 2.5 L 20.5 7 Z"
          fill={secondary}
          strokeLinejoin="round"
        />

        {/* Shield exterior — single symmetric path */}
        <Path
          d="M 3 7 L 3 15.5 Q 3 19.5 7.5 21.5 L 12 23.5 L 16.5 21.5 Q 21 19.5 21 15.5 L 21 7 Z"
          fill={primary}
          stroke={secondary}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />

        {/* Shield interior — white field */}
        <Path
          d="M 5 8 L 5 15 Q 5 18.5 8.5 20 L 12 21.5 L 15.5 20 Q 19 18.5 19 15 L 19 8 Z"
          fill={interior}
        />

        {/* Paw silhouette — negative-space cross */}
        {/* Central pad — large, lower */}
        <Ellipse cx={12} cy={16.5} rx={3} ry={2.5} fill={primary} />

        {/* 4 toe pads — gaps form a + cross */}
        <Ellipse cx={9.3} cy={11.2} rx={1.7} ry={1.4} fill={primary} />
        <Ellipse cx={14.7} cy={11.2} rx={1.7} ry={1.4} fill={primary} />
        <Ellipse cx={9.3} cy={13.8} rx={1.6} ry={1.3} fill={primary} />
        <Ellipse cx={14.7} cy={13.8} rx={1.6} ry={1.3} fill={primary} />
      </G>
    </Svg>
  );
}
