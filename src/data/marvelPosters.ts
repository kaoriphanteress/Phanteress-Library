// Curated high-resolution poster images and thematic artwork for Marvel titles
// Used by Discover tab to render cinematic visual poster grid matching modern streaming apps.

export interface PosterData {
  posterUrl: string;
  backdropUrl?: string;
  themeColor: string;
  accentColor: string;
}

// Map of canonical Marvel title IDs to verified high-res poster artworks
export const MARVEL_POSTER_MAP: Record<string, PosterData> = {
  // --- SPECIAL / FEATURED ---
  'visionquest-2026': {
    posterUrl: '/assets/visionquest_featured.jpg',
    backdropUrl: '/assets/visionquest_featured.jpg',
    themeColor: 'from-amber-950 via-zinc-950 to-black',
    accentColor: '#f59e0b',
  },
  'spiderman-brand-new-day-2026': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    themeColor: 'from-red-950 via-blue-950 to-black',
    accentColor: '#ef4444',
  },

  // --- AVENGERS & SAGA CLIMAXES ---
  'avengers-endgame-2019': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    themeColor: 'from-indigo-950 via-purple-950 to-black',
    accentColor: '#8b5cf6',
  },
  'avengers-infinity-war-2018': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg',
    themeColor: 'from-purple-950 via-amber-950 to-black',
    accentColor: '#a855f7',
  },
  'the-avengers-2012': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
    themeColor: 'from-blue-950 via-slate-950 to-black',
    accentColor: '#3b82f6',
  },
  'avengers-age-of-ultron-2015': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/4ssDuvEDkS9NvmR15ezabUt07Gj.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8WW5l2G6L7m8N7xY0uQ8l5Q8p.jpg',
    themeColor: 'from-red-950 via-zinc-950 to-black',
    accentColor: '#ef4444',
  },
  'avengers-doomsday-2026': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yDHYTjA3R0neXjY5A4P8bY0K.jpg',
    themeColor: 'from-emerald-950 via-slate-950 to-black',
    accentColor: '#10b981',
  },
  'avengers-secret-wars-2027': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
    themeColor: 'from-purple-950 via-indigo-950 to-black',
    accentColor: '#a855f7',
  },

  // --- DEADPOOL & WOLVERINE & MUTANTS ---
  'deadpool-and-wolverine-2024': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yDHYTjA3R0neXjY5A4P8bY0K.jpg',
    themeColor: 'from-red-950 via-amber-950 to-black',
    accentColor: '#e11d48',
  },
  'x-men-2000': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/bRDAc4GogS9yiUTm8P660GQ2Act.jpg',
    themeColor: 'from-blue-950 via-slate-950 to-black',
    accentColor: '#38bdf8',
  },
  'x2-x-men-united-2003': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/e9V4z0y2e6i5v4b3m1a8k7c9p.jpg',
    themeColor: 'from-cyan-950 via-slate-950 to-black',
    accentColor: '#06b6d4',
  },

  // --- SPIDER-MAN ---
  'spider-man-no-way-home-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg',
    themeColor: 'from-red-950 via-amber-950 to-black',
    accentColor: '#ef4444',
  },
  'spider-man-far-from-home-2019': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/4q2hz2m8hubgvijTyPp0agvxQz7.jpg',
    themeColor: 'from-red-950 via-blue-950 to-black',
    accentColor: '#3b82f6',
  },
  'spider-man-homecoming-2017': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg',
    themeColor: 'from-blue-950 via-amber-950 to-black',
    accentColor: '#f59e0b',
  },
  'spider-man-across-the-spider-verse-2023': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    themeColor: 'from-pink-950 via-purple-950 to-black',
    accentColor: '#ec4899',
  },
  'spider-man-into-the-spider-verse-2018': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
    themeColor: 'from-purple-950 via-pink-950 to-black',
    accentColor: '#d946ef',
  },
  'spider-man-beyond-the-spider-verse-2027': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    themeColor: 'from-purple-950 via-slate-950 to-black',
    accentColor: '#c084fc',
  },

  // --- IRON MAN & CAPTAIN AMERICA ---
  'iron-man-2008': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dWDJa.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/cyecB7godJ6kNHGONvjUyVN9OX5.jpg',
    themeColor: 'from-red-950 via-amber-950 to-black',
    accentColor: '#eab308',
  },
  'iron-man-2-2010': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/6WBeq40v3094GeqaoVsrncX29zg.jpg',
    themeColor: 'from-red-950 via-slate-950 to-black',
    accentColor: '#ef4444',
  },
  'iron-man-3-2013': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg',
    themeColor: 'from-amber-950 via-zinc-950 to-black',
    accentColor: '#f59e0b',
  },
  'captain-america-the-first-avenger-2011': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/vSNxAJTlD0r02V9sPY2BvURK2IL.jpg',
    themeColor: 'from-blue-950 via-red-950 to-black',
    accentColor: '#3b82f6',
  },
  'captain-america-the-winter-soldier-2014': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/tVFRpFw3xTed5nGQqW0sdKHpRPA.jpg',
    themeColor: 'from-slate-950 via-blue-950 to-black',
    accentColor: '#60a5fa',
  },
  'captain-america-civil-war-2016': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg',
    themeColor: 'from-red-950 via-blue-950 to-black',
    accentColor: '#f43f5e',
  },
  'captain-america-brave-new-world-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/pzIddUEMWhWzfvLI3TwxUG2wYLF.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/m9vhQy44V4Wb5n0a8m5Y.jpg',
    themeColor: 'from-blue-950 via-red-950 to-black',
    accentColor: '#38bdf8',
  },

  // --- BLACK PANTHER & THOR & DOCTOR STRANGE ---
  'black-panther-2018': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
    themeColor: 'from-purple-950 via-zinc-950 to-black',
    accentColor: '#a855f7',
  },
  'black-panther-wakanda-forever-2022': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xDMIl84Qo5Tsu62c9DGWhmPI6Mc.jpg',
    themeColor: 'from-emerald-950 via-purple-950 to-black',
    accentColor: '#10b981',
  },
  'thor-2011': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/prSfAi1xGrhLQNxVSUFh61xQ4Qx.jpg',
    themeColor: 'from-sky-950 via-slate-950 to-black',
    accentColor: '#0284c7',
  },
  'thor-the-dark-world-2013': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/wp6OxE4poJ4G7c0U2ZIXasTSMR7.jpg',
    themeColor: 'from-slate-950 via-red-950 to-black',
    accentColor: '#dc2626',
  },
  'thor-ragnarok-2017': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/kaIfm5ryEOwYg8pahVIq2YRnn2S.jpg',
    themeColor: 'from-amber-950 via-teal-950 to-black',
    accentColor: '#f59e0b',
  },
  'thor-love-and-thunder-2022': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/pIkRyD18kl4F0b69em2LsgA4Hio.jpg',
    themeColor: 'from-pink-950 via-cyan-950 to-black',
    accentColor: '#ec4899',
  },
  'doctor-strange-2016': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/uGBVj34PvVJXiMLV1ND849Yvxtz.jpg',
    themeColor: 'from-amber-950 via-orange-950 to-black',
    accentColor: '#f97316',
  },
  'doctor-strange-in-the-multiverse-of-madness-2022': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1oKAhiwbBKS.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg',
    themeColor: 'from-red-950 via-purple-950 to-black',
    accentColor: '#ef4444',
  },

  // --- GUARDIANS & SHANG-CHI & ETERNALS ---
  'guardians-of-the-galaxy-2014': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXvlshvgEx.jpg',
    themeColor: 'from-purple-950 via-blue-950 to-black',
    accentColor: '#8b5cf6',
  },
  'guardians-of-the-galaxy-vol-2-2017': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/y4MBh0EjBlMuOzv9axM4qJmLRbF.jpg',
    themeColor: 'from-teal-950 via-purple-950 to-black',
    accentColor: '#14b8a6',
  },
  'guardians-of-the-galaxy-vol-3-2023': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctetjST2FimOPlhg.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg',
    themeColor: 'from-sky-950 via-amber-950 to-black',
    accentColor: '#38bdf8',
  },
  'shang-chi-and-the-legend-of-the-ten-rings-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/1BIoJGKbXjdFDAvUEiA2VHqkK1Z.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/cinER0j2z989y9R6i9a7.jpg',
    themeColor: 'from-amber-950 via-red-950 to-black',
    accentColor: '#f59e0b',
  },
  'eternals-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/bcCBq9N1EMo3daNIjWJ8kYvrQm6.jpg',
    themeColor: 'from-amber-950 via-slate-950 to-black',
    accentColor: '#fbbf24',
  },
  'the-incredible-hulk-2008': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/gKzYx79y0AQTL4UAk1cBQJ3nvrm.jpg',
    themeColor: 'from-emerald-950 via-green-950 to-black',
    accentColor: '#22c55e',
  },
  'ant-man-2015': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/jOVOgm0vH00gM63Z7P6a9n14V8U.jpg',
    themeColor: 'from-red-950 via-slate-950 to-black',
    accentColor: '#ef4444',
  },
  'ant-man-and-the-wasp-2018': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/eivQmS3wqz9Q1v8gX2Y70v7f0iS.jpg',
    themeColor: 'from-amber-950 via-red-950 to-black',
    accentColor: '#f59e0b',
  },
  'ant-man-and-the-wasp-quantumania-2023': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg',
    themeColor: 'from-purple-950 via-blue-950 to-black',
    accentColor: '#a855f7',
  },
  'captain-marvel-2019': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/AtsgWhDnHTq68L0lLsUr8A8r3nR.jpg',
    themeColor: 'from-blue-950 via-amber-950 to-black',
    accentColor: '#eab308',
  },
  'the-marvels-2023': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/9GBhzXMFjgcZ3FdR9w0bYvIRbp5.jpg',
    themeColor: 'from-purple-950 via-amber-950 to-black',
    accentColor: '#ec4899',
  },
  'black-widow-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/qAZ0wfzwflioeqGU8Frr90CSGjX.jpg',
    themeColor: 'from-red-950 via-zinc-950 to-black',
    accentColor: '#f43f5e',
  },
  'thunderbolts-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/pzIddUEMWhWzfvLI3TwxUG2wYLF.jpg',
    themeColor: 'from-zinc-950 via-amber-950 to-black',
    accentColor: '#f59e0b',
  },
  'the-fantastic-four-first-steps-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    themeColor: 'from-sky-950 via-blue-950 to-black',
    accentColor: '#38bdf8',
  },

  // --- DISNEY+ SERIES ---
  'wandavision-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/gWjGYG1hgtgE7aKq5n7VqN5x3yL.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/57vVjteucIF3LcvMBHtLf6vhkWo.jpg',
    themeColor: 'from-red-950 via-amber-950 to-black',
    accentColor: '#dc2626',
  },
  'loki-season-1-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/12VO56r4wW9u1.jpg',
    themeColor: 'from-emerald-950 via-amber-950 to-black',
    accentColor: '#10b981',
  },
  'loki-season-2-2023': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/kEl2t3OhXc3Zb9FBh1AuYzRTgZp.jpg',
    themeColor: 'from-emerald-950 via-teal-950 to-black',
    accentColor: '#059669',
  },
  'the-falcon-and-the-winter-soldier-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/6kbAMLteGO8yyewYau6bJ683sw7.jpg',
    themeColor: 'from-blue-950 via-slate-950 to-black',
    accentColor: '#3b82f6',
  },
  'what-if-season-1-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/lztNs6r93Z872UvJ5t0kS0nN1Fm.jpg',
    themeColor: 'from-purple-950 via-blue-950 to-black',
    accentColor: '#a855f7',
  },
  'hawkeye-2021': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/pqzjVP5BzxP699z51Fk3kQ2v3dE.jpg',
    themeColor: 'from-purple-950 via-indigo-950 to-black',
    accentColor: '#8b5cf6',
  },
  'moon-knight-2022': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/x6FsYvt33846G7G0Nek1A9k3f12.jpg',
    themeColor: 'from-slate-950 via-cyan-950 to-black',
    accentColor: '#e2e8f0',
  },
  'ms-marvel-2022': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/cdkyMYdu8ao2657MWg4g5Z0v7wX.jpg',
    themeColor: 'from-pink-950 via-indigo-950 to-black',
    accentColor: '#ec4899',
  },
  'she-hulk-attorney-at-law-2022': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/hJfI6tKwR52yVPI0yUe9VT8R4v0.jpg',
    themeColor: 'from-emerald-950 via-teal-950 to-black',
    accentColor: '#10b981',
  },
  'secret-invasion-2023': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/f5ZM8rSpHIl69o14IW086119v50.jpg',
    themeColor: 'from-emerald-950 via-zinc-950 to-black',
    accentColor: '#059669',
  },
  'echo-2024': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/v1Qc8n58KqS0j7b1c3n8x2Wq8c.jpg',
    themeColor: 'from-red-950 via-zinc-950 to-black',
    accentColor: '#ef4444',
  },
  'agatha-all-along-2024': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/pA2f1b4pU8jWq7y6z0h0f6v7r8k.jpg',
    themeColor: 'from-purple-950 via-zinc-950 to-black',
    accentColor: '#9333ea',
  },
  'daredevil-born-again-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/x5Z7kK9v2m0N1p7q3R8s1v5b3.jpg',
    themeColor: 'from-red-950 via-zinc-950 to-black',
    accentColor: '#dc2626',
  },
  'ironheart-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/s8w3n2j8c1v9r5k7m3x0q1z8b2.jpg',
    themeColor: 'from-pink-950 via-amber-950 to-black',
    accentColor: '#f43f5e',
  },
  'wonder-man-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/m2n5b8v3x1c9q8z7k0p2y4r6t1.jpg',
    themeColor: 'from-red-950 via-purple-950 to-black',
    accentColor: '#ef4444',
  },
  'your-friendly-neighborhood-spider-man-2025': {
    posterUrl: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
    themeColor: 'from-blue-950 via-red-950 to-black',
    accentColor: '#38bdf8',
  },
};

