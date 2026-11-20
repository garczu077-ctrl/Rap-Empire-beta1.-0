import { useEffect, useState } from 'react';
import {
  Home,
  Sliders,
  Users,
  Map,
  Swords,
  Briefcase,
  Award,
} from 'lucide-react';
import {
  BeatStyle,
  BrandStyle,
  CoverConfig,
  GameState,
  Gender,
  InboxMessage,
  NavTab,
  RapPortalPost,
  Track,
  VenueScopeId,
  VoivodeshipId,
} from './types/game';

function prependPost(feed: RapPortalPost[], post: RapPortalPost): RapPortalPost[] {
  return [post, ...feed].slice(0, 45);
}
import {
  advanceDay,
  buildGalaForSeason,
  createNewGameState,
  evaluateMilestones,
  formatCompact,
  formatPLN,
  SAVE_STORAGE_KEY,
  startInterviewNow,
  uid,
} from './engine/simulation';
import { STUDIO_TIERS, VOIVODESHIP_MAP } from './data/worldData';
import { createInterviewInvite } from './data/interviews';
import { beatEngine } from './audio/beatEngine';
import { soundtrack } from './audio/soundtrack';
import { AudioPlayerMenu } from './components/AudioPlayerMenu';
import { SplashAndCreator } from './components/SplashAndCreator';
import { HomeDashboard } from './components/HomeDashboard';
import { StudioView } from './components/StudioView';
import { SceneView } from './components/SceneView';
import { MapTourView } from './components/MapTourView';
import { ArenaView } from './components/ArenaView';
import { EmpireView } from './components/EmpireView';
import { GalaModal, InterviewModal, ProfileView } from './components/ProfileAndModals';

function loadSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (parsed && parsed.started && parsed.player?.alias) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const NAV_ITEMS: { id: NavTab; label: string; shortLabel: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Kariera', shortLabel: 'Kariera', icon: Home },
  { id: 'studio', label: 'Studio', shortLabel: 'Studio', icon: Sliders },
  { id: 'scene', label: 'Scena', shortLabel: 'Scena', icon: Users },
  { id: 'map', label: 'Mapa', shortLabel: 'Mapa', icon: Map },
  { id: 'arena', label: 'Arena', shortLabel: 'Arena', icon: Swords },
  { id: 'empire', label: 'Imperium', shortLabel: 'Biznes', icon: Briefcase },
  { id: 'profile', label: 'Profil', shortLabel: 'Profil', icon: Award },
];

