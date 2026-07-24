import React from 'react';
import Svg, { Path, Ellipse, Defs, LinearGradient, Stop, G } from 'react-native-svg';

interface BeagleLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export default function BeagleLogo({ size = 88, variant = 'light' }: BeagleLogoProps) {
  const isDark = variant === 'dark';
  const primary = isDark ? '#C9D6E8' : '#0B1D3A';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#D4A843" />
          <Stop offset="40%" stopColor="#C9A227" />
          <Stop offset="100%" stopColor="#A6841E" />
        </LinearGradient>
        <LinearGradient id="goldGradLight" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#E8C84A" />
          <Stop offset="50%" stopColor="#C9A227" />
          <Stop offset="100%" stopColor="#B8921F" />
        </LinearGradient>
      </Defs>
      <G>
        {/* Crown — ornate fleur-de-lis style */}
        <Path
          d="M 30 32 L 33 18 L 38 26 L 44 12 L 50 22 L 56 12 L 62 26 L 67 18 L 70 32 Z"
          fill="url(#goldGrad)"
          strokeLinejoin="round"
        />
        {/* Crown base bar */}
        <Path
          d="M 28 32 L 72 32 L 72 36 L 28 36 Z"
          fill="url(#goldGrad)"
        />

        {/* Shield exterior — navy fill */}
        <Path
          d="M 20 36 L 20 68 Q 20 85 50 95 Q 80 85 80 68 L 80 36 Z"
          fill={primary}
        />

        {/* Shield gold outer border */}
        <Path
          d="M 17 34 L 17 68 Q 17 87 50 98 Q 83 87 83 68 L 83 34 Z"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Shield gold inner border */}
        <Path
          d="M 23 38 L 23 67 Q 23 83 50 92 Q 77 83 77 67 L 77 38 Z"
          fill="none"
          stroke="url(#goldGradLight)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Paw print — gold with vet cross in center pad */}
        {/* Central pad — large, lower */}
        <Ellipse cx={50} cy={72} rx={12} ry={10} fill="url(#goldGrad)" />

        {/* Vet cross inside central pad — negative space */}
        <Path
          d="M 48.5 66 L 51.5 66 L 51.5 69 L 54 69 L 54 72 L 51.5 72 L 51.5 75 L 48.5 75 L 48.5 72 L 46 72 L 46 69 L 48.5 69 Z"
          fill={primary}
        />

        {/* 4 toe pads — gold */}
        <Ellipse cx={38} cy={56} rx={6.5} ry={5.5} fill="url(#goldGrad)" />
        <Ellipse cx={62} cy={56} rx={6.5} ry={5.5} fill="url(#goldGrad)" />
        <Ellipse cx={33} cy={64} rx={5.5} ry={4.5} fill="url(#goldGrad)" />
        <Ellipse cx={67} cy={64} rx={5.5} ry={4.5} fill="url(#goldGrad)" />
      </G>
    </Svg>
  );
}
