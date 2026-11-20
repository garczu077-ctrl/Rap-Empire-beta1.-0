import { BeatStyle, GameState, InboxMessage, InterviewQuestion } from '../types/game';
import { STUDIO_TIERS, VOIVODESHIP_MAP } from './worldData';

export interface MediaOutlet {
  name: string;
  host: string;
  vibe: string;
}

export const MEDIA_OUTLETS: MediaOutlet[] = [
  { name: 'RapStudio TV', host: 'Red. Kuba „Kabel”', vibe: 'Główny format wideo polskiej sceny' },
  { name: 'Podziemie FM', host: 'DJ Szyna', vibe: 'Nocna audycja dla koneserów rapu' },
  { name: 'Kanał Scena', host: 'Maja „Mika”', vibe: 'Gorące wywiady na żywo z czatem' },
  { name: 'Betonowe Mikrofony', host: 'Stary Wiarus', vibe: 'Szczere rozmowy bez owijania w bawełnę' },
  { name: 'Czwórka Rap', host: 'Red. Patryk', vibe: 'Ogólnopolski zasięg i premiery' },
  { name: 'Magazyn 94', host: 'Red. Filip', vibe: 'Wywiad okładkowy i analiza dyskografii' },
];

const BEAT_STYLE_LABELS: Record<BeatStyle, string> = {
  '808_trap': '808 Trap',
  mpc_boombap: 'MPC Boom-Bap',
  uk_drill: 'UK Drill',
  dark_synth: 'Dark Synth',
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function fanScale(state: GameState, base: number, ratio = 0.025): number {
  return Math.round(base + Math.min(state.fans * ratio, 45000));
}

function cashScale(state: GameState, base: number): number {
  return Math.round(base + Math.min(state.hype * 12 + state.fans * 0.008, 4500));
}

interface CandidateQuestion {
  priority: 1 | 2 | 3; // 1 = hot live event (beef/recent drop/release), 2 = career milestones/business, 3 = general/roots
  question: InterviewQuestion;
}

export function buildAllCandidateQuestions(state: GameState): CandidateQuestion[] {
  const out: CandidateQuestion[] = [];
  const push = (priority: 1 | 2 | 3, question: InterviewQuestion) => out.push({ priority, question });

  const activeBeef = state.beefs.find((b) => !b.resolved);
  const resolvedBeef = state.beefs.find((b) => b.resolved);
  const releasedTracks = state.tracks.filter((t) => t.mode !== 'vault');
  const latestTrack = releasedTracks[0];
  const latestDissTrack = state.tracks.find((t) => t.mode === 'diss');
  const latestFeatTrack = state.tracks.find((t) => t.featNpcId);
  const latestProdTrack = state.tracks.find((t) => t.mode === 'prod_commission');
  const certTrack = state.tracks.find((t) => t.cert !== 'none');
  const vaultTracks = state.tracks.filter((t) => t.mode === 'vault');
  const latestProject = state.projects[0];
  const latestDrop = state.brand?.drops[0];
  const lastGala = state.galaHistory[0];
  const daysToGala = 60 - (state.day % 60 || 60);
  const studio = STUDIO_TIERS[state.studioTier] || STUDIO_TIERS[0];

  const allyNpc = [...state.npcs]
    .filter((n) => n.relation >= 35)
    .sort((a, b) => b.relation - a.relation)[0];
  const rivalNpc = [...state.npcs]
    .filter((n) => n.relation <= -20 && (!activeBeef || activeBeef.opponentId !== n.id))
    .sort((a, b) => a.relation - b.relation)[0];

  const topRegionEntry = (Object.entries(state.regionSupport) as [keyof typeof VOIVODESHIP_MAP, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const topRegionName = topRegionEntry ? VOIVODESHIP_MAP[topRegionEntry[0]]?.name || state.player.city : state.player.city;
  const topRegionSupport = topRegionEntry ? topRegionEntry[1] : 0;

  // =========================================================================
  // 1. TRWAJĄCY BEEF & KONKRETNY DISS (10 zróżnicowanych pytań)
  // =========================================================================
  if (activeBeef) {
    const opp = state.npcs.find((n) => n.id === activeBeef.opponentId);
    const oppAlias = opp?.alias || 'rywalem';
    const dissTitle = activeBeef.playerDissTitle;
    const totalVotes = Math.max(1, activeBeef.playerVotes + activeBeef.opponentVotes);
    const playerPct = Math.round((activeBeef.playerVotes / totalVotes) * 100);
    const daysLeft = Math.max(1, activeBeef.votingEndDay - state.day);

    push(1, {
      id: 'beef_active_no_regrets',
      topicTag: `Beef vs ${oppAlias}`,
      prompt: `Cały RapPortal żyje Twoim dissem „${dissTitle}” wymierzonym w ${oppAlias}. Nie żałujesz, że odpaliłeś tę wojnę?`,
      options: [
        {
          label: '„Nie cofam ani jednego wersu. Ulica widzi prawdę.”',
          streetDelta: -9,
          hypeDelta: 10,
          fansDelta: fanScale(state, 280, 0.03),
          cashDelta: 0,
          reaction: 'Czat zapłonął! Cytat z wywiadu już krąży po wszystkich grupach rapowych.',
        },
        {
          label: '„To czysty sport na majku. Liczy się, kto ma lepsze pióro.”',
          streetDelta: 3,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.025),
          cashDelta: cashScale(state, 500),
          reaction: 'Słuchacze docenili sportowe podejście i klasę w studiu.',
        },
        {
          label: '„Zrobiłem mu największą promocję w karierze — niech dziękuje.”',
          streetDelta: 7,
          hypeDelta: 9,
          fansDelta: fanScale(state, 250, 0.028),
          cashDelta: cashScale(state, 800),
          reaction: 'Zuchwała riposta trafiła od razu na nagłówki portali muzycznych.',
        },
      ],
    });

    if (!activeBeef.responded) {
      push(1, {
        id: 'beef_active_waiting_reply',
        topicTag: `Cisza po „${dissTitle}”`,
        prompt: `${oppAlias} wciąż milczy po premierze „${dissTitle}”. Myślisz, że siedzi w kabinie i pisze odpowiedź, czy po prostu wymiękł?`,
        options: [
          {
            label: '„Zegar tyka. Albo wrzuca odpowiedź, albo oddaje pas walkowerem.”',
            streetDelta: -8,
            hypeDelta: 9,
            fansDelta: fanScale(state, 240, 0.026),
            cashDelta: 0,
            reaction: 'Fani zasypują profil rywala komentarzami z ikoną klepsydry!',
          },
          {
            label: '„Daję mu czas. Wolę dostać mocny diss niż wrzutkę pisaną na kolanie.”',
            streetDelta: 2,
            hypeDelta: 6,
            fansDelta: fanScale(state, 190, 0.022),
            cashDelta: cashScale(state, 400),
            reaction: 'Komentatorzy chwalą pewność siebie i chłodną głowę.',
          },
        ],
      });
    } else {
      push(1, {
        id: 'beef_active_rival_reply',
        topicTag: `Odpowiedź: „${activeBeef.opponentDissTitle || 'Diss rywala'}”`,
        prompt: `${oppAlias} odpowiedział numerem „${activeBeef.opponentDissTitle || 'swój diss'}”. Który wers faktycznie Cię ubódł, a co wywołało tylko śmiech?`,
        options: [
          {
            label: '„Same puste frazesy. Mój numer „' + dissTitle + '” zjada to na śniadanie.”',
            streetDelta: -7,
            hypeDelta: 9,
            fansDelta: fanScale(state, 260, 0.028),
            cashDelta: 0,
            reaction: 'Ostry komentarz podkręca temperaturę głosowania na RapPortalu!',
          },
          {
            label: '„Jeden punchline był celny, szanuję rzemiosło — ale werdykt i tak należy do mnie.”',
            streetDelta: -2,
            hypeDelta: 7,
            fansDelta: fanScale(state, 230, 0.025),
            cashDelta: cashScale(state, 450),
            reaction: 'Dojrzała reakcja zaskoczyła nawet fanów przeciwnika.',
          },
          {
            label: '„Słucham liczb, nie jego krzyków. Sprawdźcie moje streamingi po tym beefie.”',
            streetDelta: 8,
            hypeDelta: 8,
            fansDelta: fanScale(state, 240, 0.027),
            cashDelta: cashScale(state, 900),
            reaction: 'Pewność siebie w stylu gwiazdy mainstreamu — sponsorzy klaszczą.',
          },
        ],
      });

      if (playerPct >= 52) {
        push(1, {
          id: 'beef_active_votes_leading',
          topicTag: `Głosowanie: ${playerPct}% dla Ciebie`,
          prompt: `W głosowaniu słuchaczy prowadzisz z ${oppAlias} wynikiem ${playerPct}% do ${100 - playerPct}%. Czujesz już zwycięstwo na ${daysLeft} dni przed końcem?`,
          options: [
            {
              label: '„Nie świętuję przed gongiem, ale ten beef już ma jednego wygranego.”',
              streetDelta: -6,
              hypeDelta: 8,
              fansDelta: fanScale(state, 250, 0.026),
              cashDelta: 0,
              reaction: 'Twoi słuchacze ruszyli masowo dorzucać kolejne głosy!',
            },
            {
              label: '„Sondaż sondażem — prawdziwa wygrana to nowi fani, którzy zostają po burzy.”',
              streetDelta: 6,
              hypeDelta: 7,
              fansDelta: fanScale(state, 270, 0.03),
              cashDelta: cashScale(state, 700),
              reaction: 'Rozsądna odpowiedź przyciągnęła też bardziej neutralnych słuchaczy.',
            },
          ],
        });
      } else {
        push(1, {
          id: 'beef_active_votes_trailing',
          topicTag: `Walka na głosy (${playerPct}%)`,
          prompt: `Na ten moment masz ${playerPct}% głosów w starciu z ${oppAlias}. Zamierzasz odwrócić ten wynik, czy ten beef wymyka się spod kontroli?`,
          options: [
            {
              label: '„Głosowanie trwa jeszcze ' + daysLeft + ' dni. Zobaczycie, kto śmieje się ostatni.”',
              streetDelta: -8,
              hypeDelta: 10,
              fansDelta: fanScale(state, 290, 0.03),
              cashDelta: 0,
              reaction: 'Pełna mobilizacja! Twoi fani udostępniają link do głosowania.',
            },
            {
              label: '„Internet lubi szum, ale mój diss „' + dissTitle + '” obroni się za pięć lat.”',
              streetDelta: -3,
              hypeDelta: 6,
              fansDelta: fanScale(state, 200, 0.022),
              cashDelta: cashScale(state, 400),
              reaction: 'Koneserzy rapu przyznają Ci rację w sekcji komentarzy.',
            },
          ],
        });
      }
    }

    push(1, {
      id: 'beef_active_lines_crossed',
      topicTag: `Granice w beefie`,
      prompt: `W środowisku mówi się, że Twój spór z ${oppAlias} robi się coraz bardziej osobisty. Masz jakieś czerwone linie, których na dissie nie przekraczasz?`,
      options: [
        {
          label: '„Rodzina jest święta, ale wszystko co robi na scenie to otwarty cel.”',
          streetDelta: -5,
          hypeDelta: 7,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: cashScale(state, 350),
          reaction: 'Zasady starej szkoły zyskały szacunek po obu stronach barykady.',
        },
        {
          label: '„Na wojnie nie ma regulaminu. Skoro wszedł na ring, bierze wszystko na klatę.”',
          streetDelta: -10,
          hypeDelta: 11,
          fansDelta: fanScale(state, 260, 0.028),
          cashDelta: 0,
          reaction: 'Bezkompromisowa deklaracja wywołała gorącą dyskusję na portalu.',
        },
        {
          label: '„To ma być show i emocje dla słuchaczy, nie prawdziwa krew na ulicy.”',
          streetDelta: 9,
          hypeDelta: 6,
          fansDelta: fanScale(state, 210, 0.024),
          cashDelta: cashScale(state, 850),
          reaction: 'Partnerzy reklamowi odetchnęli z ulgą — stawki zostają bez zmian.',
        },
      ],
    });

    push(1, {
      id: 'beef_active_sponsors',
      topicTag: `Biznes a konflikt`,
      prompt: `Czy otwarty beef z ${oppAlias} nie odstrasza marek i organizatorów koncertów, czy wręcz przeciwnie — teraz dzwonią jeszcze częściej?`,
      options: [
        {
          label: '„Kogo obchodzą marki? Jak ktoś boi się prawdy, to nie mój partner.”',
          streetDelta: -9,
          hypeDelta: 8,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: 0,
          reaction: 'Podziemie bije brawo za kręgosłup i zero kalkulacji.',
        },
        {
          label: '„Kontrowersja sprzedaje bilety. Telefon w sprawie koncertów właśnie płonie.”',
          streetDelta: 8,
          hypeDelta: 9,
          fansDelta: fanScale(state, 250, 0.026),
          cashDelta: cashScale(state, 1100),
          reaction: 'Szczerość biznesowa zrobiła wrażenie na menedżerach z całej Polski.',
        },
      ],
    });

    push(1, {
      id: 'beef_active_reconciliation',
      topicTag: `Co po beefie?`,
      prompt: `Wyobrażasz sobie, że po zakończeniu beefu z ${oppAlias} jeszcze kiedyś podacie sobie rękę albo staniecie na jednej scenie?`,
      options: [
        {
          label: '„Nie ma mowy. Spalone mosty dają najlepsze światło w nocy.”',
          streetDelta: -8,
          hypeDelta: 9,
          fansDelta: fanScale(state, 230, 0.024),
          cashDelta: 0,
          reaction: 'Ten cytat już ląduje jako opis pod dziesiątkami filmików na sieci.',
        },
        {
          label: '„W hip-hopie bywały większe zgody. Jeśli odda szacunek, pogadamy.”',
          streetDelta: 4,
          hypeDelta: 6,
          fansDelta: fanScale(state, 210, 0.023),
          cashDelta: cashScale(state, 550),
          reaction: 'Dyplomatyczna odpowiedź pokazała, że panujesz nad emocjami.',
        },
      ],
    });
  }

  // =========================================================================
  // 2. ZAKOŃCZONY BEEF / HISTORIA KONFLIKTÓW (4 pytania)
  // =========================================================================
  if (resolvedBeef) {
    const opp = state.npcs.find((n) => n.id === resolvedBeef.opponentId);
    const oppAlias = opp?.alias || 'dawny rywal';

    if (resolvedBeef.winner === 'player') {
      push(2, {
        id: 'beef_won_aftermath',
        topicTag: `Triumf nad ${oppAlias}`,
        prompt: `Wygrałeś głośny beef z ${oppAlias} numerem „${resolvedBeef.playerDissTitle}”. Czujesz, że teraz reszta sceny dwa razy się zastanowi, zanim zaczepi ${state.player.alias}?`,
        options: [
          {
            label: '„Każdy widział wynik. Mikrofon to moja broń i nie boję się jej użyć.”',
            streetDelta: -8,
            hypeDelta: 8,
            fansDelta: fanScale(state, 240, 0.025),
            cashDelta: 0,
            reaction: 'Twoja reputacja niepokonanego zawodnika rośnie jeszcze mocniej.',
          },
          {
            label: '„Zamykam ten rozdział. Teraz wolę wygrywać płytami i wyprzedanymi halami.”',
            streetDelta: 7,
            hypeDelta: 7,
            fansDelta: fanScale(state, 250, 0.027),
            cashDelta: cashScale(state, 800),
            reaction: 'Ruch godny lidera — media chwalą ambicję.',
          },
        ],
      });
    } else {
      push(2, {
        id: 'beef_lost_comeback',
        topicTag: `Lekcja po starciu z ${oppAlias}`,
        prompt: `W głosowaniu przeciwko ${oppAlias} tym razem zabrakło Ci głosów. Jak podnosisz się po takiej porażce w oczach całej sceny?`,
        options: [
          {
            label: '„Porażka to najlepsze paliwo. Wracam do kabiny dziesięć razy głodniejszy.”',
            streetDelta: -6,
            hypeDelta: 9,
            fansDelta: fanScale(state, 240, 0.026),
            cashDelta: 0,
            reaction: 'Słuchacze szanują pokorę i sportową złość — hype wraca na tory!',
          },
          {
            label: '„Sondaż w sieci to nie cała kariera. Najlepszą zemstą będzie mój kolejny hit.”',
            streetDelta: 6,
            hypeDelta: 7,
            fansDelta: fanScale(state, 220, 0.025),
            cashDelta: cashScale(state, 600),
            reaction: 'Chłodny dystans uciszył szyderców w komentarzach.',
          },
        ],
      });
    }

    push(2, {
      id: 'beef_legacy_diss',
      topicTag: `Kulisy „${resolvedBeef.playerDissTitle}”`,
      prompt: `Wielu fanów wciąż wraca do Twojego dissu „${resolvedBeef.playerDissTitle}”. Jak szybko powstał tamten tekst — w jedną noc czy pod chłodną kalkulacją?`,
      options: [
        {
          label: '„Jedna bezsenna noc, kawa i czyste emocje. Tak powstają najlepsze wersy.”',
          streetDelta: -7,
          hypeDelta: 7,
          fansDelta: fanScale(state, 200, 0.022),
          cashDelta: 0,
          reaction: 'Fani uwielbiają takie zakulisowe historie ze studia.',
        },
        {
          label: '„Każda linijka była rozpisana jak partia szachów, żeby trafić dokładnie w punkt.”',
          streetDelta: 4,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.022),
          cashDelta: cashScale(state, 450),
          reaction: 'Analitycy rapu podziwiają warsztat i dyscyplinę.',
        },
      ],
    });
  }

  // =========================================================================
  // 3. KONKRETNY WYDANY SINGIEL / UTWÓR & PRODUKCJA (10 pytań)
  // =========================================================================
  if (latestTrack) {
    const styleName = BEAT_STYLE_LABELS[latestTrack.beatStyle];
    const isFresh = state.day - latestTrack.releaseDay <= 6;

    push(isFresh ? 1 : 2, {
      id: 'track_sound_direction',
      topicTag: `Singiel „${latestTrack.title}”`,
      prompt: `Twój numer „${latestTrack.title}” (${styleName}, ${latestTrack.bpm} BPM) odbił się szerokim echem. Skąd decyzja akurat o takim brzmieniu?`,
      options: [
        {
          label: '„Szukałem brudnego, ciężkiego bębnienia, które dobrze niesie się w słuchawkach nocą.”',
          streetDelta: -7,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.024),
          cashDelta: 0,
          reaction: 'Koneserzy brzmienia propsują klimat i konsekwencję.',
        },
        {
          label: '„Ten rytm od razu buja klub i festiwalową scenę — wiedziałem, że to zadziała.”',
          streetDelta: 8,
          hypeDelta: 8,
          fansDelta: fanScale(state, 260, 0.028),
          cashDelta: cashScale(state, 700),
          reaction: 'DJ-e klubowi już dopisują Twój numer do weekendowych setów.',
        },
        {
          label: '„Lubię łamać schematy. Jeśli wszyscy robią jedno tempo, ja idę pod prąd.”',
          streetDelta: 0,
          hypeDelta: 8,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 350),
          reaction: 'Redaktor przytakuje — świeże podejście budzi ciekawość.',
        },
      ],
    });

    push(isFresh ? 1 : 2, {
      id: 'track_lyrics_craft',
      topicTag: `Tekst w „${latestTrack.title}”`,
      prompt: `Słuchacze rozbierają na części pierwsze Twoje rymy w „${latestTrack.title}” (ocena tekstu ${latestTrack.lyricScore}/100). Piszesz wszystko od ręki na bicie, czy zbierasz linijki w notatniku tygodniami?`,
      options: [
        {
          label: '„Włączam pętlę w studiu i pierwsze skojarzenia są najprawdziwsze.”',
          streetDelta: -6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 200, 0.022),
          cashDelta: 0,
          reaction: 'Spontaniczność i autentyczność trafiają prosto do słuchaczy.',
        },
        {
          label: '„Szlifuję każde wielokrotne rymy jak diament. Zero przypadkowych zapychaczy.”',
          streetDelta: -2,
          hypeDelta: 8,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 400),
          reaction: 'Techniczni słuchacze doceniają szacunek do warsztatu.',
        },
        {
          label: '„Najważniejszy jest chwytliwy refren, który tysiące gardeł wykrzyczą pod sceną.”',
          streetDelta: 8,
          hypeDelta: 8,
          fansDelta: fanScale(state, 260, 0.028),
          cashDelta: cashScale(state, 750),
          reaction: 'Zasięgi na playlistach właśnie dostały solidnego kopa.',
        },
      ],
    });

    push(2, {
      id: 'track_viral_vs_timeless',
      topicTag: `Trwałość muzyki`,
      prompt: `Po premierze „${latestTrack.title}” zapytam wprost: wolisz jeden gigantyczny viral, który znika po miesiącu, czy katalog numerów słuchanych za dziesięć lat?`,
      options: [
        {
          label: '„Klasyki buduje się na lata. Modę zostawiam sezonowcom.”',
          streetDelta: -8,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.023),
          cashDelta: 0,
          reaction: 'Stara gwardia i wierni fani zgadzają się w stu procentach.',
        },
        {
          label: '„Czemu nie oba? Dobry viral otwiera drzwi, a mocny katalog zamyka usta hejterom.”',
          streetDelta: 6,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.027),
          cashDelta: cashScale(state, 650),
          reaction: 'Mądre połączenie ambicji i strategii — świetny odbiór!',
        },
      ],
    });

    if (latestTrack.streams >= 8000) {
      push(1, {
        id: 'track_streams_explosion',
        topicTag: `Liczby: ${fmtNum(latestTrack.streams)} odsłuchań`,
        prompt: `„${latestTrack.title}” przekroczyło już ${fmtNum(latestTrack.streams)} streamów! Spodziewałeś się, że ten konkretny kawałek aż tak zażre?`,
        options: [
          {
            label: '„Kiedy usłyszałem finalny miks, wiedziałem, że to rozsadzi głośniki.”',
            streetDelta: 5,
            hypeDelta: 9,
            fansDelta: fanScale(state, 270, 0.03),
            cashDelta: cashScale(state, 750),
            reaction: 'Pewność siebie poparta liczbami robi ogromne wrażenie.',
          },
          {
            label: '„Pisałem to dla siebie i swoich ludzi. Reszta to tylko miły bonus.”',
            streetDelta: -7,
            hypeDelta: 7,
            fansDelta: fanScale(state, 220, 0.024),
            cashDelta: 0,
            reaction: 'Skromność w momencie sukcesu rozbroiła studio.',
          },
        ],
      });
    }
  }

  if (latestDissTrack && !activeBeef) {
    push(2, {
      id: 'track_diss_recall',
      topicTag: `Ostrze „${latestDissTrack.title}”`,
      prompt: `W Twojej dyskografii mocno wyróżnia się diss „${latestDissTrack.title}”. Czy ostry, konfrontacyjny rap to Twój żywioł?`,
      options: [
        {
          label: '„Kiedy ktoś wchodzi mi w drogę, nie milczę. Takie są zasady tej gry.”',
          streetDelta: -8,
          hypeDelta: 8,
          fansDelta: fanScale(state, 210, 0.024),
          cashDelta: 0,
          reaction: 'Fani uwielbiają ten bezkompromisowy pazur.',
        },
        {
          label: '„Wolę tworzyć pełne albumy niż żyć z dramatów, ale rękawicy nie odmawiam.”',
          streetDelta: 3,
          hypeDelta: 6,
          fansDelta: fanScale(state, 190, 0.022),
          cashDelta: cashScale(state, 450),
          reaction: 'Wyważona odpowiedź buduje obraz dojrzałego gracza.',
        },
      ],
    });
  }

  if (latestFeatTrack) {
    const guest = state.npcs.find((n) => n.id === latestFeatTrack.featNpcId);
    if (guest) {
      push(1, {
        id: 'track_feat_chemistry',
        topicTag: `Kooperacja z ${guest.alias}`,
        prompt: `Wspólny kawałek „${latestFeatTrack.title}” z ${guest.alias} narobił sporo szumu. Jak pracowało się w studiu — była chemia od pierwszego podejścia?`,
        options: [
          {
            label: `„Z ${guest.alias} rozumiemy się bez słów. To na pewno nie nasz ostatni numer.”`,
            streetDelta: -3,
            hypeDelta: 8,
            fansDelta: fanScale(state, 260, 0.028),
            cashDelta: cashScale(state, 400),
            reaction: `Fani obu stron już domagają się wspólnej EP-ki z ${guest.alias}!`,
          },
          {
            label: '„Każdy chciał położyć lepszą zwrotkę niż drugi — zdrowa rywalizacja podniosła poprzeczkę.”',
            streetDelta: -6,
            hypeDelta: 9,
            fansDelta: fanScale(state, 240, 0.026),
            cashDelta: 0,
            reaction: 'Słuchacze natychmiast wracają sprawdzić, kto zjadł ten bit.',
          },
        ],
      });
    }
  }

  if (certTrack) {
    const certLabel =
      certTrack.cert === 'diamond' ? 'Diamentowa' : certTrack.cert === 'platinum' ? 'Platynowa' : 'Złota';
    push(1, {
      id: 'track_cert_pride',
      topicTag: `${certLabel} Płyta: „${certTrack.title}”`,
      prompt: `„${certTrack.title}” ma już status: ${certLabel}! Gdzie wisi wyróżnienie i czy zmieniło coś w Twojej głowie?`,
      options: [
        {
          label: '„Wisi u mamy na ścianie. Ja już myślę o kolejnym numerze, który przebije ten wynik.”',
          streetDelta: -4,
          hypeDelta: 8,
          fansDelta: fanScale(state, 270, 0.03),
          cashDelta: cashScale(state, 500),
          reaction: 'Ciepła, szczera odpowiedź zyskała tysiące serduszek w sieci.',
        },
        {
          label: '„To dopiero początek kolekcji. Celuję w całą ścianę platyny i diamentu.”',
          streetDelta: 7,
          hypeDelta: 9,
          fansDelta: fanScale(state, 290, 0.032),
          cashDelta: cashScale(state, 1000),
          reaction: 'Gwiazdorski rozmach podbił nagłówki portali branżowych.',
        },
      ],
    });
  }

  if (latestProdTrack) {
    push(2, {
      id: 'track_prod_commission',
      topicTag: `Produkcja [${state.player.producerTag}]`,
      prompt: `Nie tylko rapujesz, ale też sprzedajesz bity innym raperom z podpisem „${state.player.producerTag}”. Nie żal oddawać najmocniejszych pętli konkurencji?`,
      options: [
        {
          label: '„Najcięższe bity zawsze zostają w moim sejfie, ale dobra produkcja buduje imperium.”',
          streetDelta: 4,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.024),
          cashDelta: cashScale(state, 800),
          reaction: 'Producenci i raperzy z całej Polski doceniają Twój zmysł.',
        },
        {
          label: '„Dobry bit musi żyć. Jeśli inny kot go udźwignie, wygrywa cała polska scena.”',
          streetDelta: -5,
          hypeDelta: 7,
          fansDelta: fanScale(state, 220, 0.025),
          cashDelta: cashScale(state, 350),
          reaction: 'Szacunek za kulturę hip-hopową i brak zawiści!',
        },
      ],
    });
  }

  if (vaultTracks.length > 0) {
    push(2, {
      id: 'track_vault_secrets',
      topicTag: `Skarbiec (${vaultTracks.length} szt.)`,
      prompt: `Krążą plotki, że masz już w skarbcu ${vaultTracks.length} gotowych, niewydanych numerów. Szykujesz z tego większą płytę czy testujesz słuchaczy cierpliwością?`,
      options: [
        {
          label: '„Składam spójny projekt od pierwszego do ostatniego kawałka. Warto poczekać.”',
          streetDelta: -3,
          hypeDelta: 9,
          fansDelta: fanScale(state, 230, 0.026),
          cashDelta: 0,
          reaction: 'W sieci natychmiast ruszyły spekulacje o dacie premiery płyty!',
        },
        {
          label: '„Zawsze mam w zapasie amunicję. Jak trzeba będzie, mogę zrzucić bombę z dnia na dzień.”',
          streetDelta: -6,
          hypeDelta: 10,
          fansDelta: fanScale(state, 250, 0.027),
          cashDelta: cashScale(state, 400),
          reaction: 'Komentarze płoną — hype przed premierą szybuje w górę.',
        },
      ],
    });
  }

  push(3, {
    id: 'track_producer_tag',
    topicTag: `Tag „${state.player.producerTag}”`,
    prompt: `Twój tag producencki „${state.player.producerTag}” staje się znakiem rozpoznawczym. Dlaczego sam siadasz za bitmaszyną zamiast brać gotowce z internetu?`,
    options: [
      {
        label: '„Kiedy sam kroisz bębny, kontrolujesz 100% klimatu. Nikt nie podrobi tego brzmienia.”',
        streetDelta: -7,
        hypeDelta: 7,
        fansDelta: fanScale(state, 190, 0.022),
        cashDelta: 0,
        reaction: 'Beatmakerzy z całej Polski zostawiają płomienie pod wywiadem.',
      },
      {
        label: '„Zostają pełne prawa autorskie i 100% zysku z tantiem. Prosta matematyka.”',
        streetDelta: 7,
        hypeDelta: 7,
        fansDelta: fanScale(state, 210, 0.024),
        cashDelta: cashScale(state, 750),
        reaction: 'Młodzi artyści notują tę lekcję biznesu muzycznego.',
      },
    ],
  });

  // =========================================================================
  // 4. WYDANA EP-KA LUB ALBUM (6 pytań)
  // =========================================================================
  if (latestProject) {
    const isFreshProj = state.day - latestProject.releaseDay <= 8;
    const fmt = latestProject.format;

    push(isFreshProj ? 1 : 2, {
      id: 'project_concept',
      topicTag: `${fmt} „${latestProject.title}”`,
      prompt: `Twój projekt ${fmt} „${latestProject.title}” (${latestProject.trackIds.length} utworów) zbiera mocne recenzje. Jaka myśl przewodnia spina całą tracklistę?`,
      options: [
        {
          label: '„To pamiętnik drogi z małego pokoju na największe sceny — bez cenzury.”',
          streetDelta: -6,
          hypeDelta: 8,
          fansDelta: fanScale(state, 260, 0.028),
          cashDelta: 0,
          reaction: 'Fani odpalają płytę jeszcze raz, szukając ukrytych nawiązań.',
        },
        {
          label: '„Chciałem nagrać krążek, który brzmi światowo i podnosi poprzeczkę całej branży.”',
          streetDelta: 7,
          hypeDelta: 9,
          fansDelta: fanScale(state, 290, 0.032),
          cashDelta: cashScale(state, 850),
          reaction: 'Krytycy muzyczni cytują Twoje słowa w recenzjach miesiąca.',
        },
      ],
    });

    push(2, {
      id: 'project_sales_cert',
      topicTag: `Odbiór „${latestProject.title}”`,
      prompt: `„${latestProject.title}” ma już ${fmtNum(latestProject.streams)} streamów i ${latestProject.sales.toLocaleString('pl-PL')} sprzedanych egzemplarzy. Patrzysz codziennie w statystyki po premierze?`,
      options: [
        {
          label: '„Zerkam, nie będę ściemniał — ale najważniejsze są wiadomości od ludzi po koncertach.”',
          streetDelta: -2,
          hypeDelta: 7,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 400),
          reaction: 'Szczera, ludzka odpowiedź zyskała ogromną sympatię widzów.',
        },
        {
          label: '„Liczby nie kłamią. Każdy tysiąc sprzedanych płyt to dowód, że strategia działa.”',
          streetDelta: 8,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.028),
          cashDelta: cashScale(state, 900),
          reaction: 'Branża widzi w Tobie gracza z głową do wielkiego biznesu.',
        },
      ],
    });

    push(2, {
      id: 'project_critics_review',
      topicTag: `Recenzje „${latestProject.title}”`,
      prompt: `Recenzenci ostro spierają się o „${latestProject.title}” — jedni dają pełną pulę, inni kręcą nosem. Czytasz komentarze po premierze?`,
      options: [
        {
          label: '„Słucham krytyki tylko od ludzi, którzy sami kiedykolwiek napisali dobrą zwrotkę.”',
          streetDelta: -8,
          hypeDelta: 9,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: 0,
          reaction: 'Klasyczna, twarda riposta obiegła cały RapPortal.',
        },
        {
          label: '„Skoro jedni kochają, a drudzy dyskutują — znaczy, że nie nagrałem letniego produktu.”',
          streetDelta: 4,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.027),
          cashDelta: cashScale(state, 600),
          reaction: 'Świetna puenta — prowadzący nie kryje uznania.',
        },
      ],
    });

    push(2, {
      id: 'project_physical_vs_stream',
      topicTag: `Fizyki i preorder`,
      prompt: `Po premierze „${latestProject.title}” uważasz, że w erze streamingu wydania fizyczne CD i winyle mają jeszcze sens?`,
      options: [
        {
          label: '„Płyta na półce z dopracowaną okładką to relikwia. Prawdziwi fani zawsze ją kupią.”',
          streetDelta: -6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: cashScale(state, 650),
          reaction: 'Kolekcjonerzy ruszyli zamawiać kolejne egzemplarze!',
        },
        {
          label: '„Przyszłość to streaming i szybki zasięg na cały świat, nie plastikowe pudełka.”',
          streetDelta: 8,
          hypeDelta: 7,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: cashScale(state, 500),
          reaction: 'Wywołałeś żywą debatę między młodym a starszym pokoleniem słuchaczy.',
        },
      ],
    });

    push(2, {
      id: 'project_next_era',
      topicTag: `Co po „${latestProject.title}”?`,
      prompt: `Poprzeczka po „${latestProject.title}” wisi bardzo wysoko. Następny krążek będzie jeszcze mroczniejszy, czy zaskoczysz zupełnie nowym brzmieniem?`,
      options: [
        {
          label: '„Wracam do korzeni — jeszcze bardziej surowo, ciężko i bez żadnych kompromisów.”',
          streetDelta: -9,
          hypeDelta: 8,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: 0,
          reaction: 'Podziemie już zaciera ręce na kolejny materiał.',
        },
        {
          label: '„Nie stoję w miejscu. Kolejna płyta otworzy zupełnie nowy rozdział mojego brzmienia.”',
          streetDelta: 6,
          hypeDelta: 9,
          fansDelta: fanScale(state, 260, 0.028),
          cashDelta: cashScale(state, 700),
          reaction: 'Ciekawość mediów i słuchaczy właśnie podskoczyła!',
        },
      ],
    });
  }

  // =========================================================================
  // 5. MARKA ODZIEŻOWA & DROPY (4 pytania)
  // =========================================================================
  if (state.brand) {
    const brandName = state.brand.name;

    if (latestDrop) {
      push(1, {
        id: 'brand_latest_drop',
        topicTag: `Drop „${latestDrop.name}”`,
        prompt: `Twój drop „${latestDrop.name}” pod szyldem ${brandName} (${latestDrop.soldOut ? 'wyprzedany w 100%!' : `${latestDrop.soldUnits}/${latestDrop.totalUnits} szt.`}) narobił szumu. Jesteś dziś bardziej raperem czy szefem marki?`,
        options: [
          {
            label: '„Muzyka zawsze na pierwszym miejscu — ciuchy to zbroja dla moich ludzi.”',
            streetDelta: -7,
            hypeDelta: 7,
            fansDelta: fanScale(state, 220, 0.025),
            cashDelta: cashScale(state, 450),
            reaction: 'Fani doceniają szczerość i pytają w czacie o kolejny drop.',
          },
          {
            label: '„Buduję imperium 360 stopni. Muzyka, moda, pełna niezależność finansowa.”',
            streetDelta: 8,
            hypeDelta: 9,
            fansDelta: fanScale(state, 260, 0.028),
            cashDelta: cashScale(state, 1400),
            reaction: 'Po wywiadzie sklep internetowy zanotował skok zamówień!',
          },
        ],
      });
    }

    push(2, {
      id: 'brand_quality_price',
      topicTag: `Marka ${brandName}`,
      prompt: `Sceptycy mówią, że raperski streetwear to często zwykła koszulka z logo za duże pieniądze. Czym broni się ${brandName}?`,
      options: [
        {
          label: '„Gruba gramatura, polska szwalnia i kroje, w których sam chodzę po mieście.”',
          streetDelta: -5,
          hypeDelta: 7,
          fansDelta: fanScale(state, 200, 0.022),
          cashDelta: cashScale(state, 600),
          reaction: 'Zaufanie do marki rośnie — klienci chwalą jakość w komentarzach.',
        },
        {
          label: '„Płacisz za limitowany nakład i styl, którego nie kupisz w żadnej sieciówce.”',
          streetDelta: 7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: cashScale(state, 1100),
          reaction: 'Kolekcjonerzy limitowanych dropów już polują na następną serię.',
        },
      ],
    });

    push(2, {
      id: 'brand_future_collab',
      topicTag: `Plany ${brandName}`,
      prompt: `Widzisz markę ${brandName} w prestiżowych butikach i na zagranicznych wybiegach, czy ma pozostać zamkniętą sprawą dla wtajemniczonych?`,
      options: [
        {
          label: '„Dla swoich z osiedla i koncertów — nie chcę widzieć tego w każdym centrum handlowym.”',
          streetDelta: -8,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.023),
          cashDelta: cashScale(state, 300),
          reaction: 'Elitarny charakter marki tylko podbija jej kultowy status.',
        },
        {
          label: '„Chcę podbić ulice Warszawy, Berlina i Londynu. Limitów nie uznaję.”',
          streetDelta: 8,
          hypeDelta: 9,
          fansDelta: fanScale(state, 250, 0.026),
          cashDelta: cashScale(state, 1200),
          reaction: 'Ambitna wizja przyciągnęła uwagę magazynów modowych.',
        },
      ],
    });
  }

  // =========================================================================
  // 6. WYTWÓRNIA MUZYCZNA (3 pytania)
  // =========================================================================
  if (state.label) {
    const labelName = state.label.name;
    const rosterCount = state.label.artists.length;

    push(2, {
      id: 'label_independence',
      topicTag: `Wytwórnia ${labelName}`,
      prompt: `Prowadzisz własny label „${labelName}” (${rosterCount} zakontraktowanych artystów). Łatwo pogodzić rolę rapera z fotelikiem szefa wytwórni?`,
      options: [
        {
          label: '„Nikt mi nie dyktuje dat premier ani cenzury. Ta wolność jest bezcenna.”',
          streetDelta: -6,
          hypeDelta: 8,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 600),
          reaction: 'Niezależni artyści z całego kraju cytują Twoje słowa.',
        },
        {
          label: '„Trzeba myśleć jak CEO: budżety, kontrakty, marketing. Zbudowałem maszynę.”',
          streetDelta: 8,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.028),
          cashDelta: cashScale(state, 1500),
          reaction: 'Branża patrzy z respektem — wizerunek rekina biznesu działa.',
        },
      ],
    });

    push(2, {
      id: 'label_contracts_fair',
      topicTag: `Kontrakty w ${labelName}`,
      prompt: `Młodzi raperzy marzą o kontrakcie w ${labelName}. Czego szukasz u zawodników, zanim położysz przed nimi papier?`,
      options: [
        {
          label: '„Głodu, charyzmy i własnego charakteru. Klonów z generatora nie podpisuję.”',
          streetDelta: -7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: cashScale(state, 400),
          reaction: 'Twoja skrzynka demo właśnie zapełniła się nowymi talentami.',
        },
        {
          label: '„Gotowości do ciężkiej pracy i potencjału na wyprzedanie dużych hal.”',
          streetDelta: 6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 1000),
          reaction: 'Profesjonalne podejście buduje prestiż Twojej wytwórni.',
        },
      ],
    });
  }

  // =========================================================================
  // 7. EKIPA (CREW) & RELACJE NA SCENIE (5 pytań)
  // =========================================================================
  if (state.crew) {
    const crewName = state.crew.name;
    push(2, {
      id: 'crew_chemistry',
      topicTag: `Ekipa ${crewName}`,
      prompt: `Założyłeś ekipę „${crewName}” (${state.crew.memberIds.length + 1} osoby w składzie). W rapie ekipy często rozpadają się o ego i kasę — jak Wy trzymacie szyk?`,
      options: [
        {
          label: '„Zasady są jasne od dnia pierwszego: lojalność ponad wszystko, sukces dzielimy razem.”',
          streetDelta: -7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: 0,
          reaction: 'Fani ekipy „' + crewName + '” odpalają racę w komentarzach!',
        },
        {
          label: '„Każdy wnosi inną jakość i napędzamy się nawzajem jak dobrze naoliwiony zespół.”',
          streetDelta: 4,
          hypeDelta: 7,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 650),
          reaction: 'Profesjonalny obraz kolektywu budzi szacunek branży.',
        },
      ],
    });
  }

  if (allyNpc) {
    push(2, {
      id: 'scene_ally_respect',
      topicTag: `Relacja z ${allyNpc.alias}`,
      prompt: `Słuchacze widzą, że dobrze dogadujesz się z ${allyNpc.alias} (${allyNpc.city}). Czy z tej przyjaźni wyjdzie kiedyś wspólna płyta albo duża trasa?`,
      options: [
        {
          label: `„${allyNpc.alias} to prawdziwy zawodnik. Jak siądziemy w studiu, pójdą iskry.”`,
          streetDelta: -4,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: cashScale(state, 350),
          reaction: `Fani ${allyNpc.alias} właśnie zaczęli obserwować Twój profil!`,
        },
        {
          label: '„Szanujemy się bardzo, a biznesowe ruchy ogłosimy, kiedy podpiszemy terminy.”',
          streetDelta: 6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.023),
          cashDelta: cashScale(state, 700),
          reaction: 'Tajemnicza zapowiedź rozbudziła apetyt całej sceny.',
        },
      ],
    });
  }

  if (rivalNpc) {
    push(1, {
      id: 'scene_rival_tension',
      topicTag: `Napięcie z ${rivalNpc.alias}`,
      prompt: `Nie jest tajemnicą, że między Tobą a ${rivalNpc.alias} iskrzy od dłuższego czasu. Wisi w powietrzu oficjalny diss?`,
      options: [
        {
          label: `„Jeśli ${rivalNpc.alias} jeszcze raz rzuci moją ksywką, dostanie odpowiedź w 24 godziny.”`,
          streetDelta: -9,
          hypeDelta: 10,
          fansDelta: fanScale(state, 250, 0.028),
          cashDelta: 0,
          reaction: 'Napięcie na RapPortalu sięgnęło zenitu — wszyscy czekają na ruch rywala!',
        },
        {
          label: '„Nie karmię cudzego zasięgu. Mam ważniejsze rzeczy do zrobienia w studiu.”',
          streetDelta: 5,
          hypeDelta: 6,
          fansDelta: fanScale(state, 190, 0.022),
          cashDelta: cashScale(state, 500),
          reaction: 'Chłodna obojętność zabolała obóz rywala bardziej niż zaczepka.',
        },
      ],
    });
  }

  push(3, {
    id: 'scene_fake_friends',
    topicTag: `Prawdziwi vs sezonowcy`,
    prompt: `Im większe robisz liczby, tym więcej ludzi nagle klepie Cię po plecach. Jak rozpoznajesz, kto jest z Tobą szczerze, a kto liczy tylko na podpięcie pod hype?`,
    options: [
      {
        label: '„Pamiętam, kto odbierał telefon, gdy miałem puste konto. To wąskie grono się nie zmienia.”',
        streetDelta: -7,
        hypeDelta: 7,
        fansDelta: fanScale(state, 210, 0.024),
        cashDelta: 0,
        reaction: 'Autentyczność i lojalność zawsze bronią się same.',
      },
      {
        label: '„Oddzielam przyjaźń od biznesu. Z każdym można zrobić dobry deal, jeśli zasady są jasne.”',
        streetDelta: 7,
        hypeDelta: 6,
        fansDelta: fanScale(state, 200, 0.023),
        cashDelta: cashScale(state, 700),
        reaction: 'Zimna krew i doświadczenie — redaktor kiwa głową z uznaniem.',
      },
    ],
  });

  // =========================================================================
  // 8. TRASA KONCERTOWA, MAPA POLSKI & POLONIA (5 pytań)
  // =========================================================================
  if (state.concertsPlayed > 0) {
    push(2, {
      id: 'tour_energy_crowd',
      topicTag: `Scena na żywo (${state.concertsPlayed} konc.)`,
      prompt: `Masz już za sobą ${state.concertsPlayed} koncertów. Gdzie czujesz większy ogień — w ciasnym, zadymionym klubie czy przed wielką halą?`,
      options: [
        {
          label: '„Mały klub, pot na suficie i ludzie na wyciągnięcie ręki — tego nie zastąpi nic.”',
          streetDelta: -8,
          hypeDelta: 7,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: 0,
          reaction: 'Fani koncertowi wrzucają wspomnienia z Twoich występów.',
        },
        {
          label: '„Gdy kilkanaście tysięcy ludzi świeci latarkami na refrenie, przechodzą ciarki życia.”',
          streetDelta: 7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 260, 0.028),
          cashDelta: cashScale(state, 800),
          reaction: 'Agencje koncertowe już planują większe obiekty na następną trasę.',
        },
      ],
    });
  } else {
    push(3, {
      id: 'tour_dream_stage',
      topicTag: `Koncertowe plany`,
      prompt: `Jeszcze nie ruszyłeś w pełną trasę po Polsce. W którym mieście najbardziej chcesz usłyszeć tłum rapujący Twoje zwrotki?`,
      options: [
        {
          label: `„Najpierw chcę wyprzedać własne ${state.player.city}, a potem zdobyć każde województwo po kolei.”`,
          streetDelta: -6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.024),
          cashDelta: 0,
          reaction: `Lokalni słuchacze w ${state.player.city} już pytają o bilety!`,
        },
        {
          label: '„Celuję prosto w największe festiwale i stołeczne hale. Nie ma co zaczynać skromnie.”',
          streetDelta: 7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: cashScale(state, 550),
          reaction: 'Odważna deklaracja narobiła szumu na portalu.',
        },
      ],
    });
  }

  if (topRegionSupport >= 20) {
    push(2, {
      id: 'tour_strongest_region',
      topicTag: `Twierdza: ${topRegionName}`,
      prompt: `Twoje poparcie w województwie ${topRegionName} wynosi już ${topRegionSupport}%! Co takiego łączy Cię z tamtejszymi słuchaczami?`,
      options: [
        {
          label: '„Tam czuć ten sam głód i szczerość, o których nawijam w numerach.”',
          streetDelta: -6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: 0,
          reaction: `Województwo ${topRegionName} dumnie udostępnia fragment wywiadu!`,
        },
        {
          label: '„To moja baza wypadowa, ale niedługo cała mapa Polski zaświeci się w naszych barwach.”',
          streetDelta: 5,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.027),
          cashDelta: cashScale(state, 600),
          reaction: 'Fani z innych regionów od razu dopominają się o koncert u siebie!',
        },
      ],
    });
  }

  if (state.poloniaConcertsPlayed > 0) {
    push(2, {
      id: 'tour_polonia_abroad',
      topicTag: `Trasa Polonijna`,
      prompt: `Zagrałeś dla Polonii za granicą (${state.poloniaConcertsPlayed}x). Prawda to, że rodacy na emigracji bawią się jeszcze głośniej niż w kraju?`,
      options: [
        {
          label: '„To zupełnie inna tęsknota za polskim słowem. Roznieśli salę w drobny mak!”',
          streetDelta: -3,
          hypeDelta: 8,
          fansDelta: fanScale(state, 270, 0.03),
          cashDelta: cashScale(state, 700),
          reaction: 'Polonia w Londynie, Berlinie i Chicago zasypuje czat pozdrowieniami!',
        },
        {
          label: '„Świetny klimat i świetny rynek. Na pewno wrócę tam z jeszcze większym show.”',
          streetDelta: 7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.028),
          cashDelta: cashScale(state, 1100),
          reaction: 'Zagraniczni promotorzy już szykują kolejne zaproszenia.',
        },
      ],
    });
  }

  push(3, {
    id: 'tour_backstage_rider',
    topicTag: `Kulisy backstage'u`,
    prompt: `Trochę lżejsze pytanie od widzów: co musi być na backstage’u przed Twoim koncertem, żebyś wyszedł na scenę w 100% gotowy?`,
    options: [
      {
        label: '„Woda, cisza na pięć minut przed wyjściem i zaufana ekipa za plecami. Zero gwiazdorzenia.”',
        streetDelta: -6,
        hypeDelta: 6,
        fansDelta: fanScale(state, 180, 0.02),
        cashDelta: 0,
        reaction: 'Zero pozy — widzowie bardzo doceniają normalne podejście.',
      },
      {
        label: '„Profesjonalne nagłośnienie, dobra kawa i perfekcyjna organizacja. Lubię standard premium.”',
        streetDelta: 6,
        hypeDelta: 6,
        fansDelta: fanScale(state, 200, 0.022),
        cashDelta: cashScale(state, 550),
        reaction: 'Organizatorzy wiedzą, że mają do czynienia z profesjonalistą.',
      },
    ],
  });

  // =========================================================================
  // 9. ARENA FREESTYLE (4 pytania)
  // =========================================================================
  if (state.freestyleWins > 0) {
    push(2, {
      id: 'freestyle_streak_king',
      topicTag: `Arena Freestyle (${state.freestyleWins} wygr.)`,
      prompt: `Masz na koncie ${state.freestyleWins} wygranych bitew na Arenie Freestyle${state.freestyleStreak >= 2 ? ` i serię ${state.freestyleStreak} z rzędu` : ''}. Czego bitwy na wolno uczą rapera, czego nie da żadne studio?`,
      options: [
        {
          label: '„Stalowych nerwów. Jak potrafisz zgnieść rywala na żywo bez kartki, nic Cię nie złamie.”',
          streetDelta: -9,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: 0,
          reaction: 'Fani bitew freestyle ogłosili Cię jednym z najgroźniejszych graczy w kraju!',
        },
        {
          label: '„Refleksu i kontaktu z tłumem — dziś to samo wykorzystuję przy nagrywaniu hitów.”',
          streetDelta: 3,
          hypeDelta: 7,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: cashScale(state, 500),
          reaction: 'Świetna analiza — prowadzący chwali wszechstronność.',
        },
      ],
    });
  }

  push(3, {
    id: 'freestyle_vs_written',
    topicTag: `Wolny styl vs kartka`,
    prompt: `Odwieczny spór w hip-hopie: czy każdy szanujący się raper powinien umieć rzucić celny freestyle, czy liczy się wyłącznie efekt finalny na płycie?`,
    options: [
      {
        label: '„Freestyle to test prawdy. Jeśli nie umiesz nawinąć czterech wersów z głowy, nie jesteś MC.”',
        streetDelta: -9,
        hypeDelta: 8,
        fansDelta: fanScale(state, 220, 0.024),
        cashDelta: 0,
        reaction: 'Stara szkoła bije brawo, a część mainstreamu poczuła się wywołana do tablicy!',
      },
      {
        label: '„To dwie różne dyscypliny. Jedni wygrywają bitwy, inni piszą ponadczasowe albumy.”',
        streetDelta: 5,
        hypeDelta: 6,
        fansDelta: fanScale(state, 200, 0.022),
        cashDelta: cashScale(state, 450),
        reaction: 'Rozsądne, wyważone stanowisko zamknęło internetową kłótnię.',
      },
    ],
  });

  // =========================================================================
  // 10. GALA RAP AWARDS (4 pytania)
  // =========================================================================
  if (lastGala) {
    if (lastGala.playerAwards.length > 0) {
      push(1, {
        id: 'gala_winner_speech',
        topicTag: `Laureat Gali Sezon ${lastGala.season}`,
        prompt: `Na Gali Rap Awards (Sezon ${lastGala.season}) zgarnąłeś wyróżnienia: ${lastGala.playerAwards.join(', ')}! Jak smakuje ten sukces i jak utrzymać głód po zdobyciu statuetki?`,
        options: [
          {
            label: '„Statuetka jest piękna, ale na ulicy nikt nie daje taryfy ulgowej za wczorajsze nagrody.”',
            streetDelta: -7,
            hypeDelta: 9,
            fansDelta: fanScale(state, 290, 0.032),
            cashDelta: cashScale(state, 400),
            reaction: 'Mistrzowska pokora! Słuchacze szanują takie podejście.',
          },
          {
            label: '„To potwierdzenie, że ten sezon należał do mnie. W kolejnym biorę całą pulę!”',
            streetDelta: 7,
            hypeDelta: 10,
            fansDelta: fanScale(state, 320, 0.035),
            cashDelta: cashScale(state, 1200),
            reaction: 'Pewność siebie mistrza — nagłówki mediów oszalały!',
          },
        ],
      });
    } else {
      push(2, {
        id: 'gala_snubbed_fuel',
        topicTag: `Po Gali Sezon ${lastGala.season}`,
        prompt: `Podczas ostatniej Gali Rap Awards statuetkę Artysty Roku zgarnął ${lastGala.artistOfYear.artist}. Czujesz sportową złość, że zabrakło tam Twojej ksywki?`,
        options: [
          {
            label: '„Gratulacje dla wygranych, ale na następnej Gali nikt mnie już nie pominie.”',
            streetDelta: 4,
            hypeDelta: 9,
            fansDelta: fanScale(state, 250, 0.027),
            cashDelta: cashScale(state, 500),
            reaction: 'Ambitna zapowiedź napędza wyścig o kolejny sezon!',
          },
          {
            label: '„Nie robię muzyki dla jury w garniturach. Moją nagrodą są ludzie pod sceną.”',
            streetDelta: -8,
            hypeDelta: 8,
            fansDelta: fanScale(state, 240, 0.026),
            cashDelta: 0,
            reaction: 'Publiczność nagrodziła tę odpowiedź głośnymi oklaskami.',
          },
        ],
      });
    }
  }

  if (daysToGala <= 18) {
    push(1, {
      id: 'gala_upcoming_hype',
      topicTag: `Gala już za ${daysToGala} dni`,
      prompt: `Do wielkiej Gali Rap Awards zostało już tylko ${daysToGala} dni. Szykujesz przemowę zwycięzcy, czy podchodzisz do tego na totalnym luzie?`,
      options: [
        {
          label: '„Jak mnie wywołają na scenę, powiem prosto z serca — bez kartki.”',
          streetDelta: -4,
          hypeDelta: 8,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: 0,
          reaction: 'Naturalność i luz budują świetną aurę przed Galą.',
        },
        {
          label: '„Garnitur gotowy, miejsce na półce wolne. Ten sezon będzie nasz!”',
          streetDelta: 7,
          hypeDelta: 9,
          fansDelta: fanScale(state, 270, 0.029),
          cashDelta: cashScale(state, 800),
          reaction: 'Bukmacherzy i dziennikarze od razu podnieśli Twoje szanse!',
        },
      ],
    });
  }

  push(3, {
    id: 'gala_awards_meaning',
    topicTag: `Sens nagród branżowych`,
    prompt: `Powiedz szczerze: czy nagrody typu Gala Rap Awards mają dziś realne znaczenie, czy to już tylko czerwony dywan dla kamer?`,
    options: [
      {
        label: '„Zawsze miło odebrać docenienie, ale historia pamięta płyty, nie statuetki.”',
        streetDelta: -5,
        hypeDelta: 6,
        fansDelta: fanScale(state, 190, 0.022),
        cashDelta: cashScale(state, 300),
        reaction: 'Mądra refleksja — zero nadęcia, sama prawda.',
      },
      {
        label: '„To wielkie święto naszej kultury. Hip-hop zasłużył na największe gale w kraju.”',
        streetDelta: 7,
        hypeDelta: 7,
        fansDelta: fanScale(state, 220, 0.024),
        cashDelta: cashScale(state, 700),
        reaction: 'Organizatorzy i media muzyczne ciepło komentują Twoje słowa.',
      },
    ],
  });

  // =========================================================================
  // 11. KARIERA, KORZENIE, STUDIO, KASA, STYL & FILOZOFIA (11 pytań)
  // =========================================================================
  push(3, {
    id: 'roots_hometown',
    topicTag: `Korzenie: ${state.player.city}`,
    prompt: `Startowałeś w ${state.player.city} z dziewięcioma stówami w kieszeni. Czy tamte ulice wciąż słychać w każdym Twoim wersie?`,
    options: [
      {
        label: `„${state.player.city} ukształtowało mój charakter — nigdy nie wyprę się korzeni.”`,
        streetDelta: -8,
        hypeDelta: 7,
        fansDelta: fanScale(state, 230, 0.026),
        cashDelta: 0,
        reaction: `Twoje rodzinne miasto pęka z dumy! Lokalne media podają wywiad dalej.`,
      },
      {
        label: '„Szanuję skąd wyszedłem, ale dziś patrzę znacznie szerzej niż jedno podwórko.”',
        streetDelta: 8,
        hypeDelta: 8,
        fansDelta: fanScale(state, 260, 0.028),
        cashDelta: cashScale(state, 750),
        reaction: 'Światowa perspektywa przyciągnęła nowych słuchaczy z całego kraju.',
      },
    ],
  });

  push(3, {
    id: 'studio_setup_evolution',
    topicTag: `Studio: ${studio.name}`,
    prompt: `Nagrywasz dziś w miejscu: ${studio.name}. Jak bardzo sprzęt i akustyka wpływają na numer, a ile zależy po prostu od prawdy w głosie?`,
    options: [
      {
        label: '„Największe klasyki powstawały w piwnicach. Jak nie masz serca, najlepszy mikrofon nie pomoże.”',
        streetDelta: -8,
        hypeDelta: 7,
        fansDelta: fanScale(state, 200, 0.023),
        cashDelta: 0,
        reaction: 'Młodzi raperzy nagrywający w domach poczuli ogromną motywację!',
      },
      {
        label: '„Charyzma to podstawa, ale topowe brzmienie i zawodowy miks robią różnicę w radiu.”',
        streetDelta: 6,
        hypeDelta: 7,
        fansDelta: fanScale(state, 220, 0.025),
        cashDelta: cashScale(state, 650),
        reaction: 'Realizatorzy dźwięku w Polsce podpisują się pod tym obiema rękami.',
      },
    ],
  });

  if (state.cash < 1800) {
    push(2, {
      id: 'money_rent_pressure',
      topicTag: `Presja codzienności`,
      prompt: `Nie każdy widzi drugą stronę kariery — czynsz, rachunki, koszty studia. Był ostatnio moment, kiedy myślałeś, że rachunki pokonają marzenia o rapie?`,
      options: [
        {
          label: '„Nawet jak trzeba dorobić na magazynie, w nocy wracam do mikrofonu. Nie pękam.”',
          streetDelta: -8,
          hypeDelta: 9,
          fansDelta: fanScale(state, 240, 0.027),
          cashDelta: 0,
          reaction: 'Ogromna fala wsparcia! Fani utożsamiają się z Twoją determinacją.',
        },
        {
          label: '„To chwilowy etap. Jedna dobra premiera i sytuacja na koncie odwróci się o 180 stopni.”',
          streetDelta: 4,
          hypeDelta: 7,
          fansDelta: fanScale(state, 210, 0.024),
          cashDelta: cashScale(state, 500),
          reaction: 'Optymizm i wiara w plan zrobiły świetne wrażenie w studiu.',
        },
      ],
    });
  } else if (state.cash >= 15000) {
    push(2, {
      id: 'money_success_change',
      topicTag: `Duże pieniądze`,
      prompt: `Nie musisz już martwić się o czynsz na koniec miesiąca. Czy pełne konto zmienia to, o czym rapujesz?`,
      options: [
        {
          label: '„Nie udaję biedaka, kiedy mi się powodzi — rapuję prawdę o tym etapie, na którym jestem.”',
          streetDelta: 3,
          hypeDelta: 8,
          fansDelta: fanScale(state, 250, 0.027),
          cashDelta: cashScale(state, 800),
          reaction: 'Dojrzała szczerość zamknęła usta zazdrośnikom.',
        },
        {
          label: '„Kasa to tylko narzędzie, żeby inwestować w lepsze bity, teledyski i własnych ludzi.”',
          streetDelta: -4,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: cashScale(state, 500),
          reaction: 'Słuchacze widzą, że nie roztrwaniasz sukcesu na błyskotki.',
        },
      ],
    });
  }

  if (state.streetMainstream <= 38) {
    push(2, {
      id: 'alignment_street_purist',
      topicTag: `Wizerunek: Ulica (${100 - state.streetMainstream}%)`,
      prompt: `Trzymasz bardzo twardą, uliczną linię (${100 - state.streetMainstream}% Ulicy). Nie kusi Cię czasem nagrać lekkiego, letniego przeboju pod wielkie rozgłośnie?`,
      options: [
        {
          label: '„Prędzej odłożę mikrofon niż nagram plastik pod reklamę jogurtu.”',
          streetDelta: -9,
          hypeDelta: 9,
          fansDelta: fanScale(state, 250, 0.027),
          cashDelta: 0,
          reaction: 'Prawdziwi fani podziemia oszaleli z zachwytu!',
        },
        {
          label: '„Nie mówię nigdy, ale nawet radiowy numer zrobiłbym w stu procentach po swojemu.”',
          streetDelta: 5,
          hypeDelta: 7,
          fansDelta: fanScale(state, 230, 0.025),
          cashDelta: cashScale(state, 650),
          reaction: 'Otwarta głowa bez utraty twarzy — dobrze rozegrane!',
        },
      ],
    });
  } else if (state.streetMainstream >= 62) {
    push(2, {
      id: 'alignment_mainstream_star',
      topicTag: `Wizerunek: Mainstream (${state.streetMainstream}%)`,
      prompt: `Wszedłeś mocno w mainstream (${state.streetMainstream}%). Co odpowiadasz tym z podziemia, którzy krzyczą, że „sprzedałeś się dla zasięgów”?`,
      options: [
        {
          label: '„Łatwo krytykować z piwnicy. Ja spełniam marzenia i utrzymuję z muzyki cały zespół.”',
          streetDelta: 8,
          hypeDelta: 9,
          fansDelta: fanScale(state, 280, 0.03),
          cashDelta: cashScale(state, 1100),
          reaction: 'Mocna odpowiedź podbiła zasięgi i wywołała falę komentarzy.',
        },
        {
          label: '„W każdej chwili mogę wejść na surowy bit boom-bap i przypomnieć, skąd przyszedłem.”',
          streetDelta: -7,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: cashScale(state, 350),
          reaction: 'Część krytyków z podziemia z ciekawością czeka na ten ruch.',
        },
      ],
    });
  } else {
    push(3, {
      id: 'alignment_golden_balance',
      topicTag: `Złoty Balans`,
      prompt: `Udaje Ci się łączyć szacunek ulicy z radiowym zasięgiem. To trudna sztuka — jak nie stracić równowagi między tymi dwoma światami?`,
      options: [
        {
          label: '„Robię muzykę szczerą. Dobry numer działa równie dobrze na osiedlu i na dużym festiwalu.”',
          streetDelta: 0,
          hypeDelta: 8,
          fansDelta: fanScale(state, 240, 0.026),
          cashDelta: cashScale(state, 600),
          reaction: 'Idealne podsumowanie Twojego stylu — oba obozy kiwają głową.',
        },
        {
          label: '„W głębi duszy zawsze bliżej mi do ulicy, nawet jeśli refreny niosą się szeroko.”',
          streetDelta: -6,
          hypeDelta: 7,
          fansDelta: fanScale(state, 220, 0.024),
          cashDelta: 0,
          reaction: 'Lojalni słuchacze poczuli, że pamiętasz o swoich fundamentach.',
        },
      ],
    });
  }

  push(3, {
    id: 'creative_burnout_wena',
    topicTag: `Wena i presja`,
    prompt: `Kiedy dopada Cię spadek weny i zmęczenie tempem branży, jak ładujesz baterie, żeby nie wydawać wymuszonych numerów?`,
    options: [
      {
        label: '„Wyłączam telefon, jadę za miasto i wracam do pisania dopiero, gdy znowu mam coś do powiedzenia.”',
        streetDelta: -3,
        hypeDelta: 6,
        fansDelta: fanScale(state, 200, 0.022),
        cashDelta: cashScale(state, 300),
        reaction: 'Zdrowe podejście do głowy artysty zebrało mnóstwo pozytywnych reakcji.',
      },
      {
        label: '„Nie czekam na natchnienie. Wchodzę do studia codziennie jak do roboty i wyciskam efekt.”',
        streetDelta: 4,
        hypeDelta: 7,
        fansDelta: fanScale(state, 210, 0.024),
        cashDelta: cashScale(state, 650),
        reaction: 'Etyka pracy jak u zawodowego sportowca robi wrażenie na słuchaczach.',
      },
    ],
  });

  push(3, {
    id: 'polish_rap_state',
    topicTag: `Kondycja polskiego rapu`,
    prompt: `Jak oceniasz dzisiejszy polski hip-hop? Przeżywamy złotą erę różnorodności, czy za dużo w tym wszystkim plastiku i kopiowania Zachodu?`,
    options: [
      {
        label: '„Za dużo kopii, za mało własnych historii. Przyszedłem przywrócić tu charakter.”',
        streetDelta: -8,
        hypeDelta: 9,
        fansDelta: fanScale(state, 240, 0.026),
        cashDelta: 0,
        reaction: 'Mocna teza podzieliła scenę i napędziła setki dyskusji!',
      },
      {
        label: '„Nigdy nie było tak mocnej produkcji i tylu świetnych graczy. Podnosimy się nawzajem.”',
        streetDelta: 6,
        hypeDelta: 7,
        fansDelta: fanScale(state, 230, 0.025),
        cashDelta: cashScale(state, 600),
        reaction: 'Wielu artystów na scenie przybiło Ci wirtualną piątkę za te słowa.',
      },
    ],
  });

  push(3, {
    id: 'fans_milestone_gratitude',
    topicTag: `Społeczność (${fmtNum(state.fans)} fanów)`,
    prompt: `Słucha Cię już ${fmtNum(state.fans)} osób. Pamiętasz moment, kiedy dotarło do Ciebie, że ${state.player.alias} to już nie hobby, tylko prawdziwa kariera?`,
    options: [
      {
        label: '„Kiedy obcy ludzie zaczęli mi pisać, że moje wersy pomogły im przetrwać ciężki czas.”',
        streetDelta: -5,
        hypeDelta: 7,
        fansDelta: fanScale(state, 240, 0.027),
        cashDelta: 0,
        reaction: 'Wzruszający moment w studiu — fani zasypali czat wyrazami szacunku.',
      },
      {
        label: '„Kiedy pierwszy raz zapłaciłem wszystkie rachunki wyłącznie z własnej muzyki.”',
        streetDelta: 5,
        hypeDelta: 7,
        fansDelta: fanScale(state, 230, 0.025),
        cashDelta: cashScale(state, 700),
        reaction: 'Konkret bez ściemy — słuchacze cenią taką bezpośredniość.',
      },
    ],
  });

  push(3, {
    id: 'legacy_5_years',
    topicTag: `Wizja za 5 lat`,
    prompt: `Na sam koniec: gdzie widzisz ksywkę ${state.player.alias} za pięć lat?`,
    options: [
      {
        label: '„Własne imperium, pełne stadiony i status absolutnego lidera polskiej sceny.”',
        streetDelta: 7,
        hypeDelta: 9,
        fansDelta: fanScale(state, 270, 0.03),
        cashDelta: cashScale(state, 900),
        reaction: 'Ambitna puenta na koniec wywiadu — redaktor zamyka program z hukiem!',
      },
      {
        label: '„Wciąż głodny mikrofonu, niezależny i z katalogiem płyt, których nikt nie zapomni.”',
        streetDelta: -7,
        hypeDelta: 8,
        fansDelta: fanScale(state, 240, 0.026),
        cashDelta: cashScale(state, 350),
        reaction: 'Klasyczne zakończenie rozmowy, które zostaje w głowie widzów.',
      },
    ],
  });

  return out;
}

