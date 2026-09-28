import React from 'react';
import Svg, { Path } from 'react-native-svg';

// The four-point star that crowns the crest in assets/banner.png.
// Used sparingly as the product's own ornament (never as a generic "AI" sparkle).
export default function CrestStar({ size = 12, color = '#A8842A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 0.5 L13.6 10.4 L23.5 12 L13.6 13.6 L12 23.5 L10.4 13.6 L0.5 12 L10.4 10.4 Z" fill={color} />
    </Svg>
  );
}
