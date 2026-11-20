import React, { useEffect, useMemo, useState } from 'react';
import { Swords, Trophy, Play, Square, Flame, CheckCircle2 } from 'lucide-react';
import { GameState, NpcRapper } from '../types/game';
import {
  ASSET_URLS,
  BEAT_PRESETS,
  FREESTYLE_TOPICS,
  scorePolishLyrics,
  suggestPolishRhymes,
} from '../data/worldData';
import { beatEngine } from '../audio/beatEngine';
import { ComicPortrait } from './ComicPortrait';
import { formatPLN } from '../engine/simulation';

interface ArenaViewProps {
  state: GameState;
  onFinishBattle: (payload: {
    opponentId: string;
    won: boolean;
    playerScore: number;
    opponentScore: number;
    isTournamentFinal: boolean;
  }) => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({ state, onFinishBattle }) => {
  const [mode, setMode] = useState<'1v1' | 'tournament'>('1v1');
  const [selectedNpcId, setSelectedNpcId] = useState<string>(state.npcs[11]?.id || state.npcs[0].id);

  // Active battle state
  const [activeBattle, setActiveBattle] = useState<{
    opponent: NpcRapper;
    topic: string;
    keywords: string[];
    tournamentRound?: number;
  } | null>(null);

  const [responseText, setResponseText] = useState('');
  const [beatPlaying, setBeatPlaying] = useState(false);
  const [result, setResult] = useState<{
    won: boolean;
    playerScore: number;
    opponentScore: number;
    keywordsHit: string[];
    opponentAlias: string;
    tournamentRound?: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      beatEngine.stop();
    };
  }, []);

  const rhymes = useMemo(() => suggestPolishRhymes(responseText), [responseText]);
  const liveEval = useMemo(
    () => scorePolishLyrics(responseText, activeBattle?.keywords || []),
    [responseText, activeBattle]
  );

  const startBattle = (opponent: NpcRapper, tournamentRound?: number) => {
    const prompt = FREESTYLE_TOPICS[Math.floor(Math.random() * FREESTYLE_TOPICS.length)];
    setActiveBattle({
      opponent,
      topic: prompt.topic,
      keywords: prompt.keywords,
      tournamentRound,
    });
    setResponseText('');
    setResult(null);
  };

  const toggleArenaBeat = () => {
    if (beatPlaying) {
      beatEngine.stop();
      setBeatPlaying(false);
    } else {
      const preset = BEAT_PRESETS.mpc_boombap;
      beatEngine.start({ style: 'mpc_boombap', bpm: preset.defaultBpm, steps: preset.steps });
      setBeatPlaying(true);
    }
  };

  const submitFreestyle = () => {
    if (!activeBattle) return;
    if (beatPlaying) {
      beatEngine.stop();
      setBeatPlaying(false);
    }

    const streetBonus = Math.round(((100 - state.streetMainstream) / 100) * 14);
    const playerScore = Math.min(100, liveEval.score + streetBonus);

    const tierBase =
      activeBattle.opponent.tier === 'Legenda'
        ? 78
        : activeBattle.opponent.tier === 'Gwiazda'
          ? 70
          : activeBattle.opponent.tier === 'Średnia Liga'
            ? 60
            : 50;
    const opponentScore = Math.min(96, Math.round(tierBase + (Math.random() * 14 - 7)));
    const won = playerScore >= opponentScore;

    const isTournamentFinal = activeBattle.tournamentRound === 3;
    onFinishBattle({
      opponentId: activeBattle.opponent.id,
      won,
      playerScore,
      opponentScore,
      isTournamentFinal,
    });

    setResult({
      won,
      playerScore,
      opponentScore,
      keywordsHit: liveEval.keywordsHit,
      opponentAlias: activeBattle.opponent.alias,
      tournamentRound: activeBattle.tournamentRound,
    });
  };

  const handleNextTournamentRound = () => {
    if (!result?.tournamentRound || result.tournamentRound >= 3) {
      setActiveBattle(null);
      setResult(null);
      return;
    }
    const nextRound = result.tournamentRound + 1;
    const pool =
      nextRound === 2
        ? state.npcs.filter((n) => n.tier === 'Średnia Liga' || n.tier === 'Gwiazda')
        : state.npcs.filter((n) => n.tier === 'Legenda' || n.tier === 'Gwiazda');
    const opp = pool[Math.floor(Math.random() * pool.length)] || state.npcs[0];
    startBattle(opp, nextRound);
  };

  const insertAutoBar = () => {
    if (!activeBattle) return;
    const [k1, k2, k3] = activeBattle.keywords;
    setResponseText(
      `Wchodzę na tę scenę, dziś należy do mnie ${k1}\nNie zatrzyma mnie Twój styl, bo za mną stoi ${k2}\nKażdy mój punchline płonie, w ręku trzymam ${k3}\nPublika krzyczy głośno, kiedy kończę ten mój wers!`
    );
  };

  const previewOpponent = state.npcs.find((n) => n.id === selectedNpcId) || state.npcs[0];

  return (
    <div className="space-y-6">
      {/* Arena Hero Backdrop */}
      <section className="relative rounded-3xl overflow-hidden border border-[#f5d37b]/25 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.95)]">
        <img
          src={ASSET_URLS.arena}
          alt="Podziemna Arena Bitew Freestyle"
          referrerPolicy="no-referrer"
          className="w-full h-48 sm:h-56 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060a] via-[#06060a]/65 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="text-xs text-[#fae092] font-semibold uppercase tracking-wider">
              Bitwy 1v1 i Turnieje Pucharowe · Bonus Ulicy aktywny
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-white leading-none mt-1">
              Arena Bitew Freestyle
            </h1>
          </div>
          <div className="flex items-center gap-4 font-mono-num text-xs surface-inset px-4 py-2.5 rounded-2xl">
            <div>
              <span className="text-[#9b99aa]">Wygrane: </span>
              <span className="text-[#fae092] font-bold">{state.freestyleWins}</span>
            </div>
            <div>
              <span className="text-[#9b99aa]">Seria: </span>
              <span className="text-[#4cd4f5] font-bold">{state.freestyleStreak}</span>
            </div>
            <div>
              <span className="text-[#9b99aa]">Puchary: </span>
              <span className="text-[#c4b5fd] font-bold">{state.tournamentsWon}</span>
            </div>
          </div>
        </div>
      </section>

      {!activeBattle ? (
        <section className="glass-panel rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-1 p-1.5 rounded-2xl surface-inset w-fit">
            <button
              onClick={() => setMode('1v1')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                mode === '1v1' ? 'btn-gold' : 'text-[#9b99aa] hover:text-white'
              }`}
            >
              Bitwa 1v1
            </button>
            <button
              onClick={() => setMode('tournament')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                mode === 'tournament' ? 'btn-violet' : 'text-[#9b99aa] hover:text-white'
              }`}
            >
              Turniej Pucharowy (3 rundy)
            </button>
          </div>

          {mode === '1v1' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3">
                <label className="block text-xs font-semibold text-[#cfccd9]">
                  Wybierz rywala na bitwę 1v1 (Koszt: 18 Energii)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {state.npcs.map((npc) => (
                    <button
                      key={npc.id}
                      onClick={() => setSelectedNpcId(npc.id)}
                      className={`group flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedNpcId === npc.id
                          ? 'glass-panel-gold border-[#f5d37b]'
                          : 'surface-interactive'
                      }`}
                    >
                      <ComicPortrait
                        portraitId={npc.portraitId}
                        size="sm"
                        ring={selectedNpcId === npc.id ? 'gold' : 'default'}
                        alt={npc.alias}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{npc.alias}</div>
                        <div className="text-[11px] text-[#9b99aa]">
                          {npc.tier} · {npc.style} · {npc.city}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Face-off Matchup Card */}
              <div className="lg:col-span-5 rounded-3xl surface-inset p-5 space-y-5">
                <div className="flex items-center justify-around gap-3 pt-1">
                  <div className="flex flex-col items-center text-center gap-2">
                    <ComicPortrait
                      portraitId={state.player.portraitId}
                      customAvatar={state.player.customAvatar}
                      size="lg"
                      ring="gold"
                    />
                    <div className="font-display text-base font-bold text-white truncate max-w-[110px]">
                      {state.player.alias}
                    </div>
                  </div>
                  <div className="font-display text-3xl font-bold text-gold-metallic">VS</div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <ComicPortrait
                      portraitId={previewOpponent.portraitId}
                      size="lg"
                      ring="rose"
                    />
                    <div className="font-display text-base font-bold text-white truncate max-w-[110px]">
                      {previewOpponent.alias}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#cfccd9] leading-relaxed text-center">
                  Rywal rzuca 4 wersy w swoim stylu. Odpowiedz na temat i wpleć 3 słowa kluczowe —
                  im większy szacunek na Ulicy i lepsze rymy, tym wyższy werdykt publiki.
                </p>

                <button
                  onClick={() => startBattle(previewOpponent)}
                  disabled={state.energy < 18}
                  className="w-full min-h-[50px] rounded-2xl btn-gold disabled:opacity-45 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  Wejdź na ring 1v1
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl surface-inset p-6 border border-[#9d6bff]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="text-xs text-[#c4b5fd] font-bold flex items-center gap-1.5 uppercase tracking-wider">
                  <Trophy className="w-4 h-4" />
                  Wielki Puchar Freestyle · 3 rundy bez porażki
                </div>
                <h2 className="font-display text-3xl font-bold text-white">
                  Ćwierćfinał → Półfinał → Finał z Legendą
                </h2>
                <p className="text-xs text-[#9b99aa] max-w-xl">
                  Wpisowe: {formatPLN(300)}. Wygrana całego turnieju daje {formatPLN(3500)} nagrody,
                  potężny skok Hype’u, szacunek Ulicy i puchar w profilu.
                </p>
              </div>
              <button
                onClick={() => {
                  const starters = state.npcs.filter((n) => n.tier === 'Podziemie');
                  const opp = starters[Math.floor(Math.random() * starters.length)] || state.npcs[11];
                  startBattle(opp, 1);
                }}
                disabled={state.energy < 20 || state.cash < 300}
                className="min-h-[50px] px-6 py-3 rounded-2xl btn-violet disabled:opacity-40 font-bold text-sm shrink-0 cursor-pointer whitespace-nowrap"
              >
                Rozpocznij Turniej (300 zł)
              </button>
            </div>
          )}
        </section>
      ) : (
        /* Active Battle Ring with Dual Portraits */
        <section className="glass-panel-gold rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <ComicPortrait
                portraitId={state.player.portraitId}
                customAvatar={state.player.customAvatar}
                size="md"
                ring="gold"
              />
              <div className="text-center">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#fae092]">
                  {activeBattle.tournamentRound
                    ? `Runda ${activeBattle.tournamentRound}/3`
                    : 'Bitwa 1v1'}
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-white leading-none">
                  {state.player.alias} <span className="text-rose-400">VS</span>{' '}
                  {activeBattle.opponent.alias}
                </div>
              </div>
              <ComicPortrait
                portraitId={activeBattle.opponent.portraitId}
                size="md"
                ring="rose"
                alt={activeBattle.opponent.alias}
              />
            </div>

            <button
              onClick={toggleArenaBeat}
              className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer ${
                beatPlaying ? 'btn-crimson' : 'btn-glass text-white'
              }`}
            >
              {beatPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {beatPlaying ? 'Wyłącz bit' : 'Odpal bit freestyle'}
            </button>
          </div>

          {/* Opponent 4-bar Jab */}
          <div className="rounded-2xl surface-inset p-4 border border-rose-500/30">
            <div className="text-xs font-bold text-rose-300 mb-2">
              {activeBattle.opponent.alias} rzuca Ci prosto w twarz ({activeBattle.opponent.style}):
            </div>
            <div className="space-y-1 text-sm text-white italic">
              {activeBattle.opponent.freestyleJabs.map((line, i) => (
                <p key={i}>„{line}”</p>
              ))}
            </div>
          </div>

          {/* Topic & 3 Required Keywords */}
          <div className="rounded-2xl surface-inset p-4 border border-[#e2b64e]/30 space-y-2.5">
            <div className="text-xs text-[#9b99aa]">
              Temat rundy: <span className="text-white font-bold">{activeBattle.topic}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#fae092]">Wpleć 3 słowa kluczowe:</span>
              {activeBattle.keywords.map((kw) => {
                const hit = liveEval.keywordsHit.includes(kw);
                return (
                  <span
                    key={kw}
                    className={`text-xs font-mono-num font-bold px-3 py-1 rounded-lg border transition-all ${
                      hit
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                        : 'bg-white/6 text-[#fae092] border-white/15'
                    }`}
                  >
                    {hit && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                    {kw}
                  </span>
                );
              })}
            </div>
          </div>

          {!result ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#cfccd9]">
                  Twoja odpowiedź (4 wersy)
                </label>
                <button
                  type="button"
                  onClick={insertAutoBar}
                  className="text-xs font-semibold text-[#4cd4f5] hover:underline cursor-pointer"
                >
                  Podpowiedź wersów z kluczami
                </button>
              </div>
              <textarea
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Odpowiedz rywalowi, wplatając wszystkie 3 słowa kluczowe..."
                className="w-full p-4 rounded-2xl surface-inset text-sm text-white placeholder:text-[#6e6c7a] focus:outline-none focus:border-[#f5d37b]"
              />

              <div className="flex flex-wrap gap-1.5">
                {rhymes.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setResponseText((p) => (p.trimEnd() ? `${p.trimEnd()} ${w}` : w))}
                    className="px-3 py-1 rounded-lg surface-interactive text-xs font-semibold text-[#fae092] cursor-pointer"
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    beatEngine.stop();
                    setBeatPlaying(false);
                    setActiveBattle(null);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl btn-glass text-xs font-semibold text-[#cfccd9] cursor-pointer"
                >
                  Wycofaj się
                </button>
                <button
                  type="button"
                  onClick={submitFreestyle}
                  disabled={responseText.trim().length < 15}
                  className="min-h-[48px] px-6 py-2.5 rounded-2xl btn-gold disabled:opacity-40 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  Rzuć zwrotkę i oddaj majk
                </button>
              </div>
            </div>
          ) : (
            /* Crowd Verdict */
            <div className="rounded-3xl surface-inset p-6 text-center space-y-3.5">
              <div
                className={`font-display text-4xl font-bold ${
                  result.won ? 'text-gold-metallic' : 'text-rose-400'
                }`}
              >
                {result.won ? 'WYGRYWASZ BITWĘ!' : 'RYWAL ZGARNIA RUNDĘ'}
              </div>
              <div className="font-mono-num text-base text-white">
                Twój wynik: <span className="text-[#fae092] font-bold">{result.playerScore}</span> ·{' '}
                {result.opponentAlias}:{' '}
                <span className="text-rose-400 font-bold">{result.opponentScore}</span>
              </div>
              <p className="text-xs text-[#9b99aa]">
                Trafione słowa kluczowe: {result.keywordsHit.length}/3
                {result.won && result.tournamentRound === 3
                  ? ' · ZDOBYWASZ PUCHAR TURNIEJU I +3 500 ZŁ!'
                  : ''}
              </p>

              <div className="pt-2 flex justify-center gap-3">
                {result.won && result.tournamentRound && result.tournamentRound < 3 ? (
                  <button
                    onClick={handleNextTournamentRound}
                    className="min-h-[46px] px-6 py-2.5 rounded-2xl btn-violet font-bold text-sm cursor-pointer"
                  >
                    Przejdź do Rundy {result.tournamentRound + 1}/3
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveBattle(null);
                      setResult(null);
                    }}
                    className="min-h-[46px] px-6 py-2.5 rounded-2xl btn-gold font-bold text-sm cursor-pointer"
                  >
                    Wróć na Arenę
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
