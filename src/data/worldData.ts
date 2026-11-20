import {
  BeatConfig,
  BeatStyle,
  CoverArtDef,
  GameState,
  MilestoneDef,
  NpcRapper,
  PortraitDef,
  ProducerBeatDef,
  VoivodeshipDef,
  VoivodeshipId,
} from '../types/game';

export const ASSET_URLS = {
  splash: '/assets/aistudio/tytul_7f328c67.png',
  emblem: '/src/assets/images/rap_empire_emblem_1795105432966.jpg',
  arena: '/src/assets/images/rap_arena_stage_1795105433029.jpg',
  gala: '/src/assets/images/rap_gala_awards_1795105431942.jpg',
};

// 16 Polish Voivodeships laid out in accurate geographic silhouette of Poland (viewBox 0 0 420 380)
export const VOIVODESHIPS: VoivodeshipDef[] = [
  {
    id: 'zachodniopomorskie',
    name: 'Zachodniopomorskie',
    cities: ['Szczecin', 'Koszalin', 'Świnoujście', 'Stargard', 'Kołobrzeg', 'Szczecinek'],
    path: 'M 22,52 L 106,36 L 122,74 L 94,112 L 32,108 L 18,78 Z',
    labelX: 66,
    labelY: 78,
    baseAudience: 1150,
  },
  {
    id: 'pomorskie',
    name: 'Pomorskie',
    cities: ['Gdańsk', 'Gdynia', 'Sopot', 'Słupsk', 'Tczew', 'Wejherowo', 'Rumia'],
    path: 'M 106,36 L 188,26 L 214,60 L 182,92 L 122,74 Z',
    labelX: 162,
    labelY: 58,
    baseAudience: 1650,
  },
  {
    id: 'warminsko-mazurskie',
    name: 'Warmińsko-Mazurskie',
    cities: ['Olsztyn', 'Elbląg', 'Ełk', 'Iława', 'Ostróda', 'Giżycko'],
    path: 'M 214,60 L 298,42 L 330,78 L 298,108 L 222,102 L 182,92 Z',
    labelX: 258,
    labelY: 78,
    baseAudience: 950,
  },
  {
    id: 'podlaskie',
    name: 'Podlaskie',
    cities: ['Białystok', 'Łomża', 'Suwałki', 'Augustów', 'Bielsk Podlaski', 'Zambrów'],
    path: 'M 330,78 L 382,70 L 396,138 L 352,162 L 316,134 L 298,108 Z',
    labelX: 356,
    labelY: 116,
    baseAudience: 1050,
  },
  {
    id: 'lubuskie',
    name: 'Lubuskie',
    cities: ['Zielona Góra', 'Gorzów Wlkp.', 'Żary', 'Nowa Sól', 'Żagań', 'Świebodzin'],
    path: 'M 32,108 L 94,112 L 98,176 L 60,204 L 28,172 Z',
    labelX: 64,
    labelY: 154,
    baseAudience: 850,
  },
  {
    id: 'wielkopolskie',
    name: 'Wielkopolskie',
    cities: ['Poznań', 'Kalisz', 'Konin', 'Leszno', 'Piła', 'Ostrów Wlkp.', 'Gniezno'],
    path: 'M 94,112 L 154,112 L 176,158 L 166,214 L 112,216 L 98,176 Z',
    labelX: 134,
    labelY: 168,
    baseAudience: 1850,
  },
  {
    id: 'kujawsko-pomorskie',
    name: 'Kujawsko-Pomorskie',
    cities: ['Bydgoszcz', 'Toruń', 'Włocławek', 'Grudziądz', 'Inowrocław', 'Brodnica'],
    path: 'M 122,74 L 182,92 L 222,102 L 214,146 L 176,158 L 154,112 Z',
    labelX: 180,
    labelY: 120,
    baseAudience: 1200,
  },
  {
    id: 'mazowieckie',
    name: 'Mazowieckie',
    cities: ['Warszawa', 'Radom', 'Płock', 'Siedlce', 'Pruszków', 'Ostrołęka', 'Ciechanów'],
    path: 'M 222,102 L 298,108 L 316,134 L 352,162 L 330,220 L 254,224 L 236,184 L 214,146 Z',
    labelX: 282,
    labelY: 164,
    baseAudience: 2900,
  },
  {
    id: 'lodzkie',
    name: 'Łódzkie',
    cities: ['Łódź', 'Piotrków Tryb.', 'Bełchatów', 'Pabianice', 'Tomaszów Maz.', 'Zgierz'],
    path: 'M 176,158 L 214,146 L 236,184 L 254,224 L 212,248 L 166,214 Z',
    labelX: 206,
    labelY: 202,
    baseAudience: 1600,
  },
  {
    id: 'lubelskie',
    name: 'Lubelskie',
    cities: ['Lublin', 'Zamość', 'Chełm', 'Biała Podlaska', 'Puławy', 'Świdnik'],
    path: 'M 352,162 L 396,174 L 404,252 L 348,274 L 320,248 L 330,220 Z',
    labelX: 364,
    labelY: 222,
    baseAudience: 1300,
  },
  {
    id: 'dolnoslaskie',
    name: 'Dolnośląskie',
    cities: ['Wrocław', 'Wałbrzych', 'Legnica', 'Jelenia Góra', 'Lubin', 'Głogów', 'Świdnica'],
    path: 'M 60,204 L 98,176 L 112,216 L 154,244 L 138,284 L 74,274 L 48,236 Z',
    labelX: 104,
    labelY: 244,
    baseAudience: 1950,
  },
  {
    id: 'opolskie',
    name: 'Opolskie',
    cities: ['Opole', 'Prudnik', 'Nysa', 'Kędzierzyn-Koźle', 'Głubczyce', 'Krapkowice', 'Ozimek'],
    path: 'M 154,244 L 186,238 L 194,284 L 164,304 L 138,284 Z',
    labelX: 168,
    labelY: 274,
    baseAudience: 1100,
  },
  {
    id: 'slaskie',
    name: 'Śląskie',
    cities: ['Katowice', 'Gliwice', 'Sosnowiec', 'Częstochowa', 'Bielsko-Biała', 'Rybnik', 'Zabrze'],
    path: 'M 186,238 L 212,248 L 234,276 L 222,330 L 186,326 L 164,304 L 194,284 Z',
    labelX: 204,
    labelY: 294,
    baseAudience: 2600,
  },
  {
    id: 'swietokrzyskie',
    name: 'Świętokrzyskie',
    cities: ['Kielce', 'Ostrowiec Św.', 'Sandomierz', 'Starachowice', 'Skarżysko-Kam.', 'Busko-Zdrój'],
    path: 'M 212,248 L 254,224 L 320,248 L 304,284 L 234,276 Z',
    labelX: 268,
    labelY: 258,
    baseAudience: 1000,
  },
  {
    id: 'malopolskie',
    name: 'Małopolskie',
    cities: ['Kraków', 'Tarnów', 'Nowy Sącz', 'Zakopane', 'Oświęcim', 'Chrzanów', 'Olkusz'],
    path: 'M 234,276 L 304,284 L 308,342 L 246,356 L 222,330 Z',
    labelX: 266,
    labelY: 318,
    baseAudience: 2300,
  },
  {
    id: 'podkarpackie',
    name: 'Podkarpackie',
    cities: ['Rzeszów', 'Przemyśl', 'Mielec', 'Krosno', 'Stalowa Wola', 'Tarnobrzeg', 'Dębica'],
    path: 'M 304,284 L 348,274 L 392,316 L 368,364 L 308,342 Z',
    labelX: 344,
    labelY: 320,
    baseAudience: 1250,
  },
];

