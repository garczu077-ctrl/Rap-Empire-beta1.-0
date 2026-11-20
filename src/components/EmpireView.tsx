import React, { useState } from 'react';
import { Shirt, Building2, UserPlus, Disc3, Flame, CheckCircle2 } from 'lucide-react';
import { BrandStyle, GameState } from '../types/game';
import { PORTRAITS, VOIVODESHIPS } from '../data/worldData';
import { ComicPortrait } from './ComicPortrait';
import { formatCompact, formatPLN } from '../engine/simulation';

interface EmpireViewProps {
  state: GameState;
  onFoundBrand: (name: string, style: BrandStyle) => void;
  onLaunchDrop: (name: string, units: number, unitPrice: number, prodCost: number) => void;
  onFoundLabel: (name: string) => void;
  onSignTalent: (talent: {
    alias: string;
    gender: 'male' | 'female';
    portraitId: number;
    city: string;
    voivodeship: GameState['player']['voivodeship'];
    potential: number;
    signingBonus: number;
  }) => void;
  onDropLabelCompilation: () => void;
}

const TALENT_NAMES = [
  'Młody Kruk', 'Złota Iskra', 'Nocny Cień', 'Kacper 808', 'Maja Flow',
  'Szybki Wers', 'Vibe z Osiedla', 'Klara Drill', 'Betonowy Sen', 'Mały Błysk',
];

