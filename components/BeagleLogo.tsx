import React from 'react';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';

interface BeagleLogoProps {
  size?: number;
  variant?: 'light' | 'dark';
}

export default function BeagleLogo({ size = 88, variant = 'light' }: BeagleLogoProps) {
  const scale = size / 88;
  const isDark = variant === 'dark';

  const faceColor = isDark ? '#E8E0D8' : '#FFFFFF';
  const earColor = isDark ? '#6D4C41' : '#8D6E63';
  const capColor = isDark ? '#4E342E' : '#5D4037';
  const eyeColor = '#1A1A1A';
  const noseColor = '#1A1A1A';
  const chestColor = isDark ? '#D7CCC8' : '#FFFFFF';

  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <G>
        {/* Left ear */}
        <Ellipse cx={18} cy={42} rx={14} ry={22} fill={earColor} />

        {/* Right ear */}
        <Ellipse cx={70} cy={42} rx={14} ry={22} fill={earColor} />

        {/* Chest patch */}
        <Ellipse cx={44} cy={76} rx={18} ry={12} fill={chestColor} />

        {/* Face circle */}
        <Circle cx={44} cy={44} r={28} fill={faceColor} />

        {/* Cap marking (forehead) */}
        <Path
          d="M 26 38 Q 30 18 44 16 Q 58 18 62 38 Q 56 30 44 28 Q 32 30 26 38 Z"
          fill={capColor}
        />

        {/* Left eyebrow area */}
        <Ellipse cx={34} cy={34} rx={7} ry={3} fill={earColor} opacity={0.3} />

        {/* Right eyebrow area */}
        <Ellipse cx={54} cy={34} rx={7} ry={3} fill={earColor} opacity={0.3} />

        {/* Left eye white */}
        <Circle cx={34} cy={44} r={6} fill={faceColor} />

        {/* Left eye pupil */}
        <Circle cx={35} cy={44} r={3.5} fill={eyeColor} />

        {/* Left eye highlight */}
        <Circle cx={36} cy={42.5} r={1.2} fill="#FFFFFF" />

        {/* Right eye white */}
        <Circle cx={54} cy={44} r={6} fill={faceColor} />

        {/* Right eye pupil */}
        <Circle cx={53} cy={44} r={3.5} fill={eyeColor} />

        {/* Right eye highlight */}
        <Circle cx={54} cy={42.5} r={1.2} fill="#FFFFFF" />

        {/* Nose */}
        <Path
          d="M 44 52 L 40 48 Q 44 45 48 48 Z"
          fill={noseColor}
        />

        {/* Nose tip highlight */}
        <Ellipse cx={44} cy={47} rx={1.5} ry={1} fill="#FFFFFF" opacity={0.3} />

        {/* Mouth - left */}
        <Path
          d="M 40 50 Q 36 54 32 52"
          stroke={noseColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />

        {/* Mouth - right */}
        <Path
          d="M 48 50 Q 52 54 56 52"
          stroke={noseColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}