export const VOIVODESHIP_MAP: Record<VoivodeshipId, VoivodeshipDef> = VOIVODESHIPS.reduce(
  (acc, v) => {
    acc[v.id] = v;
    return acc;
  },
  {} as Record<VoivodeshipId, VoivodeshipDef>
);

// All 47 authentic graphic-novel portraits (35 male rappers + 12 female rappers)
export const PORTRAITS: PortraitDef[] = [
  { id: 1, gender: 'female', label: 'Róża z Bloków', imageUrl: '/assets/aistudio/01_Portret_8053f1c2.png', accent: '#e2b64e' },
  { id: 2, gender: 'male', label: 'Ciemny Kaptur', imageUrl: '/assets/aistudio/02_Portret_2e56159c.png', accent: '#a1a1aa' },
  { id: 3, gender: 'male', label: 'Broda z Podziemia', imageUrl: '/assets/aistudio/03_Portret_0140230c.png', accent: '#9d6bff' },
  { id: 4, gender: 'female', label: 'Neonowa Blond', imageUrl: '/assets/aistudio/04_Portret_3dc21d12.png', accent: '#f472b6' },
  { id: 5, gender: 'male', label: 'Złoty Zmierzch', imageUrl: '/assets/aistudio/05_Portret_7d1015ca.png', accent: '#4cd4f5' },
  { id: 6, gender: 'male', label: 'Szczęśliwa 13', imageUrl: '/assets/aistudio/06_Portret_ee0ba7cb.png', accent: '#fb7185' },
  { id: 7, gender: 'female', label: 'Warkocze Zachodu', imageUrl: '/assets/aistudio/07_Portret_89c6388d.png', accent: '#f59e0b' },
  { id: 8, gender: 'male', label: 'Siatka Osiedla', imageUrl: '/assets/aistudio/08_Portret_557d8269.png', accent: '#fb923c' },
  { id: 9, gender: 'male', label: 'Weteran Betonów', imageUrl: '/assets/aistudio/09_Portret_93164baa.png', accent: '#e2b64e' },
  { id: 10, gender: 'female', label: 'Ruda Korona', imageUrl: '/assets/aistudio/10_Portret_f50f0a0a.png', accent: '#ef4444' },
  { id: 11, gender: 'male', label: 'Biały Fullcap', imageUrl: '/assets/aistudio/11_Portret_4225983e.png', accent: '#cbd5e1' },
  { id: 12, gender: 'male', label: 'Bandana i Palmy', imageUrl: '/assets/aistudio/12_Portret_0daacf6c.png', accent: '#f59e0b' },
  { id: 13, gender: 'female', label: 'Burza Loków', imageUrl: '/assets/aistudio/13_Portret_a2adcdab.png', accent: '#e2b64e' },
  { id: 14, gender: 'male', label: 'Młody z Bloków', imageUrl: '/assets/aistudio/14_Portret_64fcdee6.png', accent: '#60a5fa' },
  { id: 15, gender: 'male', label: 'Stara Szkoła', imageUrl: '/assets/aistudio/15_Portret_72467541.png', accent: '#f97316' },
  { id: 16, gender: 'female', label: 'Czarna Bandana', imageUrl: '/assets/aistudio/16_Portret_6441fee9.png', accent: '#f5d37b' },
  { id: 17, gender: 'male', label: 'Liliowy Flow', imageUrl: '/assets/aistudio/17_Portret_59131791.png', accent: '#a855f7' },
  { id: 18, gender: 'male', label: 'Czarny Diament', imageUrl: '/assets/aistudio/18_Portret_2be3e0ac.png', accent: '#c084fc' },
  { id: 19, gender: 'female', label: 'Królowa Neonów', imageUrl: '/assets/aistudio/19_Portret_4daf7f46.png', accent: '#d946ef' },
  { id: 20, gender: 'male', label: 'Książę Stolicy', imageUrl: '/assets/aistudio/20_Portret_d35b81d5.png', accent: '#c084fc' },
  { id: 21, gender: 'male', label: 'Punkowy Bunt', imageUrl: '/assets/aistudio/21_Portret_fa160f97.png', accent: '#ef4444' },
  { id: 22, gender: 'female', label: 'Złote Warkocze', imageUrl: '/assets/aistudio/22_Portret_62758b72.png', accent: '#f59e0b' },
  { id: 23, gender: 'male', label: 'Czerwony Graffiti', imageUrl: '/assets/aistudio/23_Portret_3b0731f1.png', accent: '#ef4444' },
  { id: 25, gender: 'female', label: 'Pajęczyna Nocy', imageUrl: '/assets/aistudio/25_Portret_f94fd458.png', accent: '#c084fc' },
  { id: 26, gender: 'male', label: 'Wieżowce o Zmroku', imageUrl: '/assets/aistudio/26_Portret_b960cf98.png', accent: '#4cd4f5' },
  { id: 27, gender: 'male', label: 'Nocne Tokio', imageUrl: '/assets/aistudio/27_Portret_aaaacaca.png', accent: '#ec4899' },
  { id: 28, gender: 'female', label: 'Złote Koraliki', imageUrl: '/assets/aistudio/28_Portret_355ca23b.png', accent: '#e2b64e' },
  { id: 29, gender: 'male', label: 'Diamentowy Grillz', imageUrl: '/assets/aistudio/29_Portret_290a7683.png', accent: '#ef4444' },
  { id: 30, gender: 'male', label: 'Poeta Wieży', imageUrl: '/assets/aistudio/30_Portret_f3630659.png', accent: '#e2b64e' },
  { id: 31, gender: 'female', label: 'Stalowa Sznyt', imageUrl: '/assets/aistudio/31_Portret_ba9b8baa.png', accent: '#94a3b8' },
  { id: 32, gender: 'male', label: 'Okulary Nocy', imageUrl: '/assets/aistudio/32_Portret_b91df05b.png', accent: '#60a5fa' },
  { id: 33, gender: 'male', label: 'Kominiarka X', imageUrl: '/assets/aistudio/33_Portret_6f0fb339.png', accent: '#e2e8f0' },
  { id: 34, gender: 'female', label: 'Złote Aviatory', imageUrl: '/assets/aistudio/34_Portret_b7a51b3d.png', accent: '#f5d37b' },
  { id: 35, gender: 'male', label: 'Kapelusz Bucket', imageUrl: '/assets/aistudio/35_Portret_d7b4c82f.png', accent: '#94a3b8' },
  { id: 36, gender: 'male', label: 'Wilk z Lasu', imageUrl: '/assets/aistudio/36_Portret_66630b63.png', accent: '#34d399' },
  { id: 37, gender: 'male', label: 'Ciężki Beton', imageUrl: '/assets/aistudio/37_Portret_8008ea26.png', accent: '#94a3b8' },
  { id: 38, gender: 'male', label: 'Różowy Dym', imageUrl: '/assets/aistudio/38_Portret_805059c8.png', accent: '#e879f9' },
  { id: 39, gender: 'male', label: 'Złoty Łańcuch', imageUrl: '/assets/aistudio/39_Portret_238d9524.png', accent: '#f59e0b' },
  { id: 40, gender: 'male', label: 'Mistrz Sampli', imageUrl: '/assets/aistudio/40_Portret_54470d6a.png', accent: '#a78bfa' },
  { id: 41, gender: 'male', label: 'Irokez Podziemia', imageUrl: '/assets/aistudio/41_Portret_086c6164.png', accent: '#f43f5e' },
  { id: 42, gender: 'male', label: 'Mosty Weterana', imageUrl: '/assets/aistudio/42_Portret_176d8c40.png', accent: '#f97316' },
  { id: 43, gender: 'male', label: 'Rasta Dready', imageUrl: '/assets/aistudio/43_Portret_4dcce1e1.png', accent: '#22c55e' },
  { id: 44, gender: 'male', label: 'Złoty Dres', imageUrl: '/assets/aistudio/44_Portret_808a372e.png', accent: '#e2b64e' },
  { id: 45, gender: 'male', label: 'Futro i Bas', imageUrl: '/assets/aistudio/45_Portret_e530c858.png', accent: '#e2b64e' },
  { id: 46, gender: 'male', label: 'Nocna Panorama', imageUrl: '/assets/aistudio/46_Portret_f10130b6.png', accent: '#a855f7' },
  { id: 47, gender: 'male', label: 'Czaszka Drill', imageUrl: '/assets/aistudio/47_Portret_7a6b0bce.png', accent: '#cbd5e1' },
  { id: 48, gender: 'male', label: 'Czerwona Korona', imageUrl: '/assets/aistudio/48_Portret_aeaa13a1.png', accent: '#ef4444' },
];

