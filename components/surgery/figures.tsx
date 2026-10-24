// Diagrams referenced by guide blocks ({ type: 'figure', key }). Drawn from scratch in the theme's colours;
// nothing is copied from the books.
import React from 'react';
import Svg, { Rect, Ellipse, Path, Line, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { TYPOGRAPHY, alpha } from '../../constants/tokens';

type Palette = ReturnType<typeof useTheme>['colors'];
type FigureProps = { colors: Palette };

const FONT = TYPOGRAPHY.fontFamily;

/** OVH: the three-clamp technique on the ovarian pedicle */
function OvhThreeClamps({ colors }: FigureProps) {
  const label = { fontFamily: FONT, fontSize: 13, fill: colors.text } as const;
  const small = { fontFamily: FONT, fontSize: 11.5, fill: colors.textSecondary } as const;
  const clamp = (x: number, removed?: boolean) => (
    <Rect x={x} y={56} width={12} height={128} rx={2}
      fill={removed ? 'none' : colors.text} fillOpacity={removed ? 0 : 0.85}
      stroke={removed ? colors.textSecondary : 'none'} strokeWidth={2} strokeDasharray={removed ? '4 3' : undefined} />
  );
  return (
    <Svg width="100%" height={250} viewBox="0 0 680 250" style={{ minWidth: 560, maxWidth: 680 }} accessibilityLabel="Técnica de las tres pinzas en el pedículo ovárico">
      <Ellipse cx={62} cy={120} rx={40} ry={56} fill={colors.surface} stroke={colors.textSecondary} strokeWidth={1.5} />
      <SvgText x={62} y={124} textAnchor="middle" {...small}>riñón</SvgText>
      <Path d="M100 108 C 250 96, 420 96, 560 104 L 560 136 C 420 144, 250 144, 100 132 Z"
        fill={alpha(colors.error, 0.14)} stroke={colors.error} strokeWidth={1.5} />
      <SvgText x={126} y={162} {...small}>pedículo ovárico: arteria y vena ováricas, grasa</SvgText>
      <Ellipse cx={600} cy={120} rx={44} ry={28} fill={alpha(colors.warning, 0.16)} stroke={colors.warning} strokeWidth={2} />
      <SvgText x={600} y={124} textAnchor="middle" {...label}>ovario</SvgText>

      {/* Ligatures */}
      <Rect x={198} y={94} width={7} height={52} rx={1} fill={colors.success} />
      <Rect x={253} y={94} width={7} height={52} rx={1} fill={colors.success} />
      {/* Clamps: 1 is taken off and its crush line receives ligature 1 */}
      {clamp(250, true)}
      {clamp(340)}
      {clamp(440)}
      <Line x1={396} y1={60} x2={396} y2={184} stroke={colors.error} strokeWidth={2} strokeDasharray="6 4" />

      <G>
        <SvgText x={256} y={44} textAnchor="middle" {...label} fontWeight="600">Pinza 1</SvgText>
        <SvgText x={256} y={28} textAnchor="middle" {...small}>proximal, se retira</SvgText>
        <SvgText x={346} y={44} textAnchor="middle" {...label} fontWeight="600">Pinza 2</SvgText>
        <SvgText x={346} y={28} textAnchor="middle" {...small}>sostiene</SvgText>
        <SvgText x={446} y={44} textAnchor="middle" {...label} fontWeight="600">Pinza 3</SvgText>
        <SvgText x={446} y={28} textAnchor="middle" {...small}>distal, evita el reflujo</SvgText>
      </G>
      <G>
        <SvgText x={196} y={206} textAnchor="middle" {...label} fill={colors.success} fontWeight="600">Ligadura 2</SvgText>
        <SvgText x={196} y={222} textAnchor="middle" {...small}>proximal</SvgText>
        <SvgText x={262} y={238} textAnchor="middle" {...label} fill={colors.success} fontWeight="600">Ligadura 1, en el surco</SvgText>
        <SvgText x={396} y={206} textAnchor="middle" {...label} fill={colors.error} fontWeight="600">Corte</SvgText>
        <SvgText x={396} y={222} textAnchor="middle" {...small}>entre la pinza 2 y la 3</SvgText>
        <SvgText x={100} y={40} {...small}>← hacia la aorta</SvgText>
      </G>
    </Svg>
  );
}

export const FIGURES: Record<string, React.ComponentType<FigureProps>> = {
  'ovh-three-clamps': OvhThreeClamps,
};
