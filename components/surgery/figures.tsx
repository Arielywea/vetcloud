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

/** Orchiectomy: the layers around the testis, in section */
function TestisLayers({ colors }: FigureProps) {
  const label = { fontFamily: FONT, fontSize: 13, fill: colors.text } as const;
  const small = { fontFamily: FONT, fontSize: 11.5, fill: colors.textSecondary } as const;
  const rings = [
    { rx: 170, ry: 122, fill: colors.surface, stroke: colors.textSecondary, w: 2 },
    { rx: 150, ry: 104, fill: colors.surface, stroke: colors.textSecondary, w: 1.5, dash: '5 4' },
    { rx: 132, ry: 90, fill: alpha(colors.primary, 0.1), stroke: colors.primary, w: 3 },
    { rx: 112, ry: 74, fill: colors.surface, stroke: colors.primary, w: 1.5 },
    { rx: 104, ry: 68, fill: alpha(colors.warning, 0.16), stroke: colors.warning, w: 2.5 },
  ];
  const leaders: [number, number, number][] = [[285, 44, 30], [315, 83, 72], [324, 119, 114], [322, 150, 156], [305, 175, 198], [274, 198, 240]];
  return (
    <Svg width="100%" height={300} viewBox="0 0 660 300" style={{ minWidth: 560, maxWidth: 660 }} accessibilityLabel="Capas del testículo en corte">
      {rings.map((r, i) => (
        <Ellipse key={i} cx={200} cy={150} rx={r.rx} ry={r.ry} fill={r.fill} stroke={r.stroke} strokeWidth={r.w} strokeDasharray={r.dash} />
      ))}
      <SvgText x={200} y={146} textAnchor="middle" {...label}>parénquima</SvgText>
      <SvgText x={200} y={164} textAnchor="middle" {...small}>nunca se incide</SvgText>
      {leaders.map(([x, y, ty], i) => (
        <G key={i}>
          <Line x1={x} y1={y} x2={420} y2={ty} stroke={colors.textSecondary} strokeWidth={1} />
        </G>
      ))}
      <SvgText x={428} y={34} {...label}>Piel y dartos</SvgText>
      <SvgText x={428} y={76} {...label}>Fascia espermática</SvgText>
      <SvgText x={428} y={118} {...label} fill={colors.primary} fontWeight="600">Túnica vaginal parietal</SvgText>
      <SvgText x={428} y={134} {...small}>abierta: se incide · cerrada: intacta</SvgText>
      <SvgText x={428} y={160} {...label}>Cavidad vaginal</SvgText>
      <SvgText x={428} y={176} {...small}>se comunica con el peritoneo</SvgText>
      <SvgText x={428} y={202} {...label}>Túnica vaginal visceral</SvgText>
      <SvgText x={428} y={244} {...label} fill={colors.warning} fontWeight="600">Túnica albugínea</SvgText>
      <SvgText x={428} y={260} {...small}>no se incide: expone el parénquima</SvgText>
    </Svg>
  );
}

/** Incisional gastropexy: pyloric antrum sutured to the right transversus abdominis, seen from the surgeon's side */
function IncisionalGastropexy({ colors }: FigureProps) {
  const label = { fontFamily: FONT, fontSize: 13, fill: colors.text } as const;
  const small = { fontFamily: FONT, fontSize: 11.5, fill: colors.textSecondary } as const;
  return (
    <Svg width="100%" height={280} viewBox="0 0 660 280" style={{ minWidth: 560, maxWidth: 660 }} accessibilityLabel="Gastropexia incisional del antro pilórico a la pared derecha">
      {/* Right body wall */}
      <Rect x={470} y={20} width={150} height={240} fill={alpha(colors.error, 0.08)} stroke={colors.textSecondary} strokeWidth={1.5} />
      <SvgText x={545} y={42} textAnchor="middle" {...label}>Pared derecha</SvgText>
      <SvgText x={545} y={58} textAnchor="middle" {...small}>transverso del abdomen</SvgText>
      {/* Last rib */}
      <Line x1={470} y1={86} x2={620} y2={70} stroke={colors.textSecondary} strokeWidth={3} />
      <SvgText x={600} y={92} textAnchor="end" {...small}>última costilla</SvgText>
      {/* Stomach */}
      <Path d="M60 60 C 140 20, 260 30, 330 80 C 380 115, 420 130, 455 140 L 455 186 C 410 182, 360 176, 320 190 C 250 220, 120 230, 70 180 C 30 140, 30 90, 60 60 Z"
        fill={alpha(colors.warning, 0.14)} stroke={colors.warning} strokeWidth={2} />
      <SvgText x={150} y={130} textAnchor="middle" {...label}>Estómago</SvgText>
      <SvgText x={150} y={148} textAnchor="middle" {...small}>fundus y cuerpo a la izquierda</SvgText>
      <SvgText x={405} y={220} textAnchor="middle" {...small}>antro pilórico</SvgText>
      {/* Seromuscular incision on the antrum and incision in the transversus, both opened into an ellipse */}
      <Ellipse cx={405} cy={163} rx={34} ry={7} fill={alpha(colors.error, 0.25)} stroke={colors.primary} strokeWidth={2} />
      <Ellipse cx={540} cy={163} rx={34} ry={7} fill={alpha(colors.error, 0.25)} stroke={colors.primary} strokeWidth={2} />
      {/* Cranial edges joined (above) and caudal edges joined (below): one stitch line each */}
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Path d={`M${385 + i * 14} 156 Q ${472 + i * 2} ${132 - i * 2} ${520 + i * 14} 156`} stroke={colors.success} strokeWidth={1.5} fill="none" />
          <Path d={`M${385 + i * 14} 170 Q ${472 + i * 2} ${194 + i * 2} ${520 + i * 14} 170`} stroke={colors.success} strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
        </G>
      ))}
      <SvgText x={230} y={252} textAnchor="middle" {...label} fill={colors.primary} fontWeight="600">Incisiones de 4–5 cm en el antro y en el transverso</SvgText>
      <SvgText x={230} y={270} textAnchor="middle" {...small}>continuo craneal (línea llena) y caudal (línea punteada) con PDS 2-0</SvgText>
    </Svg>
  );
}

export const FIGURES: Record<string, React.ComponentType<FigureProps>> = {
  'ovh-three-clamps': OvhThreeClamps,
  'testis-layers': TestisLayers,
  'gastropexy-incisional': IncisionalGastropexy,
};