// All 30 authentic comic-book hip-hop cover artworks for singles, EPs and albums
export const COVER_ARTWORKS: CoverArtDef[] = [
  { id: 1, label: 'Klatka i Dym', imageUrl: '/assets/aistudio/cover_01_7c5fc701.jpg', accent: '#e2b64e' },
  { id: 2, label: 'Dym w Kapturze', imageUrl: '/assets/aistudio/cover_02_3a50360d.jpg', accent: '#60a5fa' },
  { id: 3, label: 'Nocny Lot', imageUrl: '/assets/aistudio/cover_03_17b524f2.jpg', accent: '#f59e0b' },
  { id: 4, label: 'Kominiarka', imageUrl: '/assets/aistudio/cover_04_e45c1ea7.jpg', accent: '#cbd5e1' },
  { id: 5, label: 'Złota Korona', imageUrl: '/assets/aistudio/cover_05_b0adc371.jpg', accent: '#e2b64e' },
  { id: 6, label: 'Igła na Winylu', imageUrl: '/assets/aistudio/cover_06_a71197e1.jpg', accent: '#f59e0b' },
  { id: 7, label: 'Cegła i Tynk', imageUrl: '/assets/aistudio/cover_07_b867fcff.jpg', accent: '#ef4444' },
  { id: 8, label: 'G.O.A.T. Laur', imageUrl: '/assets/aistudio/cover_08_aa2a881c.jpg', accent: '#e2b64e' },
  { id: 9, label: 'Autostrada Słońca', imageUrl: '/assets/aistudio/cover_09_3240dcb0.jpg', accent: '#fb923c' },
  { id: 10, label: 'Złoty Most', imageUrl: '/assets/aistudio/cover_10_2f5895e1.jpg', accent: '#f59e0b' },
  { id: 11, label: 'Boisko o Zachodzie', imageUrl: '/assets/aistudio/cover_11_0ce296ac.jpg', accent: '#fb923c' },
  { id: 12, label: 'Lowrider West', imageUrl: '/assets/aistudio/cover_12_da194bbb.jpg', accent: '#f59e0b' },
  { id: 13, label: 'Panorama Nocy', imageUrl: '/assets/aistudio/cover_13_cb3822fe.jpg', accent: '#f59e0b' },
  { id: 14, label: 'Mikrofon w Kabinie', imageUrl: '/assets/aistudio/cover_14_af1fe5b6.jpg', accent: '#e2b64e' },
  { id: 15, label: 'Tatuowane Dłonie', imageUrl: '/assets/aistudio/cover_15_c954da1f.jpg', accent: '#e2b64e' },
  { id: 16, label: 'Blokowisko Zmierzch', imageUrl: '/assets/aistudio/cover_16_56147070.jpg', accent: '#60a5fa' },
  { id: 17, label: 'Burza nad Miastem', imageUrl: '/assets/aistudio/cover_17_57836151.jpg', accent: '#4cd4f5' },
  { id: 18, label: 'Szach-Mat Król', imageUrl: '/assets/aistudio/cover_18_d00d315c.jpg', accent: '#e2b64e' },
  { id: 19, label: 'Pies z Łańcuchem', imageUrl: '/assets/aistudio/cover_19_4971af4b.jpg', accent: '#94a3b8' },
  { id: 20, label: 'Klepsydra Czasu', imageUrl: '/assets/aistudio/cover_20_e221750e.jpg', accent: '#e2b64e' },
  { id: 21, label: 'Czerwony Zacisk', imageUrl: '/assets/aistudio/cover_21_76f6a183.jpg', accent: '#ef4444' },
  { id: 22, label: 'Słuchawki i Winyle', imageUrl: '/assets/aistudio/cover_22_96cf5ad8.jpg', accent: '#f59e0b' },
  { id: 23, label: 'Ponad Chmurami', imageUrl: '/assets/aistudio/cover_23_c363895e.jpg', accent: '#fb923c' },
  { id: 24, label: 'Nocne Metro', imageUrl: '/assets/aistudio/cover_24_ebe92841.jpg', accent: '#f59e0b' },
  { id: 25, label: 'Anioł z Kamienia', imageUrl: '/assets/aistudio/cover_25_84593e6f.jpg', accent: '#cbd5e1' },
  { id: 26, label: 'Notatnik Tekściarza', imageUrl: '/assets/aistudio/cover_26_3ccb7922.jpg', accent: '#e2b64e' },
  { id: 27, label: 'Na Krawędzi Dachu', imageUrl: '/assets/aistudio/cover_27_21ed02f0.jpg', accent: '#60a5fa' },
  { id: 28, label: 'Płonąca Róża', imageUrl: '/assets/aistudio/cover_28_e5b3c618.jpg', accent: '#fb7185' },
  { id: 29, label: 'Za Siatką Świateł', imageUrl: '/assets/aistudio/cover_29_653770fb.jpg', accent: '#9d6bff' },
  { id: 30, label: 'Klasyczny Boombox', imageUrl: '/assets/aistudio/cover_30_2682d3c2.jpg', accent: '#e2b64e' },
];

export function getCoverArtwork(artworkId?: number): CoverArtDef {
  if (!artworkId) return COVER_ARTWORKS[0];
  return COVER_ARTWORKS.find((c) => c.id === artworkId) || COVER_ARTWORKS[0];
}

