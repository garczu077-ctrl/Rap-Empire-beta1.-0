import React, { useState } from 'react';
import { Award, Trophy, Disc3, CheckCircle2, Lock, Radio, RotateCcw } from 'lucide-react';
import { GalaRecord, GameState, InterviewQuestion } from '../types/game';
import { ASSET_URLS, MILESTONES, VOIVODESHIP_MAP } from '../data/worldData';
import { ComicPortrait } from './ComicPortrait';
import { formatCompact, formatPLN } from '../engine/simulation';

interface ProfileViewProps {
  state: GameState;
  onSelectActiveTitle: (title: string) => void;
  onResetCareer: () => void;
  onPreviewGala: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  state,
  onSelectActiveTitle,
  onResetCareer,
  onPreviewGala,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const goldCount =
    state.tracks.filter((t) => t.cert === 'gold').length +
    state.projects.filter((p) => p.cert === 'gold').length;
  const platCount =
    state.tracks.filter((t) => t.cert === 'platinum' || t.cert === 'diamond').length +
    state.projects.filter((p) => p.cert === 'platinum' || p.cert === 'diamond').length;
  const totalStreams =
    state.tracks.reduce((s, t) => s + t.streams, 0) +
    state.projects.reduce((s, p) => s + p.streams, 0);