// Character thematic color & gradient mapping generator for any title
export function getPosterInfo(id: string, heroCharacter: string, titleName: string, phase: string): PosterData {
  if (MARVEL_POSTER_MAP[id]) {
    return MARVEL_POSTER_MAP[id];
  }

  // Deduce high-style visual theme based on hero/title
  const heroLower = (heroCharacter + ' ' + titleName).toLowerCase();

  let themeColor = 'from-zinc-900 via-zinc-950 to-black';
  let accentColor = '#ec4899';

  if (heroLower.includes('spider')) {
    themeColor = 'from-red-950 via-blue-950 to-black';
    accentColor = '#ef4444';
  } else if (heroLower.includes('iron man') || heroLower.includes('stark')) {
    themeColor = 'from-red-950 via-amber-950 to-black';
    accentColor = '#f59e0b';
  } else if (heroLower.includes('thor') || heroLower.includes('loki') || heroLower.includes('asgard')) {
    themeColor = 'from-sky-950 via-indigo-950 to-black';
    accentColor = '#38bdf8';
  } else if (heroLower.includes('captain america') || heroLower.includes('bucky') || heroLower.includes('falcon')) {
    themeColor = 'from-blue-950 via-slate-950 to-black';
    accentColor = '#3b82f6';
  } else if (heroLower.includes('hulk') || heroLower.includes('she-hulk')) {
    themeColor = 'from-emerald-950 via-green-950 to-black';
    accentColor = '#10b981';
  } else if (heroLower.includes('wolverine') || heroLower.includes('x-men') || heroLower.includes('mutant') || heroLower.includes('magneto')) {
    themeColor = 'from-amber-950 via-blue-950 to-black';
    accentColor = '#eab308';
  } else if (heroLower.includes('panther') || heroLower.includes('wakanda')) {
    themeColor = 'from-purple-950 via-zinc-950 to-black';
    accentColor = '#a855f7';
  } else if (heroLower.includes('strange') || heroLower.includes('wanda') || heroLower.includes('witch') || heroLower.includes('agatha')) {
    themeColor = 'from-red-950 via-purple-950 to-black';
    accentColor = '#c084fc';
  } else if (heroLower.includes('fantastic') || heroLower.includes('doom')) {
    themeColor = 'from-blue-950 via-cyan-950 to-black';
    accentColor = '#06b6d4';
  } else if (heroLower.includes('deadpool')) {
    themeColor = 'from-red-950 via-rose-950 to-black';
    accentColor = '#e11d48';
  } else if (phase.includes('Legacy') || phase.includes('Fox') || phase.includes('Sony')) {
    themeColor = 'from-indigo-950 via-slate-950 to-black';
    accentColor = '#818cf8';
  }

  // Use a fallback gradient poster style
  return {
    posterUrl: '', // Will trigger cinematic fallback canvas with hero icon & typography
    themeColor,
    accentColor,
  };
}
