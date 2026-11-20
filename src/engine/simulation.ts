import {
  Certification,
  GalaRecord,
  GameState,
  Gender,
  InboxMessage,
  RapPortalPost,
  VoivodeshipId,
} from '../types/game';
import {
  createInitialNpcs,
  MILESTONES,
  STUDIO_TIERS,
  VOIVODESHIPS,
} from '../data/worldData';
import { createInterviewInvite, generateContextualInterview } from '../data/interviews';

export const SAVE_STORAGE_KEY = 'rap_empire_94_save_v1';

export function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatPLN(amount: number): string {
  return `${Math.round(amount).toLocaleString('pl-PL')} zł`;
}

export function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)} mln`;
  if (num >= 10_000) return `${(num / 1_000).toFixed(1)} tys.`;
  return Math.round(num).toLocaleString('pl-PL');
}

export function getCertificationForStreams(streams: number, isAlbum = false): Certification {
  const mult = isAlbum ? 2.2 : 1;
  if (streams >= 1_500_000 * mult) return 'diamond';
  if (streams >= 320_000 * mult) return 'platinum';
  if (streams >= 95_000 * mult) return 'gold';
  return 'none';
}

export function createNewGameState(params: {
  alias: string;
  gender: Gender;
  city: string;
  voivodeship: VoivodeshipId;
  portraitId: number;
  customAvatar?: string;
}): GameState {
  const regionSupport = VOIVODESHIPS.reduce((acc, v) => {
    acc[v.id] = v.id === params.voivodeship ? 12 : 0;
    return acc;
  }, {} as Record<VoivodeshipId, number>);

  const npcs = createInitialNpcs(params.portraitId, params.voivodeship);

  return {
    started: true,
    day: 1,
    player: {
      alias: params.alias.trim() || 'Młody Gracz',
      gender: params.gender,
      city: params.city,
      voivodeship: params.voivodeship,
      portraitId: params.portraitId,
      customAvatar: params.customAvatar,
      producerTag: `${params.alias.trim() || 'Młody'} on the beat`,
      activeTitle: 'Nowa Krew',
    },
    cash: 900,
    fans: 30,
    hype: 18,
    energy: 100,
    inspiration: 90,
    streetMainstream: 38, // lekko po stronie Ulicy na start
    studioTier: 0,
    dailyRent: 55,
    freestyleWins: 0,
    freestyleStreak: 0,
    tournamentsWon: 0,
    concertsPlayed: 0,
    poloniaConcertsPlayed: 0,
    regionSupport,
    npcs,
    tracks: [],
    projects: [],
    beefs: [],
    inbox: [
      {
        id: uid('msg'),
        day: 1,
        type: 'scene_event',
        title: `Witaj na polskiej scenie, ${params.alias.trim() || 'Młody Gracz'}!`,
        body: `Masz 900 zł w kieszeni, 30 znajomych słuchaczy w ${params.city} i mikrofon w pokoju. Wejdź do Studia, nagraj pierwszy numer albo sprawdź rywali na polskiej scenie.`,
        handled: true,
      },
    ],
    portalFeed: [
      {
        id: uid('post'),
        day: 1,
        category: 'Scena',
        headline: `Nowa twarz z ${params.city} wchodzi do gry`,
        body: `${params.alias.trim() || 'Młody Gracz'} zapowiada pierwsze nagrania z domowego studia. Scena w województwie uważnie obserwuje debiut.`,
        likes: 24,
      },
      {
        id: uid('post'),
        day: 1,
        category: 'Premiera',
        headline: 'Król Południa i Królowa Południa dominują zestawienia sezonu',
        body: 'Do Gali Rap Awards zostało 60 dni. Kto odbierze w tym roku statuetki za Singiel, Album i Artystę Roku?',
        likes: 1840,
      },
    ],
    crew: null,
    brand: null,
    label: null,
    galaHistory: [],
    unlockedMilestones: [],
    pendingGala: null,
    pendingInterview: null,
    lastInterviewDay: -10,
    askedInterviewIds: [],
  };
}

export function evaluateMilestones(state: GameState): GameState {
  const newlyUnlocked: string[] = [];
  for (const m of MILESTONES) {
    if (!state.unlockedMilestones.includes(m.id) && m.check(state)) {
      newlyUnlocked.push(m.id);
    }
  }
  if (newlyUnlocked.length === 0) return state;

  const updatedUnlocked = [...state.unlockedMilestones, ...newlyUnlocked];
  const latestMilestone = MILESTONES.find((m) => m.id === newlyUnlocked[newlyUnlocked.length - 1]);
  const newPosts: RapPortalPost[] = newlyUnlocked.map((id) => {
    const m = MILESTONES.find((x) => x.id === id)!;
    return {
      id: uid('post'),
      day: state.day,
      category: 'Scena',
      headline: `Kamień milowy: ${state.player.alias} zdobywa tytuł „${m.badgeTitle}”`,
      body: m.description,
      likes: Math.round(120 + state.fans * 0.06),
    };
  });

  return {
    ...state,
    unlockedMilestones: updatedUnlocked,
    player: {
      ...state.player,
      activeTitle: latestMilestone ? latestMilestone.badgeTitle : state.player.activeTitle,
    },
    portalFeed: [...newPosts, ...state.portalFeed].slice(0, 45),
    lastActionToast: latestMilestone
      ? `Odblokowano kamień milowy: ${latestMilestone.badgeTitle}!`
      : state.lastActionToast,
  };
}

export function buildGalaForSeason(state: GameState, day: number): GalaRecord {
  const season = state.galaHistory.length + 1;
  const topPlayerTrack = [...state.tracks]
    .filter((t) => t.mode !== 'vault')
    .sort((a, b) => b.streams - a.streams)[0];
  const topPlayerProject = [...state.projects].sort((a, b) => b.streams - a.streams)[0];

  const sortedNpcs = [...state.npcs].sort((a, b) => b.fans - a.fans);
  const topNpc = sortedNpcs[0];
  const secondNpc = sortedNpcs[1];

  const playerWinsSingle = Boolean(topPlayerTrack && topPlayerTrack.streams >= 75_000 + season * 35_000);
  const playerWinsAlbum = Boolean(topPlayerProject && topPlayerProject.streams >= 120_000 + season * 50_000);
  const playerWinsArtist = state.fans >= 65_000 + season * 45_000 && state.hype >= 45;

  const playerAwards: string[] = [];
  if (playerWinsSingle) playerAwards.push('Singiel Roku');
  if (playerWinsAlbum) playerAwards.push('Album Roku');
  if (playerWinsArtist) playerAwards.push('Artysta Roku');

  return {
    season,
    day,
    singleOfYear: playerWinsSingle && topPlayerTrack
      ? { title: topPlayerTrack.title, artist: state.player.alias, isPlayer: true }
      : { title: topNpc.biggestHit, artist: topNpc.alias, isPlayer: false },
    albumOfYear: playerWinsAlbum && topPlayerProject
      ? { title: topPlayerProject.title, artist: state.player.alias, isPlayer: true }
      : { title: `Kroniki ${secondNpc.city}`, artist: secondNpc.alias, isPlayer: false },
    artistOfYear: playerWinsArtist
      ? { artist: state.player.alias, isPlayer: true }
      : { artist: topNpc.alias, isPlayer: false },
    playerAwards,
  };
}

export function advanceDay(prev: GameState): GameState {
  const nextDay = prev.day + 1;
  const newPosts: RapPortalPost[] = [];
  const newInbox: InboxMessage[] = [];

  // Dynamic rent scales with fame + studio upkeep
  const studioUpkeep = STUDIO_TIERS[prev.studioTier].dailyUpkeep;
  const baseRent = Math.round(55 + Math.pow(prev.fans, 0.44) * 3.8);
  const totalDailyCost = baseRent + studioUpkeep;

  let cash = prev.cash - totalDailyCost;
  let fans = prev.fans;
  let hype = Math.max(5, prev.hype - 2);
  const energy = Math.min(100, prev.energy + 38);
  const inspiration = Math.min(100, prev.inspiration + 12);

  // Mainstream gives streaming multiplier; Street gives stronger merch & battle loyalty
  const streamBoost = 0.8 + (prev.streetMainstream / 100) * 0.7;

  // 1. Daily Streams & Gold/Platinum certifications on Tracks
  let streamingIncome = 0;
  const updatedTracks = prev.tracks.map((track) => {
    if (track.mode === 'vault') return track;
    const age = Math.max(1, nextDay - track.releaseDay);
    const decay = Math.max(0.1, 1 / Math.pow(age, 0.58));
    const dailyStreams = Math.round(
      (120 + prev.fans * 0.34 + prev.hype * 22) * (track.quality / 65) * decay * streamBoost
    );
    const totalStreams = track.streams + dailyStreams;
    streamingIncome += dailyStreams * 0.011;

    const newCert = getCertificationForStreams(totalStreams, false);
    if (newCert !== track.cert && newCert !== 'none') {
      const label =
        newCert === 'diamond' ? 'DIAMENTOWĄ PŁYTĘ' : newCert === 'platinum' ? 'PLATYNOWĄ PŁYTĘ' : 'ZŁOTĄ PŁYTĘ';
      newPosts.push({
        id: uid('post'),
        day: nextDay,
        category: 'Premiera',
        headline: `${prev.player.alias} zdobywa ${label} za „${track.title}”!`,
        body: `Numer przekroczył ${formatCompact(totalStreams)} odsłuchań i zapisuje się w historii polskiej sceny.`,
        likes: Math.round(500 + prev.fans * 0.08),
      });
      fans += newCert === 'diamond' ? 18000 : newCert === 'platinum' ? 6500 : 1800;
      hype = Math.min(100, hype + (newCert === 'platinum' ? 14 : 8));
    }

    return {
      ...track,
      streams: totalStreams,
      likes: track.likes + Math.round(dailyStreams * 0.09),
      cert: newCert,
    };
  });

  // 2. Daily Streams on EP/Albums
  const updatedProjects = prev.projects.map((proj) => {
    const age = Math.max(1, nextDay - proj.releaseDay);
    const decay = Math.max(0.14, 1 / Math.pow(age, 0.52));
    const dailyStreams = Math.round(
      (360 + prev.fans * 0.58 + prev.hype * 35) * decay * streamBoost
    );
    const totalStreams = proj.streams + dailyStreams;
    const dailySales = Math.round(dailyStreams * 0.008);
    streamingIncome += dailyStreams * 0.013 + dailySales * 16;

    const newCert = getCertificationForStreams(totalStreams, true);
    if (newCert !== proj.cert && newCert !== 'none') {
      const label =
        newCert === 'diamond' ? 'DIAMENTOWY ALBUM' : newCert === 'platinum' ? 'PLATYNOWY ALBUM' : 'ZŁOTY ALBUM';
      newPosts.push({
        id: uid('post'),
        day: nextDay,
        category: 'Premiera',
        headline: `Certyfikat! „${proj.title}” pokrywa się statusem: ${label}`,
        body: `Krążek ${prev.player.alias} bije kolejne rekordy w całej Polsce.`,
        likes: Math.round(900 + prev.fans * 0.1),
      });
      fans += newCert === 'platinum' ? 12000 : 3500;
      hype = Math.min(100, hype + 12);
    }

    return {
      ...proj,
      streams: totalStreams,
      sales: proj.sales + dailySales,
      cert: newCert,
    };
  });

  cash += Math.round(streamingIncome);
  fans += Math.round(streamingIncome * 0.18);

  // 3. Clothing Brand daily drops
  let updatedBrand = prev.brand;
  if (updatedBrand) {
    const streetLoyalty = updatedBrand.style === 'streetwear' ? 1 + (100 - prev.streetMainstream) / 140 : 1.05;
    const drops = updatedBrand.drops.map((drop) => {
      if (!drop.active || drop.soldOut) return drop;
      const remaining = drop.totalUnits - drop.soldUnits;
      const demand = Math.max(
        4,
        Math.round((8 + prev.fans * 0.0045 + prev.hype * 0.9) * streetLoyalty * (0.75 + Math.random() * 0.5))
      );
      const soldToday = Math.min(remaining, demand);
      const newSold = drop.soldUnits + soldToday;
      cash += soldToday * drop.unitPrice;

      const hitSoldOut = newSold >= drop.totalUnits;
      if (hitSoldOut) {
        hype = Math.min(100, hype + 10);
        fans += Math.round(450 + drop.totalUnits * 0.8);
        newPosts.push({
          id: uid('post'),
          day: nextDay,
          category: 'Biznes',
          headline: `Błyskawiczny SOLD OUT! Drop „${drop.name}” marki ${updatedBrand!.name} zniknął ze sklepu`,
          body: `Wszystkie ${drop.totalUnits} sztuk wyprzedane. Na grupach streetwearowych ceny z drugiej ręki szybują w górę.`,
          likes: Math.round(350 + prev.fans * 0.05),
        });
      }

      return {
        ...drop,
        soldUnits: newSold,
        soldOut: hitSoldOut,
        active: !hitSoldOut && nextDay - drop.startDay < 14,
      };
    });
    updatedBrand = { ...updatedBrand, drops };
  }

  // 4. Record Label daily royalties
  let updatedLabel = prev.label;
  if (updatedLabel && updatedLabel.artists.length > 0) {
    let labelIncomeToday = 0;
    const updatedArtists = updatedLabel.artists.map((a) => {
      const growth = Math.round((40 + a.potential * 2.5) * (0.8 + Math.random() * 0.4));
      const royalty = Math.round((a.fans * 0.025 + a.potential * 4) * (a.morale / 80));
      labelIncomeToday += royalty;
      return {
        ...a,
        fans: a.fans + growth,
        dailyRoyalty: royalty,
      };
    });
    cash += labelIncomeToday;
    updatedLabel = {
      ...updatedLabel,
      artists: updatedArtists,
      totalEarnings: updatedLabel.totalEarnings + labelIncomeToday,
    };
  }

  // 5. Beefs: 2-day NPC diss response & 4-day RapPortal voting resolution
  let beefJustResponded = false;
  const updatedBeefs = prev.beefs.map((beef) => {
    if (beef.resolved) return beef;
    const opp = prev.npcs.find((n) => n.id === beef.opponentId);
    let responded = beef.responded;
    let opponentDissTitle = beef.opponentDissTitle;
    let opponentDissBar = beef.opponentDissBar;
    let playerVotes = beef.playerVotes;
    let opponentVotes = beef.opponentVotes;

    if (!responded && nextDay >= beef.responseDay) {
      responded = true;
      beefJustResponded = true;
      opponentDissTitle = `Odpowiedź dla ${prev.player.alias} (Diss)`;
      opponentDissBar =
        opp?.dissLines[0] || 'Myślałeś, że ten zaczepny numer przejdzie bez echa? Sprawdź werdykt słuchaczy.';
      newInbox.push({
        id: uid('msg'),
        day: nextDay,
        type: 'diss_reply',
        fromNpcId: beef.opponentId,
        beefId: beef.id,
        title: `${opp?.alias || 'Rywal'} odpowiada dissem!`,
        body: `„${opponentDissBar}” — na RapPortalu właśnie ruszyło 4-dniowe głosowanie słuchaczy, kto wygrał ten beef!`,
        handled: true,
      });
      newPosts.push({
        id: uid('post'),
        day: nextDay,
        category: 'Beef',
        headline: `WOJNA! ${opp?.alias} odpowiada na diss ${prev.player.alias}`,
        body: `Rusza 4-dniowe głosowanie na RapPortalu. Kto kogo zjadł na bicie?`,
        likes: Math.round(800 + prev.fans * 0.09),
      });
    }

    if (responded) {
      // Daily audience voting
      const streetEdge = (100 - prev.streetMainstream) * 0.4;
      const pGain = Math.round(80 + prev.fans * 0.015 + prev.hype * 2.8 + streetEdge + Math.random() * 140);
      const oGain = Math.round(70 + (opp?.fans || 40000) * 0.0022 + Math.random() * 165);
      playerVotes += pGain;
      opponentVotes += oGain;
    }

    if (responded && nextDay >= beef.votingEndDay) {
      const winner: 'player' | 'opponent' = playerVotes >= opponentVotes ? 'player' : 'opponent';
      if (winner === 'player') {
        fans += Math.round(1400 + (opp?.fans || 20000) * 0.045);
        hype = Math.min(100, hype + 18);
        newPosts.push({
          id: uid('post'),
          day: nextDay,
          category: 'Beef',
          headline: `WERDYKT BEEFU: ${prev.player.alias} wygrywa głosowanie z ${opp?.alias}!`,
          body: `Słuchacze nie mieli wątpliwości (${playerVotes.toLocaleString('pl-PL')} vs ${opponentVotes.toLocaleString('pl-PL')} głosów). Szacunek sceny rośnie!`,
          likes: Math.round(1400 + prev.fans * 0.1),
        });
      } else {
        hype = Math.max(8, hype - 10);
        fans += 220;
        newPosts.push({
          id: uid('post'),
          day: nextDay,
          category: 'Beef',
          headline: `WERDYKT BEEFU: ${opp?.alias} górą w starciu z ${prev.player.alias}`,
          body: `Głosowanie zakończone (${opponentVotes.toLocaleString('pl-PL')} vs ${playerVotes.toLocaleString('pl-PL')}). Czas wrócić do studia z jeszcze mocniejszym materiałem.`,
          likes: Math.round(950 + prev.fans * 0.05),
        });
      }
      return {
        ...beef,
        responded,
        opponentDissTitle,
        opponentDissBar,
        playerVotes,
        opponentVotes,
        resolved: true,
        winner,
      };
    }

    return {
      ...beef,
      responded,
      opponentDissTitle,
      opponentDissBar,
      playerVotes,
      opponentVotes,
    };
  });

  // 6. Industry Offers & Random Living Scene Events (every 3 days)
  if (nextDay % 3 === 0 && prev.inbox.filter((m) => !m.handled).length < 4) {
    const roll = Math.random();
    const friendlyOrNeutral = prev.npcs.filter((n) => n.relation >= -10);
    const chosen = friendlyOrNeutral[Math.floor(Math.random() * friendlyOrNeutral.length)] || prev.npcs[0];

    if (roll < 0.36) {
      // Beat commission [Prod. Ty]
      const pay = Math.round(950 + prev.studioTier * 1100 + prev.hype * 22);
      newInbox.push({
        id: uid('msg'),
        day: nextDay,
        type: 'beat_commission',
        fromNpcId: chosen.id,
        title: `Zlecenie na bit od ${chosen.alias} [Prod. ${prev.player.alias}]`,
        body: `${chosen.alias} (${chosen.city}) szuka mocnego podkładu na swój oficjalny singiel. Zapłaci ${formatPLN(pay)}, a numer trafi na ogólnopolskie listy z Twoim podpisem [Prod. ${prev.player.alias}].`,
        rewardCash: pay,
        rewardFans: Math.round(350 + chosen.fans * 0.008),
        rewardHype: 9,
        handled: false,
      });
    } else if (roll < 0.68) {
      // Support gig offer
      const pay = Math.round(650 + prev.fans * 0.04 + chosen.fans * 0.004);
      newInbox.push({
        id: uid('msg'),
        day: nextDay,
        type: 'support',
        fromNpcId: chosen.id,
        title: `Propozycja supportu przed ${chosen.alias} w ${chosen.city}`,
        body: `${chosen.alias} zaprasza Cię na rozgrzewkę przed swoim koncertem w ${chosen.city}. Gwarantowana wypłata ${formatPLN(pay)} i nowi słuchacze na żywo.`,
        rewardCash: pay,
        rewardFans: Math.round(280 + chosen.fans * 0.006),
        rewardHype: 7,
        handled: false,
      });
    } else {
      // Guest verse offer
      const pay = Math.round(800 + prev.hype * 28);
      newInbox.push({
        id: uid('msg'),
        day: nextDay,
        type: 'feat_offer',
        fromNpcId: chosen.id,
        title: `Zaproszenie na gościnną zwrotkę od ${chosen.alias}`,
        body: `${chosen.alias} kończy nowy singiel i chce Twoją szesnastkę na feacie. Oferuje ${formatPLN(pay)} i wspólną promocję.`,
        rewardCash: pay,
        rewardFans: Math.round(400 + chosen.fans * 0.009),
        rewardHype: 8,
        handled: false,
      });
    }
  }

  // Autonomous NPC chatter on RapPortal every 4 days
  if (nextDay % 4 === 0) {
    const a = prev.npcs[Math.floor(Math.random() * prev.npcs.length)];
    const b = prev.npcs[(prev.npcs.indexOf(a) + 3) % prev.npcs.length];
    newPosts.push({
      id: uid('post'),
      day: nextDay,
      category: 'Scena',
      headline: `${a.alias} (${a.city}) zapowiada wspólny projekt z ${b.alias}`,
      body: `Słuchacze spekulują, czy ten duet zgarnie statuetkę na nadchodzącej Gali Rap Awards.`,
      likes: Math.round(450 + a.fans * 0.01),
    });
  }

  // 7. Every 60 days: Gala Rap Awards!
  let pendingGala = prev.pendingGala;
  let galaHistory = prev.galaHistory;
  if (nextDay % 60 === 0) {
    const gala = buildGalaForSeason(
      { ...prev, day: nextDay, fans, hype, tracks: updatedTracks, projects: updatedProjects },
      nextDay
    );
    pendingGala = gala;
    galaHistory = [gala, ...prev.galaHistory];
    if (gala.playerAwards.length > 0) {
      cash += gala.playerAwards.length * 12000;
      fans += gala.playerAwards.length * 15000;
      hype = Math.min(100, hype + 22);
    }
    newPosts.push({
      id: uid('post'),
      day: nextDay,
      category: 'Gala',
      headline: `GALA RAP AWARDS — SEZON ${gala.season}: Artystą Roku zostaje ${gala.artistOfYear.artist}!`,
      body: `Singiel Roku: „${gala.singleOfYear.title}” (${gala.singleOfYear.artist}) · Album Roku: „${gala.albumOfYear.title}” (${gala.albumOfYear.artist}).`,
      likes: 6400,
    });
  }

  // 8. Organic Media Interview Invitations (spaced out by cooldown, never stacked)
  const hasPendingInterviewInvite =
    prev.inbox.some((m) => !m.handled && m.type === 'interview') ||
    newInbox.some((m) => !m.handled && m.type === 'interview');
  const daysSinceInterview = nextDay - (prev.lastInterviewDay ?? -10);

  if (!hasPendingInterviewInvite) {
    const draftForInvite: GameState = {
      ...prev,
      day: nextDay,
      beefs: updatedBeefs,
      tracks: updatedTracks,
      projects: updatedProjects,
      galaHistory,
    };

    if (nextDay % 60 === 0) {
      newInbox.push(createInterviewInvite(draftForInvite, nextDay, 'gala'));
    } else if (beefJustResponded && daysSinceInterview >= 4) {
      newInbox.push(createInterviewInvite(draftForInvite, nextDay, 'beef'));
    } else if (
      nextDay >= 4 &&
      daysSinceInterview >= 7 &&
      (daysSinceInterview >= 11 || Math.random() < 0.35)
    ) {
      const hasActiveBeef = updatedBeefs.some((b) => !b.resolved);
      newInbox.push(createInterviewInvite(draftForInvite, nextDay, hasActiveBeef ? 'beef' : 'periodic'));
    }
  }

  const nextState: GameState = {
    ...prev,
    day: nextDay,
    cash: Math.round(cash),
    fans: Math.max(30, Math.round(fans)),
    hype: Math.max(0, Math.min(100, Math.round(hype))),
    energy,
    inspiration,
    dailyRent: totalDailyCost,
    tracks: updatedTracks,
    projects: updatedProjects,
    beefs: updatedBeefs,
    brand: updatedBrand,
    label: updatedLabel,
    inbox: [...newInbox, ...prev.inbox].slice(0, 25),
    portalFeed: [...newPosts, ...prev.portalFeed].slice(0, 45),
    galaHistory,
    pendingGala,
    lastActionToast:
      streamingIncome > 50
        ? `Dzień ${nextDay} · Czynsz i koszty: -${formatPLN(totalDailyCost)} · Streaming: +${formatPLN(streamingIncome)}`
        : `Dzień ${nextDay} · Czynsz i utrzymanie: -${formatPLN(totalDailyCost)}`,
  };

  return evaluateMilestones(nextState);
}

export function startInterviewNow(state: GameState, preferredOutlet?: string): GameState {
  const questions = generateContextualInterview(state, preferredOutlet);
  const existing = state.askedInterviewIds || [];
  const merged = [...existing, ...questions.map((q) => q.id)];
  // Keep sliding window of last 42 question IDs so player experiences huge variety without back-to-back repeats
  const askedInterviewIds = merged.slice(-42);

  return {
    ...state,
    pendingInterview: questions,
    lastInterviewDay: state.day,
    askedInterviewIds,
  };
}
