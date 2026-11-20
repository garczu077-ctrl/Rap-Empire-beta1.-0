export type Gender = 'male' | 'female';

export type VoivodeshipId =
  | 'pomorskie'
  | 'zachodniopomorskie'
  | 'warminsko-mazurskie'
  | 'podlaskie'
  | 'kujawsko-pomorskie'
  | 'wielkopolskie'
  | 'lubuskie'
  | 'mazowieckie'
  | 'lodzkie'
  | 'lubelskie'
  | 'dolnoslaskie'
  | 'opolskie'
  | 'slaskie'
  | 'swietokrzyskie'
  | 'malopolskie'
  | 'podkarpackie';

export type VenueScopeId = VoivodeshipId | 'londyn' | 'chicago';

export type BeatStyle = '808_trap' | 'mpc_boombap' | 'uk_drill' | 'dark_synth';

export type CoverFilter = 'none' | 'noir' | 'vintage' | 'neon' | 'gold';

export type CoverMotif = 'vinyl' | 'crown' | 'city' | 'mic' | 'wave';

export type CoverTextStyle = 'bottom' | 'center' | 'editorial' | 'gold';

export type Certification = 'none' | 'gold' | 'platinum' | 'diamond';

export type StudioTier = 0 | 1 | 2; // 0: Domowe Zacisze, 1: Podziemna Kanciapa, 2: Studio PRO

export type BrandStyle = 'streetwear' | 'luxury' | 'vinyl_merch';

export type NavTab = 'home' | 'studio' | 'scene' | 'map' | 'arena' | 'empire' | 'profile';

export interface PortraitDef {
  id: number;
  gender: Gender;
  label: string;
  imageUrl: string;
  accent: string;
}

export interface CoverArtDef {
  id: number;
  label: string;
  imageUrl: string;
  accent: string;
}

export interface VoivodeshipDef {
  id: VoivodeshipId;
  name: string;
  cities: string[];
  path: string;
  labelX: number;
  labelY: number;
  baseAudience: number;
}

export interface NpcRapper {
  id: string;
  alias: string;
  gender: Gender;
  portraitId: number;
  city: string;
  voivodeship: VoivodeshipId;
  style: 'Ulica' | 'Mainstream' | 'Trap' | 'Oldschool' | 'Drill';
  tier: 'Podziemie' | 'Średnia Liga' | 'Gwiazda' | 'Legenda';
  goldCerts: number;
  platinumCerts: number;
  biggestHit: string;
  relation: number; // -100 to 100
  fans: number;
  featCost: number;
  bio: string;
  freestyleJabs: string[];
  dissLines: string[];
}

export interface BeatConfig {
  style: BeatStyle;
  bpm: number;
  steps: {
    kick: boolean[];
    snare: boolean[];
    hat: boolean[];
    chord: boolean[];
  };
}

export interface ProducerBeatDef {
  id: string;
  title: string;
  producer: string;
  producerTag: string;
  city: string;
  tier: 'Podziemie' | 'Średnia Liga' | 'Top Sceny' | 'Legenda';
  style: BeatStyle;
  bpm: number;
  price: number;
  qualityBonus: number;
  hypeBonus: number;
  vibe: string;
  steps: BeatConfig['steps'];
}

export interface CoverConfig {
  artworkId?: number;
  textStyle?: CoverTextStyle;
  bgPrimary: string;
  bgSecondary: string;
  accent: string;
  filter: CoverFilter;
  motif: CoverMotif;
  parentalAdvisory: boolean;
  customImage?: string;
}

export interface Track {
  id: string;
  title: string;
  mode: 'single' | 'vault' | 'diss' | 'prod_commission';
  beatStyle: BeatStyle;
  bpm: number;
  producerTag: string;
  beatProducer?: string;
  beatCost?: number;
  cover: CoverConfig;
  lyrics: string;
  lyricScore: number;
  quality: number;
  featNpcId?: string;
  dissTargetId?: string;
  commissionForNpcId?: string;
  streams: number;
  likes: number;
  releaseDay: number;
  cert: Certification;
  projectId?: string;
}

export interface ReleaseProject {
  id: string;
  title: string;
  format: 'EP' | 'Album' | 'CrewMixtape' | 'LabelComp';
  trackIds: string[];
  cover: CoverConfig;
  streams: number;
  sales: number;
  releaseDay: number;
  cert: Certification;
}

