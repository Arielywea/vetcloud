import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// One consistent line-icon set for navigation and dashboard surfaces:
// 24px grid, 1.75 stroke, round caps/joins, no decorative fills.

export type VetCloudIconName =
  | 'dashboard'
  | 'pacientes'
  | 'enfermedades'
  | 'medicamentos'
  | 'cirugias'
  | 'agenda'
  | 'hospitalizacion'
  | 'laboratorio'
  | 'inventario'
  | 'reportes'
  | 'configuracion'
  | 'notas'
  | 'recordatorios'
  | 'fluidoterapia'
  | 'dosis'
  | 'consulta'
  | 'fichas';

interface VetCloudIconProps {
  name: VetCloudIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

type GlyphProps = { s: { stroke: string; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round'; fill: 'none' } };

const GLYPHS: Record<VetCloudIconName, React.FC<GlyphProps>> = {
  dashboard: ({ s }) => (
    <>
      <Rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...s} />
      <Rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...s} />
      <Rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...s} />
      <Rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...s} />
    </>
  ),
  pacientes: ({ s }) => (
    <>
      <Path d="M12 12.5c-2.6 0-5 2.6-5 5 0 1.6 1.2 2.5 2.6 2.5.9 0 1.5-.4 2.4-.4s1.5.4 2.4.4c1.4 0 2.6-.9 2.6-2.5 0-2.4-2.4-5-5-5z" {...s} />
      <Circle cx="5.5" cy="11" r="1.7" {...s} />
      <Circle cx="9" cy="6.5" r="1.9" {...s} />
      <Circle cx="15" cy="6.5" r="1.9" {...s} />
      <Circle cx="18.5" cy="11" r="1.7" {...s} />
    </>
  ),
  enfermedades: ({ s }) => (
    <>
      <Circle cx="12" cy="12" r="5" {...s} />
      <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.9 2.9M18.4 5.6l-2.9 2.9M5.6 18.4l2.9-2.9M18.4 18.4l-2.9-2.9" {...s} />
      <Path d="M10.8 3h2.4M10.8 21h2.4M3 10.8v2.4M21 10.8v2.4" {...s} />
      <Circle cx="10.5" cy="11" r="0.6" {...s} />
      <Circle cx="13.5" cy="13.3" r="0.6" {...s} />
    </>
  ),
  medicamentos: ({ s }) => (
    <>
      <Path d="M10.5 20.5a4.95 4.95 0 0 1-7-7l6-6a4.95 4.95 0 0 1 7 7z" {...s} />
      <Path d="M8.5 8.5l7 7" {...s} />
    </>
  ),
  cirugias: ({ s }) => (
    <>
      <Path d="M10 14l-5.5 5.5a1.06 1.06 0 0 0 1.5 1.5l5.5-5.5" {...s} />
      <Path d="M10 14l8.5-8.5c1.3-1.3 2.8-1.9 2.4-.6-.6 2.1-3.1 5.7-9.4 10.6z" {...s} />
    </>
  ),
  agenda: ({ s }) => (
    <>
      <Rect x="3" y="5" width="18" height="16" rx="2.5" {...s} />
      <Path d="M3 10h18M8 3v4M16 3v4" {...s} />
      <Rect x="13" y="13.5" width="4" height="4" rx="1" {...s} />
    </>
  ),
  hospitalizacion: ({ s }) => (
    <>
      <Path d="M3 5v15M3 16h18v4" {...s} />
      <Path d="M10 16v-4h8a3 3 0 0 1 3 3v1" {...s} />
      <Circle cx="6.5" cy="13" r="1.8" {...s} />
      <Path d="M16 3.5v4M14 5.5h4" {...s} />
    </>
  ),
  laboratorio: ({ s }) => (
    <>
      <Path d="M9 3h6" {...s} />
      <Path d="M10 3v6l-5.2 9.2A1.9 1.9 0 0 0 6.5 21h11a1.9 1.9 0 0 0 1.7-2.8L14 9V3" {...s} />
      <Path d="M7.2 15h9.6" {...s} />
    </>
  ),
  inventario: ({ s }) => (
    <>
      <Path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z" {...s} />
      <Path d="M3 7.5l9 4.5 9-4.5M12 12v9M7.5 5.25l9 4.5" {...s} />
    </>
  ),
  reportes: ({ s }) => (
    <>
      <Path d="M3.5 20.5h17" {...s} />
      <Rect x="5.5" y="12" width="3" height="8.5" rx="0.8" {...s} />
      <Rect x="10.5" y="6" width="3" height="14.5" rx="0.8" {...s} />
      <Rect x="15.5" y="9.5" width="3" height="11" rx="0.8" {...s} />
    </>
  ),
  configuracion: ({ s }) => (
    <>
      <Path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h10M18 18h2" {...s} />
      <Circle cx="14" cy="6" r="2" {...s} />
      <Circle cx="8" cy="12" r="2" {...s} />
      <Circle cx="16" cy="18" r="2" {...s} />
    </>
  ),
  notas: ({ s }) => (
    <>
      <Rect x="5" y="3" width="14" height="18" rx="2" {...s} />
      <Path d="M8.5 3v18M12 8h4M12 12h4M12 16h2" {...s} />
    </>
  ),
  recordatorios: ({ s }) => (
    <>
      <Path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" {...s} />
      <Path d="M10 21a2 2 0 0 0 4 0M12 3v2" {...s} />
    </>
  ),
  fluidoterapia: ({ s }) => (
    <>
      <Path d="M8 3h8a1 1 0 0 1 1 1v8a5 5 0 0 1-10 0V4a1 1 0 0 1 1-1z" {...s} />
      <Path d="M7 9h10M12 17v1.5" {...s} />
      <Rect x="10.5" y="18.5" width="3" height="3" rx="0.8" {...s} />
    </>
  ),
  dosis: ({ s }) => (
    <>
      <Path d="M12.6 5.6l2.8 2.8-8 8-2.8-2.8z" {...s} />
      <Path d="M6 15l-3 3M14 7l3-3M15.6 2.6l2.8 2.8M10.6 7.6l1 1M8.6 9.6l1 1" {...s} />
    </>
  ),
  consulta: ({ s }) => (
    <>
      <Path d="M5 3v5a4 4 0 0 0 8 0V3M4 3h2M12 3h2" {...s} />
      <Path d="M9 12v3a5 5 0 0 0 10 0v-2" {...s} />
      <Circle cx="19" cy="11" r="2" {...s} />
    </>
  ),
  fichas: ({ s }) => (
    <>
      <Rect x="5" y="4" width="14" height="17" rx="2" {...s} />
      <Rect x="9" y="2.5" width="6" height="3" rx="1" {...s} />
      <Path d="M9 11h6M9 15h4" {...s} />
    </>
  ),
};

export default function VetCloudIcon({ name, size = 24, color = '#C9A227', strokeWidth = 1.75 }: VetCloudIconProps) {
  const Glyph = GLYPHS[name] || GLYPHS.dashboard;
  const s = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Glyph s={s} />
    </Svg>
  );
}
