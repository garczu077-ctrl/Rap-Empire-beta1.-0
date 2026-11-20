import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Disc3,
  Music,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SOUNDTRACK_TRACKS, soundtrack } from '../audio/soundtrack';

export function AudioPlayerMenu() {
  const snap = useSyncExternalStore(soundtrack.subscribe, soundtrack.getSnapshot);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const statusText = snap.muted
    ? 'Wyciszono'
    : snap.duckedByBeatmaker
      ? 'Beatmaker aktywny'
      : snap.isPlaying
        ? 'Gra w tle'
        : 'Pauza';

  const triggerLabel = snap.muted
    ? 'Wyciszono'
    : snap.duckedByBeatmaker
      ? 'Studio'
      : snap.isPlaying
        ? `Audio · ${snap.trackIndex + 1}/7`
        : 'Audio';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Odtwarzacz muzyki i dźwięk gry"
        className={`min-h-[40px] min-w-[40px] px-3 rounded-xl btn-glass text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-all ${
          open ? 'border-[#f5d37b]/55 text-[#fae092]' : 'text-[#e4e2ec]'
        }`}
      >
        {snap.muted ? (
          <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
        ) : snap.isPlaying ? (
          <span className="flex items-end gap-[2px] h-3.5 w-3.5 justify-center shrink-0" aria-hidden="true">
            <span className="w-[3px] h-2 bg-[#f5d37b] rounded-full animate-pulse" />
            <span className="w-[3px] h-3.5 bg-[#fae092] rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-[3px] h-2.5 bg-[#f5d37b] rounded-full animate-pulse [animation-delay:300ms]" />
          </span>
        ) : (
          <Volume2 className="w-4 h-4 text-[#f5d37b] shrink-0" />
        )}
        <span className="hidden sm:inline">{triggerLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[296px] sm:w-[324px] rounded-2xl bg-[#0d0d16]/95 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.95)] p-4 z-50">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <Disc3
                className={`w-4 h-4 text-[#f5d37b] shrink-0 ${snap.isPlaying ? 'animate-spin [animation-duration:6s]' : ''}`}
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#fae092]">
                  Soundtrack
                </p>
                <p className="text-[11px] text-[#9b99aa] truncate">{statusText}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => soundtrack.toggleMute()}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border ${
                snap.muted
                  ? 'bg-rose-500/15 border-rose-400/40 text-rose-300 hover:bg-rose-500/25'
                  : 'bg-white/5 border-white/10 text-[#d7d5e2] hover:bg-white/10'
              }`}
            >
              {snap.muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{snap.muted ? 'Odcisz' : 'Wycisz'}</span>
            </button>
          </div>

          {/* Active Track + Transport */}
          <div className="mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {snap.trackIndex + 1}. {snap.track.title}
                </p>
                <p className="text-[11px] text-[#9b99aa] truncate">{snap.track.vibe}</p>
              </div>
              <button
                type="button"
                onClick={() => soundtrack.toggleShuffle()}
                title={snap.shuffle ? 'Losowanie włączone' : 'Odtwarzanie po kolei'}
                aria-label="Przełącz losowanie utworów"
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  snap.shuffle
                    ? 'bg-[#f5d37b]/20 text-[#fae092]'
                    : 'text-[#8e8c9e] hover:text-white hover:bg-white/5'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => soundtrack.prev()}
                aria-label="Poprzedni utwór"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/12 text-[#e4e2ec] flex items-center justify-center cursor-pointer transition-colors"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => soundtrack.togglePlay()}
                aria-label={snap.isPlaying ? 'Pauza' : 'Odtwórz'}
                className="w-11 h-9 rounded-xl btn-gold text-[#0b0a0e] flex items-center justify-center cursor-pointer shadow-md"
              >
                {snap.isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => soundtrack.next()}
                aria-label="Następny utwór"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/12 text-[#e4e2ec] flex items-center justify-center cursor-pointer transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume slider */}
            <div className="mt-3 flex items-center gap-2.5">
              <Music className="w-3.5 h-3.5 text-[#9b99aa] shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={snap.muted ? 0 : Math.round(snap.volume * 100)}
                onChange={(e) => soundtrack.setVolume(Number(e.target.value) / 100)}
                aria-label="Głośność muzyki w tle"
                className="w-full h-1.5 accent-[#f5d37b] bg-white/15 rounded-lg cursor-pointer"
              />
              <span className="font-mono-num text-[11px] text-[#cfccd9] w-8 text-right shrink-0">
                {snap.muted ? '0%' : `${Math.round(snap.volume * 100)}%`}
              </span>
            </div>
          </div>

          {snap.duckedByBeatmaker && (
            <p className="mt-2.5 text-[11px] text-[#fae092]/90 bg-[#f5d37b]/10 border border-[#f5d37b]/25 rounded-lg px-2.5 py-1.5">
              Muzyka w tle pauzuje się automatycznie, gdy odpalasz Beatmaker lub bit na Arenie.
            </p>
          )}

          {/* 7-Track Playlist */}
          <div className="mt-3 space-y-1 max-h-56 overflow-y-auto pr-0.5">
            {SOUNDTRACK_TRACKS.map((t, idx) => {
              const isCurrent = idx === snap.trackIndex;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => soundtrack.selectTrack(idx, true)}
                  className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-[#f5d37b]/14 border border-[#f5d37b]/35 text-[#fae092]'
                      : 'bg-transparent border border-transparent text-[#d4d2e0] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono-num text-[11px] text-[#8e8c9e] w-4 shrink-0">
                      0{t.id}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{t.title}</p>
                      <p className="text-[10px] text-[#9b99aa] truncate">{t.vibe}</p>
                    </div>
                  </div>
                  {isCurrent && snap.isPlaying && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#fae092] shrink-0">
                      Gra
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
