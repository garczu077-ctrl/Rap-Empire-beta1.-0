import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Square,
  Sliders,
  Disc3,
  Upload,
  Sparkles,
  Flame,
  Archive,
  ArrowUpCircle,
  Music2,
  Shuffle,
  Check,
  X,
  ShoppingBag,
} from 'lucide-react';
import {
  BeatConfig,
  BeatStyle,
  Certification,
  CoverConfig,
  CoverFilter,
  CoverTextStyle,
  GameState,
  ProducerBeatDef,
  Track,
} from '../types/game';
import {
  BEAT_PRESETS,
  COVER_ARTWORKS,
  countPolishSyllables,
  getCoverArtwork,
  PRODUCER_BEATS,
  scorePolishLyrics,
  STUDIO_TIERS,
  suggestPolishRhymes,
} from '../data/worldData';
import { beatEngine } from '../audio/beatEngine';
import { CoverArt } from './CoverArt';
import { formatCompact, formatPLN } from '../engine/simulation';

interface StudioViewProps {
  state: GameState;
  onUpdateProducerTag: (tag: string) => void;
  onUpgradeStudio: () => void;
  onRecordTrack: (payload: {
    title: string;
    mode: 'single' | 'vault' | 'diss';
    beatStyle: BeatStyle;
    bpm: number;
    cover: CoverConfig;
    lyrics: string;
    lyricScore: number;
    featNpcId?: string;
    dissTargetId?: string;
    featCost: number;
    beatProducer?: string;
    beatProducerTag?: string;
    beatCost?: number;
    beatQualityBonus?: number;
    beatHypeBonus?: number;
  }) => void;
  onReleaseProject: (payload: {
    title: string;
    format: 'EP' | 'Album';
    trackIds: string[];
    cover: CoverConfig;
  }) => void;
}

const TEXT_STYLES: { id: CoverTextStyle; label: string }[] = [
  { id: 'bottom', label: 'Klasyk' },
  { id: 'center', label: 'Plakat' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'gold', label: 'Złoto' },
];

const COVER_FILTERS: { id: CoverFilter; label: string }[] = [
  { id: 'none', label: 'Oryginał' },
  { id: 'noir', label: 'Noir' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'neon', label: 'Neon' },
  { id: 'gold', label: 'Złoto' },
];

const SAMPLE_VERSES = [
  'Nocne światła nad miastem, w słuchawkach wali gruby bas\nZaczynałem od zera, ale dzisiaj nadszedł mój czas\nKażdy wers z tego studia ma ciężar czystego złota\nNa polskiej scenie nie ma miejsca na puste słowa bez polotu',
  'Z rodzinnego podwórka niosę ogień i głód zwycięstwa\nNie pytaj mnie o cenę, kiedy w grze jest moja legenda\nNa bicie płynie prawda, a pod sceną płoną ręce\nOd małego pubu aż po największe hale na tej planecie',
];

function makeInitialCover(artworkId: number): CoverConfig {
  const art = getCoverArtwork(artworkId);
  return {
    artworkId: art.id,
    textStyle: 'bottom',
    bgPrimary: '#141420',
    bgSecondary: '#07070c',
    accent: art.accent,
    filter: 'none',
    motif: 'vinyl',
    parentalAdvisory: true,
  };
}

interface CoverPickerBlockProps {
  cover: CoverConfig;
  onChange: React.Dispatch<React.SetStateAction<CoverConfig>>;
  previewTitle: string;
  previewArtist: string;
  releaseTag?: string;
}