export const STUDIO_TIERS = [
  {
    tier: 0 as const,
    name: 'Domowe Zacisze',
    subtitle: 'Mikrofon na biurku, koc na ścianie, własne bity',
    upgradeCost: 0,
    dailyUpkeep: 0,
    qualityBonus: 0,
    energyCost: 22,
  },
  {
    tier: 1 as const,
    name: 'Podziemna Kanciapa',
    subtitle: 'Wygłuszona kabina, klasyczny preamp i odsłuchy',
    upgradeCost: 4500,
    dailyUpkeep: 90,
    qualityBonus: 16,
    energyCost: 18,
  },
  {
    tier: 2 as const,
    name: 'Studio PRO',
    subtitle: 'Topowi realizatorzy, analogowy stół mikserski, mastering',
    upgradeCost: 22000,
    dailyUpkeep: 340,
    qualityBonus: 32,
    energyCost: 15,
  },
];

export const BEAT_PRESETS: Record<BeatStyle, { label: string; vibe: string; defaultBpm: number; steps: BeatConfig['steps'] }> = {
  '808_trap': {
    label: '808 Trap',
    vibe: 'Głęboki sub-bas 808, szybkie hi-haty, klubowa energia',
    defaultBpm: 136,
    steps: {
      kick:  [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, false, true, true, true, false, true, false, true, true, true, false, true, true, true, false],
      chord: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false],
    },
  },
  mpc_boombap: {
    label: 'MPC Boom-Bap',
    vibe: 'Klasyczne cięte sample, brudna stopa, klimat 90s',
    defaultBpm: 92,
    steps: {
      kick:  [true, false, false, false, false, false, false, true, true, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, true],
      chord: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
    },
  },
  uk_drill: {
    label: 'UK Drill',
    vibe: 'Ślizgający się bas, synkopowany werbel, mroczna ulica',
    defaultBpm: 142,
    steps: {
      kick:  [true, false, false, false, false, false, false, false, false, false, true, false, false, true, false, false],
      snare: [false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
      hat:   [true, false, false, true, false, false, true, false, true, false, false, true, false, true, true, false],
      chord: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false],
    },
  },
  dark_synth: {
    label: 'Dark Neon',
    vibe: 'Luksusowe syntezatory, nocna autostrada, mainstreamowy sznyt',
    defaultBpm: 118,
    steps: {
      kick:  [true, false, false, true, false, false, true, false, true, false, false, false, false, false, true, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, true, false, true, true, false, true, true, true, true, false, true, true, false, true, false],
      chord: [true, false, false, false, true, false, false, false, true, false, false, false, false, false, true, false],
    },
  },
};

export const PRODUCER_BEATS: ProducerBeatDef[] = [
  {
    id: 'beat-kruszon',
    title: 'Klatkowy Kurz',
    producer: 'DJ Kruszon',
    producerTag: 'Kruszon na bicie',
    city: 'Łódź',
    tier: 'Podziemie',
    style: 'mpc_boombap',
    bpm: 90,
    price: 350,
    qualityBonus: 5,
    hypeBonus: 1,
    vibe: 'Surowy winylowy sampel z osiedlowego MPC, idealny pod twarde wersy.',
    steps: {
      kick:  [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, false],
      chord: [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false],
    },
  },
  {
    id: 'beat-mlody808',
    title: 'Nocny Kurs 808',
    producer: 'Młody 808',
    producerTag: 'Młody 808',
    city: 'Katowice',
    tier: 'Podziemie',
    style: '808_trap',
    bpm: 138,
    price: 450,
    qualityBonus: 6,
    hypeBonus: 1,
    vibe: 'Ciężki bas 808 i pędzące hi-haty do jazdy po mieście po zmroku.',
    steps: {
      kick:  [true, false, false, false, false, false, false, true, false, false, true, false, false, false, true, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, true, true, false, true, true, true, false, true, true, false, true, true, true, true, false],
      chord: [true, false, false, false, false, false, false, false, true, false, false, true, false, false, false, false],
    },
  },
  {
    id: 'beat-drillz',
    title: 'Mroczny Kwartał',
    producer: 'Szymon Drillz',
    producerTag: 'Drillz on the track',
    city: 'Wrocław',
    tier: 'Średnia Liga',
    style: 'uk_drill',
    bpm: 142,
    price: 950,
    qualityBonus: 10,
    hypeBonus: 2,
    vibe: 'Zimny drillowy ślizg, ostry werbel i agresywny puls pod mocny singiel lub diss.',
    steps: {
      kick:  [true, false, false, false, false, false, false, false, false, false, true, false, false, true, false, true],
      snare: [false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
      hat:   [true, false, false, true, false, false, true, false, true, false, false, true, false, true, false, true],
      chord: [true, false, false, false, false, false, false, false, false, false, true, false, false, false, true, false],
    },
  },
  {
    id: 'beat-klasik',
    title: 'Złoty Samplerek',
    producer: 'Klasik MPC',
    producerTag: 'Klasik MPC',
    city: 'Kraków',
    tier: 'Średnia Liga',
    style: 'mpc_boombap',
    bpm: 94,
    price: 1100,
    qualityBonus: 11,
    hypeBonus: 2,
    vibe: 'Ciepłe jazzowe akordy i tłusta perkusja z analogowego samplera.',
    steps: {
      kick:  [true, false, false, true, false, false, false, true, true, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, true],
      hat:   [true, false, true, false, true, false, true, false, true, true, true, false, true, false, true, true],
      chord: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false],
    },
  },
  {
    id: 'beat-vortex',
    title: 'Autostrada Neon',
    producer: 'Vortex Beats',
    producerTag: 'Vortex prod.',
    city: 'Warszawa',
    tier: 'Top Sceny',
    style: 'dark_synth',
    bpm: 122,
    price: 2200,
    qualityBonus: 15,
    hypeBonus: 4,
    vibe: 'Szerokie syntezatory i radiowy połysk — gotowy przepis na główną playlistę.',
    steps: {
      kick:  [true, false, false, true, false, false, true, false, true, false, false, false, false, true, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, true, false, true, true, false, true, true, true, false, true, true, true, false, true, true],
      chord: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false],
    },
  },
  {
    id: 'beat-smola',
    title: 'Ciężki Sub-Bas',
    producer: 'Mistrz Smoła',
    producerTag: 'Smoła na bicie',
    city: 'Gdańsk',
    tier: 'Top Sceny',
    style: '808_trap',
    bpm: 134,
    price: 2600,
    qualityBonus: 16,
    hypeBonus: 4,
    vibe: 'Klubowy banger z potężnym dropem, który rozsadza nagłośnienie na koncertach.',
    steps: {
      kick:  [true, false, false, true, false, false, true, false, false, false, true, false, false, false, true, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, false, true, true, true, true, true, false, true, false, true, true, true, true, true, true],
      chord: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
    },
  },
  {
    id: 'beat-magik',
    title: 'Żelazny Drill',
    producer: 'Czarny Magik',
    producerTag: 'Magik Beats',
    city: 'Poznań',
    tier: 'Legenda',
    style: 'uk_drill',
    bpm: 145,
    price: 4200,
    qualityBonus: 20,
    hypeBonus: 6,
    vibe: 'Elitarny, mroczny podkład topowego beatmakera — bezkompromisowa moc.',
    steps: {
      kick:  [true, false, false, false, false, false, false, true, false, false, true, false, false, true, false, false],
      snare: [false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, true],
      hat:   [true, true, false, true, false, true, true, false, true, true, false, true, false, true, true, false],
      chord: [true, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false],
    },
  },
  {
    id: 'beat-architekt',
    title: 'Platynowa Korona',
    producer: 'Platynowy Architekt',
    producerTag: 'Architekt prod.',
    city: 'Warszawa',
    tier: 'Legenda',
    style: 'dark_synth',
    bpm: 116,
    price: 4800,
    qualityBonus: 22,
    hypeBonus: 7,
    vibe: 'Luksusowy, kinowy sound od producenta diamentowych płyt. Czysta liga mistrzów.',
    steps: {
      kick:  [true, false, false, true, false, false, true, false, true, false, true, false, false, false, true, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hat:   [true, true, true, false, true, true, true, true, true, true, false, true, true, true, true, false],
      chord: [true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false],
    },
  },
];