  return (
    <div className="space-y-6">
      {/* Artist Prestige Card */}
      <section className="glass-panel-gold rounded-3xl p-6 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-20 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,211,123,0.6), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5">
            <ComicPortrait
              portraitId={state.player.portraitId}
              customAvatar={state.player.customAvatar}
              size="xl"
              ring="gold"
              alt={state.player.alias}
            />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#fae092]">
                {state.player.activeTitle}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-none mt-1">
                {state.player.alias}
              </h1>
              <div className="text-xs text-[#b5b2c2] mt-1.5">
                {state.player.city} · woj. {VOIVODESHIP_MAP[state.player.voivodeship].name} · Tag:{' '}
                <span className="text-white font-semibold">{state.player.producerTag}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={onPreviewGala}
              className="min-h-[44px] px-4 py-2 rounded-xl btn-glass text-xs font-bold text-[#fae092] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              Podgląd Gali Sezonu
            </button>
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold text-rose-300 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetuj karierę
              </button>
            ) : (
              <button
                onClick={onResetCareer}
                className="min-h-[44px] px-4 py-2 rounded-xl btn-crimson text-xs font-bold cursor-pointer"
              >
                Potwierdź nową karierę
              </button>
            )}
          </div>
        </div>

        {/* Certs & Totals */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 font-mono-num">
          <div className="rounded-2xl surface-inset p-4">
            <div className="text-[11px] text-[#9b99aa]">Złote Płyty</div>
            <div className="text-2xl font-bold text-gold-metallic mt-1 flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-[#f5d37b]" />
              {goldCount}
            </div>
          </div>
          <div className="rounded-2xl surface-inset p-4">
            <div className="text-[11px] text-[#9b99aa]">Platynowe Płyty</div>
            <div className="text-2xl font-bold text-[#4cd4f5] mt-1 flex items-center gap-2">
              <Disc3 className="w-5 h-5" />
              {platCount}
            </div>
          </div>
          <div className="rounded-2xl surface-inset p-4">
            <div className="text-[11px] text-[#9b99aa]">Łączne Odsłuchania</div>
            <div className="text-2xl font-bold text-white mt-1">{formatCompact(totalStreams)}</div>
          </div>
          <div className="rounded-2xl surface-inset p-4">
            <div className="text-[11px] text-[#9b99aa]">Statuetki Rap Awards</div>
            <div className="text-2xl font-bold text-gold-metallic mt-1">
              {state.galaHistory.reduce((s, g) => s + g.playerAwards.length, 0)}
            </div>
          </div>
        </div>
      </section>

      {/* 12 Milestones & Prestige Titles */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#f5d37b]" />
              12 Kamieni Milowych Kariery
            </h2>
            <p className="text-xs text-[#9b99aa]">
              Kliknij odblokowany kamień milowy, aby ustawić jego prestiżowy tytuł nad swoją ksywką.
            </p>
          </div>
          <span className="font-mono-num text-base font-bold text-gold-metallic">
            {state.unlockedMilestones.length} / 12
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {MILESTONES.map((m) => {
            const unlocked = state.unlockedMilestones.includes(m.id);
            const active = state.player.activeTitle === m.badgeTitle;
            return (
              <button
                key={m.id}
                disabled={!unlocked}
                onClick={() => unlocked && onSelectActiveTitle(m.badgeTitle)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  unlocked
                    ? active
                      ? 'glass-panel-gold border-[#f5d37b] cursor-pointer'
                      : 'surface-interactive cursor-pointer'
                    : 'surface-inset opacity-50 cursor-default'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{m.badgeTitle}</span>
                  {unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-[#fae092] shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#9b99aa] shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[#9b99aa] mt-1 leading-relaxed">{m.description}</p>
                {active && (
                  <div className="text-[11px] font-bold text-[#fae092] mt-2">
                    Aktywny tytuł na profilu
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Gablota Chwały (Gala History) */}
      <section className="glass-panel rounded-3xl p-5 sm:p-6">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#fae092]" />
          Gablota Chwały · Historia Gali Rap Awards
        </h2>

        {state.galaHistory.length === 0 ? (
          <p className="text-sm text-[#9b99aa]">
            Pierwsza Gala Rap Awards odbędzie się w 60. dniu kariery. Do tego czasu pracuj na
            Singiel Roku, Album Roku i tytuł Artysty Roku!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.galaHistory.map((g) => (
              <div key={g.season} className="rounded-2xl surface-inset p-4 border border-[#e2b64e]/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#fae092] font-bold">
                  <span>Sezon {g.season} · Dzień {g.day}</span>
                  <span>Twoje statuetki: {g.playerAwards.length}</span>
                </div>
                <div className="text-xs text-[#cfccd9]">
                  Singiel Roku: <strong className="text-white">„{g.singleOfYear.title}”</strong> ({g.singleOfYear.artist})
                </div>
                <div className="text-xs text-[#cfccd9]">
                  Album Roku: <strong className="text-white">„{g.albumOfYear.title}”</strong> ({g.albumOfYear.artist})
                </div>
                <div className="text-xs text-[#cfccd9]">
                  Artysta Roku: <strong className="text-[#fae092]">{g.artistOfYear.artist}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

interface InterviewModalProps {
  questions: InterviewQuestion[];
  onComplete: (summary: {
    streetDelta: number;
    hypeDelta: number;
    fansDelta: number;
    cashDelta: number;
    lastReaction: string;
  }) => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({ questions, onComplete }) => {
  const [idx, setIdx] = useState(0);
  const [totals, setTotals] = useState({ streetDelta: 0, hypeDelta: 0, fansDelta: 0, cashDelta: 0 });
  const [reaction, setReaction] = useState<string | null>(null);

  const q = questions[idx];
  if (!q) return null;

  const pickOption = (opt: InterviewQuestion['options'][number]) => {
    const nextTotals = {
      streetDelta: totals.streetDelta + opt.streetDelta,
      hypeDelta: totals.hypeDelta + opt.hypeDelta,
      fansDelta: totals.fansDelta + opt.fansDelta,
      cashDelta: totals.cashDelta + opt.cashDelta,
    };
    setTotals(nextTotals);
    setReaction(opt.reaction);

    window.setTimeout(() => {
      setReaction(null);
      if (idx + 1 < questions.length) {
        setIdx(idx + 1);
      } else {
        onComplete({ ...nextTotals, lastReaction: opt.reaction });
      }
    }, 950);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel-gold rounded-3xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-[#fae092] flex items-center gap-1.5 uppercase tracking-wider">
              <Radio className="w-4 h-4 shrink-0" />
              {q.outlet || 'Wywiad na Żywo'} · Pytanie {idx + 1}/{questions.length}
            </span>
            {q.host && (
              <p className="text-[11px] text-[#9b99aa] mt-0.5">Prowadzi: {q.host}</p>
            )}
          </div>
          <span className="text-xs text-[#cfccd9] font-medium">{q.topicTag}</span>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-snug">
          „{q.prompt}”
        </h2>

        {reaction ? (
          <div className="rounded-2xl bg-[#e2b64e]/15 border border-[#f5d37b]/45 p-4 text-sm text-[#fae092] font-semibold">
            {reaction}
          </div>
        ) : (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => pickOption(opt)}
                className="w-full text-left p-4 rounded-2xl surface-interactive text-sm text-white cursor-pointer"
              >
                <div className="font-medium">{opt.label}</div>
                <div className="text-[11px] text-[#9b99aa] mt-1.5 font-mono-num">
                  {opt.streetDelta < 0
                    ? `Ulica +${Math.abs(opt.streetDelta)}`
                    : opt.streetDelta > 0
                      ? `Mainstream +${opt.streetDelta}`
                      : 'Balans'} · Hype +{opt.hypeDelta} · Fani +{formatCompact(opt.fansDelta)}
                  {opt.cashDelta > 0 ? ` · +${formatPLN(opt.cashDelta)}` : ''}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface GalaModalProps {
  gala: GalaRecord;
  onClose: () => void;
}

export const GalaModal: React.FC<GalaModalProps> = ({ gala, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass-panel-gold rounded-3xl overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.95)]">
        <div className="relative h-52">
          <img
            src={ASSET_URLS.gala}
            alt="Gala Rap Awards"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121118] via-[#121118]/45 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="text-xs font-bold text-[#fae092] tracking-wider uppercase">
              PODSUMOWANIE ROKU · SEZON {gala.season} (DZIEŃ {gala.day})
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              GALA RAP AWARDS
            </h2>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2.5">
            <div className="rounded-2xl surface-inset p-4 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] text-[#9b99aa]">Singiel Roku</div>
                <div className="text-sm font-bold text-white">„{gala.singleOfYear.title}”</div>
              </div>
              <span
                className={`text-xs font-bold ${
                  gala.singleOfYear.isPlayer ? 'text-[#fae092]' : 'text-[#cfccd9]'
                }`}
              >
                {gala.singleOfYear.artist}
              </span>
            </div>

            <div className="rounded-2xl surface-inset p-4 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] text-[#9b99aa]">Album Roku</div>
                <div className="text-sm font-bold text-white">„{gala.albumOfYear.title}”</div>
              </div>
              <span
                className={`text-xs font-bold ${
                  gala.albumOfYear.isPlayer ? 'text-[#fae092]' : 'text-[#cfccd9]'
                }`}
              >
                {gala.albumOfYear.artist}
              </span>
            </div>

            <div className="rounded-2xl surface-inset p-4 border border-[#f5d37b]/45 flex items-center justify-between gap-2">
              <div>
                <div className="text-[11px] text-[#fae092] font-semibold">Artysta Roku</div>
                <div className="text-xl font-display font-bold text-gold-metallic">
                  {gala.artistOfYear.artist}
                </div>
              </div>
              <Trophy className="w-7 h-7 text-[#fae092]" />
            </div>
          </div>

          <div className="text-xs text-center text-[#cfccd9]">
            {gala.playerAwards.length > 0
              ? `Gratulacje! Odbierasz statuetki: ${gala.playerAwards.join(', ')} i zapisujesz sezon w Gablocie Chwały!`
              : 'W tym sezonie statuetki trafiły do konkurencji. Wydaj wielki album, podbij Polskę i zgarnij koronę za rok!'}
          </div>

          <button
            onClick={onClose}
            className="w-full min-h-[50px] rounded-2xl btn-gold font-bold text-sm cursor-pointer"
          >
            Zapisz sezon w Gablocie Chwały
          </button>
        </div>
      </div>
    </div>
  );
};
