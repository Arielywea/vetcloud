import React from 'react';
import { Dog, Cat, PawPrint } from 'lucide-react-native';

interface SpeciesIconProps {
  species?: string | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Vector replacement for the 🐕 / 🐈 / 🐾 emoji avatars
export default function SpeciesIcon({ species, size = 16, color, strokeWidth = 1.75 }: SpeciesIconProps) {
  const Icon = species === 'dog' ? Dog : species === 'cat' ? Cat : PawPrint;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
