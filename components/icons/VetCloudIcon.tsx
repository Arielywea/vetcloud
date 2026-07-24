import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type VetCloudIconName =
  | 'dashboard'
  | 'pacientes'
  | 'enfermedades'
  | 'agenda'
  | 'hospitalizacion'
  | 'laboratorio'
  | 'inventario'
  | 'reportes'
  | 'configuracion';

interface VetCloudIconProps {
  name: VetCloudIconName;
  size?: number;
  color?: string;
}

function DashboardIcon({ color }: { color: string }) {
  return (
    <>
      <Rect width="7" height="9" x="3" y="3" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Rect width="7" height="5" x="14" y="3" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Rect width="7" height="9" x="14" y="12" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Rect width="7" height="5" x="3" y="16" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Branding: small gold rhombus top-right accent */}
      <Path d="M19.5 1.5l1 1-1 1-1-1z" fill={color} opacity="0.5" />
    </>
  );
}

function PacientesIcon({ color }: { color: string }) {
  return (
    <>
      <Circle cx="11" cy="4" r="2" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="18" cy="8" r="2" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="20" cy="16" r="2" stroke={color} strokeWidth="2" fill="none" />
      <Path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Branding: subtle double line on pad */}
      <Path d="M9.2 10.8a4.2 4.2 0 0 1 4.3 3.7" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" fill="none" />
    </>
  );
}

function EnfermedadesIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Branding: metallic accent dot on heart curve */}
      <Circle cx="12" cy="7" r="1.2" fill={color} opacity="0.4" />
    </>
  );
}

function AgendaIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M8 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Rect width="18" height="18" x="3" y="4" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Branding: extended post tops */}
      <Path d="M8 1.5v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <Path d="M16 1.5v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </>
  );
}

function HospitalizacionIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M12 7v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 21v-3a2 2 0 0 0-4 0v3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 9h-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Branding: beveled top-right corner */}
      <Path d="M18 3l2 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </>
  );
}

function LaboratorioIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M6.453 15h11.094" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.5 2h7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Branding: gold diamond stopper */}
      <Path d="M12 1l1 1.5-1 1.5-1-1.5z" fill={color} opacity="0.45" />
    </>
  );
}

function InventarioIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M12 22V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3.29 7 12 12 20.71 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="m7.5 4.27 9 5.15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Branding: double line on lid */}
      <Path d="M4.5 7.5l7.5 4.3 7.5-4.3" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.3" fill="none" />
    </>
  );
}

function ReportesIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M3 3v16a2 2 0 0 0 2 2h16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 17V9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13 17V5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 17v-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Branding: arrow tip accent on y-axis */}
      <Path d="M3 2.5l1.5 1-1.5 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" fill="none" />
    </>
  );
}

function ConfiguracionIcon({ color }: { color: string }) {
  return (
    <>
      <Path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
      {/* Branding: center dot accent */}
      <Circle cx="12" cy="12" r="1" fill={color} opacity="0.4" />
    </>
  );
}

const ICONS: Record<VetCloudIconName, React.FC<{ color: string }>> = {
  dashboard: DashboardIcon,
  pacientes: PacientesIcon,
  enfermedades: EnfermedadesIcon,
  agenda: AgendaIcon,
  hospitalizacion: HospitalizacionIcon,
  laboratorio: LaboratorioIcon,
  inventario: InventarioIcon,
  reportes: ReportesIcon,
  configuracion: ConfiguracionIcon,
};

export default function VetCloudIcon({ name, size = 24, color = '#C9A227' }: VetCloudIconProps) {
  const IconComponent = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <IconComponent color={color} />
    </Svg>
  );
}