const NPC_SIGNATURE_PORTRAITS: Record<string, number> = {
  'krol-poludnia': 9,
  'krolowa-poludnia': 34,
  'mlody-wwa': 20,
  liliowa: 25,
  'bialy-kruk': 30,
  'nocna-fala': 19,
  szept: 15,
  'stalowy-beton': 37,
  'czarny-diament': 18,
  korsarz: 33,
  'zlota-igla': 10,
  'wschodni-wiatr': 14,
  'polnocny-dym': 38,
  'wersja-zero': 2,
  'srebrna-strzala': 22,
};

export function createInitialNpcs(playerPortraitId: number, playerVoivodeship: VoivodeshipId): NpcRapper[] {
  const used = new Set<number>([playerPortraitId]);
  const poolMale = PORTRAITS.filter((p) => p.gender === 'male');
  const poolFemale = PORTRAITS.filter((p) => p.gender === 'female');

  const pickPortrait = (npcId: string, g: 'male' | 'female'): number => {
    const preferred = NPC_SIGNATURE_PORTRAITS[npcId];
    if (preferred && !used.has(preferred)) {
      used.add(preferred);
      return preferred;
    }
    const pool = g === 'male' ? poolMale : poolFemale;
    const candidate = pool.find((p) => !used.has(p.id)) || pool[0];
    used.add(candidate.id);
    return candidate.id;
  };

  const raw: Omit<NpcRapper, 'portraitId' | 'relation'>[] = [
    {
      id: 'krol-poludnia',
      alias: 'Król Południa',
      gender: 'male',
      city: 'Opole',
      voivodeship: 'opolskie',
      style: 'Ulica',
      tier: 'Legenda',
      goldCerts: 6,
      platinumCerts: 4,
      biggestHit: 'Złote Mosty Opola',
      fans: 480000,
      featCost: 9500,
      bio: 'Niekwestionowany weteran południowego brzmienia. Szanuje tylko autentyczność i ciężką pracę w kabinie.',
      freestyleJabs: [
        'Mówisz o koronie, a nie znasz nawet ceny tego tronu,',
        'Na południu każdy wers ma wagę czystego betonu,',
        'Twój rap brzmi jak demo nagrane na pożyczonym kablu,',
        'Zanim wejdziesz na mój szczebel, naucz się trzymać gardę w ogniu!',
      ],
      dissLines: ['Myślałeś, że zaczepka da Ci zasięg na dzielni — właśnie zgasiłem Twoje pięć minut.'],
    },
    {
      id: 'krolowa-poludnia',
      alias: 'Królowa Południa',
      gender: 'female',
      city: 'Katowice',
      voivodeship: 'slaskie',
      style: 'Trap',
      tier: 'Legenda',
      goldCerts: 5,
      platinumCerts: 5,
      biggestHit: 'Czarny Diament Spodka',
      fans: 540000,
      featCost: 11000,
      bio: 'Wypełnia Spodek po brzegi. Łączy bezkompromisowy śląski charakter z luksusową produkcją na światowym poziomie.',
      freestyleJabs: [
        'Wchodzisz na mój teren bez biletu i bez charyzmy,',
        'Katowice znają tylko bity, co łamią wszystkie pryzmy,',
        'Masz w kieszeni drobne, a udajesz wielki format,',
        'Sprawdź moje platyny — Twój styl to zwykły półprodukt i dramat!',
      ],
      dissLines: ['Na Śląsku nie ma miejsca na plastikowe wersy. Wróć do domu po lekcje dykcji.'],
    },
    {
      id: 'mlody-wwa',
      alias: 'Młody WWA',
      gender: 'male',
      city: 'Warszawa',
      voivodeship: 'mazowieckie',
      style: 'Mainstream',
      tier: 'Gwiazda',
      goldCerts: 4,
      platinumCerts: 3,
      biggestHit: 'Neony Złotej 44',
      fans: 360000,
      featCost: 7500,
      bio: 'Król stołecznych list streamingowych i głośnych kampanii. Zawsze tam, gdzie błyszczą flesze i duże kontrakty.',
      freestyleJabs: [
        'Z góry szklanej wieży ledwo widzę Twoje liczby,',
        'Moje refreny lecą w radiu, Twoje w pustej izbie,',
        'Mówisz o ulicy, bo nikt Cię nie zaprasza na salony,',
        'Zanim nagrasz jeden hit, ja zgarnę już trzy platynowe korony!',
      ],
      dissLines: ['Zazdrość z podziemia nie opłaci Ci czynszu w Warszawie.'],
    },
    {
      id: 'liliowa',
      alias: 'Liliowa',
      gender: 'female',
      city: 'Wrocław',
      voivodeship: 'dolnoslaskie',
      style: 'Drill',
      tier: 'Gwiazda',
      goldCerts: 3,
      platinumCerts: 2,
      biggestHit: 'Noc Nad Odrą',
      fans: 240000,
      featCost: 5200,
      bio: 'Zimny głos wrocławskiego drillu. Jej agresywne przyspieszenia rozkładają najtwardszych MC na scenie.',
      freestyleJabs: [
        'Nad Odrą noc jest zimna, dokładnie jak mój wokal,',
        'Wchodzisz na ten drill, a gubisz rytm już w pierwszym takcie,',
        'Każdy mój punchline tnie jak szkło na pustym dworcu,',
        'Zostaw majk starszym — dziś kończysz bieg na pierwszym zakręcie!',
      ],
      dissLines: ['Myślałeś, że z dziewczyną z Wrocławia będzie łatwiej? Sprawdź komentarze pod swoim profilem.'],
    },
    {
      id: 'bialy-kruk',
      alias: 'Biały Kruk',
      gender: 'male',
      city: 'Kraków',
      voivodeship: 'malopolskie',
      style: 'Oldschool',
      tier: 'Gwiazda',
      goldCerts: 4,
      platinumCerts: 1,
      biggestHit: 'Kazimierz Po Zmroku',
      fans: 195000,
      featCost: 4800,
      bio: 'Poeta krakowskiego boom-bapu. Kolekcjoner winyli i mistrz wielokrotnych rymów.',
      freestyleJabs: [
        'Kraków uczy kunsztu, a nie pustego krzyku w sieci,',
        'Moje linijki zostaną, gdy Twój sezonowy hype uleci,',
        'Składasz proste rymy jak z zeszytu podstawówki,',
        'Na tym klasycznym samplu rozkładam Cię na drobne bez wymówki!',
      ],
      dissLines: ['Twój tekst nie ma nawet podwójnego rymu. Zostawiłem Ci lekcję poezji na MPC.'],
    },
    {
      id: 'nocna-fala',
      alias: 'Nocna Fala',
      gender: 'female',
      city: 'Gdańsk',
      voivodeship: 'pomorskie',
      style: 'Mainstream',
      tier: 'Gwiazda',
      goldCerts: 3,
      platinumCerts: 2,
      biggestHit: 'Bursztynowy Horyzont',
      fans: 270000,
      featCost: 5600,
      bio: 'Melodic rap z Trójmiasta. Jej refreny podbijają letnie festiwale od Helu po Zakopane.',
      freestyleJabs: [
        'Mój refren niesie Bałtyk, Twój nie wyjdzie z klatki,',
        'Gram na wielkich scenach, kiedy Ty liczysz ostatki,',
        'Nie musisz mnie kochać, wystarczą moje złote płyty,',
        'Z takim słabym flow zostaniesz tutaj szybko zmyty!',
      ],
      dissLines: ['Zimny prysznic znad morza — może teraz nabierzesz pokory.'],
    },
    {
      id: 'szept',
      alias: 'Szept',
      gender: 'male',
      city: 'Poznań',
      voivodeship: 'wielkopolskie',
      style: 'Oldschool',
      tier: 'Średnia Liga',
      goldCerts: 2,
      platinumCerts: 0,
      biggestHit: 'Jeżyce 4 Rano',
      fans: 98000,
      featCost: 2600,
      bio: 'Weteran wielkopolskich bitew freestyle. Cichy poza sceną, bezlitosny z mikrofonem w dłoni.',
      freestyleJabs: [
        'Poznań nie wybacza fałszu, pamiętaj tę zasadę,',
        'Zjadłem stu takich graczy, zanim wyszedłeś na estradę,',
        'Słyszę drżenie w głosie, kiedy bit przyspiesza tempo,',
        'Dla mnie ten pojedynek to po prostu zwykłe rozgrzewkowe święto!',
      ],
      dissLines: ['Na Jeżycach mówimy krótko: za słaby warsztat na taki duży krzyk.'],
    },
    {
      id: 'stalowy-beton',
      alias: 'Stalowy Beton',
      gender: 'male',
      city: 'Łódź',
      voivodeship: 'lodzkie',
      style: 'Ulica',
      tier: 'Średnia Liga',
      goldCerts: 2,
      platinumCerts: 0,
      biggestHit: 'Bałuty Nie Śpią',
      fans: 112000,
      featCost: 2800,
      bio: 'Surowy głos łódzkich kamienic. Nigdy nie wziął reklamy, ma fanatycznie lojalny fanbase.',
      freestyleJabs: [
        'Z łódzkich podwórek niosę ciężar prawdziwego życia,',
        'Ty piszesz bajki z kanapy bez żadnego pokrycia,',
        'Ulica pamięta każdy ruch i każde puste słowo,',
        'Dziś schodzisz z tej sceny ze spuszczoną nisko głową!',
      ],
      dissLines: ['Bałuty pozdrawiają. Następnym razem pomyśl dwa razy, zanim rzucisz ksywką.'],
    },
    {
      id: 'czarny-diament',
      alias: 'Czarny Diament',
      gender: 'male',
      city: 'Lublin',
      voivodeship: 'lubelskie',
      style: 'Trap',
      tier: 'Średnia Liga',
      goldCerts: 1,
      platinumCerts: 1,
      biggestHit: 'Wschodni Szlak',
      fans: 128000,
      featCost: 3100,
      bio: 'Trapowy innowator ze wschodu. Sam produkuje większość swoich mrocznych 808-ek.',
      freestyleJabs: [
        'Ze wschodu idzie burza, a Ty nie masz nawet parasola,',
        'Mój bas rozsadza kluby, Twój nie rusza nawet stoła,',
        'Klepię własne bity i zgarniam pełną pulę,',
        'Na mojej arenie kończysz rundę z wynikiem równym zeru!',
      ],
      dissLines: ['Lublin właśnie wystawił Ci rachunek za bezczelność.'],
    },
    {
      id: 'korsarz',
      alias: 'Korsarz',
      gender: 'male',
      city: 'Szczecin',
      voivodeship: 'zachodniopomorskie',
      style: 'Drill',
      tier: 'Średnia Liga',
      goldCerts: 1,
      platinumCerts: 0,
      biggestHit: 'Portowe Mgły',
      fans: 76000,
      featCost: 2100,
      bio: 'Mroczny klimat portowego miasta i bezlitosne tempo na 142 BPM.',
      freestyleJabs: [
        'W szczecińskiej mgle łatwo stracić cały kompas,',
        'Mój styl to ciężki sztorm, a Twój to słaby komiks,',
        'Wbijam na ten bit jak pirat na pokład bez ochrony,',
        'Za chwilę z Twojej pewności zostaną same pogorzeliska!',
      ],
      dissLines: ['W porcie nie ma sentymentów. Zatonąłeś w pierwszej zwrotce.'],
    },
    {
      id: 'zlota-igla',
      alias: 'Złota Igła',
      gender: 'female',
      city: 'Rzeszów',
      voivodeship: 'podkarpackie',
      style: 'Oldschool',
      tier: 'Średnia Liga',
      goldCerts: 1,
      platinumCerts: 0,
      biggestHit: 'Winyl Podkarpacia',
      fans: 64000,
      featCost: 1900,
      bio: 'Mistrzyni klasycznego flow i turntablismu. Zaczynała na rzeszowskich jamach.',
      freestyleJabs: [
        'Kładę igłę na płytę i od razu gasną Twoje światła,',
        'Moja dykcja to brzytwa, Twoja zwrotka jest za słaba,',
        'Podkarpacie ma charakter, którego nie kupisz za grosze,',
        'Oddaj mikrofon na stół — po tej rundzie nie ma już o czym gadać!',
      ],
      dissLines: ['Szlifuj warsztat, zanim znowu zaczepisz Rzeszów.'],
    },
    {
      id: 'wschodni-wiatr',
      alias: 'Wschodni Wiatr',
      gender: 'male',
      city: 'Białystok',
      voivodeship: 'podlaskie',
      style: 'Ulica',
      tier: 'Podziemie',
      goldCerts: 0,
      platinumCerts: 0,
      biggestHit: 'Mroźny Poranek',
      fans: 28000,
      featCost: 1100,
      bio: 'Głodny gracz z Podlasia. Ma w sobie pasję, która może wkrótce wybuchnąć w całej Polsce.',
      freestyleJabs: [
        'Z Białegostoku niosę mróz, co studzi gorące głowy,',
        'Nie mam jeszcze złotych płyt, ale każdy wers mam gotowy,',
        'Myślisz, że podziemie śpi? My właśnie przejmujemy scenę,',
        'Pokaż, czy masz odwagę stanąć ze mną na otwartej arenie!',
      ],
      dissLines: ['Podlasie nie pęka przed nikim. Zapisz to sobie w notatniku.'],
    },
    {
      id: 'polnocny-dym',
      alias: 'Północny Dym',
      gender: 'male',
      city: 'Olsztyn',
      voivodeship: 'warminsko-mazurskie',
      style: 'Trap',
      tier: 'Podziemie',
      goldCerts: 0,
      platinumCerts: 0,
      biggestHit: 'Jeziora o Północy',
      fans: 22000,
      featCost: 950,
      bio: 'Klimatyczny cloud-trap z Warmii. Często szuka świeżych bitów i młodych głosów na featy.',
      freestyleJabs: [
        'Płynę po tym bicie jak mgła nad mazurską taflą,',
        'Twoje rymy brzmią ciężko, jakby ktoś ciągnął je na siłę,',
        'Z Olsztyna wbijam cicho, ale zostawiam ślad na długo,',
        'Dzisiaj to moje imię publika skanduje po drugiej rundzie!',
      ],
      dissLines: ['Warmia właśnie zgasiła Twój zapał w dwie minuty.'],
    },
    {
      id: 'wersja-zero',
      alias: 'Wersja Zero',
      gender: 'male',
      city: 'Bydgoszcz',
      voivodeship: 'kujawsko-pomorskie',
      style: 'Drill',
      tier: 'Podziemie',
      goldCerts: 0,
      platinumCerts: 0,
      biggestHit: 'Sygnał Z Brdy',
      fans: 34000,
      featCost: 1200,
      bio: 'Młody wilk z Kujaw. Szybki, techniczny i zawsze gotowy na spontaniczny beef dla rozgłosu.',
      freestyleJabs: [
        'Wersja Zero to start, po którym nie ma już powrotu,',
        'Bydgoszcz daje mi napęd do najwyższego lotu,',
        'Próbujesz mnie zatrzymać, ale stoisz w miejscu jak słup,',
        'Zaraz cała sala usłyszy, kto tu naprawdę rządzi przy majku!',
      ],
      dissLines: ['Szybka odpowiedź z Bydgoszczy — następnym razem przygotuj lepszy refren.'],
    },
    {
      id: 'srebrna-strzala',
      alias: 'Srebrna Strzała',
      gender: 'female',
      city: 'Kielce',
      voivodeship: 'swietokrzyskie',
      style: 'Mainstream',
      tier: 'Podziemie',
      goldCerts: 0,
      platinumCerts: 0,
      biggestHit: 'Świętokrzyski Błysk',
      fans: 31000,
      featCost: 1150,
      bio: 'Charyzmatyczna debiutantka z Kielc. Świetnie czuje się w mediach i na letnich scenach.',
      freestyleJabs: [
        'Z Kielc lecę jak strzała prosto w sam środek tarczy,',
        'Na taki słaby występ jedna moja zwrotka wystarczy,',
        'Masz wielkie ego, ale puste bity bez iskry,',
        'Zostań na widowni, bo ta scena należy dziś do błysku!',
      ],
      dissLines: ['Kielce pozdrawiają! Szkoda tylko, że musiałam zniżyć się do tego poziomu.'],
    },
  ];

  return raw.map((npc) => ({
    ...npc,
    portraitId: pickPortrait(npc.id, npc.gender),
    relation: npc.voivodeship === playerVoivodeship ? 35 : 5,
  }));
}

