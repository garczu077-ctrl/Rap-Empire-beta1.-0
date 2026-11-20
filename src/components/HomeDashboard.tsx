import React from 'react';
import {
  Briefcase,
  Sparkles,
  Flame,
  Tv,
  Moon,
  Inbox,
  Newspaper,
  Swords,
  Mic,
  Check,
  X,
  ArrowRight,
  Radio,
  Zap,
  Wallet,
  Users,
} from 'lucide-react';
import { GameState, InboxMessage, NavTab } from '../types/game';
import { formatCompact, formatPLN } from '../engine/simulation';
import { ComicPortrait } from './ComicPortrait';

interface HomeDashboardProps {
  state: GameState;
  onAdvanceDay: () => void;
  onDailyAction: (action: 'warehouse' | 'reset' | 'underground_cypher' | 'commercial_ad') => void;
  onHandleInbox: (msg: InboxMessage, accept: boolean) => void;
  onNavigate: (tab: NavTab) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  state,
  onAdvanceDay,
  onDailyAction,
  onHandleInbox,
  onNavigate,
}) => {
  const daysToGala = 60 - (state.day % 60 || 60);
  const unhandledInbox = state.inbox.filter((m) => !m.handled);
  const pendingInterviewMsg = unhandledInbox.find((m) => m.type === 'interview');
  const activeBeefs = state.beefs.filter((b) => !b.resolved);

  const alignmentLabel =
    state.streetMainstream <= 30
      ? 'Twarde Podziemie'
      : state.streetMainstream <= 45
        ? 'Szacunek Ulicy'
        : state.streetMainstream <= 58
          ? 'Złoty Balans'
          : state.streetMainstream <= 75
            ? 'Radiowy Zasięg'
            : 'Pełny Mainstream';

  const adPayout = Math.round(950 + state.fans * 0.08 + state.hype * 24);
  const warehouseDoneToday = state.lastWarehouseDay === state.day;
  const resetDoneToday = state.lastResetDay === state.day;
  const cypherDoneToday = state.lastCypherDay === state.day;
  const adCooldownLeft =
    state.lastCommercialAdDay !== undefined ? Math.max(0, 7 - (state.day - state.lastCommercialAdDay)) : 0;
  const adNeedsFans = state.fans < 120;
  const adDisabled = adNeedsFans || adCooldownLeft > 0 || state.energy < 25;

  return (
    <div className="space-y-6">
      {/* Elevated Hero Artist Status Card */}
      <section className="glass-panel-gold rounded-3xl p-5 sm:p-6 relative overflow-hidden">
        {/* Subtle overhead directional spotlight */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(245,211,123,0.55), transparent 70%)',
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <ComicPortrait
              portraitId={state.player.portraitId}
              customAvatar={state.player.customAvatar}
              size="lg"
              ring="gold"
              alt={state.player.alias}
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#f5d37b] truncate">
                {state.player.activeTitle} · {state.player.city}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white truncate leading-none mt-1">
                {state.player.alias}
              </h1>
              <div className="text-xs text-[#b5b2c2] mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                <span className="font-mono-num font-semibold text-white">Dzień {state.day}</span>
                <span className="text-white/25" aria-hidden="true">•</span>
                <span className="font-mono-num">Czynsz {formatPLN(state.dailyRent)}/d</span>
                <span className="text-white/25" aria-hidden="true">•</span>
                <span className="text-[#4cd4f5] font-mono-num font-medium">
                  Gala Rap Awards: {daysToGala === 0 ? 'Dziś!' : `za ${daysToGala} dni`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onAdvanceDay}
            className="min-h-[50px] px-6 py-3 rounded-2xl btn-gold font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Moon className="w-4 h-4" />
            Zakończ Dzień {state.day}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Core Life Indicators (Recessed HUD Gauges) */}
        <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="rounded-2xl surface-inset p-3.5">
            <div className="flex items-center justify-between text-[11px] text-[#9b99aa]">
              <span>Saldo</span>
              <Wallet className="w-3.5 h-3.5 text-[#e2b64e]" />
            </div>
            <div
              className={`font-mono-num text-lg sm:text-xl font-bold mt-1 ${
                state.cash < 0 ? 'text-rose-400' : 'text-gold-metallic'
              }`}
            >
              {formatPLN(state.cash)}
            </div>
          </div>

          <div className="rounded-2xl surface-inset p-3.5">
            <div className="flex items-center justify-between text-[11px] text-[#9b99aa]">
              <span>Fani</span>
              <Users className="w-3.5 h-3.5 text-[#b58cff]" />
            </div>
            <div className="font-mono-num text-lg sm:text-xl font-bold text-white mt-1">
              {formatCompact(state.fans)}
            </div>
          </div>

          <div className="rounded-2xl surface-inset p-3.5">
            <div className="flex items-center justify-between text-[11px] text-[#9b99aa]">
              <span>Hype</span>
              <span className="font-mono-num font-bold text-[#c4b5fd]">{state.hype}%</span>
            </div>
            <div className="h-2 rounded-full meter-track mt-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${state.hype}%`,
                  background: 'linear-gradient(90deg, #7c3aed 0%, #c084fc 100%)',
                  boxShadow: '0 0 12px rgba(167,139,250,0.65)',
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl surface-inset p-3.5">
            <div className="flex items-center justify-between text-[11px] text-[#9b99aa]">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#4cd4f5]" />
                Energia
              </span>
              <span className="font-mono-num font-bold text-[#4cd4f5]">{state.energy}%</span>
            </div>
            <div className="h-2 rounded-full meter-track mt-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${state.energy}%`,
                  background: 'linear-gradient(90deg, #0284c7 0%, #4cd4f5 100%)',
                  boxShadow: '0 0 12px rgba(76,212,245,0.65)',
                }}
              />
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl surface-inset p-3.5">
            <div className="flex items-center justify-between text-[11px] text-[#9b99aa]">
              <span>Wena twórcza</span>
              <span className="font-mono-num font-bold text-[#fae092]">{state.inspiration}%</span>
            </div>
            <div className="h-2 rounded-full meter-track mt-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${state.inspiration}%`,
                  background: 'linear-gradient(90deg, #b58425 0%, #fae092 100%)',
                  boxShadow: '0 0 12px rgba(245,211,123,0.6)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Sculpted Ulica vs Mainstream Tug-of-War */}
        <div className="relative mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold tracking-wide text-[#c4b5fd]">
              ULICA ({100 - state.streetMainstream}%)
            </span>
            <span className="text-white font-semibold">{alignmentLabel}</span>
            <span className="font-bold tracking-wide text-[#fae092]">
              MAINSTREAM ({state.streetMainstream}%)
            </span>
          </div>
          <div className="h-3 rounded-full meter-track relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
              style={{
                width: `${state.streetMainstream}%`,
                background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 45%, #e5b84b 100%)',
              }}
            />
            <div
              className="absolute top-0 bottom-0 w-2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-300"
              style={{ left: `calc(${state.streetMainstream}% - 4px)` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9b99aa] mt-2">
            <span>Ulica wzmacnia bitwy freestyle, beefy i sprzedaż streetwearu</span>
            <span>Mainstream pomnaża streamingi, reklamy i zasięgi radiowe</span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 cols: Daily Actions + Active Beefs + Inbox */}
        <div className="lg:col-span-7 space-y-6">
          {/* Daily Artist Routine */}
          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Codzienność Artysty</h2>
                <p className="text-xs text-[#9b99aa]">Zarządzaj gotówką, energią i wizerunkiem</p>
              </div>
              <button
                onClick={() => onNavigate('studio')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl btn-glass text-xs font-semibold text-[#fae092] cursor-pointer whitespace-nowrap"
              >
                Studio Nagrań →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => onDailyAction('warehouse')}
                disabled={warehouseDoneToday || state.energy < 30}
                className="min-h-[82px] text-left p-4 rounded-2xl surface-interactive disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                    </span>
                    Zmiana na magazynie
                  </span>
                  <span className="font-mono-num text-xs font-bold text-emerald-400">
                    {warehouseDoneToday ? 'Dziś zrobione' : '+480 zł'}
                  </span>
                </div>
                <div className="text-xs text-[#9b99aa] mt-2">
                  {warehouseDoneToday
                    ? 'Zmiana zaliczona — kolejna dostępna jutro.'
                    : 'Raz dziennie · -30 Energii · -8 Weny'}
                </div>
              </button>

              <button
                onClick={() => onDailyAction('reset')}
                disabled={resetDoneToday}
                className="min-h-[82px] text-left p-4 rounded-2xl surface-interactive disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/25 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#4cd4f5]" />
                    </span>
                    Reset z dala od zgiełku
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#4cd4f5]">
                    {resetDoneToday ? 'Dziś zrobione' : '+36 Weny'}
                  </span>
                </div>
                <div className="text-xs text-[#9b99aa] mt-2">
                  {resetDoneToday
                    ? 'Odpoczynek zaliczony — kolejny możliwy jutro.'
                    : 'Raz dziennie · +24 Energii · -120 zł'}
                </div>
              </button>

              <button
                onClick={() => onDailyAction('underground_cypher')}
                disabled={cypherDoneToday || state.energy < 22}
                className="min-h-[82px] text-left p-4 rounded-2xl surface-interactive disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center shrink-0">
                      <Flame className="w-4 h-4 text-[#c4b5fd]" />
                    </span>
                    Osiedlowy cypher
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#c4b5fd]">
                    {cypherDoneToday ? 'Dziś zrobione' : 'Ulica +8'}
                  </span>
                </div>
                <div className="text-xs text-[#9b99aa] mt-2">
                  {cypherDoneToday
                    ? 'Dzisiejszy cypher za Tobą — kolejny jutro.'
                    : 'Raz dziennie · +7 Hype · +Fani · -22 Energii'}
                </div>
              </button>

              <button
                onClick={() => onDailyAction('commercial_ad')}
                disabled={adDisabled}
                className="min-h-[82px] text-left p-4 rounded-2xl surface-interactive disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-white flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0">
                      <Tv className="w-4 h-4 text-[#fae092]" />
                    </span>
                    Reklama / TV śniadaniowa
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#fae092]">
                    {adNeedsFans
                      ? 'Od 120 fanów'
                      : adCooldownLeft > 0
                        ? `Za ${adCooldownLeft} dni`
                        : `+${formatPLN(adPayout)}`}
                  </span>
                </div>
                <div className="text-xs text-[#9b99aa] mt-2">
                  {adNeedsFans
                    ? 'Zdobądź 120 fanów, by dostać pierwsze propozycje reklamowe.'
                    : adCooldownLeft > 0
                      ? `Rzadka okazja (raz na 7 dni) · następna oferta za ${adCooldownLeft} dni.`
                      : 'Raz na 7 dni · duży zasięg i kasa · Mainstream +10'}
                </div>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
              {pendingInterviewMsg ? (
                <>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-[#fae092] flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 shrink-0" />
                      {pendingInterviewMsg.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onHandleInbox(pendingInterviewMsg, true)}
                    className="min-h-[42px] px-4 py-2 rounded-xl btn-gold text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    Wejdź na antenę
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xs text-[#9b99aa]">
                    Wywiady w mediach pojawiają się okresowo oraz po premierach, dissach i Gali.
                  </span>
                  {unhandledInbox.length > 0 && (
                    <button
                      onClick={() =>
                        document.getElementById('inbox-section')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl btn-glass text-xs font-semibold text-[#fae092] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Inbox className="w-3.5 h-3.5" />
                      Skrzynka ({unhandledInbox.length})
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Dramatic Active Beefs VS Showcase */}
          {activeBeefs.length > 0 && (
            <section className="glass-panel rounded-3xl p-5 sm:p-6 border border-rose-500/35 shadow-[0_0_40px_-16px_rgba(244,63,94,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Swords className="w-5 h-5 text-rose-400" />
                  Aktywne Beefy na RapPortalu
                </h2>
                <span className="text-xs text-rose-300 font-semibold">Głosowanie słuchaczy</span>
              </div>

              <div className="space-y-4">
                {activeBeefs.map((beef) => {
                  const opp = state.npcs.find((n) => n.id === beef.opponentId);
                  const total = Math.max(1, beef.playerVotes + beef.opponentVotes);
                  const playerPct = Math.round((beef.playerVotes / total) * 100);
                  const daysLeft = Math.max(0, beef.votingEndDay - state.day);

                  return (
                    <div key={beef.id} className="rounded-2xl surface-inset p-4 space-y-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <ComicPortrait
                            portraitId={state.player.portraitId}
                            customAvatar={state.player.customAvatar}
                            size="sm"
                            ring="gold"
                          />
                          <div className="min-w-0">
                            <div className="font-display text-base font-bold text-white truncate">
                              {state.player.alias}
                            </div>
                            <div className="text-[11px] text-[#f5d37b] truncate">
                              „{beef.playerDissTitle}”
                            </div>
                          </div>
                        </div>

                        <span className="font-display text-lg font-bold text-rose-400 px-2 shrink-0">
                          VS
                        </span>

                        <div className="flex items-center gap-2.5 min-w-0 text-right">
                          <div className="min-w-0">
                            <div className="font-display text-base font-bold text-white truncate">
                              {opp?.alias || 'Rywal'}
                            </div>
                            <div className="text-[11px] text-rose-300 truncate">
                              {beef.opponentDissTitle
                                ? `„${beef.opponentDissTitle}”`
                                : `Odpowiedź Dzień ${beef.responseDay}`}
                            </div>
                          </div>
                          {opp && <ComicPortrait portraitId={opp.portraitId} size="sm" ring="rose" />}
                        </div>
                      </div>

                      {beef.responded ? (
                        <div>
                          <div className="flex justify-between text-xs font-mono-num mb-1.5">
                            <span className="text-[#fae092] font-bold">
                              {beef.playerVotes.toLocaleString('pl-PL')} ({playerPct}%)
                            </span>
                            <span className="text-[#9b99aa]">Koniec za {daysLeft} dni</span>
                            <span className="text-rose-400 font-bold">
                              {beef.opponentVotes.toLocaleString('pl-PL')} ({100 - playerPct}%)
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-rose-500/35 overflow-hidden meter-track">
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${playerPct}%`,
                                background: 'linear-gradient(90deg, #b58425, #fae092)',
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#9b99aa] text-center">
                          Rywal siedzi w kabinie — odpowiedź i start głosowania już za{' '}
                          <span className="text-white font-semibold">
                            {Math.max(1, beef.responseDay - state.day)} dni
                          </span>
                          .
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Inbox & Industry Commissions */}
          <section id="inbox-section" className="glass-panel rounded-3xl p-5 sm:p-6 scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#f5d37b]" />
                Skrzynka i Zlecenia z Branży
              </h2>
              <span className="text-xs text-[#f5d37b] font-mono-num font-semibold">
                {unhandledInbox.length} oczekujące
              </span>
            </div>

            {state.inbox.length === 0 ? (
              <p className="text-sm text-[#9b99aa]">Brak nowych wiadomości.</p>
            ) : (
              <div className="space-y-3">
                {state.inbox.slice(0, 6).map((msg) => {
                  const sender = msg.fromNpcId
                    ? state.npcs.find((n) => n.id === msg.fromNpcId)
                    : undefined;
                  return (
                    <div
                      key={msg.id}
                      className="rounded-2xl surface-inset p-4 space-y-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {sender ? (
                          <ComicPortrait portraitId={sender.portraitId} size="sm" ring="violet" alt={sender.alias} />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-400/30 text-[#fae092] flex items-center justify-center shrink-0">
                            <Mic className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white leading-snug">
                            {msg.title}
                          </div>
                          <div className="text-[11px] text-[#9b99aa] font-mono-num mt-0.5">
                            Dzień {msg.day}
                            {sender ? ` · ${sender.city}` : ''}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-[#cfccd9] leading-relaxed">{msg.body}</p>

                      {!msg.handled && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() => onHandleInbox(msg, true)}
                            className="min-h-[42px] px-4 py-2 rounded-xl btn-gold font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {msg.type === 'interview'
                              ? 'Wejdź na antenę'
                              : msg.type === 'beat_commission'
                                ? 'Wyprodukuj bit [Prod. Ty]'
                                : 'Przyjmij ofertę'}
                          </button>
                          <button
                            onClick={() => onHandleInbox(msg, false)}
                            className="min-h-[42px] px-3.5 py-2 rounded-xl btn-glass text-[#cfccd9] text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <X className="w-3.5 h-3.5" />
                            Odrzuć
                          </button>
                        </div>
                      )}

                      {msg.handled && msg.accepted !== undefined && (
                        <div className="text-[11px] font-medium text-[#9b99aa]">
                          {msg.accepted ? 'Zrealizowano' : 'Odrzucono'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right 5 cols: Editorial RapPortal Feed */}
        <aside className="lg:col-span-5 glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#b58cff]" />
              RapPortal · Newsroom
            </h2>
            <span className="text-xs text-[#9b99aa]">Na bieżąco</span>
          </div>

          <div className="space-y-3.5 max-h-[720px] overflow-y-auto pr-1">
            {state.portalFeed.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl surface-inset p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-[11px] text-[#9b99aa]">
                  <span
                    className={
                      post.category === 'Beef'
                        ? 'text-rose-400 font-bold uppercase tracking-wider'
                        : post.category === 'Gala'
                          ? 'text-[#fae092] font-bold uppercase tracking-wider'
                          : post.category === 'Premiera'
                            ? 'text-[#4cd4f5] font-bold uppercase tracking-wider'
                            : 'text-[#c4b5fd] font-bold uppercase tracking-wider'
                    }
                  >
                    {post.category}
                  </span>
                  <span className="text-white/20" aria-hidden="true">•</span>
                  <span className="font-mono-num">Dzień {post.day}</span>
                  <span className="text-white/20" aria-hidden="true">•</span>
                  <span className="font-mono-num">{formatCompact(post.likes)} polubień</span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {post.headline}
                </h3>
                <p className="text-xs text-[#9b99aa] leading-relaxed">{post.body}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
