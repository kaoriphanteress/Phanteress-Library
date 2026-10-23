const fs = require('fs');
const path = require('path');

const catalogPath = path.resolve(__dirname, '../src/data/marvelCatalog.ts');
const rawTs = fs.readFileSync(catalogPath, 'utf8');

const match = rawTs.match(/export const MARVEL_CATALOG: MarvelTitle\[\] = (\[[\s\S]*?\]);\n\nexport const/);
if (!match) {
  console.error('Failed to parse MARVEL_CATALOG array');
  process.exit(1);
}

let titles = JSON.parse(match[1]);

// 1. Clean Title String function - Strips all parenthetical years, dates, and film/series tags
function cleanTitle(raw, id) {
  // Specific clean mappings
  const knownOverrides = {
    'captain-america-1944': 'Captain America',
    'dr-strange-1978': 'Doctor Strange',
    'captain-america-1979': 'Captain America',
    'captain-america-ii-1979': 'Captain America II: Death Too Soon',
    'captain-america-1990': 'Captain America',
    'the-punisher-1989': 'The Punisher',
    'the-punisher-2004': 'The Punisher',
    'punisher-war-zone-2008': 'Punisher: War Zone',
    'fantastic-four-unreleased-1994': 'The Fantastic Four',
    'fantastic-four-2005': 'Fantastic Four',
    'fantastic-four-rotss-2007': 'Fantastic Four: Rise of the Silver Surfer',
    'fant4stic-2015': 'Fantastic Four',
    'fantastic-four-first-steps-2025': 'The Fantastic Four: First Steps',
    'hulk-2003': 'Hulk',
    'the-incredible-hulk-2008': 'The Incredible Hulk',
    'x-men-2000': 'X-Men',
    'x2-united-2003': 'X2: X-Men United',
    'x-men-the-last-stand-2006': 'X-Men: The Last Stand',
    'blade-1998': 'Blade',
    'blade-ii-2002': 'Blade II',
    'blade-trinity-2004': 'Blade: Trinity',
    'spider-man-2002': 'Spider-Man',
    'spider-man-2-2004': 'Spider-Man 2',
    'spider-man-3-2007': 'Spider-Man 3',
    'daredevil-2003': 'Daredevil',
    'elektra-2005': 'Elektra',
    'ghost-rider-2007': 'Ghost Rider',
    'ghost-rider-spirit-of-vengeance-2011': 'Ghost Rider: Spirit of Vengeance',
    'howard-the-duck-1986': 'Howard the Duck',
    'hulk-vs-2009': 'Hulk Vs. Thor & Wolverine',
    'spider-man-brand-new-day-2026': 'Spider-Man: Brand New Day',
    'vision-quest-2026': 'VisionQuest',
  };

  if (knownOverrides[id]) {
    return knownOverrides[id];
  }

  let t = raw;
  // Remove parentheticals with Film, Movie, Pilot, Serial, Special Presentation, Special, Short, Series, Animated, etc.
  t = t.replace(/\s*\([^)]*(Film|Movie|Pilot|Serial|Special Presentation|Special|Short|Series|Animated|Toei|Live-Action|15-Part)[^)]*\)/gi, '');
  // Remove any remaining parenthetical years or dates like (1944), (2000), (2021-2023)
  t = t.replace(/\s*\(\d{4}(?:[–-]\d{4})?\)/g, '');
  t = t.replace(/\s*\(\s*\)/g, '');
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}

