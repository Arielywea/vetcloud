import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

interface EscutcheonProps {
  size?: number;
  /** Outline (or fill when `filled`) */
  color: string;
  /** Initial or short charge drawn on the shield */
  initial?: string;
  initialColor?: string;
  filled?: boolean;
}

// A heater shield, the shape of the crest: used where the template would put a round avatar
// (the signed-in vet's "arms", a patient's mark). Height is size, width 0.82 × size.
export default function Escutcheon({ size = 32, color, initial, initialColor, filled = false }: EscutcheonProps) {
  const w = size * 0.82;
  return (
    <Svg width={w} height={size} viewBox="0 0 41 50" accessibilityElementsHidden importantForAccessibility="no">
      <Path
        d="M2 2 H39 V22 C39 36 29 44 20.5 48 C12 44 2 36 2 22 Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 2}
        strokeLinejoin="miter"
      />
      {initial ? (
        <SvgText
          x={20.5}
          y={29}
          fontSize={22}
          fontWeight="600"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill={initialColor || color}
          textAnchor="middle"
        >
          {initial}
        </SvgText>
      ) : null}
    </Svg>
  );
}