export function pickMediaOutlet(preferredName?: string): MediaOutlet {
  if (preferredName) {
    const found = MEDIA_OUTLETS.find((o) => o.name === preferredName);
    if (found) return found;
  }
  return MEDIA_OUTLETS[Math.floor(Math.random() * MEDIA_OUTLETS.length)];
}

export function generateContextualInterview(
  state: GameState,
  preferredOutletName?: string
): InterviewQuestion[] {
  const outlet = pickMediaOutlet(preferredOutletName);
  const askedSet = new Set(state.askedInterviewIds || []);
  const candidates = buildAllCandidateQuestions(state);

  // Separate unasked vs previously asked within each priority tier
  const pickFromTier = (priority: 1 | 2 | 3, includeAsked: boolean) =>
    shuffle(
      candidates
        .filter((c) => c.priority === priority && (includeAsked || !askedSet.has(c.question.id)))
        .map((c) => c.question)
    );

  const selected: InterviewQuestion[] = [];
  const usedIds = new Set<string>();

  const addUpTo = (pool: InterviewQuestion[], targetCount: number) => {
    for (const q of pool) {
      if (selected.length >= targetCount) break;
      if (usedIds.has(q.id)) continue;
      usedIds.add(q.id);
      selected.push({
        ...q,
        outlet: outlet.name,
        host: outlet.host,
      });
    }
  };

  // First pass: strictly UNASKED questions — max 2 from hot priority 1, then 2, then 3
  addUpTo(pickFromTier(1, false), 2);
  addUpTo(pickFromTier(2, false), 3);
  addUpTo(pickFromTier(3, false), 3);
  // If still fewer than 3 (e.g., player has 3+ hot events), pull remaining unasked P1
  addUpTo(pickFromTier(1, false), 3);

  // Fallback only if player has exhausted nearly all applicable unasked questions
  if (selected.length < 3) {
    addUpTo(pickFromTier(1, true), 3);
    addUpTo(pickFromTier(2, true), 3);
    addUpTo(pickFromTier(3, true), 3);
  }

  return selected;
}