// 2. Upcoming Movies & Disney+ Series/Specials provided by user:
const upcomingToAddOrUpdate = [
  // --- MOVIES ---
  {
    id: 'avengers-doomsday-2026',
    title: 'Avengers: Doomsday',
    year: 2026,
    type: 'movie',
    runtimeMinutes: 165,
    phase: 'Phase 6',
    imdbId: 'tt21361454',
    imdbRating: 9.3,
    synopsis: 'Directed by the Russo Brothers; starring Robert Downey Jr. as Victor von Doom facing Earth’s Mightiest Heroes.',
    directorOrCreator: 'Anthony & Joe Russo',
    releaseDate: '2026-12-18',
    isUpcoming: true,
    upcomingDateText: 'December 18, 2026',
    inDoomsdayList: false, // The Doomsday list is the 15 road-to prep titles
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Avengers & Doctor Doom',
    bannerColor: '#059669',
  },
  {
    id: 'spider-man-beyond-the-spider-verse-2027',
    title: 'Spider-Man: Beyond the Spider-Verse',
    year: 2027,
    type: 'movie',
    runtimeMinutes: 140,
    phase: 'Fox / Sony Multiverse',
    imdbId: 'tt9362722',
    imdbRating: 9.0,
    synopsis: 'Animated Sony/Marvel feature. Miles Morales and Gwen Stacy rally the spider-heroes to stop The Spot and shatter multiversal destiny.',
    directorOrCreator: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    releaseDate: '2027-06-18',
    isUpcoming: true,
    upcomingDateText: 'June 18, 2027',
    inDoomsdayList: false,
    inFocusMcu: false,
    inAllMarvel: true,
    heroCharacter: 'Miles Morales',
    bannerColor: '#dc2626',
  },
  {
    id: 'avengers-secret-wars-2027',
    title: 'Avengers: Secret Wars',
    year: 2027,
    type: 'movie',
    runtimeMinutes: 180,
    phase: 'Phase 6',
    imdbId: 'tt21361456',
    imdbRating: 9.5,
    synopsis: 'Concludes Phase 6 and the Multiverse Saga. Incursions threaten all existence as heroes from across cinematic history assemble.',
    directorOrCreator: 'Anthony & Joe Russo',
    releaseDate: '2027-12-17',
    isUpcoming: true,
    upcomingDateText: 'December 17, 2027',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Avengers',
    bannerColor: '#9333ea',
  },
  {
    id: 'untitled-x-men-movie-2028',
    title: 'Untitled X-Men Movie',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 135,
    phase: 'Phase 6',
    imdbId: 'tt10648342',
    imdbRating: 8.5,
    synopsis: 'Directed by Jake Schreier; focused on a youth-oriented mutant team navigating prejudice and superpowers in the MCU.',
    directorOrCreator: 'Jake Schreier',
    releaseDate: '2028-05-05',
    isUpcoming: true,
    upcomingDateText: 'May 5, 2028',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'X-Men',
    bannerColor: '#eab308',
  },
  {
    id: 'ghost-rider-2028',
    title: 'Ghost Rider',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 125,
    phase: 'Upcoming',
    imdbId: 'tt28014560',
    imdbRating: 8.2,
    synopsis: 'Starring Ryan Gosling as the Spirit of Vengeance, riding the highways to punish the wicked with supernatural hellfire.',
    directorOrCreator: 'Marvel Studios',
    releaseDate: '2028-07-28',
    isUpcoming: true,
    upcomingDateText: 'July 28, 2028',
    inDoomsdayList: false,
    inFocusMcu: false,
    inAllMarvel: true,
    heroCharacter: 'Ghost Rider',
    bannerColor: '#ea580c',
  },
  {
    id: 'black-panther-3-2028',
    title: 'Black Panther 3',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 145,
    phase: 'Phase 6',
    imdbId: 'tt23736780',
    imdbRating: 8.4,
    synopsis: 'Directed by Ryan Coogler. Shuri, Namor, and the next generation of Wakandan leaders protect their homeland against rising global threats.',
    directorOrCreator: 'Ryan Coogler',
    releaseDate: '2028-12-15',
    isUpcoming: true,
    upcomingDateText: 'December 15, 2028',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Black Panther',
    bannerColor: '#4f46e5',
  },
  {
    id: 'armor-wars-tba',
    title: 'Armor Wars',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 130,
    phase: 'Phase 6',
    imdbId: 'tt13623126',
    imdbRating: 8.0,
    synopsis: 'In development as a theatrical feature film. James Rhodes must defend Tony Stark’s legacy when Stark tech is stolen and weaponized.',
    directorOrCreator: 'Yassir Lester',
    releaseDate: '2028-12-30',
    isUpcoming: true,
    upcomingDateText: 'TBA (In Development)',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'War Machine',
    bannerColor: '#64748b',
  },
  {
    id: 'blade-mcu-tba',
    title: 'Blade',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 120,
    phase: 'Phase 6',
    imdbId: 'tt10671440',
    imdbRating: 8.1,
    synopsis: 'Currently on hold/removed from the immediate release calendar. Eric Brooks stalks the supernatural shadows of the underworld.',
    directorOrCreator: 'Marvel Studios',
    releaseDate: '2028-12-31',
    isUpcoming: true,
    upcomingDateText: 'TBA (On Hold)',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Blade',
    bannerColor: '#dc2626',
  },
  {
    id: 'nova-tba',
    title: 'Nova',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 125,
    phase: 'Phase 6',
    imdbId: 'tt19245120',
    imdbRating: 8.0,
    synopsis: 'Officially transitioned from a series into a live-action movie development following Richard Rider and the cosmic Nova Corps.',
    directorOrCreator: 'Marvel Studios',
    releaseDate: '2028-12-31',
    isUpcoming: true,
    upcomingDateText: 'TBA (In Development)',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Nova',
    bannerColor: '#3b82f6',
  },
  {
    id: 'shang-chi-2-tba',
    title: 'Shang-Chi 2',
    year: 2028,
    type: 'movie',
    runtimeMinutes: 135,
    phase: 'Phase 6',
    imdbId: 'tt16377752',
    imdbRating: 8.3,
    synopsis: 'In development with director Destin Daniel Cretton, unlocking deeper cosmic secrets behind the Ten Rings.',
    directorOrCreator: 'Destin Daniel Cretton',
    releaseDate: '2028-12-31',
    isUpcoming: true,
    upcomingDateText: 'TBA (In Development)',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Shang-Chi',
    bannerColor: '#dc2626',
  },

  // --- DISNEY+ SERIES & SPECIALS ---
  {
    id: 'friendly-neighborhood-spider-man-s2-2027',
    title: 'Your Friendly Neighborhood Spider-Man Season 2',
    year: 2027,
    type: 'series',
    episodesCount: 8,
    runtimeMinutes: 240,
    phase: 'Phase 6',
    imdbId: 'tt15833446-s2',
    imdbRating: 8.1,
    synopsis: 'Animated Disney+ series continuing Peter Parker’s early high school hero career through new villain confrontations.',
    directorOrCreator: 'Jeff Trammell',
    releaseDate: '2027-01-13',
    isUpcoming: true,
    upcomingDateText: 'January 13, 2027',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Spider-Man',
    bannerColor: '#dc2626',
  },
  {
    id: 'daredevil-born-again-s3-2027',
    title: 'Daredevil: Born Again Season 3',
    year: 2027,
    type: 'series',
    episodesCount: 9,
    runtimeMinutes: 450,
    phase: 'Phase 6',
    imdbId: 'tt18923754-s3',
    imdbRating: 8.8,
    synopsis: 'Live-action Disney+ series continuing Matt Murdock’s pursuit of justice on the streets of New York.',
    directorOrCreator: 'Dario Scardapane',
    releaseDate: '2027-03-01',
    isUpcoming: true,
    upcomingDateText: 'March 2027',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Daredevil',
    bannerColor: '#991b1b',
  },
  {
    id: 'x-men-97-s3-2027',
    title: "X-Men '97 Season 3",
    year: 2027,
    type: 'series',
    episodesCount: 10,
    runtimeMinutes: 300,
    phase: 'Fox / Sony Multiverse',
    imdbId: 'tt16026746-s3',
    imdbRating: 9.1,
    synopsis: 'Animated continuation of the iconic mutant team facing cosmic trials, Apocalypse, and timeline paradoxes.',
    directorOrCreator: 'Marvel Animation',
    releaseDate: '2027-09-15',
    isUpcoming: true,
    upcomingDateText: 'Fall 2027',
    inDoomsdayList: false,
    inFocusMcu: false,
    inAllMarvel: true,
    heroCharacter: 'X-Men',
    bannerColor: '#eab308',
  },
  {
    id: 'marvel-zombies-specials-2027',
    title: 'Marvel Zombies Specials',
    year: 2027,
    type: 'series',
    episodesCount: 4,
    runtimeMinutes: 180,
    phase: 'Phase 6',
    imdbId: 'tt16027150',
    imdbRating: 7.9,
    synopsis: 'Animated Disney+ specials premiering Halloween 2027–2029, pitting surviving heroes against a ravaging zombie plague.',
    directorOrCreator: 'Bryan Andrews',
    releaseDate: '2027-10-31',
    isUpcoming: true,
    upcomingDateText: 'Halloween 2027–2029',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Avengers',
    bannerColor: '#15803d',
  },
  {
    id: 'zodiac-2028',
    title: 'Zodiac',
    year: 2028,
    type: 'series',
    episodesCount: 6,
    runtimeMinutes: 300,
    phase: 'Phase 6',
    imdbId: 'tt31289456',
    imdbRating: 8.0,
    synopsis: 'Newly announced live-action spy thriller series; starts filming in London in Spring 2027, tracking the shadow crime syndicate Zodiac.',
    directorOrCreator: 'Marvel Studios',
    releaseDate: '2028-06-01',
    isUpcoming: true,
    upcomingDateText: '2028',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'S.H.I.E.L.D.',
    bannerColor: '#475569',
  },
  {
    id: 'star-lord-project-tba',
    title: 'Star-Lord Project',
    year: 2028,
    type: 'series',
    episodesCount: 6,
    runtimeMinutes: 270,
    phase: 'Phase 6',
    imdbId: 'tt31289457',
    imdbRating: 8.1,
    synopsis: 'Teased Disney+ project following the Legendary Star-Lord Peter Quill after his cosmic return to Earth.',
    directorOrCreator: 'Marvel Studios',
    releaseDate: '2028-12-31',
    isUpcoming: true,
    upcomingDateText: 'TBA (Teased)',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Star-Lord',
    bannerColor: '#e11d48',
  },
  {
    id: 'untitled-wakanda-okoye-series-tba',
    title: 'Untitled Wakanda / Okoye Series',
    year: 2028,
    type: 'series',
    episodesCount: 6,
    runtimeMinutes: 300,
    phase: 'Phase 6',
    imdbId: 'tt14088658',
    imdbRating: 8.2,
    synopsis: 'In-development live-action series expanding on the Kingdom of Wakanda and the Midnight Angels.',
    directorOrCreator: 'Ryan Coogler',
    releaseDate: '2028-12-31',
    isUpcoming: true,
    upcomingDateText: 'TBA (In Development)',
    inDoomsdayList: false,
    inFocusMcu: true,
    inAllMarvel: true,
    heroCharacter: 'Okoye',
    bannerColor: '#b45309',
  },
];

