import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Disc3,
  Handshake,
  Flame,
  UserPlus,
  X,
  Music,
  Bus,
} from 'lucide-react';
import { GameState, NpcRapper } from '../types/game';
import { PORTRAITS, VOIVODESHIP_MAP } from '../data/worldData';
import { ComicPortrait } from './ComicPortrait';
import { formatCompact, formatPLN } from '../engine/simulation';

interface SceneViewProps {
  state: GameState;
  onInteractNpc: (npcId: string, action: 'hangout' | 'provoke' | 'recruit') => void;
  onFoundCrew: (name: string) => void;
  onCrewAction: (action: 'mixtape' | 'tour') => void;
  onGoToStudio: () => void;
}

export const SceneView: React.FC<SceneViewProps> = ({
  state,
  onInteractNpc,
  onFoundCrew,
  onCrewAction,
  onGoToStudio,
}) => {
  const [filter, setFilter] = useState<'all' | 'homies' | 'enemies' | 'same_region'>('all');
  const [selectedNpc, setSelectedNpc] = useState<NpcRapper | null>(null);
  const [crewName, setCrewName] = useState('');

  const filteredNpcs = state.npcs.filter((n) => {
    if (filter === 'homies') return n.relation >= 40;
    if (filter === 'enemies') return n.relation <= -20;
    if (filter === 'same_region') return n.voivodeship === state.player.voivodeship;
    return true;
  });

  const liveSelectedNpc = selectedNpc
    ? state.npcs.find((n) => n.id === selectedNpc.id) || null
    : null;

  const getRelationLabel = (rel: number) => {
    if (rel >= 60) return { text: 'Bliski Ziomek', cls: 'text-emerald-400' };
    if (rel >= 35) return { text: 'Ziomek (-35% feat)', cls: 'text-[#4cd4f5]' };
    if (rel <= -20) return { text: 'Wróg (+65% feat)', cls: 'text-rose-400' };
    return { text: 'Neutralny', cls: 'text-[#9b99aa]' };
  };

  const getTierRing = (tier: NpcRapper['tier']): 'gold' | 'cyan' | 'violet' | 'default' => {
    if (tier === 'Legenda') return 'gold';
    if (tier === 'Gwiazda') return 'cyan';
    if (tier === 'Średnia Liga') return 'violet';
    return 'default';
  };

  const getTierTextCls = (tier: NpcRapper['tier']) => {
    if (tier === 'Legenda') return 'text-[#fae092]';
    if (tier === 'Gwiazda') return 'text-[#4cd4f5]';
    if (tier === 'Średnia Liga') return 'text-[#c4b5fd]';
    return 'text-[#9b99aa]';
  };

  const modalPortraitUrl = liveSelectedNpc
    ? PORTRAITS.find((p) => p.id === liveSelectedNpc.portraitId)?.imageUrl
    : undefined;

  return (
    <div className="space-y-6">
      {/* Crew (Ekipa) Banner */}
      <section className="glass-panel-gold rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#fae092] font-semibold uppercase tracking-wider">
              Wspólne mixtape'y i trasy grupowe
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-0.5 leading-none">
              {state.crew ? `Ekipa: ${state.crew.name}` : 'Polska Scena (15 Artystów NPC)'}
            </h1>
            <p className="text-xs text-[#b5b2c2] mt-1.5">
              {state.crew
                ? `Członkowie: ${state.crew.memberIds.length + 1} · Mixtape'y: ${state.crew.mixtapes} · Trasy ekipy: ${state.crew.groupTours}`
                : 'Kliknij dowolnego rapera, aby zajrzeć w jego pełną kartę, budować relacje lub założyć własną Ekipę.'}
            </p>
          </div>

          {!state.crew ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="text"
                value={crewName}
                onChange={(e) => setCrewName(e.target.value)}
                maxLength={22}
                placeholder="Nazwa Twojej Ekipy..."
                className="min-h-[46px] px-4 py-2 rounded-xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b]"
              />
              <button
                onClick={() => {
                  onFoundCrew(crewName.trim() || `${state.player.city} Squad`);
                  setCrewName('');
                }}
                disabled={state.cash < 1500}
                className="min-h-[46px] px-5 py-2 rounded-xl btn-gold disabled:opacity-45 font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Users className="w-4 h-4" />
                Załóż Ekipę (1 500 zł)
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onCrewAction('mixtape')}
                disabled={state.crew.memberIds.length < 1 || state.energy < 25}
                className="min-h-[44px] px-4 py-2 rounded-xl btn-gold disabled:opacity-40 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Music className="w-4 h-4" />
                Nagraj Mixtape Ekipy
              </button>
              <button
                onClick={() => onCrewAction('tour')}
                disabled={state.crew.memberIds.length < 1 || state.energy < 30}
                className="min-h-[44px] px-4 py-2 rounded-xl btn-violet disabled:opacity-40 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Bus className="w-4 h-4" />
                Trasa Grupowa
              </button>
            </div>
          )}
        </div>

        {state.crew && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-3">
            <span className="text-xs text-[#9b99aa]">Skład:</span>
            <span className="text-xs font-bold text-[#fae092]">{state.player.alias} (Lider)</span>
            {state.crew.memberIds.length === 0 ? (
              <span className="text-xs text-[#9b99aa]">
                · Zrekrutuj Ziomków (relacja ≥ 45), klikając ich kartę poniżej.
              </span>
            ) : (
              state.crew.memberIds.map((id) => {
                const m = state.npcs.find((n) => n.id === id);
                return m ? (
                  <span key={id} className="text-xs font-semibold text-white">
                    · {m.alias}
                  </span>
                ) : null;
              })
            )}
          </div>
        )}
      </section>

      {/* Filter Segmented Bar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-2xl surface-inset w-fit">
        {(
          [
            { id: 'all', label: `Wszyscy (${state.npcs.length})` },
            { id: 'same_region', label: 'Twój Region' },
            { id: 'homies', label: 'Ziomki' },
            { id: 'enemies', label: 'Wrogowie' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filter === tab.id ? 'btn-gold' : 'text-[#9b99aa] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 15 Collector-Style NPC Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredNpcs.map((npc) => {
          const relInfo = getRelationLabel(npc.relation);
          const inCrew = state.crew?.memberIds.includes(npc.id);
          return (
            <button
              key={npc.id}
              onClick={() => setSelectedNpc(npc)}
              className="group surface-interactive rounded-3xl p-4 text-left cursor-pointer flex flex-col justify-between gap-3.5"
            >
              <div className="flex items-start gap-4">
                <ComicPortrait
                  portraitId={npc.portraitId}
                  size="lg"
                  ring={getTierRing(npc.tier)}
                  alt={npc.alias}
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${getTierTextCls(npc.tier)}`}>
                    {npc.tier} · {npc.style}
                  </div>
                  <div className="font-display text-xl font-bold text-white truncate mt-0.5 leading-tight">
                    {npc.alias}
                  </div>
                  <div className="text-xs text-[#9b99aa] flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#b58cff] shrink-0" />
                    {npc.city} · {VOIVODESHIP_MAP[npc.voivodeship].name}
                  </div>
                  <div className="text-[11px] text-[#cfccd9] mt-1.5 font-mono-num">
                    {formatCompact(npc.fans)} fanów
                    {inCrew ? ' · Twoja Ekipa' : ''}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/8 flex items-center justify-between text-xs">
                <span className="text-[#9b99aa] font-mono-num">
                  Złoto: <strong className="text-[#fae092]">{npc.goldCerts}</strong> · Platyna:{' '}
                  <strong className="text-[#4cd4f5]">{npc.platinumCerts}</strong>
                </span>
                <span className={`font-bold ${relInfo.cls}`}>
                  {relInfo.text} ({npc.relation > 0 ? `+${npc.relation}` : npc.relation})
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Full Dramatic NPC Profile Modal */}
      {liveSelectedNpc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedNpc(null)}
        >
          <div
            className="w-full sm:max-w-lg glass-panel-gold rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto shadow-[0_32px_80px_rgba(0,0,0,0.95)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Atmospheric blurred banner header */}
            <div className="relative p-6 pb-5">
              {modalPortraitUrl && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={modalPortraitUrl}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-125 blur-2xl opacity-25"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a12]/55 via-[#0f0e18]/80 to-[#11101a]" />
                </div>
              )}

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <ComicPortrait
                    portraitId={liveSelectedNpc.portraitId}
                    size="xl"
                    ring={getTierRing(liveSelectedNpc.tier)}
                    alt={liveSelectedNpc.alias}
                  />
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wider ${getTierTextCls(liveSelectedNpc.tier)}`}>
                      {liveSelectedNpc.tier} · {liveSelectedNpc.style}
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white leading-tight mt-0.5">
                      {liveSelectedNpc.alias}
                    </h2>
                    <div className="text-xs text-[#cfccd9] mt-0.5">
                      {liveSelectedNpc.city}, woj. {VOIVODESHIP_MAP[liveSelectedNpc.voivodeship].name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNpc(null)}
                  className="min-h-[40px] min-w-[40px] rounded-xl btn-glass text-white flex items-center justify-center cursor-pointer"
                  aria-label="Zamknij profil"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 pt-2 space-y-5">
              <p className="text-sm text-[#d6d3e0] leading-relaxed">{liveSelectedNpc.bio}</p>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-2xl surface-inset p-3.5">
                  <div className="text-[11px] text-[#9b99aa]">Fani</div>
                  <div className="font-mono-num text-sm font-bold text-white mt-0.5">
                    {formatCompact(liveSelectedNpc.fans)}
                  </div>
                </div>
                <div className="rounded-2xl surface-inset p-3.5">
                  <div className="text-[11px] text-[#9b99aa]">Złote / Platyny</div>
                  <div className="font-mono-num text-sm font-bold text-[#fae092] mt-0.5">
                    {liveSelectedNpc.goldCerts} / {liveSelectedNpc.platinumCerts}
                  </div>
                </div>
                <div className="rounded-2xl surface-inset p-3.5">
                  <div className="text-[11px] text-[#9b99aa]">Gościnka</div>
                  <div className="font-mono-num text-sm font-bold text-[#4cd4f5] mt-0.5">
                    {state.crew?.memberIds.includes(liveSelectedNpc.id)
                      ? '0 zł'
                      : formatPLN(
                          liveSelectedNpc.relation >= 40
                            ? Math.round(liveSelectedNpc.featCost * 0.65)
                            : liveSelectedNpc.relation <= -20
                              ? Math.round(liveSelectedNpc.featCost * 1.65)
                              : liveSelectedNpc.featCost
                        )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl surface-inset p-3.5 flex items-center justify-between text-xs">
                <span className="text-[#9b99aa] flex items-center gap-1.5">
                  <Disc3 className="w-4 h-4 text-[#f5d37b]" />
                  Największy hit:
                </span>
                <span className="font-bold text-white">„{liveSelectedNpc.biggestHit}”</span>
              </div>

              {/* Relation meter */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#9b99aa]">Twoja relacja</span>
                  <span className={`font-bold ${getRelationLabel(liveSelectedNpc.relation).cls}`}>
                    {getRelationLabel(liveSelectedNpc.relation).text} ({liveSelectedNpc.relation})
                  </span>
                </div>
                <div className="h-2.5 rounded-full meter-track overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      liveSelectedNpc.relation >= 0 ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, (liveSelectedNpc.relation + 100) / 2))}%` }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => onInteractNpc(liveSelectedNpc.id, 'hangout')}
                  disabled={state.energy < 12}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl btn-glass disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Handshake className="w-4 h-4 text-emerald-400" />
                  Spotkanie (-12 Energii)
                </button>

                <button
                  onClick={() => onInteractNpc(liveSelectedNpc.id, 'provoke')}
                  disabled={state.energy < 10}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl btn-crimson disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  Zaczep w sieci (+Hype)
                </button>

                {state.crew && !state.crew.memberIds.includes(liveSelectedNpc.id) && (
                  <button
                    onClick={() => onInteractNpc(liveSelectedNpc.id, 'recruit')}
                    disabled={liveSelectedNpc.relation < 45}
                    className="min-h-[46px] px-4 py-2.5 rounded-xl btn-violet disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    {liveSelectedNpc.relation < 45
                      ? 'Zaproś do Ekipy (relacja 45)'
                      : 'Zrekrutuj do Ekipy'}
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedNpc(null);
                    onGoToStudio();
                  }}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl btn-gold text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  Nagraj Feat / Diss w Studiu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