export default function App() {
  const [savedSnapshot, setSavedSnapshot] = useState<GameState | null>(() => loadSavedGame());
  const [state, setState] = useState<GameState | null>(null);
  const [tab, setTab] = useState<NavTab>('home');

  // Start quiet background soundtrack immediately on app launch (with first-gesture fallback)
  useEffect(() => {
    return soundtrack.initAutoStart();
  }, []);

  // Autosave whenever playing state changes
  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
      setSavedSnapshot(state);
    } catch {
      // ignore quota error
    }
  }, [state]);

  const updateState = (updater: (prev: GameState) => GameState) => {
    setState((prev) => {
      if (!prev) return prev;
      return evaluateMilestones(updater(prev));
    });
  };

  const handleStartNew = (params: {
    alias: string;
    gender: Gender;
    city: string;
    voivodeship: VoivodeshipId;
    portraitId: number;
    customAvatar?: string;
  }) => {
    const fresh = createNewGameState(params);
    setState(fresh);
    setTab('home');
    beatEngine.playFx('win');
    soundtrack.startOnInteraction();
  };

  const handleContinue = () => {
    if (savedSnapshot) {
      setState(savedSnapshot);
      setTab('home');
      soundtrack.startOnInteraction();
    }
  };

  const handleResetCareer = () => {
    beatEngine.stop();
    soundtrack.stopForReset();
    localStorage.removeItem(SAVE_STORAGE_KEY);
    setSavedSnapshot(null);
    setState(null);
    setTab('home');
  };

  // --- Gameplay Handlers ---
  const handleAdvanceDay = () => {
    beatEngine.playFx('tap');
    updateState((prev) => advanceDay(prev));
  };

  const handleDailyAction = (action: 'warehouse' | 'reset' | 'underground_cypher' | 'commercial_ad') => {
    updateState((prev) => {
      if (action === 'warehouse') {
        if (prev.energy < 30 || prev.lastWarehouseDay === prev.day) return prev;
        beatEngine.playFx('cash');
        return {
          ...prev,
          cash: prev.cash + 480,
          energy: Math.max(0, prev.energy - 30),
          inspiration: Math.max(0, prev.inspiration - 8),
          lastWarehouseDay: prev.day,
          lastActionToast: 'Zmiana na magazynie zakończona · +480 zł (kolejna jutro)',
        };
      }
      if (action === 'reset') {
        if (prev.lastResetDay === prev.day) return prev;
        beatEngine.playFx('tap');
        return {
          ...prev,
          cash: prev.cash - 120,
          energy: Math.min(100, prev.energy + 24),
          inspiration: Math.min(100, prev.inspiration + 36),
          lastResetDay: prev.day,
          lastActionToast: 'Reset z dala od zgiełku · +36 Weny · +24 Energii',
        };
      }
      if (action === 'underground_cypher') {
        if (prev.energy < 22 || prev.lastCypherDay === prev.day) return prev;
        beatEngine.playFx('tap');
        const gainedFans = Math.round(45 + prev.hype * 3.5);
        return {
          ...prev,
          energy: Math.max(0, prev.energy - 22),
          hype: Math.min(100, prev.hype + 7),
          fans: prev.fans + gainedFans,
          streetMainstream: Math.max(0, prev.streetMainstream - 8),
          regionSupport: {
            ...prev.regionSupport,
            [prev.player.voivodeship]: Math.min(100, (prev.regionSupport[prev.player.voivodeship] || 0) + 4),
          },
          lastCypherDay: prev.day,
          lastActionToast: `Osiedlowy cypher w ${prev.player.city} · +${gainedFans} fanów · Ulica +8`,
        };
      }
      // commercial_ad — rare opportunity (min 120 fans + 7-day cooldown)
      const adOnCooldown =
        prev.lastCommercialAdDay !== undefined && prev.day - prev.lastCommercialAdDay < 7;
      if (prev.energy < 25 || prev.fans < 120 || adOnCooldown) return prev;
      beatEngine.playFx('cash');
      const payout = Math.round(950 + prev.fans * 0.08 + prev.hype * 24);
      const gainedFans = Math.round(120 + prev.fans * 0.03);
      return {
        ...prev,
        cash: prev.cash + payout,
        fans: prev.fans + gainedFans,
        hype: Math.min(100, prev.hype + 6),
        energy: Math.max(0, prev.energy - 25),
        streetMainstream: Math.min(100, prev.streetMainstream + 10),
        lastCommercialAdDay: prev.day,
        portalFeed: prependPost(prev.portalFeed, {
          id: uid('post'),
          day: prev.day,
          category: 'Scena',
          headline: `${prev.player.alias} w dużej kampanii reklamowej`,
          body: 'Zasięgi eksplodują w całym kraju, ale fani z podziemia komentują, że to krok w stronę mainstreamu.',
          likes: Math.round(240 + prev.fans * 0.04),
        }),
        lastActionToast: `Kampania komercyjna · +${formatPLN(payout)} · Mainstream +10 (kolejna za 7 dni)`,
      };
    });
  };

  const handleInbox = (msg: InboxMessage, accept: boolean) => {
    if (accept && msg.type === 'interview') {
      beatEngine.playFx('tap');
      updateState((prev) => ({
        ...startInterviewNow(prev, msg.interviewOutlet),
        inbox: prev.inbox.map((m) => (m.id === msg.id ? { ...m, handled: true, accepted: true } : m)),
      }));
      return;
    }

    beatEngine.playFx(accept ? 'cash' : 'tap');
    updateState((prev) => {
      const updatedInbox = prev.inbox.map((m) =>
        m.id === msg.id ? { ...m, handled: true, accepted: accept } : m
      );
      if (!accept) {
        return { ...prev, inbox: updatedInbox, lastActionToast: 'Odrzucono propozycję z branży.' };
      }

      const sender = prev.npcs.find((n) => n.id === msg.fromNpcId);
      const rewardCash = msg.rewardCash || 0;
      const rewardFans = msg.rewardFans || 0;
      const rewardHype = msg.rewardHype || 0;

      const updatedNpcs = sender
        ? prev.npcs.map((n) =>
            n.id === sender.id ? { ...n, relation: Math.min(100, n.relation + 14) } : n
          )
        : prev.npcs;

      let extraTracks = prev.tracks;
      let headline = `${prev.player.alias} podejmuje współpracę z ${sender?.alias || 'branżą'}`;
      let body = `Zrealizowano zlecenie i zdobyto ${formatCompact(rewardFans)} nowych słuchaczy.`;

      if (msg.type === 'beat_commission' && sender) {
        const prodTitle = `${sender.alias} — Nocny Singiel [Prod. ${prev.player.alias}]`;
        const prodTrack: Track = {
          id: uid('trk'),
          title: prodTitle,
          mode: 'prod_commission',
          beatStyle: '808_trap',
          bpm: 136,
          producerTag: prev.player.producerTag,
          cover: {
            artworkId: Math.floor(Math.random() * 30) + 1,
            textStyle: 'bottom',
            bgPrimary: '#1a1428',
            bgSecondary: '#07070b',
            accent: '#4cd4f5',
            filter: 'none',
            motif: 'wave',
            parentalAdvisory: false,
          },
          lyrics: `Oficjalny bit wyprodukowany dla ${sender.alias} (${prev.player.producerTag})`,
          lyricScore: 80,
          quality: Math.min(96, 68 + prev.studioTier * 12),
          commissionForNpcId: sender.id,
          streams: Math.round(4500 + sender.fans * 0.08),
          likes: Math.round(420 + sender.fans * 0.01),
          releaseDay: prev.day,
          cert: 'none',
        };
        extraTracks = [prodTrack, ...prev.tracks];
        headline = `Nowy hit na listach: ${prodTitle}`;
        body = `Oficjalny singiel ${sender.alias} na bicie od ${prev.player.alias} podbija playlisty w całej Polsce!`;
      }

      return {
        ...prev,
        cash: prev.cash + rewardCash,
        fans: prev.fans + rewardFans,
        hype: Math.min(100, prev.hype + rewardHype),
        energy: Math.max(0, prev.energy - 14),
        npcs: updatedNpcs,
        tracks: extraTracks,
        inbox: updatedInbox,
        portalFeed: prependPost(prev.portalFeed, {
          id: uid('post'),
          day: prev.day,
          category: 'Premiera',
          headline,
          body,
          likes: Math.round(350 + (sender?.fans || 20000) * 0.01),
        }),
        lastActionToast: `Zrealizowano zlecenie · +${formatPLN(rewardCash)} · +${formatCompact(rewardFans)} fanów`,
      };
    });
  };

  const handleRecordTrack = (payload: {
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
  }) => {
    beatEngine.playFx('win');
    updateState((prev) => {
      const studio = STUDIO_TIERS[prev.studioTier];
      const beatCost = payload.beatCost || 0;
      const totalCashCost = payload.featCost + beatCost;
      if (prev.energy < studio.energyCost || prev.cash < totalCashCost) return prev;

      const quality = Math.min(
        100,
        Math.round(
          payload.lyricScore * 0.52 +
            prev.inspiration * 0.24 +
            studio.qualityBonus +
            (payload.beatQualityBonus || 0) +
            (payload.featNpcId ? 10 : 0) +
            8
        )
      );

      const usedProducerTag = payload.beatProducerTag || prev.player.producerTag;

      const featNpc = payload.featNpcId
        ? prev.npcs.find((n) => n.id === payload.featNpcId)
        : undefined;
      const dissNpc = payload.dissTargetId
        ? prev.npcs.find((n) => n.id === payload.dissTargetId)
        : undefined;

      const initialStreams =
        payload.mode === 'vault'
          ? 0
          : Math.round(
              (280 + prev.fans * 0.65 + (featNpc ? featNpc.fans * 0.028 : 0)) *
                (quality / 60) *
                (payload.mode === 'diss' ? 1.55 : 1)
            );

      const newTrack: Track = {
        id: uid('trk'),
        title: payload.title,
        mode: payload.mode,
        beatStyle: payload.beatStyle,
        bpm: payload.bpm,
        producerTag: usedProducerTag,
        beatProducer: payload.beatProducer,
        beatCost: beatCost > 0 ? beatCost : undefined,
        cover: payload.cover,
        lyrics: payload.lyrics,
        lyricScore: payload.lyricScore,
        quality,
        featNpcId: payload.featNpcId,
        dissTargetId: payload.dissTargetId,
        streams: initialStreams,
        likes: Math.round(initialStreams * 0.11),
        releaseDay: prev.day,
        cert: 'none',
      };

      let updatedNpcs = prev.npcs;
      let updatedBeefs = prev.beefs;
      const extraPosts = [];

      if (featNpc) {
        updatedNpcs = updatedNpcs.map((n) =>
          n.id === featNpc.id ? { ...n, relation: Math.min(100, n.relation + 18) } : n
        );
      }

      if (payload.mode === 'diss' && dissNpc) {
        updatedNpcs = updatedNpcs.map((n) =>
          n.id === dissNpc.id ? { ...n, relation: Math.max(-100, n.relation - 45) } : n
        );
        updatedBeefs = [
          {
            id: uid('beef'),
            opponentId: dissNpc.id,
            startDay: prev.day,
            responseDay: prev.day + 2,
            responded: false,
            votingEndDay: prev.day + 6,
            playerVotes: Math.round(140 + prev.fans * 0.03),
            opponentVotes: 0,
            resolved: false,
            playerDissTitle: payload.title,
          },
          ...prev.beefs,
        ];
        extraPosts.push({
          id: uid('post'),
          day: prev.day,
          category: 'Beef' as const,
          headline: `OGIEŃ W SIECI! ${prev.player.alias} wrzuca diss „${payload.title}” na ${dissNpc.alias}`,
          body: `Internet płonie! Cała scena czeka, czy ${dissNpc.alias} odpowie w ciągu 48 godzin.`,
          likes: Math.round(450 + prev.fans * 0.08),
        });
      } else if (payload.mode === 'single') {
        extraPosts.push({
          id: uid('post'),
          day: prev.day,
          category: 'Premiera' as const,
          headline: `Nowy singiel: ${prev.player.alias} — „${payload.title}”${featNpc ? ` (feat. ${featNpc.alias})` : ''}`,
          body: `Jakość produkcji: ${quality}/100 · Bit: ${payload.beatProducer ? `${payload.beatProducer} (${usedProducerTag})` : usedProducerTag}. Numer zbiera pierwsze odsłuchania!`,
          likes: Math.round(90 + initialStreams * 0.08),
        });
      }

      const fansGain =
        payload.mode === 'vault'
          ? 0
          : Math.round(65 + initialStreams * 0.09 + (featNpc ? 220 : 0));

      let updatedInbox = prev.inbox;
      const hasPendingInterview = prev.inbox.some((m) => !m.handled && m.type === 'interview');
      const daysSinceInterview = prev.day - (prev.lastInterviewDay ?? -10);
      if (payload.mode === 'diss' && !hasPendingInterview && daysSinceInterview >= 4) {
        const invite = createInterviewInvite(
          { ...prev, beefs: updatedBeefs, tracks: [newTrack, ...prev.tracks] },
          prev.day,
          'beef'
        );
        updatedInbox = [invite, ...prev.inbox].slice(0, 25);
      }

      return {
        ...prev,
        cash: prev.cash - totalCashCost,
        fans: prev.fans + fansGain,
        hype: Math.min(
          100,
          prev.hype +
            (payload.mode === 'diss' ? 16 : payload.mode === 'single' ? 8 : 2) +
            (payload.beatHypeBonus || 0)
        ),
        energy: Math.max(0, prev.energy - studio.energyCost),
        inspiration: Math.max(0, prev.inspiration - 16),
        streetMainstream:
          payload.mode === 'diss'
            ? Math.max(0, prev.streetMainstream - 6)
            : prev.streetMainstream,
        npcs: updatedNpcs,
        beefs: updatedBeefs,
        inbox: updatedInbox,
        tracks: [newTrack, ...prev.tracks],
        portalFeed: [...extraPosts, ...prev.portalFeed].slice(0, 45),
        lastActionToast:
          payload.mode === 'vault'
            ? `Zapisano „${payload.title}” w Skarbcu (Jakość ${quality}/100${payload.beatProducer ? ` · Prod. ${payload.beatProducer}` : ''})`
            : payload.mode === 'diss'
              ? `Diss „${payload.title}” podpalił internet! Odpowiedź za 2 dni.`
              : `Singiel „${payload.title}” wydany! Jakość ${quality}/100 · +${formatCompact(fansGain)} fanów`,
      };
    });
  };

  const handleReleaseProject = (payload: {
    title: string;
    format: 'EP' | 'Album';
    trackIds: string[];
    cover: CoverConfig;
  }) => {
    beatEngine.playFx('award');
    updateState((prev) => {
      const projectId = uid('proj');
      const included = prev.tracks.filter((t) => payload.trackIds.includes(t.id));
      const avgQuality = Math.round(
        included.reduce((s, t) => s + t.quality, 0) / Math.max(1, included.length)
      );
      const launchStreams = Math.round(
        (1600 + prev.fans * 1.45 + prev.hype * 65) *
          (avgQuality / 62) *
          (payload.format === 'Album' ? 1.7 : 1.15)
      );
      const launchSales = Math.round(launchStreams * 0.015);
      const salesCash = launchSales * 26;
      const newFans = Math.round(450 + launchStreams * 0.08);

      const newProject = {
        id: projectId,
        title: payload.title,
        format: payload.format,
        trackIds: payload.trackIds,
        cover: payload.cover,
        streams: launchStreams,
        sales: launchSales,
        releaseDay: prev.day,
        cert: 'none' as const,
      };
      const updatedProjects = [newProject, ...prev.projects];
      let updatedInbox = prev.inbox;
      const hasPendingInterview = prev.inbox.some((m) => !m.handled && m.type === 'interview');
      const daysSinceInterview = prev.day - (prev.lastInterviewDay ?? -10);
      if (!hasPendingInterview && daysSinceInterview >= 4) {
        const invite = createInterviewInvite(
          { ...prev, projects: updatedProjects },
          prev.day,
          'release',
          payload.title
        );
        updatedInbox = [invite, ...prev.inbox].slice(0, 25);
      }

      return {
        ...prev,
        cash: prev.cash + salesCash,
        fans: prev.fans + newFans,
        hype: Math.min(100, prev.hype + (payload.format === 'Album' ? 24 : 15)),
        tracks: prev.tracks.map((t) =>
          payload.trackIds.includes(t.id) ? { ...t, projectId } : t
        ),
        projects: updatedProjects,
        inbox: updatedInbox,
        portalFeed: prependPost(prev.portalFeed, {
          id: uid('post'),
          day: prev.day,
          category: 'Premiera',
          headline: `PREMIERA ${payload.format.toUpperCase()}: ${prev.player.alias} — „${payload.title}”`,
          body: `${payload.trackIds.length} utworów ze skarbca trafiło do sieci! W dniu premiery sprzedano ${launchSales.toLocaleString('pl-PL')} sztuk.`,
          likes: Math.round(400 + prev.fans * 0.09),
        }),
        lastActionToast: `Premiera ${payload.format} „${payload.title}” · +${formatPLN(salesCash)} · +${formatCompact(newFans)} fanów`,
      };
    });
  };

  const handleInteractNpc = (npcId: string, action: 'hangout' | 'provoke' | 'recruit') => {
    beatEngine.playFx('tap');
    updateState((prev) => {
      const npc = prev.npcs.find((n) => n.id === npcId);
      if (!npc) return prev;

      if (action === 'hangout') {
        if (prev.energy < 12) return prev;
        return {
          ...prev,
          energy: prev.energy - 12,
          npcs: prev.npcs.map((n) =>
            n.id === npcId ? { ...n, relation: Math.min(100, n.relation + 16) } : n
          ),
          lastActionToast: `Dobre spotkanie z ${npc.alias} (${npc.city}) · Relacja +16`,
        };
      }

      if (action === 'provoke') {
        if (prev.energy < 10) return prev;
        return {
          ...prev,
          energy: prev.energy - 10,
          hype: Math.min(100, prev.hype + 9),
          streetMainstream: Math.max(0, prev.streetMainstream - 4),
          npcs: prev.npcs.map((n) =>
            n.id === npcId ? { ...n, relation: Math.max(-100, n.relation - 35) } : n
          ),
          portalFeed: prependPost(prev.portalFeed, {
            id: uid('post'),
            day: prev.day,
            category: 'Beef',
            headline: `${prev.player.alias} zaczepia ${npc.alias} w sieci!`,
            body: `Napięcie rośnie — czy za chwilę w studiu powstanie oficjalny Diss Track?`,
            likes: Math.round(280 + prev.fans * 0.04),
          }),
          lastActionToast: `Zaczepiłeś ${npc.alias} w sieci · Hype +9 · Zostajecie wrogami`,
        };
      }

      // recruit to crew
      if (!prev.crew || npc.relation < 45 || prev.crew.memberIds.includes(npcId)) return prev;
      return {
        ...prev,
        crew: {
          ...prev.crew,
          memberIds: [...prev.crew.memberIds, npcId],
        },
        portalFeed: prependPost(prev.portalFeed, {
          id: uid('post'),
          day: prev.day,
          category: 'Scena',
          headline: `${npc.alias} dołącza do ekipy ${prev.crew.name}!`,
          body: `Nowy skład pod wodzą ${prev.player.alias} rośnie w siłę na polskiej scenie.`,
          likes: Math.round(320 + npc.fans * 0.015),
        }),
        lastActionToast: `${npc.alias} dołączył do ekipy ${prev.crew.name}!`,
      };
    });
  };

  const handlePlayConcert = (payload: {
    scope: VenueScopeId;
    venueName: string;
    tier: 'pub' | 'club' | 'arena' | 'polonia';
    energyCost: number;
    upfrontCost: number;
    minFans: number;
  }) => {
    if (!state) return null;
    if (state.energy < payload.energyCost || state.cash < payload.upfrontCost || state.fans < payload.minFans) {
      return null;
    }

    const friendlyNpcs = state.npcs.filter((n) => n.relation >= 40);
    const cameoNpc =
      friendlyNpcs.length > 0 && Math.random() < 0.48
        ? friendlyNpcs[Math.floor(Math.random() * friendlyNpcs.length)]
        : undefined;

    const tierMult =
      payload.tier === 'polonia' ? 3.2 : payload.tier === 'arena' ? 2.6 : payload.tier === 'club' ? 1.5 : 1;
    const regionBase =
      payload.scope === 'londyn' || payload.scope === 'chicago'
        ? 45
        : state.regionSupport[payload.scope] || 0;

    const grossPay = Math.round(
      (550 + regionBase * 18 + state.fans * 0.055) * tierMult * (cameoNpc ? 1.3 : 1)
    );
    const netProfit = grossPay - payload.upfrontCost;
    const fansGained = Math.round((140 + state.hype * 6) * tierMult * (cameoNpc ? 1.45 : 1));
    const supportGain = payload.tier === 'arena' ? 35 : payload.tier === 'club' ? 26 : 18;

    beatEngine.playFx('cash');

    updateState((prev) => {
      const nextRegionSupport = { ...prev.regionSupport };
      let becameKing = false;
      if (payload.scope !== 'londyn' && payload.scope !== 'chicago') {
        const before = nextRegionSupport[payload.scope] || 0;
        const after = Math.min(100, before + supportGain);
        nextRegionSupport[payload.scope] = after;
        if (before < 100 && after >= 100) becameKing = true;
      }

      return {
        ...prev,
        cash: prev.cash + netProfit,
        fans: prev.fans + fansGained,
        hype: Math.min(100, prev.hype + (cameoNpc ? 11 : 6)),
        energy: Math.max(0, prev.energy - payload.energyCost),
        concertsPlayed: prev.concertsPlayed + 1,
        poloniaConcertsPlayed:
          payload.tier === 'polonia' ? prev.poloniaConcertsPlayed + 1 : prev.poloniaConcertsPlayed,
        regionSupport: nextRegionSupport,
        portalFeed: prependPost(prev.portalFeed, {
          id: uid('post'),
          day: prev.day,
          category: 'Koncert',
          headline: becameKing
            ? `${prev.player.alias} zostaje Królem Regionu ${VOIVODESHIP_MAP[payload.scope as VoivodeshipId].name}!`
            : `Wyprzedany występ: ${prev.player.alias} rozgrzał ${payload.venueName}`,
          body: cameoNpc
            ? `Niespodzianka wieczoru! Na scenę wbił ${cameoNpc.alias} i wspólnie roznieśli klub.`
            : `Publika znała każdy wers. Artysta zgarnia +${formatCompact(fansGained)} nowych słuchaczy.`,
          likes: Math.round(210 + fansGained * 0.6),
        }),
        lastActionToast: `Koncert: ${payload.venueName} · Bilans ${netProfit >= 0 ? '+' : ''}${formatPLN(netProfit)} · +${formatCompact(fansGained)} fanów`,
      };
    });

    return {
      summary: `Zagrałeś w ${payload.venueName}! Zysk na czysto: ${formatPLN(netProfit)} · Nowi fani: +${formatCompact(fansGained)}.`,
      cameoNpc: cameoNpc?.alias,
    };
  };

  // --- Render Splash or Active Game ---
  if (!state) {
    return (
      <SplashAndCreator
        hasSavedGame={Boolean(savedSnapshot)}
        savedAlias={savedSnapshot?.player.alias}
        savedDay={savedSnapshot?.day}
        onContinue={handleContinue}
        onStartNew={handleStartNew}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#06060a] bg-noise text-[#f5f3ee] flex flex-col overflow-x-clip">
      {/* Subtle Ambient Alignment Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-60"
        style={{
          background:
            state.streetMainstream < 45
              ? 'radial-gradient(circle at 12% 8%, rgba(157,107,255,0.22), transparent 44%), radial-gradient(circle at 88% 88%, rgba(226,182,78,0.14), transparent 44%)'
              : 'radial-gradient(circle at 85% 8%, rgba(226,182,78,0.22), transparent 44%), radial-gradient(circle at 14% 88%, rgba(76,212,245,0.14), transparent 44%)',
        }}
      />

      {/* Top Navigation Bar (Desktop 3-Zone Contract; Compact on Mobile) */}
      <header className="sticky top-0 z-30 h-15 bg-[#08080e]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_28px_-14px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Single Metallic Wordmark */}
          <button
            onClick={() => setTab('home')}
            className="font-display text-xl font-bold tracking-wider text-gold-metallic whitespace-nowrap shrink-0 cursor-pointer"
          >
            RAP EMPIRE BETA
          </button>

          {/* Zone 2: Desktop Single-Line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            {NAV_ITEMS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`py-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    active
                      ? 'text-[#fae092] border-[#f5d37b]'
                      : 'text-[#9b99aa] border-transparent hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Compact Soundtrack Popover + Mobile Quick Stats */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="lg:hidden font-mono-num text-xs font-bold text-[#fae092] whitespace-nowrap">
              {formatPLN(state.cash)} · D{state.day}
            </span>
            <AudioPlayerMenu />
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-10">
        {/* Quiet Feedback Strip */}
        {state.lastActionToast && (
          <div className="mb-5 px-4 py-3 rounded-2xl glass-panel-gold text-xs font-medium text-[#fae092] flex items-center justify-between gap-2">
            <span>{state.lastActionToast}</span>
            <button
              onClick={() => setState((p) => (p ? { ...p, lastActionToast: undefined } : p))}
              className="text-[#cfccd9] hover:text-white text-xs font-semibold cursor-pointer shrink-0"
            >
              Zamknij
            </button>
          </div>
        )}

        {tab === 'home' && (
          <HomeDashboard
            state={state}
            onAdvanceDay={handleAdvanceDay}
            onDailyAction={handleDailyAction}
            onHandleInbox={handleInbox}
            onNavigate={setTab}
          />
        )}

        {tab === 'studio' && (
          <StudioView
            state={state}
            onUpdateProducerTag={(tag) =>
              updateState((prev) => ({ ...prev, player: { ...prev.player, producerTag: tag } }))
            }
            onUpgradeStudio={() => {
              beatEngine.playFx('award');
              updateState((prev) => {
                const next = STUDIO_TIERS[prev.studioTier + 1];
                if (!next || prev.cash < next.upgradeCost) return prev;
                return {
                  ...prev,
                  cash: prev.cash - next.upgradeCost,
                  studioTier: next.tier,
                  hype: Math.min(100, prev.hype + 10),
                  lastActionToast: `Awans studia! Teraz nagrywasz w: ${next.name}`,
                };
              });
            }}
            onRecordTrack={handleRecordTrack}
            onReleaseProject={handleReleaseProject}
          />
        )}

        {tab === 'scene' && (
          <SceneView
            state={state}
            onInteractNpc={handleInteractNpc}
            onFoundCrew={(name) => {
              beatEngine.playFx('win');
              updateState((prev) => {
                if (prev.cash < 1500 || prev.crew) return prev;
                return {
                  ...prev,
                  cash: prev.cash - 1500,
                  crew: { name, foundedDay: prev.day, memberIds: [], mixtapes: 0, groupTours: 0 },
                  lastActionToast: `Założono ekipę „${name}”! Zrekrutuj swoich Ziomków.`,
                };
              });
            }}
            onCrewAction={(action) => {
              beatEngine.playFx('win');
              updateState((prev) => {
                if (!prev.crew || prev.crew.memberIds.length < 1) return prev;
                const power = prev.crew.memberIds.length;
                if (action === 'mixtape') {
                  if (prev.energy < 25) return prev;
                  const streams = Math.round((3200 + prev.fans * 0.9) * (1 + power * 0.45));
                  const cashGain = Math.round(streams * 0.14);
                  const fansGain = Math.round(500 + power * 380);
                  return {
                    ...prev,
                    energy: prev.energy - 25,
                    cash: prev.cash + cashGain,
                    fans: prev.fans + fansGain,
                    hype: Math.min(100, prev.hype + 12),
                    crew: { ...prev.crew, mixtapes: prev.crew.mixtapes + 1 },
                    portalFeed: prependPost(prev.portalFeed, {
                      id: uid('post'),
                      day: prev.day,
                      category: 'Premiera',
                      headline: `Ekipa ${prev.crew.name} wypuszcza wspólny Mixtape #${prev.crew.mixtapes + 1}`,
                      body: `Zjednoczone siły rozbijają bank na streamingach (+${formatCompact(fansGain)} fanów).`,
                      likes: Math.round(450 + prev.fans * 0.06),
                    }),
                    lastActionToast: `Mixtape Ekipy ${prev.crew.name} wydany · +${formatPLN(cashGain)} · +${formatCompact(fansGain)} fanów`,
                  };
                }
                // group tour
                if (prev.energy < 30) return prev;
                const cashGain = Math.round(2800 + power * 1450 + prev.fans * 0.08);
                const fansGain = Math.round(620 + power * 420);
                return {
                  ...prev,
                  energy: prev.energy - 30,
                  cash: prev.cash + cashGain,
                  fans: prev.fans + fansGain,
                  hype: Math.min(100, prev.hype + 10),
                  crew: { ...prev.crew, groupTours: prev.crew.groupTours + 1 },
                  lastActionToast: `Trasa grupowa ${prev.crew.name} wyprzedana · +${formatPLN(cashGain)}`,
                };
              });
            }}
            onGoToStudio={() => setTab('studio')}
          />
        )}

        {tab === 'map' && <MapTourView state={state} onPlayConcert={handlePlayConcert} />}

        {tab === 'arena' && (
          <ArenaView
            state={state}
            onFinishBattle={({ opponentId, won, isTournamentFinal }) => {
              beatEngine.playFx(won ? 'win' : 'tap');
              updateState((prev) => {
                const opp = prev.npcs.find((n) => n.id === opponentId);
                const prize = isTournamentFinal && won ? 3500 : won ? 450 : 0;
                const fansGain = won ? Math.round(260 + (opp?.fans || 15000) * 0.008) : 45;
                return {
                  ...prev,
                  energy: Math.max(0, prev.energy - 18),
                  cash: prev.cash + prize,
                  fans: prev.fans + fansGain,
                  hype: Math.min(100, Math.max(5, prev.hype + (won ? 10 : -4))),
                  streetMainstream: Math.max(0, prev.streetMainstream - (won ? 7 : 2)),
                  freestyleWins: won ? prev.freestyleWins + 1 : prev.freestyleWins,
                  freestyleStreak: won ? prev.freestyleStreak + 1 : 0,
                  tournamentsWon: isTournamentFinal && won ? prev.tournamentsWon + 1 : prev.tournamentsWon,
                  portalFeed: won
                    ? prependPost(prev.portalFeed, {
                        id: uid('post'),
                        day: prev.day,
                        category: 'Scena',
                        headline: isTournamentFinal
                          ? `${prev.player.alias} zdobywa Wielki Puchar Freestyle!`
                          : `${prev.player.alias} pokonuje ${opp?.alias || 'rywala'} w bitwie 1v1`,
                        body: 'Szacunek podziemia rośnie z każdą rundą.',
                        likes: Math.round(260 + prev.fans * 0.04),
                      })
                    : prev.portalFeed,
                  lastActionToast: won
                    ? `Wygrana na Arenie! +${formatPLN(prize)} · +${formatCompact(fansGain)} fanów`
                    : 'Tym razem rywal zgarnął werdykt. Wróć mocniejszy!',
                };
              });
            }}
          />
        )}

        {tab === 'empire' && (
          <EmpireView
            state={state}
            onFoundBrand={(name, style: BrandStyle) => {
              beatEngine.playFx('award');
              updateState((prev) => {
                if (prev.cash < 3500 || prev.fans < 1000 || prev.brand) return prev;
                return {
                  ...prev,
                  cash: prev.cash - 3500,
                  hype: Math.min(100, prev.hype + 10),
                  brand: { name, style, reputation: 25, drops: [] },
                  lastActionToast: `Marka odzieżowa „${name}” wystartowała!`,
                };
              });
            }}
            onLaunchDrop={(name, totalUnits, unitPrice, productionCost) => {
              beatEngine.playFx('cash');
              updateState((prev) => {
                if (!prev.brand || prev.cash < productionCost) return prev;
                return {
                  ...prev,
                  cash: prev.cash - productionCost,
                  brand: {
                    ...prev.brand,
                    drops: [
                      {
                        id: uid('drop'),
                        name,
                        totalUnits,
                        soldUnits: 0,
                        unitPrice,
                        productionCost,
                        startDay: prev.day,
                        active: true,
                        soldOut: false,
                      },
                      ...prev.brand.drops,
                    ],
                  },
                  lastActionToast: `Drop „${name}” (${totalUnits} szt.) trafił do sklepu! Obserwuj sprzedaż codziennie.`,
                };
              });
            }}
            onFoundLabel={(name) => {
              beatEngine.playFx('award');
              updateState((prev) => {
                if (prev.cash < 25000 || prev.fans < 12000 || prev.label) return prev;
                return {
                  ...prev,
                  cash: prev.cash - 25000,
                  hype: Math.min(100, prev.hype + 16),
                  label: { name, foundedDay: prev.day, artists: [], compilations: 0, totalEarnings: 0 },
                  lastActionToast: `Otwarto własną wytwórnię płytową „${name}”!`,
                };
              });
            }}
            onSignTalent={(talent) => {
              beatEngine.playFx('win');
              updateState((prev) => {
                if (!prev.label || prev.cash < talent.signingBonus || prev.label.artists.length >= 5) {
                  return prev;
                }
                return {
                  ...prev,
                  cash: prev.cash - talent.signingBonus,
                  label: {
                    ...prev.label,
                    artists: [
                      ...prev.label.artists,
                      {
                        id: uid('art'),
                        alias: talent.alias,
                        gender: talent.gender,
                        portraitId: talent.portraitId,
                        city: talent.city,
                        voivodeship: talent.voivodeship,
                        potential: talent.potential,
                        fans: 850,
                        dailyRoyalty: Math.round(talent.potential * 4),
                        releases: 0,
                        morale: 90,
                      },
                    ],
                  },
                  lastActionToast: `${talent.alias} podpisał kontrakt z wytwórnią ${prev.label.name}!`,
                };
              });
            }}
            onDropLabelCompilation={() => {
              beatEngine.playFx('award');
              updateState((prev) => {
                if (!prev.label || prev.label.artists.length < 1 || prev.energy < 25) return prev;
                const count = prev.label.artists.length;
                const revenue = Math.round(4200 + count * 2900 + prev.fans * 0.12);
                const newFans = Math.round(800 + count * 650);
                return {
                  ...prev,
                  energy: prev.energy - 25,
                  cash: prev.cash + revenue,
                  fans: prev.fans + newFans,
                  hype: Math.min(100, prev.hype + 14),
                  label: {
                    ...prev.label,
                    compilations: prev.label.compilations + 1,
                    totalEarnings: prev.label.totalEarnings + revenue,
                  },
                  portalFeed: prependPost(prev.portalFeed, {
                    id: uid('post'),
                    day: prev.day,
                    category: 'Biznes',
                    headline: `Kompilacja wytwórni ${prev.label.name} Vol. ${prev.label.compilations + 1} wchodzi na szczyt!`,
                    body: `Młode talenty pod skrzydłami ${prev.player.alias} rozgrzały listy przebojów.`,
                    likes: Math.round(750 + prev.fans * 0.07),
                  }),
                  lastActionToast: `Kompilacja wytwórni wydana · +${formatPLN(revenue)} · +${formatCompact(newFans)} fanów`,
                };
              });
            }}
          />
        )}

        {tab === 'profile' && (
          <ProfileView
            state={state}
            onSelectActiveTitle={(title) =>
              updateState((prev) => ({
                ...prev,
                player: { ...prev.player, activeTitle: title },
                lastActionToast: `Ustawiono prestiżowy tytuł: ${title}`,
              }))
            }
            onResetCareer={handleResetCareer}
            onPreviewGala={() =>
              updateState((prev) => ({
                ...prev,
                pendingGala:
                  prev.galaHistory[0] || buildGalaForSeason(prev, prev.day),
              }))
            }
          />
        )}

        <footer className="mt-10 pt-4 border-t border-white/8 text-center space-y-0.5 text-[11px] text-[#7e7c8f]">
          <div>
            <span className="text-[#e8ba62] font-semibold tracking-wider">RAP EMPIRE</span> · Developed by{' '}
            <span className="text-[#c8c5d6]">Garczu Studios</span>
          </div>
          <div>© 2026 Garczu Studios. All rights reserved.</div>
        </footer>
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Thumb-Zone Navigation) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08080e]/92 backdrop-blur-xl border-t border-white/12 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.95)] pb-safe">
        <div className="grid grid-cols-7 h-15 items-center max-w-xl mx-auto px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  active ? 'text-[#fae092]' : 'text-[#8e8b9d] hover:text-white'
                }`}
              >
                {active && (
                  <span
                    className="absolute top-0 inset-x-2 h-[2px] rounded-full bg-[#f5d37b]"
                    style={{ boxShadow: '0 0 10px rgba(245,211,123,0.9)' }}
                  />
                )}
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold leading-none truncate">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Live Contextual Interview Modal */}
      {state.pendingInterview && (
        <InterviewModal
          questions={state.pendingInterview}
          onComplete={({ streetDelta, hypeDelta, fansDelta, cashDelta, lastReaction }) => {
            beatEngine.playFx('win');
            const outletName = state.pendingInterview?.[0]?.outlet || 'RapStudio TV';
            updateState((prev) => ({
              ...prev,
              pendingInterview: null,
              streetMainstream: Math.max(0, Math.min(100, prev.streetMainstream + streetDelta)),
              hype: Math.min(100, prev.hype + hypeDelta),
              fans: prev.fans + fansDelta,
              cash: prev.cash + cashDelta,
              portalFeed: prependPost(prev.portalFeed, {
                id: uid('post'),
                day: prev.day,
                category: 'Wywiad',
                headline: `${outletName}: Głośny wywiad na żywo z ${prev.player.alias}`,
                body: lastReaction,
                likes: Math.round(320 + prev.fans * 0.06),
              }),
              lastActionToast: `Wywiad dla ${outletName} zakończony · +${formatCompact(fansDelta)} fanów · Hype +${hypeDelta}`,
            }));
          }}
        />
      )}

      {/* 60-Day Gala Rap Awards Modal */}
      {state.pendingGala && (
        <GalaModal
          gala={state.pendingGala}
          onClose={() => {
            beatEngine.playFx('award');
            updateState((prev) => ({ ...prev, pendingGala: null }));
          }}
        />
      )}
    </div>
  );
}