// Merge/Upsert upcoming titles
upcomingToAddOrUpdate.forEach(u => {
  const existingIdx = titles.findIndex(t => t.id === u.id);
  if (existingIdx >= 0) {
    titles[existingIdx] = {
      ...titles[existingIdx],
      ...u,
    };
  } else {
    titles.push({
      ...u,
      chronologicalRank: 999,
      releaseRank: 999,
      phanteressRank: 999,
    });
  }
});

// 3. Define the EXACT Doomsday List IDs from user request:
const doomsdayIds = new Set([
  'x-men-2000',
  'x2-united-2003',
  'captain-america-first-avenger-2011',
  'the-avengers-2012',
  'avengers-infinity-war-2018',
  'avengers-endgame-2019',
  'loki-s1-2021',
  'loki-s2-2023',
  'shang-chi-2021',
  'spider-man-no-way-home-2021',
  'black-panther-wakanda-forever-2022',
  'doctor-strange-multiverse-of-madness-2022',
  'deadpool-and-wolverine-2024',
  'captain-america-brave-new-world-2025',
  'thunderbolts-2025',
  'fantastic-four-first-steps-2025',
]);

const focusMcuIds = new Set([
  // Phase 1
  'iron-man-2008',
  'the-incredible-hulk-2008',
  'iron-man-2-2010',
  'thor-2011',
  'captain-america-first-avenger-2011',
  'the-avengers-2012',

  // Phase 2
  'iron-man-3-2013',
  'thor-the-dark-world-2013',
  'captain-america-winter-soldier-2014',
  'guardians-of-the-galaxy-2014',
  'avengers-age-of-ultron-2015',
  'ant-man-2015',

  // Phase 3
  'captain-america-civil-war-2016',
  'doctor-strange-2016',
  'guardians-of-the-galaxy-vol-2-2017',
  'spider-man-homecoming-2017',
  'thor-ragnarok-2017',
  'black-panther-2018',
  'avengers-infinity-war-2018',
  'ant-man-and-the-wasp-2018',
  'captain-marvel-2019',
  'avengers-endgame-2019',
  'spider-man-far-from-home-2019',

  // Phase 4
  'wandavision-2021',
  'falcon-winter-soldier-2021',
  'loki-s1-2021',
  'black-widow-2021',
  'what-if-s1-2021',
  'shang-chi-2021',
  'eternals-2021',
  'hawkeye-2021',
  'spider-man-no-way-home-2021',
  'moon-knight-2022',
  'doctor-strange-multiverse-of-madness-2022',
  'ms-marvel-2022',
  'thor-love-and-thunder-2022',
  'she-hulk-2022',
  'black-panther-wakanda-forever-2022',

  // Phase 5
  'ant-man-quantumania-2023',
  'guardians-of-the-galaxy-vol-3-2023',
  'secret-invasion-2023',
  'loki-s2-2023',
  'the-marvels-2023',
  'what-if-s2-2023',
  'echo-2024',
  'deadpool-and-wolverine-2024',
  'agatha-all-along-2024',
  'what-if-s3-2024',
  'friendly-neighborhood-spider-man-2025',
  'captain-america-brave-new-world-2025',
  'daredevil-born-again-s1-2025',
  'thunderbolts-2025',
  'ironheart-2025',
  'fantastic-four-first-steps-2025',
  'wonder-man-2025',

  // Phase 6 & Upcoming MCU Focus
  'spider-man-brand-new-day-2026',
  'vision-quest-2026',
  'avengers-doomsday-2026',
  'friendly-neighborhood-spider-man-s2-2027',
  'daredevil-born-again-s3-2027',
  'avengers-secret-wars-2027',
  'marvel-zombies-specials-2027',
  'untitled-x-men-movie-2028',
  'zodiac-2028',
  'black-panther-3-2028',
  'armor-wars-tba',
  'blade-mcu-tba',
  'nova-tba',
  'shang-chi-2-tba',
  'star-lord-project-tba',
  'untitled-wakanda-okoye-series-tba',
]);

