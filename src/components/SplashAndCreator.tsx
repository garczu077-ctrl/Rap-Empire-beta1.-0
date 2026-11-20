import React, { useMemo, useState } from 'react';
import { Upload, ArrowRight, RotateCcw, MapPin, Disc3, Check } from 'lucide-react';
import { Gender, VoivodeshipId } from '../types/game';
import { ASSET_URLS, PORTRAITS, VOIVODESHIPS } from '../data/worldData';
import { ComicPortrait } from './ComicPortrait';
import { AudioPlayerMenu } from './AudioPlayerMenu';

interface SplashAndCreatorProps {
  hasSavedGame: boolean;
  savedAlias?: string;
  savedDay?: number;
  onContinue: () => void;
  onStartNew: (params: {
    alias: string;
    gender: Gender;
    city: string;
    voivodeship: VoivodeshipId;
    portraitId: number;
    customAvatar?: string;
  }) => void;
}

export const SplashAndCreator: React.FC<SplashAndCreatorProps> = ({
  hasSavedGame,
  savedAlias,
  savedDay,
  onContinue,
  onStartNew,
}) => {
  const [step, setStep] = useState<'splash' | 'creator'>('splash');
  const [alias, setAlias] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [selectedPortraitId, setSelectedPortraitId] = useState<number>(14);
  const [customAvatar, setCustomAvatar] = useState<string | undefined>(undefined);
  const [voivodeship, setVoivodeship] = useState<VoivodeshipId>('opolskie');
  const [city, setCity] = useState<string>('Opole');

  const currentVoivodeship = useMemo(
    () => VOIVODESHIPS.find((v) => v.id === voivodeship) || VOIVODESHIPS[11],
    [voivodeship]
  );

  const visiblePortraits = useMemo(() => {
    if (genderFilter === 'all') return PORTRAITS;
    return PORTRAITS.filter((p) => p.gender === genderFilter);
  }, [genderFilter]);

  const selectedPortrait = PORTRAITS.find((p) => p.id === selectedPortraitId) || PORTRAITS[0];

  const handleVoivodeshipChange = (nextId: VoivodeshipId) => {
    setVoivodeship(nextId);
    const v = VOIVODESHIPS.find((item) => item.id === nextId);
    if (v && v.cities.length > 0) {
      setCity(v.cities[0]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartNew({
      alias: alias.trim() || 'Młody Gracz',
      gender: selectedPortrait.gender,
      city: city.trim() || currentVoivodeship.cities[0],
      voivodeship,
      portraitId: selectedPortraitId,
      customAvatar,
    });
  };

  if (step === 'splash') {
    return (
      <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-[#06060a]">
        {/* Blurred atmospheric light from user's tytul.png poster */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={ASSET_URLS.splash}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-110 blur-2xl opacity-30 saturate-125"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#06060a]/80 via-[#06060a]/75 to-[#06060a]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 72% 42%, rgba(226,182,78,0.22), transparent 52%), radial-gradient(circle at 18% 72%, rgba(157,107,255,0.16), transparent 48%)',
            }}
          />
        </div>

        {/* Minimal Top Header */}
        <header className="relative z-20 max-w-6xl w-full mx-auto px-5 sm:px-8 pt-6 flex items-center justify-center">
          <div className="font-display text-2xl sm:text-3xl font-bold tracking-wider text-gold-metallic text-center whitespace-nowrap">
            RAP EMPIRE BETA
          </div>
          <div className="absolute right-5 sm:right-8 top-5">
            <AudioPlayerMenu />
          </div>
        </header>

        {/* Cinematic Asymmetric Split Showcase featuring User's Authentic Poster */}
        <main className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Mobile Poster First, Desktop Right Column */}
          <div className="lg:col-span-5 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-[300px] sm:max-w-[340px] lg:max-w-[390px] animate-float-slow">
              {/* Warm Golden Backlight Halo */}
              <div
                className="absolute -inset-4 rounded-[36px] blur-3xl opacity-55 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 35%, rgba(245,211,123,0.45), rgba(157,107,255,0.22) 60%, transparent 80%)',
                }}
              />
              {/* Framed Vertical Graphic-Novel Poster */}
              <div className="relative rounded-[28px] overflow-hidden border border-[#f5d37b]/45 bg-[#0a0a10] shadow-[0_32px_70px_-18px_rgba(0,0,0,0.95),0_0_40px_-10px_rgba(226,182,78,0.35)]">
                <img
                  src={ASSET_URLS.splash}
                  alt="Plakat tytułowy RAP EMPIRE"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow:
                      'inset 0 1px 0 rgba(255,245,210,0.45), inset 0 -24px 36px -12px rgba(6,6,10,0.75)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Left Editorial Pitch & Sculpted Actions */}
          <div className="lg:col-span-7 lg:order-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#f5d37b] mb-3">
              Symulator Kariery Rapera · Edycja Dark Neon & Gold
            </div>

            <h1
              className="font-display text-4xl sm:text-6xl xl:text-[68px] font-bold tracking-tight text-white leading-[0.98]"
              style={{ textWrap: 'balance' }}
            >
              Z 900 ZŁ W KIESZENI NA{' '}
              <span className="text-gold-metallic">SZCZYT POLSKIEGO RAPU</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-[#cfccd9] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Klepanie bitów na 16-krokowym beatmakerze, własne zwrotki z podpowiedziami rymów,
              gorące beefy na RapPortalu, podbój 16 województw oraz własna marka streetwear i
              wytwórnia płytowa.
            </p>

            {/* Sculpted Primary Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-3.5">
              {hasSavedGame && (
                <button
                  onClick={onContinue}
                  className="w-full sm:w-auto min-h-[52px] px-7 py-3 rounded-2xl btn-gold font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
                >
                  <Disc3 className="w-4 h-4" />
                  Kontynuuj ({savedAlias} · Dzień {savedDay})
                </button>
              )}
              <button
                onClick={() => setStep('creator')}
                className={`w-full sm:w-auto min-h-[52px] px-7 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap ${
                  hasSavedGame ? 'btn-glass text-white' : 'btn-gold'
                }`}
              >
                {hasSavedGame ? (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    Nowa kariera
                  </>
                ) : (
                  <>
                    Rozpocznij karierę
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Authentic Portrait Strip Preview */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="flex -space-x-2.5">
                  {[34, 9, 20, 25, 33, 19].map((id) => (
                    <ComicPortrait
                      key={id}
                      portraitId={id}
                      size="xs"
                      ring="gold"
                      className="ring-2 ring-[#06060a]"
                    />
                  ))}
                </div>
                <span className="text-xs text-[#9b99aa]">
                  <strong className="text-white">47 komiksowych postaci</strong> zaludnia scenę — wybierz swoją twarz lub wgraj zdjęcie
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* Grounded Editorial Highlights */}
        <footer className="relative z-10 max-w-6xl w-full mx-auto px-5 sm:px-8 pb-7">
          <div className="glass-panel rounded-2xl p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div>
              <div className="font-mono-num text-xl font-bold text-gold-metallic">47</div>
              <div className="text-xs text-[#9b99aa]">Ilustrowanych portretów + własne foto</div>
            </div>
            <div>
              <div className="font-mono-num text-xl font-bold text-[#b58cff]">15 NPC</div>
              <div className="text-xs text-[#9b99aa]">Rywale, ziomki, beefy i [Prod. Ty]</div>
            </div>
            <div>
              <div className="font-mono-num text-xl font-bold text-[#4cd4f5]">16 Regionów</div>
              <div className="text-xs text-[#9b99aa]">Mapa Polski + Londyn i Chicago</div>
            </div>
            <div>
              <div className="font-mono-num text-xl font-bold text-white">60 Dni</div>
              <div className="text-xs text-[#9b99aa]">Pełny sezon zwieńczony Galą Rap Awards</div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-white/8 text-center space-y-0.5 text-[11px] text-[#7e7c8f]">
            <div>
              <span className="text-[#e8ba62] font-semibold tracking-wider">RAP EMPIRE</span> · Developed by{' '}
              <span className="text-[#c8c5d6]">Garczu Studios</span>
            </div>
            <div>© 2026 Garczu Studios. All rights reserved.</div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060a] bg-noise text-[#f5f3ee] py-6 px-4 sm:px-8 relative overflow-hidden">
      {/* Ambient spotlight matching selected portrait */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(226,182,78,0.2), transparent 48%), radial-gradient(circle at 82% 80%, rgba(157,107,255,0.18), transparent 48%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-[#f5d37b]">
              RAP EMPIRE BETA · Start Kariery
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mt-0.5">
              Kreator Artysty
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setStep('splash')}
            className="min-h-[44px] px-4 py-2 rounded-xl btn-glass text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
          >
            Wróć
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 cols: Featured Character Card + Identity Form */}
          <div className="lg:col-span-5 glass-panel-gold rounded-3xl p-5 sm:p-6 space-y-5 relative overflow-hidden">
            {/* Soft ambient blurred glow from chosen portrait */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <ComicPortrait
                portraitId={selectedPortraitId}
                customAvatar={customAvatar}
                size="2xl"
                ring="gold"
                alt="Podgląd Twojego portretu"
              />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#f5d37b]">
                  {customAvatar
                    ? 'Własne zdjęcie'
                    : `${selectedPortrait.gender === 'female' ? 'Raperka' : 'Raper'} · #${selectedPortrait.id}`}
                </div>
                <div className="font-display text-3xl font-bold text-white truncate mt-0.5">
                  {alias.trim() || 'Młody Gracz'}
                </div>
                <div className="text-xs text-[#cfccd9] flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#b58cff]" />
                  {city} · {currentVoivodeship.name}
                </div>
                <div className="text-[11px] text-[#9b99aa] mt-1">
                  Styl: {customAvatar ? 'Własny wizerunek' : selectedPortrait.label}
                </div>

                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <label className="min-h-[40px] px-3.5 py-1.5 rounded-xl btn-glass text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#f5d37b]" />
                    Wgraj zdjęcie
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {customAvatar && (
                    <button
                      type="button"
                      onClick={() => setCustomAvatar(undefined)}
                      className="text-xs text-[#9b99aa] hover:text-white underline cursor-pointer"
                    >
                      Usuń
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-[#cfccd9] mb-1.5">
                  Ksywka sceniczna
                </label>
                <input
                  type="text"
                  maxLength={22}
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="np. Młody Opole, Kruk, Złota Wena..."
                  className="w-full min-h-[46px] px-4 py-2.5 rounded-xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cfccd9] mb-1.5">
                    Województwo startowe
                  </label>
                  <select
                    value={voivodeship}
                    onChange={(e) => handleVoivodeshipChange(e.target.value as VoivodeshipId)}
                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl surface-inset text-sm text-white focus:outline-none focus:border-[#f5d37b]"
                  >
                    {VOIVODESHIPS.map((v) => (
                      <option key={v.id} value={v.id} className="bg-[#111119]">
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cfccd9] mb-1.5">
                    Rodzinne miasto
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl surface-inset text-sm text-white focus:outline-none focus:border-[#f5d37b]"
                  >
                    {currentVoivodeship.cities.map((c) => (
                      <option key={c} value={c} className="bg-[#111119]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl surface-inset p-4 text-xs text-[#9b99aa] space-y-1">
                <div className="text-[#f5d37b] font-semibold">Start: 900 zł · 30 słuchaczy · +12% w regionie</div>
                <p className="leading-relaxed">
                  Artyści z województwa {currentVoivodeship.name} od pierwszego dnia darzą Cię
                  większą sympatią i oferują zniżki na wspólne numery.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] px-6 py-3 rounded-2xl btn-gold font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Wejdź na scenę
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right 7 cols: Full-Art 47 Comic Portraits Character Select */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Galeria Postaci (47 portretów)
                </h2>
                <p className="text-xs text-[#9b99aa]">
                  Wybrana twarz zostaje z Tobą na całą karierę, a reszta zaludnia scenę.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl surface-inset self-start">
                {(
                  [
                    { id: 'all', label: 'Wszyscy (47)' },
                    { id: 'male', label: 'Raperzy (35)' },
                    { id: 'female', label: 'Raperki (12)' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGenderFilter(tab.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      genderFilter === tab.id
                        ? 'btn-gold'
                        : 'text-[#9b99aa] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-1.5">
              {visiblePortraits.map((p) => {
                const isSelected = !customAvatar && selectedPortraitId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setCustomAvatar(undefined);
                      setSelectedPortraitId(p.id);
                    }}
                    className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer aspect-square ${
                      isSelected
                        ? 'border-[#f5d37b] ring-2 ring-[#f5d37b]/50 shadow-[0_0_24px_-4px_rgba(245,211,123,0.65)] scale-[1.03]'
                        : 'border-white/10 hover:border-white/35 hover:-translate-y-0.5'
                    }`}
                  >
                    <img
                      src={p.imageUrl}
                      alt={p.label}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top block transition-transform duration-300 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 h-10 pointer-events-none flex items-end justify-between px-2 pb-1.5"
                      style={{
                        background:
                          'linear-gradient(180deg, transparent 0%, rgba(6,6,10,0.88) 100%)',
                      }}
                    >
                      <span className="font-mono-num text-[10px] font-bold text-[#f5f3ee]">
                        #{p.id}
                      </span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#f5d37b] text-[#09080c] flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