export const EmpireView: React.FC<EmpireViewProps> = ({
  state,
  onFoundBrand,
  onLaunchDrop,
  onFoundLabel,
  onSignTalent,
  onDropLabelCompilation,
}) => {
  const [brandName, setBrandName] = useState('');
  const [brandStyle, setBrandStyle] = useState<BrandStyle>('streetwear');

  const [dropName, setDropName] = useState('');
  const [dropUnits, setDropUnits] = useState(120);
  const [dropPrice, setDropPrice] = useState(219);

  const [labelName, setLabelName] = useState('');
  const [scoutSeed, setScoutSeed] = useState(1);

  const unitCost = brandStyle === 'luxury' ? 110 : brandStyle === 'streetwear' ? 65 : 42;
  const totalDropCost = dropUnits * unitCost;

  const usedPortraits = new Set<number>([
    state.player.portraitId,
    ...state.npcs.map((n) => n.portraitId),
    ...(state.label?.artists.map((a) => a.portraitId) || []),
  ]);
  const freePortraits = PORTRAITS.filter((p) => !usedPortraits.has(p.id));
  const scoutCandidates = [0, 1, 2].map((offset) => {
    const idx = (scoutSeed * 3 + offset) % Math.max(1, freePortraits.length);
    const p = freePortraits[idx] || PORTRAITS[offset];
    const v = VOIVODESHIPS[(scoutSeed * 5 + offset * 3) % VOIVODESHIPS.length];
    const potential = 62 + ((p.id * 7 + scoutSeed * 11) % 34);
    const signingBonus = Math.round(1800 + potential * 48);
    return {
      alias: TALENT_NAMES[(scoutSeed + offset * 2 + p.id) % TALENT_NAMES.length],
      gender: p.gender,
      portraitId: p.id,
      city: v.cities[0],
      voivodeship: v.id,
      potential,
      signingBonus,
    };
  });

  return (
    <div className="space-y-6">
      <section className="glass-panel-gold rounded-3xl p-5 sm:p-6">
        <div className="text-xs text-[#fae092] font-semibold uppercase tracking-wider">
          Od muzyki do wielkiego biznesu
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-0.5 leading-none">
          Imperium Biznesowe
        </h1>
        <p className="text-xs text-[#b5b2c2] mt-1.5">
          Wypuszczaj limitowane dropy odzieżowe i poluj na SOLD OUT, a potem załóż własną wytwórnię
          płytową i podpisuj młode talenty z całej Polski.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 cols: Clothing Brand */}
        <section className="lg:col-span-6 glass-panel rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Shirt className="w-5 h-5 text-[#f5d37b]" />
              {state.brand ? `Marka: ${state.brand.name}` : 'Własna Marka Odzieżowa'}
            </h2>
            {state.brand && (
              <span className="text-xs text-[#c4b5fd] font-bold uppercase tracking-wider">
                {state.brand.style === 'streetwear'
                  ? 'Streetwear'
                  : state.brand.style === 'luxury'
                    ? 'Luksus'
                    : 'Płytowa / Merch'}
              </span>
            )}
          </div>

          {!state.brand ? (
            <div className="space-y-4">
              <p className="text-xs text-[#cfccd9] leading-relaxed">
                Założenie marki kosztuje {formatPLN(3500)} (wymagane 1 000 fanów). Wybierz styl
                dopasowany do Twojej publiczności — streetwear świetnie sprzedaje się przy wysokim
                szacunku Ulicy.
              </p>

              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                maxLength={24}
                placeholder="Nazwa Twojej marki odzieżowej..."
                className="w-full min-h-[46px] px-4 py-2 rounded-xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b]"
              />

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'streetwear', label: 'Streetwear' },
                    { id: 'luxury', label: 'Luksus' },
                    { id: 'vinyl_merch', label: 'Płytowa' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBrandStyle(s.id)}
                    className={`min-h-[44px] rounded-xl text-xs font-bold cursor-pointer ${
                      brandStyle === s.id
                        ? 'btn-gold'
                        : 'surface-inset text-[#cfccd9] hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  onFoundBrand(brandName.trim() || `${state.player.alias} Wear`, brandStyle);
                  setBrandName('');
                }}
                disabled={state.cash < 3500 || state.fans < 1000}
                className="w-full min-h-[48px] rounded-2xl btn-gold disabled:opacity-40 font-bold text-sm cursor-pointer"
              >
                {state.fans < 1000
                  ? 'Wymagane 1 000 fanów'
                  : 'Załóż markę odzieżową (3 500 zł)'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Launch New Drop */}
              <div className="rounded-2xl surface-inset p-4 space-y-3.5">
                <div className="text-xs font-bold text-[#fae092]">
                  Wypuść nowy limitowany Drop
                </div>
                <input
                  type="text"
                  value={dropName}
                  onChange={(e) => setDropName(e.target.value)}
                  maxLength={28}
                  placeholder="np. Hoodie Czarny Winyl, Kolekcja Noc..."
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#12121e] border border-white/10 text-xs text-white focus:outline-none focus:border-[#f5d37b]"
                />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[#9b99aa] mb-1">
                      <span>Nakład</span>
                      <span className="font-mono-num font-bold text-white">{dropUnits} szt.</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={600}
                      step={25}
                      value={dropUnits}
                      onChange={(e) => setDropUnits(Number(e.target.value))}
                      className="w-full accent-[#e2b64e]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[#9b99aa] mb-1">
                      <span>Cena szt.</span>
                      <span className="font-mono-num font-bold text-white">{dropPrice} zł</span>
                    </div>
                    <input
                      type="range"
                      min={119}
                      max={499}
                      step={10}
                      value={dropPrice}
                      onChange={(e) => setDropPrice(Number(e.target.value))}
                      className="w-full accent-[#e2b64e]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#9b99aa] font-mono-num">
                    Produkcja: <strong className="text-white">{formatPLN(totalDropCost)}</strong>
                  </span>
                  <button
                    onClick={() => {
                      onLaunchDrop(
                        dropName.trim() || `Drop #${state.brand!.drops.length + 1}`,
                        dropUnits,
                        dropPrice,
                        totalDropCost
                      );
                      setDropName('');
                    }}
                    disabled={state.cash < totalDropCost}
                    className="min-h-[42px] px-5 py-2 rounded-xl btn-gold disabled:opacity-40 font-bold text-xs cursor-pointer whitespace-nowrap"
                  >
                    Wypuść Drop
                  </button>
                </div>
              </div>

              {/* Active & Past Drops */}
              <div className="space-y-3">
                {state.brand.drops.length === 0 ? (
                  <p className="text-xs text-[#9b99aa]">
                    Wypuść pierwszy drop i obserwuj dzień po dniu, jak schodzi nakład.
                  </p>
                ) : (
                  state.brand.drops.map((d) => {
                    const pct = Math.round((d.soldUnits / d.totalUnits) * 100);
                    return (
                      <div key={d.id} className="rounded-2xl surface-inset p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{d.name}</span>
                          {d.soldOut ? (
                            <span className="text-[#fae092] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              SOLD OUT
                            </span>
                          ) : (
                            <span className="font-mono-num font-bold text-[#4cd4f5]">
                              {d.soldUnits}/{d.totalUnits} szt. ({pct}%)
                            </span>
                          )}
                        </div>
                        <div className="h-2.5 rounded-full meter-track mt-2.5 overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              background: d.soldOut
                                ? 'linear-gradient(90deg, #b58425, #fae092)'
                                : 'linear-gradient(90deg, #0284c7, #4cd4f5)',
                            }}
                          />
                        </div>
                        <div className="text-[11px] text-[#9b99aa] font-mono-num mt-2">
                          Przychód: <strong className="text-white">{formatPLN(d.soldUnits * d.unitPrice)}</strong> · Cena: {d.unitPrice} zł
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right 6 cols: Record Label */}
        <section className="lg:col-span-6 glass-panel rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#c4b5fd]" />
              {state.label ? `Wytwórnia: ${state.label.name}` : 'Własna Wytwórnia Płytowa'}
            </h2>
            {state.label && (
              <span className="text-xs font-mono-num font-bold text-emerald-400">
                Zarobiono: {formatPLN(state.label.totalEarnings)}
              </span>
            )}
          </div>

          {!state.label ? (
            <div className="space-y-4">
              <p className="text-xs text-[#cfccd9] leading-relaxed">
                Otwórz własną wytwórnię płytową, aby wyszukiwać młode talenty z całej Polski,
                podpisywać kontrakty, zgarniać codzienne tantiemy i wydawać kompilacje wytwórni.
                Wymagane: {formatPLN(25000)} kapitału i 12 000 fanów.
              </p>

              <input
                type="text"
                value={labelName}
                onChange={(e) => setLabelName(e.target.value)}
                maxLength={26}
                placeholder="Nazwa Twojej wytwórni (np. Złoty Winyl Rec.)..."
                className="w-full min-h-[46px] px-4 py-2 rounded-xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#c4b5fd]"
              />

              <button
                onClick={() => {
                  onFoundLabel(labelName.trim() || `${state.player.alias} Records`);
                  setLabelName('');
                }}
                disabled={state.cash < 25000 || state.fans < 12000}
                className="w-full min-h-[48px] rounded-2xl btn-violet disabled:opacity-40 font-bold text-sm cursor-pointer"
              >
                {state.fans < 12000
                  ? 'Wymagane 12 000 fanów i 25 000 zł'
                  : 'Otwórz Wytwórnię Płytową (25 000 zł)'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Signed Roster */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white">
                    Podpisani artyści ({state.label.artists.length}/5)
                  </span>
                  <button
                    onClick={onDropLabelCompilation}
                    disabled={state.label.artists.length < 1 || state.energy < 25}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl btn-gold disabled:opacity-40 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Disc3 className="w-3.5 h-3.5" />
                    Wydaj Kompilację
                  </button>
                </div>

                {state.label.artists.length === 0 ? (
                  <p className="text-xs text-[#9b99aa]">
                    Podpisz poniżej pierwsze młode talenty z podziemia!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {state.label.artists.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-2xl surface-inset"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ComicPortrait portraitId={a.portraitId} size="sm" ring="violet" alt={a.alias} />
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate">{a.alias}</div>
                            <div className="text-[11px] text-[#9b99aa] font-mono-num">
                              {a.city} · Potencjał {a.potential} · {formatCompact(a.fans)} fanów
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono-num text-xs font-bold text-emerald-400 shrink-0">
                          +{formatPLN(a.dailyRoyalty)}/d
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Talent Scouting */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#c4b5fd] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Skauting młodych talentów z Polski
                  </span>
                  <button
                    onClick={() => setScoutSeed((s) => s + 1)}
                    className="text-xs text-[#fae092] hover:underline font-semibold cursor-pointer"
                  >
                    Szukaj innych
                  </button>
                </div>

                <div className="space-y-2.5">
                  {scoutCandidates.map((cand) => (
                    <div
                      key={`${cand.portraitId}_${cand.alias}`}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl surface-inset"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ComicPortrait portraitId={cand.portraitId} size="sm" ring="default" alt={cand.alias} />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{cand.alias}</div>
                          <div className="text-[11px] text-[#9b99aa] font-mono-num">
                            {cand.city} · Potencjał {cand.potential}/100
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onSignTalent(cand)}
                        disabled={
                          state.cash < cand.signingBonus || state.label!.artists.length >= 5
                        }
                        className="min-h-[40px] px-3.5 py-1.5 rounded-xl btn-violet disabled:opacity-40 text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Podpisz ({formatPLN(cand.signingBonus)})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