// 4. Apply title cleaning and flag setting across all titles
titles.forEach(item => {
  item.title = cleanTitle(item.title, item.id);
  item.inAllMarvel = true;
  item.inDoomsdayList = doomsdayIds.has(item.id);
  if (focusMcuIds.has(item.id)) {
    item.inFocusMcu = true;
  }
});

// Calculate Release Ranks
titles.sort((a, b) => {
  if (a.releaseDate !== b.releaseDate) {
    return a.releaseDate.localeCompare(b.releaseDate);
  }
  return a.year - b.year;
});
titles.forEach((item, index) => {
  item.releaseRank = index + 1;
});

// Calculate Chronological Ranks
const customChronology = {
  'captain-america-first-avenger-2011': 1943,
  'captain-marvel-2019': 1995,
  'iron-man-2008': 2008,
  'iron-man-2-2010': 2010,
  'the-incredible-hulk-2008': 2010.5,
  'thor-2011': 2011,
  'the-avengers-2012': 2012,
  'iron-man-3-2013': 2013,
  'thor-the-dark-world-2013': 2013.5,
  'captain-america-winter-soldier-2014': 2014,
  'guardians-of-the-galaxy-2014': 2014.2,
  'guardians-of-the-galaxy-vol-2-2017': 2014.5,
  'avengers-age-of-ultron-2015': 2015,
  'ant-man-2015': 2015.5,
  'captain-america-civil-war-2016': 2016,
  'black-widow-2021': 2016.2,
  'black-panther-2018': 2016.5,
  'spider-man-homecoming-2017': 2016.8,
  'doctor-strange-2016': 2017,
  'thor-ragnarok-2017': 2017.5,
  'ant-man-and-the-wasp-2018': 2018,
  'avengers-infinity-war-2018': 2018.2,
  'avengers-endgame-2019': 2023,
  'loki-s1-2021': 2023.1,
  'what-if-s1-2021': 2023.15,
  'wandavision-2021': 2023.2,
  'falcon-winter-soldier-2021': 2023.5,
  'spider-man-far-from-home-2019': 2024,
  'shang-chi-2021': 2024.2,
  'eternals-2021': 2024.3,
  'spider-man-no-way-home-2021': 2024.5,
  'doctor-strange-multiverse-of-madness-2022': 2024.7,
  'hawkeye-2021': 2024.9,
  'moon-knight-2022': 2025,
  'black-panther-wakanda-forever-2022': 2025.2,
  'echo-2024': 2025.3,
  'she-hulk-2022': 2025.4,
  'ms-marvel-2022': 2025.5,
  'thor-love-and-thunder-2022': 2025.6,
  'ant-man-quantumania-2023': 2026,
  'guardians-of-the-galaxy-vol-3-2023': 2026.2,
  'secret-invasion-2023': 2026.4,
  'the-marvels-2023': 2026.6,
  'loki-s2-2023': 2026.7,
  'deadpool-and-wolverine-2024': 2026.8,
  'agatha-all-along-2024': 2026.9,
  'captain-america-brave-new-world-2025': 2027,
  'thunderbolts-2025': 2027.2,
  'fantastic-four-first-steps-2025': 2027.4,
  'spider-man-brand-new-day-2026': 2027.6,
  'vision-quest-2026': 2027.8,
  'avengers-doomsday-2026': 2028,
  'friendly-neighborhood-spider-man-s2-2027': 2028.1,
  'daredevil-born-again-s3-2027': 2028.2,
  'avengers-secret-wars-2027': 2028.5,
  'marvel-zombies-specials-2027': 2028.6,
  'untitled-x-men-movie-2028': 2029,
  'zodiac-2028': 2029.2,
  'black-panther-3-2028': 2029.4,
  'armor-wars-tba': 2029.6,
  'blade-mcu-tba': 2029.7,
  'nova-tba': 2029.8,
  'shang-chi-2-tba': 2029.9,
  'star-lord-project-tba': 2030,
  'untitled-wakanda-okoye-series-tba': 2030.1,
};