// Polish rhyme groups for live studio & freestyle suggestions
const RHYME_BANK: string[][] = [
  ['scena', 'wena', 'cena', 'syrena', 'arena', 'zmiana', 'ściana'],
  ['miasto', 'ciasto', 'ciasno', 'jasno', 'hasło', 'światło'],
  ['noc', 'moc', 'koc', 'głos', 'los', 'cios', 'stos'],
  ['bit', 'hit', 'szczyt', 'mit', 'zgrzyt', 'świt', 'kredyt'],
  ['gra', 'mgła', 'dwa', 'trwa', 'dna', 'szkła', 'tła'],
  ['tron', 'dom', 'grom', 'ton', 'plon', 'skron', 'dzwon'],
  ['złoto', 'błoto', 'oto', 'spoko', 'wysoko', 'szeroko', 'oko'],
  ['hajs', 'czas', 'bas', 'las', 'blask', 'trzask', 'gaz'],
  ['rap', 'trap', 'szlak', 'znak', 'brak', 'smak', 'ptak'],
  ['ulica', 'dzielnica', 'granica', 'tajemnica', 'stolica', 'iglica'],
  ['płyta', 'elita', 'pyta', 'chwyta', 'ryta', 'świta'],
  ['korona', 'strona', 'obrona', 'ikona', 'zasłona', 'płona'],
  ['studio', 'audio', 'radio', 'brudno', 'trudno', 'nudno'],
  ['fani', 'wygrani', 'znani', 'rani', 'piani', 'grani'],
  ['wers', 'sens', 'stres', 'kres', 'dres', 'błysk', 'zysk'],
  ['flow', 'show', 'tło', 'szkło', 'dno', 'zło'],
  ['sława', 'sprawa', 'Warszawa', 'zabawa', 'trawa', 'ława'],
  ['droga', 'trwoga', 'za proga', 'wroga', 'boga', 'noga'],
  ['dym', 'rym', 'tym', 'styl', 'pył', 'sił', 'żył'],
  ['platyna', 'maszyna', 'godzina', 'rodzina', 'przyczyna', 'kraina'],
];

