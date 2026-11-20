import React, { useState } from 'react';
import { PORTRAITS } from '../data/worldData';

interface ComicPortraitProps {
  portraitId: number;
  customAvatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fill';
  ring?: 'default' | 'gold' | 'violet' | 'cyan' | 'rose';
  className?: string;
  alt?: string;
}

const SIZE_MAP: Record<NonNullable<ComicPortraitProps['size']>, string> = {
  xs: 'w-10 h-10 rounded-xl',
  sm: 'w-12 h-12 rounded-xl',
  md: 'w-16 h-16 rounded-2xl',
  lg: 'w-22 h-22 rounded-2xl',
  xl: 'w-28 h-28 rounded-2xl',
  '2xl': 'w-36 h-36 sm:w-40 sm:h-40 rounded-3xl',
  fill: 'w-full aspect-square rounded-2xl',
};

const RING_MAP: Record<NonNullable<ComicPortraitProps['ring']>, string> = {
  default: 'border-white/15 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)]',
  gold: 'border-[#f5d37b]/70 shadow-[0_0_28px_-6px_rgba(226,182,78,0.55),0_12px_28px_-10px_rgba(0,0,0,0.9)]',
  violet: 'border-[#a78bfa]/65 shadow-[0_0_26px_-6px_rgba(157,107,255,0.5),0_12px_28px_-10px_rgba(0,0,0,0.9)]',
  cyan: 'border-[#4cd4f5]/65 shadow-[0_0_26px_-6px_rgba(76,212,245,0.45),0_12px_28px_-10px_rgba(0,0,0,0.9)]',
  rose: 'border-rose-400/70 shadow-[0_0_26px_-6px_rgba(244,63,94,0.5),0_12px_28px_-10px_rgba(0,0,0,0.9)]',
};

export const ComicPortrait: React.FC<ComicPortraitProps> = ({
  portraitId,
  customAvatar,
  size = 'md',
  ring = 'default',
  className = '',
  alt = 'Portret artysty',
}) => {
  const [imgError, setImgError] = useState(false);
  const portrait = PORTRAITS.find((p) => p.id === portraitId) || PORTRAITS[0];
  const src = customAvatar || portrait.imageUrl;
  const sizeClass = SIZE_MAP[size];
  const ringClass = RING_MAP[ring];

  return (
    <div
      className={`${sizeClass} relative overflow-hidden border bg-[#101018] shrink-0 select-none ${ringClass} ${className}`}
      title={customAvatar ? alt : portrait.label}
    >
      {!imgError ? (
        <img
          src={src}
          alt={alt || portrait.label}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top block transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center font-display text-lg font-bold text-[#f5d37b]"
          style={{
            background: `linear-gradient(145deg, #1b1828, #0b0b12)`,
          }}
        >
          #{portrait.id}
        </div>
      )}

      {/* Subtle directional lighting rim + bottom depth vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 24%, rgba(5,5,9,0.06) 68%, rgba(5,5,9,0.42) 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.45)',
        }}
      />
    </div>
  );
};
