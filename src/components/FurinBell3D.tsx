import React from 'react';

export const FurinBell3D = ({ image, color, active }: { image: string, color: string, active: boolean }) => {
  return (
    <div className="relative w-[72px] h-[72px] min-w-[72px] min-h-[72px] flex items-center justify-center z-20">
      {/*
        Pure CSS 3D Glass Bell
        Completely transparent, realistic glass effect
      */}
      <div
        className="relative w-[64px] h-[64px] overflow-hidden transition-transform duration-500"
        style={{
          // Perfect circle, cut off at the bottom using clip-path to make a 3/4 sphere
          borderRadius: '50%',
          clipPath: 'inset(0 0 20% 0)',
          // Completely transparent base
          backgroundColor: 'transparent',
          // Complex shadows to create realistic glass refraction and reflection
          boxShadow: `
            inset 0 10px 15px -5px rgba(255,255,255,1),
            inset 0 -15px 25px -5px rgba(0,0,0,0.25),
            inset -10px 0 20px -5px rgba(0,0,0,0.15),
            inset 10px 0 20px -5px rgba(255,255,255,0.5)
          `,
          transform: active ? 'rotateY(10deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Pattern Layer - Painted ON the glass */}
        {image && (
          <div
            className="absolute inset-0 w-full h-full opacity-60"
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: '160%',
              backgroundPosition: 'center 20%',
              backgroundRepeat: 'repeat',
              mixBlendMode: 'multiply',
              // Add a slight curve to the pattern to simulate the sphere
              transform: 'scale(1.05)',
            }}
          />
        )}

        {/* Strong Specular Highlight (The bright reflection of a light source) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 15%, rgba(255,255,255,0) 40%)',
          }}
        />

        {/* Secondary Bounce Light */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 75% 80%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%)',
          }}
        />

        {/* Glass Edge Highlight (Fresnel effect) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none border-[1.5px] border-white/80"
          style={{
            borderRadius: '50%',
            boxShadow: 'inset 0 0 4px rgba(255,255,255,0.5)',
          }}
        />
      </div>
    </div>
  );
};