const CoverPickerBlock: React.FC<CoverPickerBlockProps> = ({
  cover,
  onChange,
  previewTitle,
  previewArtist,
  releaseTag,
}) => {
  const activeArt = getCoverArtwork(cover.artworkId);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange((prev) => ({ ...prev, customImage: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleShuffle = () => {
    const others = COVER_ARTWORKS.filter((c) => c.id !== cover.artworkId);
    const pick = others[Math.floor(Math.random() * others.length)] || COVER_ARTWORKS[0];
    onChange((prev) => ({
      ...prev,
      artworkId: pick.id,
      accent: pick.accent,
      customImage: undefined,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Live Vinyl Sleeve Preview + Typography & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="relative pr-6 shrink-0">
          {/* Glossy black vinyl record peeking behind the sleeve */}
          <div
            className="absolute right-0 top-2 bottom-2 aspect-square rounded-full border border-white/15 shadow-xl"
            style={{
              background:
                'repeating-radial-gradient(circle at center, #0e0e14 0px, #0e0e14 3px, #1d1d29 4px, #0e0e14 5px)',
            }}
          >
            <div
              className="absolute inset-[34%] rounded-full border border-black/40"
              style={{ background: cover.accent || activeArt.accent }}
            />
          </div>
          <div className="relative z-10 shadow-[0_18px_36px_-10px_rgba(0,0,0,0.95)] rounded-xl">
            <CoverArt
              cover={cover}
              title={previewTitle}
              artist={previewArtist}
              releaseTag={releaseTag}
              size="lg"
            />
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          {/* Text Overlay Layout */}
          <div>
            <div className="text-[11px] text-[#9b99aa] mb-1.5">Styl napisu na okładce</div>
            <div className="grid grid-cols-2 gap-1.5">
              {TEXT_STYLES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, textStyle: st.id }))}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all whitespace-nowrap ${
                    (cover.textStyle || 'bottom') === st.id
                      ? 'btn-violet'
                      : 'surface-inset text-[#cfccd9] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div>
            <div className="text-[11px] text-[#9b99aa] mb-1.5">Filtr</div>
            <div className="flex flex-wrap gap-1.5">
              {COVER_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChange((prev) => ({ ...prev, filter: f.id }))}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                    cover.filter === f.id
                      ? 'btn-gold'
                      : 'surface-inset text-[#cfccd9] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parental Advisory + Shuffle + Own Photo */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() =>
                onChange((prev) => ({ ...prev, parentalAdvisory: !prev.parentalAdvisory }))
              }
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer whitespace-nowrap ${
                cover.parentalAdvisory
                  ? 'bg-white text-black border-white'
                  : 'surface-inset text-[#9b99aa]'
              }`}
            >
              Parental Advisory
            </button>
            <button
              type="button"
              onClick={handleShuffle}
              className="px-2.5 py-1.5 rounded-lg btn-glass text-[11px] font-semibold text-[#fae092] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3 h-3" />
              Losuj
            </button>
            <label className="px-2.5 py-1.5 rounded-lg btn-glass text-[11px] font-semibold text-white inline-flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <Upload className="w-3 h-3 text-[#f5d37b]" />
              Własne foto
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* 30-Artwork Visual Hip-Hop Cover Gallery */}
      <div className="rounded-2xl surface-inset p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-[#cfccd9]">
            Galeria okładek (30 grafik)
          </span>
          <span className="text-[#fae092] font-medium truncate">
            {cover.customImage ? 'Własne zdjęcie' : `#${String(activeArt.id).padStart(2, '0')} · ${activeArt.label}`}
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[210px] overflow-y-auto pr-1">
          {COVER_ARTWORKS.map((art) => {
            const isSelected = !cover.customImage && (cover.artworkId || 1) === art.id;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() =>
                  onChange((prev) => ({
                    ...prev,
                    artworkId: art.id,
                    accent: art.accent,
                    customImage: undefined,
                  }))
                }
                title={art.label}
                className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-[#fae092] ring-2 ring-[#e2b64e]/75 scale-[1.03] z-10'
                    : 'border-white/12 hover:border-white/40'
                }`}
              >
                <img
                  src={art.imageUrl}
                  alt={art.label}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover scale-[1.06] group-hover:scale-110 transition-transform duration-200"
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e2b64e] text-black flex items-center justify-center shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const StudioView: React.FC<StudioViewProps> = ({
  state,
  onUpdateProducerTag,
  onUpgradeStudio,
  onRecordTrack,
  onReleaseProject,
}) => {
  const [subTab, setSubTab] = useState<'record' | 'vault' | 'discography'>('record');

  // Track creation state
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'single' | 'vault' | 'diss'>('single');
  const [beatSource, setBeatSource] = useState<'mpc' | 'buy'>('mpc');
  const [selectedBeatId, setSelectedBeatId] = useState<string>(PRODUCER_BEATS[0].id);
  const [beatStyleFilter, setBeatStyleFilter] = useState<'all' | BeatStyle>('all');
  const [previewBeatId, setPreviewBeatId] = useState<string | null>(null);
  const [beatStyle, setBeatStyle] = useState<BeatStyle>('808_trap');
  const [bpm, setBpm] = useState<number>(BEAT_PRESETS['808_trap'].defaultBpm);
  const [steps, setSteps] = useState<BeatConfig['steps']>(() => ({
    kick: [...BEAT_PRESETS['808_trap'].steps.kick],
    snare: [...BEAT_PRESETS['808_trap'].steps.snare],
    hat: [...BEAT_PRESETS['808_trap'].steps.hat],
    chord: [...BEAT_PRESETS['808_trap'].steps.chord],
  }));
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  const [featNpcId, setFeatNpcId] = useState<string>('');
  const [dissTargetId, setDissTargetId] = useState<string>(state.npcs[0]?.id || '');
  const [lyrics, setLyrics] = useState('');

  const [cover, setCover] = useState<CoverConfig>(() => makeInitialCover(1));

  // Vault project builder (dedicated album/EP cover!)
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedVaultIds, setSelectedVaultIds] = useState<string[]>([]);
  const [projectCover, setProjectCover] = useState<CoverConfig>(() => makeInitialCover(13));

  // Discography cover lightbox preview
  const [inspectRelease, setInspectRelease] = useState<{
    title: string;
    artist: string;
    subtitle: string;
    cover: CoverConfig;
    cert: Certification;
    releaseTag?: string;
  } | null>(null);

  useEffect(() => {
    return () => {
      beatEngine.stop();
    };
  }, []);

  useEffect(() => {
    if (isPlaying && beatSource === 'mpc') {
      beatEngine.updateConfig({ style: beatStyle, bpm, steps });
    }
  }, [beatStyle, bpm, steps, isPlaying, beatSource]);

  const stopAllBeatAudio = () => {
    beatEngine.stop();
    setIsPlaying(false);
    setPreviewBeatId(null);
    setActiveStep(-1);
  };

  const switchBeatSource = (next: 'mpc' | 'buy') => {
    if (next === beatSource) return;
    stopAllBeatAudio();
    setBeatSource(next);
  };

  const selectPreset = (style: BeatStyle) => {
    setBeatStyle(style);
    setBpm(BEAT_PRESETS[style].defaultBpm);
    setSteps({
      kick: [...BEAT_PRESETS[style].steps.kick],
      snare: [...BEAT_PRESETS[style].steps.snare],
      hat: [...BEAT_PRESETS[style].steps.hat],
      chord: [...BEAT_PRESETS[style].steps.chord],
    });
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopAllBeatAudio();
    } else {
      setPreviewBeatId(null);
      beatEngine.start({ style: beatStyle, bpm, steps }, (step) => setActiveStep(step));
      setIsPlaying(true);
    }
  };

  const toggleProducerBeatPreview = (beat: ProducerBeatDef) => {
    if (previewBeatId === beat.id) {
      stopAllBeatAudio();
      return;
    }
    setIsPlaying(false);
    setActiveStep(-1);
    setPreviewBeatId(beat.id);
    beatEngine.start({ style: beat.style, bpm: beat.bpm, steps: beat.steps });
  };

  const toggleStep = (lane: keyof BeatConfig['steps'], idx: number) => {
    setSteps((prev) => {
      const nextLane = [...prev[lane]];
      nextLane[idx] = !nextLane[idx];
      return { ...prev, [lane]: nextLane };
    });
  };

  const rhymes = useMemo(() => suggestPolishRhymes(lyrics), [lyrics]);
  const lyricEval = useMemo(() => scorePolishLyrics(lyrics), [lyrics]);

  const currentStudio = STUDIO_TIERS[state.studioTier];
  const nextStudio = STUDIO_TIERS[state.studioTier + 1];

  const getEffectiveFeatCost = (npcId: string) => {
    const npc = state.npcs.find((n) => n.id === npcId);
    if (!npc) return 0;
    if (state.crew?.memberIds.includes(npc.id)) return 0;
    if (npc.relation >= 40) return Math.round(npc.featCost * 0.65);
    if (npc.relation <= -20) return Math.round(npc.featCost * 1.65);
    return npc.featCost;
  };

  const selectedFeatCost = mode === 'diss' ? 0 : featNpcId ? getEffectiveFeatCost(featNpcId) : 0;
  const selectedBoughtBeat =
    beatSource === 'buy'
      ? PRODUCER_BEATS.find((b) => b.id === selectedBeatId) || PRODUCER_BEATS[0]
      : undefined;
  const selectedBeatCost = selectedBoughtBeat ? selectedBoughtBeat.price : 0;
  const totalCashCost = selectedFeatCost + selectedBeatCost;

  const filteredProducerBeats =
    beatStyleFilter === 'all'
      ? PRODUCER_BEATS
      : PRODUCER_BEATS.filter((b) => b.style === beatStyleFilter);

  const vaultTracks = state.tracks.filter((t) => t.mode === 'vault' && !t.projectId);
  const releasedTracks = state.tracks.filter((t) => t.mode !== 'vault');

  const appendRhyme = (word: string) => {
    setLyrics((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return word;
      return `${trimmed} ${word}`;
    });
  };

  const handleRecord = () => {
    if (state.energy < currentStudio.energyCost) return;
    if (totalCashCost > state.cash) return;

    const cleanTitle =
      title.trim() ||
      (mode === 'diss'
        ? `Bez Litości (${state.npcs.find((n) => n.id === dissTargetId)?.alias || 'Diss'})`
        : `Nocny Numer #${state.tracks.length + 1}`);

    onRecordTrack({
      title: cleanTitle,
      mode,
      beatStyle: selectedBoughtBeat ? selectedBoughtBeat.style : beatStyle,
      bpm: selectedBoughtBeat ? selectedBoughtBeat.bpm : bpm,
      cover,
      lyrics: lyrics.trim() || SAMPLE_VERSES[0],
      lyricScore: lyrics.trim() ? lyricEval.score : 58,
      featNpcId: mode === 'diss' ? undefined : featNpcId || undefined,
      dissTargetId: mode === 'diss' ? dissTargetId : undefined,
      featCost: selectedFeatCost,
      beatProducer: selectedBoughtBeat?.producer,
      beatProducerTag: selectedBoughtBeat?.producerTag,
      beatCost: selectedBeatCost,
      beatQualityBonus: selectedBoughtBeat?.qualityBonus,
      beatHypeBonus: selectedBoughtBeat?.hypeBonus,
    });

    setTitle('');
    setLyrics('');
    setFeatNpcId('');
    // Advance to next cover automatically so consecutive tracks look distinct
    const nextArtId = ((cover.artworkId || 1) % COVER_ARTWORKS.length) + 1;
    setCover((prev) => ({
      ...prev,
      artworkId: nextArtId,
      accent: getCoverArtwork(nextArtId).accent,
      customImage: undefined,
    }));

    if (isPlaying || previewBeatId) {
      stopAllBeatAudio();
    }
  };

  const toggleVaultPick = (id: string) => {
    setSelectedVaultIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDropProject = () => {
    if (selectedVaultIds.length < 3) return;
    const format: 'EP' | 'Album' = selectedVaultIds.length >= 6 ? 'Album' : 'EP';
    onReleaseProject({
      title: projectTitle.trim() || `${state.player.alias} — ${format} #${state.projects.length + 1}`,
      format,
      trackIds: selectedVaultIds,
      cover: projectCover,
    });
    setProjectTitle('');
    setSelectedVaultIds([]);
    const nextArtId = ((projectCover.artworkId || 13) % COVER_ARTWORKS.length) + 1;
    setProjectCover((prev) => ({
      ...prev,
      artworkId: nextArtId,
      accent: getCoverArtwork(nextArtId).accent,
      customImage: undefined,
    }));
  };

  const PAD_LANES = [
    {
      key: 'kick' as const,
      label: '808 / Stopa',
      activeStyle: {
        background: 'linear-gradient(180deg, #fae092 0%, #e2b64e 100%)',
        boxShadow: '0 0 14px rgba(226,182,78,0.65), inset 0 1px 0 rgba(255,255,255,0.65)',
      },
    },
    {
      key: 'snare' as const,
      label: 'Werbel',
      activeStyle: {
        background: 'linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 100%)',
        boxShadow: '0 0 14px rgba(157,107,255,0.65), inset 0 1px 0 rgba(255,255,255,0.5)',
      },
    },
    {
      key: 'hat' as const,
      label: 'Hi-Hat',
      activeStyle: {
        background: 'linear-gradient(180deg, #99ecff 0%, #0ea5e9 100%)',
        boxShadow: '0 0 14px rgba(76,212,245,0.65), inset 0 1px 0 rgba(255,255,255,0.55)',
      },
    },
    {
      key: 'chord' as const,
      label: 'Sample',
      activeStyle: {
        background: 'linear-gradient(180deg, #6ee7b7 0%, #10b981 100%)',
        boxShadow: '0 0 14px rgba(52,211,153,0.6), inset 0 1px 0 rgba(255,255,255,0.5)',
      },
    },
  ];

  const previewArtist =
    featNpcId && mode !== 'diss'
      ? `${state.player.alias} feat. ${state.npcs.find((n) => n.id === featNpcId)?.alias}`
      : state.player.alias;

  const vaultFormatTag = selectedVaultIds.length >= 6 ? 'ALBUM' : 'EP';

  return (
    <div className="space-y-6">
      {/* Studio Header & Tier Upgrade */}
      <section className="glass-panel-gold rounded-3xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#fae092] font-semibold uppercase tracking-wider">
            {currentStudio.name} · Koszt nagrania: {currentStudio.energyCost} Energii
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-0.5 leading-none">
            Studio Nagrań i Beatmaker
          </h1>
          <p className="text-xs text-[#b5b2c2] mt-1.5">{currentStudio.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 surface-inset rounded-xl px-3.5 py-2">
            <span className="text-[11px] text-[#9b99aa] whitespace-nowrap">Tag producencki:</span>
            <input
              type="text"
              value={state.player.producerTag}
              onChange={(e) => onUpdateProducerTag(e.target.value)}
              maxLength={28}
              className="bg-transparent text-xs font-bold text-[#fae092] focus:outline-none w-36"
            />
          </div>

          {nextStudio && (
            <button
              onClick={onUpgradeStudio}
              disabled={state.cash < nextStudio.upgradeCost}
              className="min-h-[44px] px-4 py-2 rounded-xl btn-violet disabled:opacity-40 text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Ulepsz: {nextStudio.name} ({formatPLN(nextStudio.upgradeCost)})
            </button>
          )}
        </div>
      </section>

      {/* Studio Sub-Navigation (Responsive 3-col on mobile so nothing clips) */}
      <div className="grid grid-cols-3 sm:inline-flex items-center gap-1 p-1.5 rounded-2xl surface-inset w-full sm:w-fit">
        {(
          [
            {
              id: 'record',
              mobileLabel: 'Nagraj',
              desktopLabel: 'Nagraj Utwór',
            },
            {
              id: 'vault',
              mobileLabel: `Skarbiec (${vaultTracks.length})`,
              desktopLabel: `Skarbiec EP/Album (${vaultTracks.length})`,
            },
            {
              id: 'discography',
              mobileLabel: `Dyskografia (${releasedTracks.length + state.projects.length})`,
              desktopLabel: `Dyskografia (${releasedTracks.length + state.projects.length})`,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id !== 'record' && (isPlaying || previewBeatId)) {
                stopAllBeatAudio();
              }
              setSubTab(t.id);
            }}
            className={`min-w-0 min-h-[40px] px-1.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate text-center ${
              subTab === t.id ? 'btn-gold' : 'text-[#9b99aa] hover:text-white'
            }`}
          >
            <span className="sm:hidden">{t.mobileLabel}</span>
            <span className="hidden sm:inline">{t.desktopLabel}</span>
          </button>
        ))}
      </div>

      {subTab === 'record' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 cols: Beat Source (MPC Beatmaker OR Buy Beat) + Lyrics Editor */}
          <div className="lg:col-span-7 space-y-6">
            {/* Beat Section: Self-Produced MPC OR Producer Beat Market */}
            <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-5">
              {/* Source Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl surface-inset">
                <button
                  type="button"
                  onClick={() => switchBeatSource('mpc')}
                  className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    beatSource === 'mpc'
                      ? 'btn-gold'
                      : 'text-[#9b99aa] hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Własny bit (MPC · 0 zł)</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchBeatSource('buy')}
                  className={`min-h-[40px] px-2.5 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    beatSource === 'buy'
                      ? 'btn-gold'
                      : 'text-[#9b99aa] hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Kup bit od producenta</span>
                </button>
              </div>

              {beatSource === 'mpc' ? (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#f5d37b]" />
                        Konsola MPC · Mini-Beatmaker
                      </h2>
                      <p className="text-xs text-[#9b99aa]">{BEAT_PRESETS[beatStyle].vibe}</p>
                    </div>

                    <button
                      onClick={togglePlayback}
                      className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                        isPlaying ? 'btn-crimson' : 'btn-gold'
                      }`}
                    >
                      {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isPlaying ? 'Zatrzymaj bit' : 'Odsłuchaj bit'}
                    </button>
                  </div>

                  {/* Style presets & BPM */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex flex-wrap gap-1.5">
                      {(Object.keys(BEAT_PRESETS) as BeatStyle[]).map((styleKey) => (
                        <button
                          key={styleKey}
                          onClick={() => selectPreset(styleKey)}
                          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            beatStyle === styleKey
                              ? 'btn-violet'
                              : 'surface-inset text-[#cfccd9] hover:text-white'
                          }`}
                        >
                          {BEAT_PRESETS[styleKey].label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2.5 surface-inset px-3.5 py-2 rounded-xl">
                      <span className="text-xs text-[#9b99aa]">Tempo</span>
                      <input
                        type="range"
                        min={80}
                        max={158}
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-24 accent-[#e2b64e]"
                      />
                      <span className="font-mono-num text-xs font-bold text-[#fae092] w-14 text-right">
                        {bpm} BPM
                      </span>
                    </div>
                  </div>

                  {/* Recessed Dark Hardware 16-Step Pad Matrix */}
                  <div className="rounded-2xl surface-inset p-3.5 space-y-2.5 overflow-x-auto">
                    {PAD_LANES.map((lane) => (
                      <div key={lane.key} className="flex items-center gap-2.5 min-w-[490px]">
                        <span className="text-[11px] font-semibold text-[#b5b2c2] w-20 shrink-0">
                          {lane.label}
                        </span>
                        <div className="grid grid-cols-16 gap-1.5 flex-1">
                          {steps[lane.key].map((active, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => toggleStep(lane.key, idx)}
                              aria-label={`${lane.label} krok ${idx + 1}`}
                              style={active ? lane.activeStyle : undefined}
                              className={`h-9 rounded-lg border transition-all cursor-pointer ${
                                active
                                  ? 'border-white/40'
                                  : idx % 4 === 0
                                    ? 'bg-[#1a1a2a] border-white/12 hover:border-white/30'
                                    : 'bg-[#0e0e18] border-white/6 hover:border-white/22'
                              } ${activeStep === idx ? 'ring-2 ring-white scale-105' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#f5d37b]" />
                        Rynek Bitów · Zewnętrzni Producenci
                      </h2>
                      <p className="text-xs text-[#9b99aa]">
                        Kup gotowy podkład od polskich beatmakerów — podbija jakość numeru i daje bonus do Hype.
                      </p>
                    </div>
                  </div>

                  {/* Style Filter */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBeatStyleFilter('all')}
                      className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        beatStyleFilter === 'all'
                          ? 'btn-violet'
                          : 'surface-inset text-[#cfccd9] hover:text-white'
                      }`}
                    >
                      Wszystkie
                    </button>
                    {(Object.keys(BEAT_PRESETS) as BeatStyle[]).map((styleKey) => (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => setBeatStyleFilter(styleKey)}
                        className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          beatStyleFilter === styleKey
                            ? 'btn-violet'
                            : 'surface-inset text-[#cfccd9] hover:text-white'
                        }`}
                      >
                        {BEAT_PRESETS[styleKey].label}
                      </button>
                    ))}
                  </div>

                  {/* Producer Beats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducerBeats.map((beat) => {
                      const isSelected = selectedBoughtBeat?.id === beat.id;
                      const isPreviewing = previewBeatId === beat.id;
                      const canAfford = state.cash >= beat.price;

                      return (
                        <div
                          key={beat.id}
                          onClick={() => setSelectedBeatId(beat.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedBeatId(beat.id);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            isSelected
                              ? 'glass-panel-gold border-[#f5d37b]'
                              : 'surface-interactive border-white/10'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="text-[11px] text-[#f5d37b] font-semibold">
                                  {beat.tier} · {BEAT_PRESETS[beat.style].label} · {beat.bpm} BPM
                                </div>
                                <div className="text-sm font-bold text-white truncate">
                                  „{beat.title}”
                                </div>
                                <div className="text-xs text-[#b5b2c2] truncate">
                                  {beat.producer} ({beat.city})
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div
                                  className={`font-mono-num text-sm font-bold ${
                                    canAfford ? 'text-[#fae092]' : 'text-rose-400'
                                  }`}
                                >
                                  {formatPLN(beat.price)}
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-emerald-400">
                                    Wybrany
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-[11px] text-[#9b99aa] leading-snug">{beat.vibe}</p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/8">
                            <div className="text-[11px] font-mono-num text-[#cfccd9]">
                              <span className="text-emerald-400 font-bold">
                                +{beat.qualityBonus} Jakość
                              </span>
                              <span className="mx-1.5 text-[#6e6c7a]">·</span>
                              <span className="text-[#c4b5fd] font-bold">
                                +{beat.hypeBonus} Hype
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBeatId(beat.id);
                                toggleProducerBeatPreview(beat);
                              }}
                              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 ${
                                isPreviewing ? 'btn-crimson' : 'btn-glass text-[#fae092]'
                              }`}
                            >
                              {isPreviewing ? (
                                <Square className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                              {isPreviewing ? 'Stop' : 'Odsłuch'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* Lyric Editor with Live Polish Rhymes */}
            <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">Edytor Zwrotek</h2>
                  <p className="text-xs text-[#9b99aa]">
                    Podpowiedzi rymów na żywo i ocena kunsztu poetyckiego.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setLyrics(SAMPLE_VERSES[Math.floor(Math.random() * SAMPLE_VERSES.length)])
                  }
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl btn-glass text-xs font-semibold text-[#fae092] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Wstaw szkic zwrotki
                </button>
              </div>

              <textarea
                rows={5}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Wpisz własne wersy (każdy wers w nowej linii)... np. Nocne światła nad miastem, w słuchawkach wali bas"
                className="w-full p-4 rounded-2xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b] leading-relaxed resize-y"
              />

              {/* Live Rhyme Suggestions */}
              <div>
                <div className="text-[11px] text-[#9b99aa] mb-2">
                  Podpowiedzi rymów (kliknij, aby dopisać do wersu):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rhymes.map((word) => (
                    <button
                      key={word}
                      type="button"
                      onClick={() => appendRhyme(word)}
                      className="min-h-[34px] px-3 py-1 rounded-xl surface-interactive text-xs font-semibold text-[#fae092] cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lyric Poetic Craft Evaluation */}
              <div className="rounded-2xl surface-inset p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#cfccd9]">
                  <span className="font-bold text-white">{lyricEval.verdict}</span>
                  <div className="text-[11px] text-[#9b99aa] mt-0.5 font-mono-num">
                    Wersy: {lyricEval.lineCount} · Rymy: {lyricEval.rhymePairs} · Śr. sylab:{' '}
                    {lyricEval.avgSyllables ||
                      countPolishSyllables(lyrics.split('\n').pop() || '')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#9b99aa] uppercase tracking-wider">Kunszt</div>
                  <div className="font-mono-num text-2xl font-bold text-gold-metallic">
                    {lyricEval.score}/100
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right 5 cols: Cover Designer (30 Hip-Hop Artworks) & Release Controls */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6 space-y-5">
            <h2 className="font-display text-2xl font-bold text-white">Okładka i Wydanie</h2>

            {/* Release Mode Segmented Buttons */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl surface-inset">
              {(
                [
                  { id: 'single', label: 'Singiel' },
                  { id: 'vault', label: 'Do Skarbca' },
                  { id: 'diss', label: 'Diss Track' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`min-h-[40px] px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    mode === m.id
                      ? m.id === 'diss'
                        ? 'btn-crimson'
                        : 'btn-gold'
                      : 'text-[#9b99aa] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cfccd9] mb-1.5">Tytuł numeru</label>
              <input
                type="text"
                maxLength={32}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={mode === 'diss' ? 'np. Koniec Gry (Diss)' : 'np. Złote Neony'}
                className="w-full min-h-[46px] px-4 py-2.5 rounded-xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b]"
              />
            </div>

            {/* Guest Feat OR Diss Target */}
            {mode === 'diss' ? (
              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1.5">
                  Cel Diss Tracka (wywoła beef i odpowiedź za 2 dni)
                </label>
                <select
                  value={dissTargetId}
                  onChange={(e) => setDissTargetId(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl surface-inset border-rose-500/40 text-sm text-white focus:outline-none"
                >
                  {state.npcs.map((npc) => (
                    <option key={npc.id} value={npc.id} className="bg-[#111119]">
                      {npc.alias} ({npc.city} · {npc.tier})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#cfccd9] mb-1.5">
                  Gość na feat (opcjonalnie)
                </label>
                <select
                  value={featNpcId}
                  onChange={(e) => setFeatNpcId(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl surface-inset text-sm text-white focus:outline-none focus:border-[#f5d37b]"
                >
                  <option value="" className="bg-[#111119]">
                    Solo (bez gościa)
                  </option>
                  {state.npcs.map((npc) => {
                    const cost = getEffectiveFeatCost(npc.id);
                    const tag = state.crew?.memberIds.includes(npc.id)
                      ? 'Ekipa · 0 zł'
                      : npc.relation >= 40
                        ? `Ziomek -35% · ${formatPLN(cost)}`
                        : npc.relation <= -20
                          ? `Wróg +65% · ${formatPLN(cost)}`
                          : formatPLN(cost);
                    return (
                      <option key={npc.id} value={npc.id} className="bg-[#111119]">
                        {npc.alias} ({npc.city}) — {tag}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Real 30-Artwork Cover Designer */}
            <div className="pt-3 border-t border-white/10">
              <CoverPickerBlock
                cover={cover}
                onChange={setCover}
                previewTitle={title || 'Nowy Numer'}
                previewArtist={previewArtist}
                releaseTag={mode === 'diss' ? 'DISS TRACK' : mode === 'vault' ? 'SKARBIEC' : 'SINGIEL'}
              />
            </div>

            {/* Selected Beat & Cost Summary */}
            <div className="rounded-2xl surface-inset px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
              <div className="text-[#cfccd9]">
                <span className="text-[#9b99aa]">Podkład: </span>
                {selectedBoughtBeat ? (
                  <span className="font-semibold text-[#fae092]">
                    „{selectedBoughtBeat.title}” · {selectedBoughtBeat.producer} (+{selectedBoughtBeat.qualityBonus} Jakość)
                  </span>
                ) : (
                  <span className="font-semibold text-white">
                    Własny bit MPC ({BEAT_PRESETS[beatStyle].label} · 0 zł)
                  </span>
                )}
              </div>
              {totalCashCost > 0 && (
                <span
                  className={`font-mono-num font-bold ${
                    totalCashCost > state.cash ? 'text-rose-400' : 'text-[#fae092]'
                  }`}
                >
                  Koszt: {formatPLN(totalCashCost)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRecord}
              disabled={state.energy < currentStudio.energyCost || totalCashCost > state.cash}
              className={`w-full min-h-[52px] px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-45 ${
                mode === 'diss' ? 'btn-crimson' : 'btn-gold'
              }`}
            >
              {mode === 'diss' ? (
                <Flame className="w-4 h-4" />
              ) : mode === 'vault' ? (
                <Archive className="w-4 h-4" />
              ) : (
                <Disc3 className="w-4 h-4" />
              )}
              {mode === 'diss'
                ? 'Wypuść Diss Track'
                : mode === 'vault'
                  ? 'Nagraj i schowaj do Skarbca'
                  : 'Nagraj i wydaj Singiel'}
              {totalCashCost > 0 ? ` (${formatPLN(totalCashCost)})` : ''}
            </button>
            {state.energy < currentStudio.energyCost && (
              <p className="text-xs text-rose-400 text-center">
                Za mało Energii ({state.energy}/{currentStudio.energyCost}). Zakończ dzień lub zrób reset.
              </p>
            )}
            {totalCashCost > state.cash && (
              <p className="text-xs text-rose-400 text-center">
                Za mało gotówki ({formatPLN(state.cash)} / {formatPLN(totalCashCost)}). Wybierz tańszy bit lub zrób własny na MPC.
              </p>
            )}
          </div>
        </div>
      )}

      {subTab === 'vault' && (
        <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Skarbiec na EP-kę i Album</h2>
              <p className="text-xs text-[#9b99aa]">
                Zaznacz 3–5 numerów na EP-kę albo 6+ numerów na pełnoprawny Album (kwalifikuje się do
                Albumu Roku na Gali Rap Awards!).
              </p>
            </div>
            <div className="text-xs font-mono-num font-bold text-[#fae092]">
              Wybrano: {selectedVaultIds.length} utworów
            </div>
          </div>

          {vaultTracks.length === 0 ? (
            <div className="rounded-2xl surface-inset p-10 text-center">
              <Music2 className="w-9 h-9 text-[#9b99aa] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#cfccd9]">Twój skarbiec jest pusty.</p>
              <p className="text-xs text-[#9b99aa] mt-1">
                Nagraj numery w trybie „Do Skarbca”, aby złożyć EP-kę lub pełny Album.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 cols: Tracklist Selection */}
              <div className="lg:col-span-7 space-y-4">
                <div className="text-xs font-semibold text-[#cfccd9]">
                  1. Wybierz utwory ze Skarbca na tracklistę
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vaultTracks.map((track) => {
                    const picked = selectedVaultIds.includes(track.id);
                    return (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => toggleVaultPick(track.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          picked
                            ? 'glass-panel-gold border-[#f5d37b]'
                            : 'surface-interactive'
                        }`}
                      >
                        <CoverArt cover={track.cover} title={track.title} artist={state.player.alias} size="sm" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate">{track.title}</div>
                          <div className="text-[11px] text-[#9b99aa] font-mono-num">
                            Jakość {track.quality}/100 · {track.bpm} BPM
                          </div>
                        </div>
                        {picked && (
                          <div className="w-5 h-5 rounded-full bg-[#e2b64e] text-black flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 5 cols: Dedicated Album/EP Cover Designer & Release */}
              <div className="lg:col-span-5 rounded-2xl surface-inset p-4 sm:p-5 space-y-4">
                <div className="text-xs font-semibold text-[#fae092]">
                  2. Zaprojektuj okładkę i tytuł płyty ({vaultFormatTag})
                </div>

                <input
                  type="text"
                  maxLength={36}
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Tytuł Twojej EP-ki lub Albumu..."
                  className="w-full min-h-[46px] px-4 py-2 rounded-xl bg-[#09090f] border border-white/12 text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b]"
                />

                <CoverPickerBlock
                  cover={projectCover}
                  onChange={setProjectCover}
                  previewTitle={projectTitle || `Nowy ${vaultFormatTag}`}
                  previewArtist={state.player.alias}
                  releaseTag={vaultFormatTag}
                />

                <button
                  type="button"
                  onClick={handleDropProject}
                  disabled={selectedVaultIds.length < 3}
                  className="w-full min-h-[50px] px-6 py-2.5 rounded-2xl btn-gold disabled:opacity-40 font-bold text-sm cursor-pointer whitespace-nowrap"
                >
                  {selectedVaultIds.length >= 6
                    ? `Wydaj Album (${selectedVaultIds.length} utworów)`
                    : `Wydaj EP-kę (${selectedVaultIds.length}/3 min.)`}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {subTab === 'discography' && (
        <div className="space-y-6">
          {state.projects.length > 0 && (
            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <h2 className="font-display text-2xl font-bold text-white mb-4">Albumy i EP-ki</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setInspectRelease({
                        title: p.title,
                        artist: state.player.alias,
                        subtitle: `${p.format} · ${p.trackIds.length} utworów · ${formatCompact(p.streams)} odsłuchań · ${p.sales.toLocaleString('pl-PL')} płyt`,
                        cover: p.cover,
                        cert: p.cert,
                        releaseTag: p.format.toUpperCase(),
                      })
                    }
                    className="flex items-center gap-4 p-4 rounded-2xl surface-interactive text-left cursor-pointer"
                  >
                    <CoverArt
                      cover={p.cover}
                      title={p.title}
                      artist={state.player.alias}
                      cert={p.cert}
                      releaseTag={p.format.toUpperCase()}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-[#f5d37b] font-semibold">
                        {p.format} · {p.trackIds.length} utworów · Dzień {p.releaseDay}
                      </div>
                      <div className="font-display text-xl font-bold text-white truncate">{p.title}</div>
                      <div className="text-xs text-[#9b99aa] font-mono-num mt-1">
                        {formatCompact(p.streams)} odsłuchań · {p.sales.toLocaleString('pl-PL')} płyt
                      </div>
                      {p.cert !== 'none' && (
                        <div className="text-xs text-[#fae092] font-bold mt-1">
                          {p.cert === 'diamond'
                            ? 'Diamentowa Płyta'
                            : p.cert === 'platinum'
                              ? 'Platynowa Płyta'
                              : 'Złota Płyta'}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold text-white mb-4">Single, Dissy i Produkcje</h2>
            {releasedTracks.length === 0 ? (
              <p className="text-sm text-[#9b99aa]">Nie wydałeś jeszcze żadnego numeru.</p>
            ) : (
              <div className="space-y-2.5">
                {releasedTracks.map((t: Track) => {
                  const feat = t.featNpcId ? state.npcs.find((n) => n.id === t.featNpcId) : undefined;
                  const artistCredit = feat
                    ? `${state.player.alias} feat. ${feat.alias}`
                    : state.player.alias;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setInspectRelease({
                          title: t.title,
                          artist: artistCredit,
                          subtitle: `${t.mode === 'diss' ? 'Diss Track' : t.mode === 'prod_commission' ? 'Produkcja na zlecenie' : 'Singiel'} · Jakość ${t.quality}/100 · ${formatCompact(t.streams)} odsłuchań`,
                          cover: t.cover,
                          cert: t.cert,
                          releaseTag: t.mode === 'diss' ? 'DISS TRACK' : 'SINGIEL',
                        })
                      }
                      className="w-full p-3.5 rounded-2xl surface-interactive flex items-center gap-3.5 text-left cursor-pointer"
                    >
                      <CoverArt
                        cover={t.cover}
                        title={t.title}
                        artist={artistCredit}
                        cert={t.cert}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {t.title}
                          {feat ? ` (feat. ${feat.alias})` : ''}
                        </div>
                        <div className="text-xs text-[#9b99aa] font-mono-num flex flex-wrap gap-x-2">
                          <span>
                            {t.mode === 'diss'
                              ? 'Diss'
                              : t.mode === 'prod_commission'
                                ? 'Zlecenie [Prod. Ty]'
                                : 'Singiel'}
                          </span>
                          <span>·</span>
                          <span>
                            {t.beatProducer ? `Prod. ${t.beatProducer}` : `Prod. ${t.producerTag}`}
                          </span>
                          <span>·</span>
                          <span>Jakość {t.quality}</span>
                          <span>·</span>
                          <span>{formatCompact(t.streams)} odsłuchań</span>
                          {t.cert !== 'none' && (
                            <>
                              <span>·</span>
                              <span className="text-[#fae092] font-bold">
                                {t.cert === 'diamond' ? 'Diament' : t.cert === 'platinum' ? 'Platyna' : 'Złoto'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Full-Size Cover Lightbox Modal */}
      {inspectRelease && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setInspectRelease(null)}
        >
          <div
            className="glass-panel-gold rounded-3xl p-6 max-w-sm w-full flex flex-col items-center text-center relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInspectRelease(null)}
              aria-label="Zamknij podgląd okładki"
              className="absolute top-4 right-4 w-9 h-9 rounded-xl btn-glass text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <CoverArt
              cover={inspectRelease.cover}
              title={inspectRelease.title}
              artist={inspectRelease.artist}
              cert={inspectRelease.cert}
              releaseTag={inspectRelease.releaseTag}
              size="xl"
              className="shadow-[0_24px_48px_-12px_rgba(0,0,0,0.95)]"
            />

            <div className="space-y-1">
              <div className="font-display text-2xl font-bold text-white leading-tight">
                {inspectRelease.title}
              </div>
              <div className="text-xs font-semibold text-[#fae092]">{inspectRelease.artist}</div>
              <div className="text-xs text-[#9b99aa] pt-1">{inspectRelease.subtitle}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
