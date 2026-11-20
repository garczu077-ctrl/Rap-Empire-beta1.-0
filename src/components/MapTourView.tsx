import React, { useState } from 'react';
import { Crown, MapPin, Plane, Ticket, Sparkles } from 'lucide-react';
import { GameState, VenueScopeId, VoivodeshipId } from '../types/game';
import { VOIVODESHIPS, VOIVODESHIP_MAP } from '../data/worldData';
import { formatCompact, formatPLN } from '../engine/simulation';

interface MapTourViewProps {
  state: GameState;
  onPlayConcert: (payload: {
    scope: VenueScopeId;
    venueName: string;
    tier: 'pub' | 'club' | 'arena' | 'polonia';
    energyCost: number;
    upfrontCost: number;
    minFans: number;
  }) => { summary: string; cameoNpc?: string } | null;
}

export const MapTourView: React.FC<MapTourViewProps> = ({ state, onPlayConcert }) => {
  const [selectedRegion, setSelectedRegion] = useState<VoivodeshipId>(state.player.voivodeship);
  const [lastRecap, setLastRecap] = useState<{ summary: string; cameoNpc?: string } | null>(null);

  const regionDef = VOIVODESHIP_MAP[selectedRegion];
  const support = state.regionSupport[selectedRegion] || 0;
  const kingCount = Object.values(state.regionSupport).filter((v) => v >= 100).length;

  const venues = [
    {
      tier: 'pub' as const,
      name: `Podziemny Pub (${regionDef.cities[0]})`,
      minFans: 0,
      upfrontCost: 150,
      energyCost: 20,
      supportGain: '+18% poparcia',
      estPay: Math.round(520 + support * 12 + state.fans * 0.025),
    },
    {
      tier: 'club' as const,
      name: `Klub Muzyczny (${regionDef.cities[1] || regionDef.cities[0]})`,
      minFans: 1500,
      upfrontCost: 900,
      energyCost: 26,
      supportGain: '+26% poparcia',
      estPay: Math.round(2400 + support * 32 + state.fans * 0.065),
    },
    {
      tier: 'arena' as const,
      name: `Hala Widowiskowa · ${regionDef.name}`,
      minFans: 25000,
      upfrontCost: 6500,
      energyCost: 34,
      supportGain: '+35% poparcia',
      estPay: Math.round(14500 + support * 90 + state.fans * 0.16),
    },
  ];

  const getRegionFill = (val: number, isSelected: boolean) => {
    if (val >= 100) return 'url(#mapGoldGrad)';
    if (val >= 55) return isSelected ? 'url(#mapVioletBright)' : 'url(#mapVioletGrad)';
    if (val >= 20) return isSelected ? 'url(#mapCyanBright)' : 'url(#mapCyanGrad)';
    return isSelected ? '#2a2a42' : '#141422';
  };

  const triggerConcert = (params: Parameters<MapTourViewProps['onPlayConcert']>[0]) => {
    const res = onPlayConcert(params);
    if (res) setLastRecap(res);
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel-gold rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#fae092] font-semibold uppercase tracking-wider">
            Podbój Polski · 16 Województw + Sceny Polonijne
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-0.5 leading-none">
            Mapa Koncertowa
          </h1>
          <p className="text-xs text-[#b5b2c2] mt-1.5">
            Osiągnij 100% poparcia w regionie, aby zdobyć tytuł Króla Regionu. Przyjaciele ze sceny
            potrafią niespodziewanie wbić na Twój koncert!
          </p>
        </div>
        <div className="rounded-2xl surface-inset px-5 py-3 text-left sm:text-right font-mono-num shrink-0">
          <div className="text-[11px] text-[#9b99aa]">Podbite województwa</div>
          <div className="text-2xl font-bold text-gold-metallic">{kingCount} / 16</div>
        </div>
      </section>

      {lastRecap && (
        <div className="glass-panel-gold rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#fae092] shrink-0 mt-0.5" />
          <div className="text-sm text-white">
            <div className="font-bold">{lastRecap.summary}</div>
            {lastRecap.cameoNpc && (
              <div className="text-xs text-[#fae092] mt-1">
                Gość niespodzianka! Na scenę wbił Twój ziomek {lastRecap.cameoNpc} — publika oszalała!
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Luminous SVG Map of 16 Polish Voivodeships */}
        <section className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 className="font-display text-2xl font-bold text-white">Kliknij województwo</h2>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[#9b99aa]">
              <span>0%</span>
              <span className="text-[#4cd4f5]">20%+</span>
              <span className="text-[#c4b5fd]">55%+</span>
              <span className="text-[#fae092]">100% Król</span>
            </div>
          </div>

          <div className="rounded-2xl surface-inset p-4 relative overflow-hidden">
            {/* Subtle radar grid lines */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
            <div className="relative w-full max-w-[520px] mx-auto">
              <svg viewBox="0 0 420 380" className="w-full h-auto select-none drop-shadow-[0_14px_24px_rgba(0,0,0,0.85)]">
                <defs>
                  <linearGradient id="mapGoldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fae092" />
                    <stop offset="55%" stopColor="#e2b64e" />
                    <stop offset="100%" stopColor="#b58425" />
                  </linearGradient>
                  <linearGradient id="mapVioletGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#9d6bff" />
                    <stop offset="100%" stopColor="#5b21b6" />
                  </linearGradient>
                  <linearGradient id="mapVioletBright" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c4b5fd" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="mapCyanGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#164e63" />
                  </linearGradient>
                  <linearGradient id="mapCyanBright" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#7dd3fc" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>

                {VOIVODESHIPS.map((v) => {
                  const val = state.regionSupport[v.id] || 0;
                  const isSelected = selectedRegion === v.id;
                  return (
                    <g
                      key={v.id}
                      onClick={() => setSelectedRegion(v.id)}
                      className="cursor-pointer transition-opacity hover:opacity-95"
                    >
                      <path
                        d={v.path}
                        fill={getRegionFill(val, isSelected)}
                        stroke={isSelected ? '#ffffff' : 'rgba(255,255,255,0.22)'}
                        strokeWidth={isSelected ? 2.6 : 1.1}
                      />
                      <text
                        x={v.labelX}
                        y={v.labelY - 3}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="700"
                        fill={val >= 100 ? '#09080c' : '#f5f3ee'}
                        className="pointer-events-none"
                      >
                        {v.cities[0]}
                      </text>
                      <text
                        x={v.labelX}
                        y={v.labelY + 8}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="800"
                        fill={val >= 100 ? '#09080c' : '#fae092'}
                        className="pointer-events-none"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </section>

        {/* Right: Selected Region Venues & Polonia Festivals */}
        <div className="lg:col-span-5 space-y-5">
          <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs text-[#c4b5fd] font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Województwo {regionDef.name}
                </div>
                <h2 className="font-display text-2xl font-bold text-white mt-0.5 flex items-center gap-2">
                  {regionDef.cities.join(' · ')}
                  {support >= 100 && <Crown className="w-5 h-5 text-[#fae092]" />}
                </h2>
              </div>
              <div className="text-right font-mono-num">
                <div className="text-[11px] text-[#9b99aa]">Poparcie</div>
                <div className="text-2xl font-bold text-gold-metallic">{support}%</div>
              </div>
            </div>

            <div className="h-2.5 rounded-full meter-track overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${support}%`,
                  background:
                    support >= 100
                      ? 'linear-gradient(90deg, #b58425, #fae092)'
                      : 'linear-gradient(90deg, #7c3aed, #c084fc)',
                }}
              />
            </div>

            <div className="space-y-3">
              {venues.map((v) => {
                const locked = state.fans < v.minFans;
                const noCash = state.cash < v.upfrontCost;
                const noEnergy = state.energy < v.energyCost;
                return (
                  <div key={v.tier} className="rounded-2xl surface-inset p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-bold text-white">{v.name}</div>
                      <span className="font-mono-num text-xs font-bold text-emerald-400">
                        ~{formatPLN(v.estPay)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9b99aa] font-mono-num">
                      Koszt org.: {formatPLN(v.upfrontCost)} · {v.energyCost} Energii · {v.supportGain}
                      {v.minFans > 0 ? ` · Wymaga ${formatCompact(v.minFans)} fanów` : ''}
                    </div>
                    <button
                      onClick={() =>
                        triggerConcert({
                          scope: selectedRegion,
                          venueName: v.name,
                          tier: v.tier,
                          energyCost: v.energyCost,
                          upfrontCost: v.upfrontCost,
                          minFans: v.minFans,
                        })
                      }
                      disabled={locked || noCash || noEnergy}
                      className="min-h-[42px] w-full rounded-xl btn-gold disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      {locked ? `Zablokowane (${formatCompact(v.minFans)} fanów)` : 'Zagraj koncert'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Polonia International Festivals */}
          <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3.5">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#4cd4f5]" />
              Festiwale Polonijne
            </h2>
            <p className="text-xs text-[#9b99aa]">
              Wielkie wyjazdy dla Polonii w Londynie i Chicago. Wymagają 15 000 fanów.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  { id: 'londyn', label: 'Londyn · O2 Polonia Fest', cost: 4500 },
                  { id: 'chicago', label: 'Chicago · Jackowo Live', cost: 6000 },
                ] as const
              ).map((fest) => (
                <button
                  key={fest.id}
                  onClick={() =>
                    triggerConcert({
                      scope: fest.id,
                      venueName: fest.label,
                      tier: 'polonia',
                      energyCost: 35,
                      upfrontCost: fest.cost,
                      minFans: 15000,
                    })
                  }
                  disabled={state.fans < 15000 || state.cash < fest.cost || state.energy < 35}
                  className="min-h-[64px] p-3.5 rounded-2xl surface-interactive disabled:opacity-40 border-[#4cd4f5]/30 text-left cursor-pointer"
                >
                  <div className="text-xs font-bold text-white">{fest.label}</div>
                  <div className="text-[11px] text-[#4cd4f5] font-mono-num mt-1">
                    Lot i organizacja: {formatPLN(fest.cost)} · 35 E
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