export function suggestPolishRhymes(text: string): string[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return ['scena', 'wena', 'bit', 'szczyt', 'złoto', 'ulica', 'korona', 'platyna'];
  }
  const lastLine = lines[lines.length - 1];
  const words = lastLine
    .toLowerCase()
    .replace(/[^a-ząćęłńóśźż0-9\s]/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lastWord = words[words.length - 1] || '';

  if (!lastWord) {
    return ['noc', 'moc', 'bit', 'hit', 'korona', 'strona', 'ulica', 'stolica'];
  }

  // Exact bank match
  for (const group of RHYME_BANK) {
    if (group.some((w) => w === lastWord || (lastWord.length >= 3 && w.endsWith(lastWord.slice(-3))))) {
      const filtered = group.filter((w) => w !== lastWord);
      if (filtered.length > 0) return filtered.slice(0, 7);
    }
  }

  // Suffix match across entire bank
  const suffix2 = lastWord.slice(-2);
  const matched = RHYME_BANK.flat().filter((w) => w !== lastWord && w.endsWith(suffix2));
  if (matched.length >= 3) {
    return Array.from(new Set(matched)).slice(0, 7);
  }

  // Fallback curated rap rhymes
  return ['szczyt', 'bit', 'wers', 'stres', 'korona', 'ikona', 'złoto'];
}

export function countPolishSyllables(line: string): number {
  const clean = line.toLowerCase().replace(/[^a-ząćęłńóśźż]/g, '');
  if (!clean) return 0;
  const matches = clean.match(/[aeiouyąęó]+/g);
  return matches ? matches.length : 1;
}

