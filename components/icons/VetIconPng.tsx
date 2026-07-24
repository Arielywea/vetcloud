import React from 'react';
import { Image, ImageStyle } from 'react-native';

const ICONS = {
  dashboard: require('../../assets/icons/icon-dashboard.png'),
  pacientes: require('../../assets/icons/icon-pacientes.png'),
  enfermedades: require('../../assets/icons/icon-enfermedades.png'),
  agenda: require('../../assets/icons/icon-agenda.png'),
  hospitalizacion: require('../../assets/icons/icon-hospitalizacion.png'),
  laboratorio: require('../../assets/icons/icon-laboratorio.png'),
  inventario: require('../../assets/icons/icon-inventario.png'),
  reportes: require('../../assets/icons/icon-reportes.png'),
  configuracion: require('../../assets/icons/icon-configuracion.png'),
};

export type VetIconName = keyof typeof ICONS;

interface VetIconPngProps {
  name: VetIconName;
  size?: number;
  style?: ImageStyle;
}

export default function VetIconPng({ name, size = 24, style }: VetIconPngProps) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size, resizeMode: 'contain' } as ImageStyle, style]}
    />
  );
}