export function createInterviewInvite(
  state: GameState,
  day: number,
  reason: 'periodic' | 'beef' | 'release' | 'gala',
  contextTitle?: string
): InboxMessage {
  const outlet = pickMediaOutlet();
  const activeBeef = state.beefs.find((b) => !b.resolved);
  const opp = activeBeef ? state.npcs.find((n) => n.id === activeBeef.opponentId) : undefined;

  let title = `Zaproszenie na wywiad w ${outlet.name}`;
  let body = `${outlet.host} (${outlet.name}) zaprasza Cię na rozmowę na żywo o Twojej karierze, ostatnich ruchach w studiu i planach na ten sezon.`;

  if (reason === 'beef' && activeBeef) {
    title = `Pilny wywiad w ${outlet.name}: Gorący beef z ${opp?.alias || 'rywalem'}`;
    body = `${outlet.host} chce Cię dziś na antenie! Cały internet komentuje Twój diss „${activeBeef.playerDissTitle}” — wejdź na żywo i podkręć emocje przed głosowaniem.`;
  } else if (reason === 'release' && contextTitle) {
    title = `Wywiad premierowy w ${outlet.name}: „${contextTitle}”`;
    body = `Po premierze „${contextTitle}” redakcja ${outlet.name} (${outlet.host}) prosi o wywiad na żywo. To świetna okazja, by podbić zasięgi nowego materiału.`;
  } else if (reason === 'gala') {
    title = `Wywiad po Gali Rap Awards w ${outlet.name}`;
    body = `${outlet.host} zaprasza Cię na podsumowanie tegorocznej Gali Rap Awards. Podziel się swoimi emocjami i planami na nowy sezon!`;
  }

  return {
    id: `msg_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36).slice(-4)}`,
    day,
    type: 'interview',
    interviewOutlet: outlet.name,
    title,
    body,
    rewardHype: 8,
    handled: false,
  };
}