export interface Beef {
  id: string;
  opponentId: string;
  startDay: number;
  responseDay: number;
  responded: boolean;
  votingEndDay: number;
  playerVotes: number;
  opponentVotes: number;
  resolved: boolean;
  winner?: 'player' | 'opponent';
  playerDissTitle: string;
  opponentDissTitle?: string;
  opponentDissBar?: string;
}

export interface InboxMessage {
  id: string;
  day: number;
  type: 'support' | 'feat_offer' | 'beat_commission' | 'diss_reply' | 'interview' | 'crew_invite' | 'scene_event';
  fromNpcId?: string;
  title: string;
  body: string;
  rewardCash?: number;
  rewardFans?: number;
  rewardHype?: number;
  handled: boolean;
  accepted?: boolean;
  beefId?: string;
  interviewOutlet?: string;
}

export interface ClothingDrop {
  id: string;
  name: string;
  totalUnits: number;
  soldUnits: number;
  unitPrice: number;
  productionCost: number;
  startDay: number;
  active: boolean;
  soldOut: boolean;
}

export interface ClothingBrand {
  name: string;
  style: BrandStyle;
  reputation: number;
  drops: ClothingDrop[];
}

export interface SignedArtist {
  id: string;
  alias: string;
  gender: Gender;
  portraitId: number;
  city: string;
  voivodeship: VoivodeshipId;
  potential: number;
  fans: number;
  dailyRoyalty: number;
  releases: number;
  morale: number;
}

export interface RecordLabel {
  name: string;
  foundedDay: number;
  artists: SignedArtist[];
  compilations: number;
  totalEarnings: number;
}

export interface Crew {
  name: string;
  foundedDay: number;
  memberIds: string[];
  mixtapes: number;
  groupTours: number;
}

export interface RapPortalPost {
  id: string;
  day: number;
  category: 'Premiera' | 'Beef' | 'Koncert' | 'Biznes' | 'Wywiad' | 'Scena' | 'Gala';
  headline: string;
  body: string;
  likes: number;
}

export interface GalaRecord {
  season: number;
  day: number;
  singleOfYear: { title: string; artist: string; isPlayer: boolean };
  albumOfYear: { title: string; artist: string; isPlayer: boolean };
  artistOfYear: { artist: string; isPlayer: boolean };
  playerAwards: string[];
}

export interface InterviewQuestion {
  id: string;
  prompt: string;
  topicTag: string;
  outlet?: string;
  host?: string;
  options: {
    label: string;
    streetDelta: number; // negative = more Ulica, positive = more Mainstream
    hypeDelta: number;
    fansDelta: number;
    cashDelta: number;
    reaction: string;
  }[];
}

export interface MilestoneDef {
  id: string;
  title: string;
  badgeTitle: string;
  description: string;
  check: (state: GameState) => boolean;
}

export interface PlayerProfile {
  alias: string;
  gender: Gender;
  city: string;
  voivodeship: VoivodeshipId;
  portraitId: number;
  customAvatar?: string;
  producerTag: string;
  activeTitle: string;
}

export interface GameState {
  started: boolean;
  day: number;
  player: PlayerProfile;
  cash: number;
  fans: number;
  hype: number; // 0 - 100
  energy: number; // 0 - 100
  inspiration: number; // Wena twórcza 0 - 100
  streetMainstream: number; // 0 = 100% Ulica, 50 = Balans, 100 = 100% Mainstream
  studioTier: StudioTier;
  dailyRent: number;
  freestyleWins: number;
  freestyleStreak: number;
  tournamentsWon: number;
  concertsPlayed: number;
  poloniaConcertsPlayed: number;
  regionSupport: Record<VoivodeshipId, number>; // 0 - 100
  npcs: NpcRapper[];
  tracks: Track[];
  projects: ReleaseProject[];
  beefs: Beef[];
  inbox: InboxMessage[];
  portalFeed: RapPortalPost[];
  crew: Crew | null;
  brand: ClothingBrand | null;
  label: RecordLabel | null;
  galaHistory: GalaRecord[];
  unlockedMilestones: string[];
  pendingGala: GalaRecord | null;
  pendingInterview: InterviewQuestion[] | null;
  lastInterviewDay?: number;
  askedInterviewIds?: string[];
  lastWarehouseDay?: number;
  lastResetDay?: number;
  lastCypherDay?: number;
  lastCommercialAdDay?: number;
  lastActionToast?: string;
}