export function scorePolishLyrics(
  lyrics: string,
  requiredKeywords: string[] = []
): {
  score: number;
  lineCount: number;
  rhymePairs: number;
  keywordsHit: string[];
  avgSyllables: number;
  verdict: string;
} {
  const lines = lyrics
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length >= 4);

  if (lines.length === 0) {
    return {
      score: 12,
      lineCount: 0,
      rhymePairs: 0,
      keywordsHit: [],
      avgSyllables: 0,
      verdict: 'Pusta kartka — napisz przynajmniej 4 wersy.',
    };
  }

  const lastWords = lines.map((l) => {
    const tokens = l
      .toLowerCase()
      .replace(/[^a-ząćęłńóśźż0-9\s]/gi, '')
      .trim()
      .split(/\s+/);
    return tokens[tokens.length - 1] || '';
  });

  let rhymePairs = 0;
  for (let i = 0; i < lastWords.length - 1; i++) {
    const a = lastWords[i];
    const b = lastWords[i + 1];
    const c = lastWords[i + 2] || '';
    const rhymesAB =
      a.length >= 2 &&
      b.length >= 2 &&
      a !== b &&
      (a.slice(-2) === b.slice(-2) ||
        RHYME_BANK.some((g) => g.includes(a) && g.includes(b)));
    const rhymesAC =
      a.length >= 2 &&
      c.length >= 2 &&
      a !== c &&
      (a.slice(-2) === c.slice(-2) ||
        RHYME_BANK.some((g) => g.includes(a) && g.includes(c)));
    if (rhymesAB || rhymesAC) rhymePairs++;
  }

  const syllableCounts = lines.map(countPolishSyllables);
  const avgSyllables = Math.round(
    syllableCounts.reduce((s, n) => s + n, 0) / syllableCounts.length
  );
  // Rhythm consistency bonus (good rap bars are usually 9–16 syllables and consistent)
  const variance =
    syllableCounts.reduce((acc, n) => acc + Math.abs(n - avgSyllables), 0) /
    syllableCounts.length;
  const flowBonus = avgSyllables >= 8 && avgSyllables <= 17 ? Math.max(0, 18 - variance * 3) : 6;

  const uniqueWords = new Set(
    lyrics
      .toLowerCase()
      .replace(/[^a-ząćęłńóśźż0-9\s]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  ).size;

  const lowerFull = lyrics.toLowerCase();
  const keywordsHit = requiredKeywords.filter((kw) => lowerFull.includes(kw.toLowerCase()));

  let score =
    20 +
    Math.min(24, lines.length * 4.5) +
    Math.min(24, rhymePairs * 8) +
    Math.min(16, uniqueWords * 0.65) +
    flowBonus +
    keywordsHit.length * 10;

  score = Math.max(15, Math.min(100, Math.round(score)));

  let verdict = 'Szkic z potencjałem — dorzuć jeszcze rymów.';
  if (score >= 88) verdict = 'Kunszt poetycki — ogień w kabinie, publika oszaleje.';
  else if (score >= 74) verdict = 'Mocna zwrotka — świetny rytm i celne rymy.';
  else if (score >= 55) verdict = 'Solidne wersy — dobrze siadają na bicie.';

  return {
    score,
    lineCount: lines.length,
    rhymePairs,
    keywordsHit,
    avgSyllables,
    verdict,
  };
}

export const FREESTYLE_TOPICS = [
  { topic: 'Kto naprawdę rządzi na tej scenie', keywords: ['korona', 'ulica', 'mikrofon'] },
  { topic: 'Pieniądze kontra autentyczność', keywords: ['złoto', 'prawda', 'czynsz'] },
  { topic: 'Droga od zera do wielkich hal', keywords: ['blok', 'szczyt', 'platyna'] },
  { topic: 'Nocne miasto i głód sukcesu', keywords: ['noc', 'neony', 'bas'] },
  { topic: 'Prawdziwy warsztat kontra internetowy hype', keywords: ['wers', 'rytm', 'scena'] },
  { topic: 'Honor rodzinnego miasta', keywords: ['miasto', 'ekipa', 'ogień'] },
];

export const MILESTONES: MilestoneDef[] = [
  {
    id: 'first_track',
    title: 'Pierwsze Demo',
    badgeTitle: 'Debiutant',
    description: 'Nagraj swój pierwszy utwór w studiu.',
    check: (s) => s.tracks.length >= 1,
  },
  {
    id: 'voice_underground',
    title: 'Głos Podziemia',
    badgeTitle: 'Głos Podziemia',
    description: 'Zdobądź 5 000 fanów przy zachowaniu ulicznego charakteru (Ulica ≤ 45%).',
    check: (s) => s.fans >= 5000 && s.streetMainstream <= 45,
  },
  {
    id: 'undefeated_mc',
    title: 'Niepokonany MC',
    badgeTitle: 'Niepokonany MC',
    description: 'Wygraj 3 bitwy freestyle na Arenie.',
    check: (s) => s.freestyleWins >= 3,
  },
  {
    id: 'gold_record',
    title: 'Złota Płyta',
    badgeTitle: 'Złoty Artysta',
    description: 'Zdobądź pierwszą Złotą Płytę za singiel lub album.',
    check: (s) =>
      s.tracks.some((t) => t.cert !== 'none') || s.projects.some((p) => p.cert !== 'none'),
  },
  {
    id: 'platinum_record',
    title: 'Platynowy Status',
    badgeTitle: 'Platynowy Gracz',
    description: 'Zdobądź pierwszą Platynową Płytę.',
    check: (s) =>
      s.tracks.some((t) => t.cert === 'platinum' || t.cert === 'diamond') ||
      s.projects.some((p) => p.cert === 'platinum' || p.cert === 'diamond'),
  },
  {
    id: 'beef_winner',
    title: 'Król Beefu',
    badgeTitle: 'Pogromca Sceny',
    description: 'Wygraj głosowanie słuchaczy na RapPortalu w oficjalnym beefie.',
    check: (s) => s.beefs.some((b) => b.resolved && b.winner === 'player'),
  },
  {
    id: 'region_king',
    title: 'Król Regionu',
    badgeTitle: 'Król Regionu',
    description: 'Osiągnij 100% poparcia w dowolnym województwie.',
    check: (s) => Object.values(s.regionSupport).some((v) => v >= 100),
  },
  {
    id: 'streetwear_icon',
    title: 'Ikona Streetwearu',
    badgeTitle: 'Ikona Streetwearu',
    description: 'Osiągnij SOLD OUT na dropie swojej marki odzieżowej.',
    check: (s) => Boolean(s.brand?.drops.some((d) => d.soldOut)),
  },
  {
    id: 'crew_boss',
    title: 'Lider Ekipy',
    badgeTitle: 'Szef Ekipy',
    description: 'Załóż ekipę i zrekrutuj minimum 2 raperów.',
    check: (s) => Boolean(s.crew && s.crew.memberIds.length >= 2),
  },
  {
    id: 'label_mogul',
    title: 'Magnat Wytwórni',
    badgeTitle: 'Boss Wytwórni',
    description: 'Załóż własną wytwórnię i podpisz pierwszego artystę.',
    check: (s) => Boolean(s.label && s.label.artists.length >= 1),
  },
  {
    id: 'king_of_poland',
    title: 'Król Polski',
    badgeTitle: 'Król Polski',
    description: 'Osiągnij 100% poparcia w co najmniej 6 województwach.',
    check: (s) => Object.values(s.regionSupport).filter((v) => v >= 100).length >= 6,
  },
  {
    id: 'rap_legend',
    title: 'Legenda Polskiego Rapu',
    badgeTitle: 'Legenda Polskiego Rapu',
    description: 'Zdobądź 250 000 fanów oraz statuetkę na Gali Rap Awards.',
    check: (s) => s.fans >= 250000 && s.galaHistory.some((g) => g.playerAwards.length > 0),
  },
];
