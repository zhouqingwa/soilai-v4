import React from 'react';

export default function ParticleImage({ src, className }: { src: string, className?: string }) {
  // Fallback implementation since the original ParticleImage code wasn't provided yet.
  // This just renders the image normally so the app doesn't break.
  return (
    <img
      src={src}
      className={`object-cover ${className || ''}`}
      alt="Plant scan"
      referrerPolicy="no-referrer"
    />
  );
}
