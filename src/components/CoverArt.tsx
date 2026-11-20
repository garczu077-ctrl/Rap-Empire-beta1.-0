import React, { useState } from 'react';
import { Certification, CoverConfig, CoverTextStyle } from '../types/game';
import { getCoverArtwork } from '../data/worldData';

interface CoverArtProps {
  cover: CoverConfig;
  title: string;
  artist: string;
  cert?: Certification;
  releaseTag?: string; // e.g. 'EP' | 'ALBUM' | 'DISS'
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const FILTER_CSS: Record<CoverConfig['filter'], string> = {
  none: '',
  noir: 'grayscale(100%) contrast(128%) brightness(92%)',
  vintage: 'sepia(50%) contrast(108%) saturate(85%)',
  neon: 'saturate(155%) hue-rotate(-10deg) contrast(114%)',
  gold: 'sepia(32%) saturate(145%) contrast(110%)',
};

export const CoverArt: React.FC<CoverArtProps> = ({
  cover,
  title,
  artist,
  cert = 'none',
  releaseTag,
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const dim =
    size === 'sm'
      ? 'w-14 h-14'
      : size === 'xl'
        ? 'w-64 h-64 sm:w-72 sm:h-72'
        : size === 'lg'
          ? 'w-44 h-44 sm:w-52 sm:h-52'
          : 'w-24 h-24';

  const artwork = getCoverArtwork(cover.artworkId);
  const src = cover.customImage || artwork.imageUrl;
  const textStyle: CoverTextStyle = cover.textStyle || 'bottom';
  const displayTitle = title.trim() || 'Bez tytułu';

  return (
    <div
      className={`${dim} relative rounded-xl overflow-hidden border border-white/15 shrink-0 select-none bg-[#0a0a10] ${className}`}
      style={{
        background: `linear-gradient(135deg, ${cover.bgPrimary || '#161622'}, ${cover.bgSecondary || '#07070c'})`,
      }}
    >
      {/* Artwork Photo Layer */}
      <div
        className="w-full h-full relative"
        style={{ filter: FILTER_CSS[cover.filter] || undefined }}
      >
        {!imgFailed ? (
          <img
            src={src}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className={`w-full h-full object-cover ${cover.customImage ? '' : 'scale-[1.06]'}`}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${artwork.accent}55, #09090f 75%)`,
            }}
          />
        )}
      </div>

      {/* Measured Scrim & Typography Overlay */}
      {size === 'sm' ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex items-end p-1.5">
          <div className="font-display text-[9px] font-bold text-white leading-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] w-full">
            {displayTitle}
          </div>
        </div>
      ) : textStyle === 'center' ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.38)_55%,rgba(0,0,0,0.65)_100%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
            {releaseTag && size !== 'md' && (
              <div className="text-[8px] font-bold tracking-[0.22em] text-[#fae092] uppercase mb-1 drop-shadow">
                {releaseTag}
              </div>
            )}
            <div
              className={`font-display font-bold uppercase tracking-wide text-white leading-[1.05] line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] ${
                size === 'xl'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'lg'
                    ? 'text-lg sm:text-xl'
                    : 'text-xs'
              }`}
            >
              {displayTitle}
            </div>
            <div className="w-8 h-[1.5px] bg-[#e2b64e]/90 my-1.5" />
            <div
              className={`font-semibold text-white/90 truncate max-w-full drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] ${
                size === 'xl' ? 'text-xs' : size === 'lg' ? 'text-[11px]' : 'text-[9px]'
              }`}
            >
              {artist}
            </div>
          </div>
        </>
      ) : textStyle === 'editorial' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-transparent to-black/88" />
          <div className="absolute top-2 left-2.5 right-2.5 flex items-center justify-between gap-1">
            <div
              className={`font-semibold uppercase tracking-[0.14em] text-white/85 truncate drop-shadow ${
                size === 'xl' ? 'text-[11px]' : size === 'lg' ? 'text-[9px]' : 'text-[8px]'
              } ${cert !== 'none' ? 'pl-6' : ''}`}
            >
              {artist}
            </div>
          </div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            {releaseTag && size !== 'md' && (
              <div className="text-[8px] font-bold tracking-[0.18em] text-[#fae092] uppercase mb-0.5">
                {releaseTag}
              </div>
            )}
            <div
              className={`font-display font-bold uppercase tracking-tight text-white leading-[1.04] line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${
                size === 'xl'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'lg'
                    ? 'text-lg sm:text-xl'
                    : 'text-xs'
              }`}
            >
              {displayTitle}
            </div>
          </div>
        </>
      ) : textStyle === 'gold' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/25" />
          <div className="absolute inset-2 rounded-lg border border-[#e2b64e]/45 pointer-events-none" />
          <div className="absolute bottom-3 left-3.5 right-3.5">
            {releaseTag && size !== 'md' && (
              <div className="text-[8px] font-bold tracking-[0.2em] text-white/80 uppercase mb-0.5">
                {releaseTag}
              </div>
            )}
            <div
              className={`font-display font-bold uppercase tracking-wide text-[#fae092] leading-[1.06] line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.98)] ${
                size === 'xl'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'lg'
                    ? 'text-base sm:text-lg'
                    : 'text-xs'
              }`}
            >
              {displayTitle}
            </div>
            <div
              className={`text-white/85 font-medium truncate mt-0.5 drop-shadow ${
                size === 'xl' ? 'text-xs' : size === 'lg' ? 'text-[10px]' : 'text-[9px]'
              }`}
            >
              {artist}
            </div>
          </div>
        </>
      ) : (
        /* Default 'bottom' — Classic Hip-Hop Sleeve */
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/32 to-transparent" />
          <div className="absolute bottom-2.5 left-2.5 right-2.5">
            {releaseTag && size !== 'md' && (
              <div className="text-[8px] font-bold tracking-[0.2em] text-[#fae092] uppercase mb-0.5 drop-shadow">
                {releaseTag}
              </div>
            )}
            <div
              className={`font-display font-bold text-white leading-[1.08] line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] ${
                size === 'xl'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'lg'
                    ? 'text-base sm:text-lg'
                    : 'text-xs'
              }`}
            >
              {displayTitle}
            </div>
            <div
              className={`text-white/80 font-medium truncate mt-0.5 drop-shadow ${
                size === 'xl' ? 'text-xs' : size === 'lg' ? 'text-[10px]' : 'text-[9px]'
              }`}
            >
              {artist}
            </div>
          </div>
        </>
      )}

      {/* Subtle Glossy Record Sleeve Rim */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15 pointer-events-none" />

      {/* Parental Advisory Sticker */}
      {cover.parentalAdvisory && (size === 'lg' || size === 'xl') && (
        <div className="absolute top-2.5 right-2.5 bg-black/90 border border-white/85 px-1.5 py-0.5 text-[7px] leading-tight font-bold tracking-wider text-white text-center shadow-md">
          <div>PARENTAL</div>
          <div className="bg-white text-black px-0.5">ADVISORY</div>
          <div>EXPLICIT</div>
        </div>
      )}

      {/* Gold/Platinum/Diamond Certification Seal */}
      {cert !== 'none' && (
        <div
          className={`absolute top-2 left-2 w-5 h-5 rounded-full border shadow-md flex items-center justify-center text-[9px] font-bold ${
            cert === 'diamond'
              ? 'bg-cyan-300 text-slate-950 border-white'
              : cert === 'platinum'
                ? 'bg-sky-300 text-slate-950 border-sky-100'
                : 'bg-[#e2b64e] text-black border-[#f8e3a3]'
          }`}
          title={
            cert === 'diamond'
              ? 'Diamentowa Płyta'
              : cert === 'platinum'
                ? 'Platynowa Płyta'
                : 'Złota Płyta'
          }
        >
          {cert === 'diamond' ? 'D' : cert === 'platinum' ? 'P' : 'Z'}
        </div>
      )}
    </div>
  );
};