const sortedByChrono = [...titles].sort((a, b) => {
  const valA = customChronology[a.id] || a.year;
  const valB = customChronology[b.id] || b.year;
  if (valA !== valB) return valA - valB;
  return a.releaseDate.localeCompare(b.releaseDate);
});
sortedByChrono.forEach((item, index) => {
  item.chronologicalRank = index + 1;
});

// Calculate Phanteress bespoke rank
titles.forEach((item, index) => {
  let score = index;
  if (item.inDoomsdayList) score -= 300;
  if (item.inFocusMcu) score -= 150;
  if (item.isUpcoming) score += 500;
  item.phanteressRank = score;
});
const sortedByPhanteress = [...titles].sort((a, b) => a.phanteressRank - b.phanteressRank);
sortedByPhanteress.forEach((item, index) => {
  item.phanteressRank = index + 1;
});

const tsFileContent = `import { MarvelTitle } from '../types';

export const MARVEL_CATALOG: MarvelTitle[] = ${JSON.stringify(titles, null, 2)};

export const PROPERTY_DESCRIPTIONS = {
  doomsday: {
    id: 'doomsday',
    name: 'Doomsday List',
    tagline: 'Curated 15 Essential Multiverse & MCU Masterworks',
    detail: 'From original X-Men and Captain America: The First Avenger to Avengers: Endgame, Loki, No Way Home, Deadpool & Wolverine, and The Fantastic Four: First Steps.',
    countText: '15 Curated Road to Doomsday Titles',
    highlightBadge: 'Road to Avengers: Doomsday',
  },
  mcu: {
    id: 'mcu',
    name: 'Focus MCU',
    tagline: 'All Marvel Cinematic Universe Canon Movies & Disney+ Series',
    detail: 'Complete mainline Sacred Timeline canon from Iron Man (2008) to Avengers: Doomsday, Secret Wars, Disney+ series, Brand New Day, and VisionQuest.',
    countText: 'Full MCU Canon Roadmap',
    highlightBadge: 'Sacred Timeline Canon',
  },
  'all-marvel': {
    id: 'all-marvel',
    name: 'All Marvel Properties',
    tagline: 'Master Checklist of All Marvel Screen History',
    detail: 'From the 1944 Captain America serial, 60s/70s animated shows, Bill Bixby Hulk, 90s animated classics, Fox X-Men, Raimi Spider-Man, to modern MCU.',
    countText: '${titles.length} Master Properties',
    highlightBadge: 'Complete Marvel Legacy',
  },
};

export const ORDER_TYPE_DESCRIPTIONS = {
  release: {
    id: 'release',
    name: 'Release Order',
    badge: 'Best For Beginners!',
    description: 'Experience every film and series in the exact order audiences did in theaters. Preserves post-credit surprises and cultural timeline.',
  },
  chronological: {
    id: 'chronological',
    name: 'Chronological Order',
    badge: 'Best For Rewatch!',
    description: 'Follow the in-universe storyline from 1940s WWII Captain America, through the Sacred Timeline, into the Quantum and Multiversal future.',
  },
  phanteress: {
    id: 'phanteress',
    name: 'Phanteress Order',
    badge: 'Best for Both, Perfect Experience!',
    description: 'The ultimate bespoke watch order crafted by Phanteress. Groups thematic arcs, balances heavy movies with fun series, and primes you for Secret Wars.',
  },
};
`;

fs.writeFileSync(catalogPath, tsFileContent);
console.log('Successfully updated MARVEL_CATALOG with', titles.length, 'titles.');
console.log('Doomsday titles count:', titles.filter(t => t.inDoomsdayList).length);
console.log('Focus MCU titles count:', titles.filter(t => t.inFocusMcu).length);
console.log('All Marvel titles count:', titles.filter(t => t.inAllMarvel).length);
