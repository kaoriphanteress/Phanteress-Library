import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Film,
  Tv,
  ExternalLink,
  Plus,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Shuffle,
  Bookmark,
  Play,
  Info,
} from 'lucide-react';
import { MARVEL_CATALOG } from '../data/marvelCatalog';
import { MarvelTitle, WatchlistItem, WatchStatus } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { TitleDetailModal } from './TitleDetailModal';
import { getPosterInfo } from '../data/marvelPosters';

type DiscoverCategory = 'all' | 'mcu' | 'doomsday' | 'upcoming' | 'movies' | 'series' | 'multiverse';

export const DiscoverTab: React.FC = () => {
  const { watchlist, addItemToWatchlist, removeItemFromWatchlist, updateItemStatus } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DiscoverCategory>('all');
  const [selectedTitle, setSelectedTitle] = useState<{ item: MarvelTitle; watchData: WatchlistItem } | null>(null);
  const [shuffleSeed, setShuffleSeed] = useState(1);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Map watchlist items by title id for instant lookup
  const watchlistMap = useMemo(() => {
    return new Map<string, WatchlistItem>(watchlist.map((w) => [w.itemId, w]));
  }, [watchlist]);

  // Filter catalog based on search & category
  const filteredCatalog = useMemo(() => {
    return MARVEL_CATALOG.filter((title) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = title.title.toLowerCase().includes(q);
        const matchHero = title.heroCharacter.toLowerCase().includes(q);
        const matchDirector = title.directorOrCreator.toLowerCase().includes(q);
        const matchPhase = title.phase.toLowerCase().includes(q);
        const matchYear = String(title.year).includes(q);
        const matchSynopsis = title.synopsis.toLowerCase().includes(q);
        if (!matchTitle && !matchHero && !matchDirector && !matchPhase && !matchYear && !matchSynopsis) {
          return false;
        }
      }

      // Category filter
      if (activeCategory === 'mcu') return title.inFocusMcu;
      if (activeCategory === 'doomsday') return title.inDoomsdayList;
      if (activeCategory === 'upcoming') return Boolean(title.isUpcoming);
      if (activeCategory === 'movies') return title.type === 'movie';
      if (activeCategory === 'series') return title.type === 'series';
      if (activeCategory === 'multiverse') {
        return title.phase === 'Fox / Sony Multiverse' || title.phase === 'Legacy Marvel' || title.title.includes('Spider-Verse');
      }

      return true;
    });
  }, [searchQuery, activeCategory]);

  // Shuffled randomized order (as requested: "all the titles should be in random, not in a release order")
  const randomizedCatalog = useMemo(() => {
    const list = [...filteredCatalog];
    // Seeded pseudo-random shuffle (Fisher-Yates)
    let s = shuffleSeed * 16807;
    for (let i = list.length - 1; i > 0; i--) {
      s = (s * 48271) % 2147483647;
      const j = Math.floor((s / 2147483647) * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [filteredCatalog, shuffleSeed]);

  // VisionQuest featured item reference
  const visionQuestItem = useMemo(() => {
    return MARVEL_CATALOG.find((t) => t.id === 'visionquest-2026') || null;
  }, []);

  const handleShuffle = () => {
    setShuffleSeed((prev) => prev + 1);
  };

  const handleToggleBookmark = (titleId: string) => {
    if (watchlistMap.has(titleId)) {
      removeItemFromWatchlist(titleId);
    } else {
      addItemToWatchlist(titleId);
    }
  };

  const handleToggleWatched = (titleId: string) => {
    const existing = watchlistMap.get(titleId);
    if (!existing) {
      addItemToWatchlist(titleId);
      setTimeout(() => updateItemStatus(titleId, 'watched'), 50);
    } else {
      const next: WatchStatus = existing.status === 'watched' ? 'unwatched' : 'watched';
      updateItemStatus(titleId, next);
    }
  };

  const handleOpenDetail = (title: MarvelTitle) => {
    const watchData: WatchlistItem = watchlistMap.get(title.id) || {
      itemId: title.id,
      customOrderIndex: -1,
      status: 'unwatched',
      episodesWatched: 0,
      scheduledDate: title.isUpcoming ? title.releaseDate : new Date().toISOString().split('T')[0],
    };
    setSelectedTitle({ item: title, watchData });
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto">
      {/* Top Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input Box with Shuffle Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search heroes, titles, multiverse, movies..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Shuffle button to re-randomize discovery */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500/60 text-slate-300 hover:text-pink-400 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
            title="Randomize titles again"
          >
            <Shuffle className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>

        {/* Scrollable Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
          {[
            { id: 'all' as DiscoverCategory, label: 'All Titles' },
            { id: 'mcu' as DiscoverCategory, label: 'Focus MCU' },
            { id: 'doomsday' as DiscoverCategory, label: 'Road to Doomsday' },
            { id: 'upcoming' as DiscoverCategory, label: 'Upcoming Releases' },
            { id: 'movies' as DiscoverCategory, label: 'Movies' },
            { id: 'series' as DiscoverCategory, label: 'Series & Specials' },
            { id: 'multiverse' as DiscoverCategory, label: 'Multiverse & Legacy' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-950 font-semibold'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEATURED HERO BANNER (Matches user's screenshot VisionQuest card!) */}
      {!searchQuery && activeCategory === 'all' && (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40 bg-zinc-950 group">
          {/* Main Visual */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            <img
              src="/assets/visionquest_featured.jpg"
              alt="VisionQuest"
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
              onError={(e) => {
                // If local image fails, fallback to clean poster styling
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Gradient Overlays for Cinematic Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/30" />

            {/* Red Bookmark Ribbon in Top-Right Corner (as in screenshot) */}
            <button
              onClick={() => visionQuestItem && handleToggleBookmark(visionQuestItem.id)}
              className="absolute top-0 right-4 z-20 transition-transform active:scale-95 cursor-pointer"
              title={watchlistMap.has('visionquest-2026') ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <div
                className={`w-7 h-10 flex items-center justify-center transition-colors shadow-lg ${
                  watchlistMap.has('visionquest-2026')
                    ? 'bg-red-600'
                    : 'bg-red-950/80 hover:bg-red-700 border-x border-b border-red-500/40'
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                }}
              >
                <Bookmark className="w-3.5 h-3.5 text-white fill-white mt-[-4px]" />
              </div>
            </button>

            {/* Content Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/90 text-black">
                  Premiere
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                  4 Episodes Out
                </span>
                <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                  Disney+ Marvel Series · Phase 6
                </span>
              </div>

              {/* Title Typography (Styled serif like the user's screenshot) */}
              <h2
                className="text-2xl sm:text-4xl font-serif tracking-tight text-white drop-shadow-md cursor-pointer hover:text-amber-300 transition-colors"
                onClick={() => visionQuestItem && handleOpenDetail(visionQuestItem)}
              >
                VisionQuest
              </h2>

              <p className="text-xs text-slate-300 max-w-lg mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                White Vision journeys through existential memory reconstruction and encounters Ultron. Starring Paul Bettany and James Spader.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 mt-3">
                <button
                  onClick={() => visionQuestItem && handleOpenDetail(visionQuestItem)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => visionQuestItem && handleToggleWatched(visionQuestItem.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                    watchlistMap.get('visionquest-2026')?.status === 'watched'
                      ? 'bg-emerald-600/90 border-emerald-500 text-white'
                      : 'bg-black/60 border-slate-700 text-slate-200 hover:bg-black/80'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {watchlistMap.get('visionquest-2026')?.status === 'watched' ? 'Watched' : 'Mark Watched'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>
            <strong className="text-white font-mono">{randomizedCatalog.length}</strong> Titles in Randomized Discovery
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Click any card for synopsis &amp; details
        </span>
      </div>

      {/* EDITORIAL POSTER GRID (Mix of 3-col portrait and 2-col wide editorial cards matching the screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {randomizedCatalog.map((item, index) => {
          const watchData = watchlistMap.get(item.id);
          const isBookmarked = Boolean(watchData);
          const isWatched = watchData?.status === 'watched';
          const posterInfo = getPosterInfo(item.id, item.heroCharacter, item.title, item.phase);
          const hasImage = Boolean(posterInfo.posterUrl) && !imgErrors[item.id];

          // Introduce visual rhythm: every 5th or 7th card can span 2 columns on larger screens for landscape variety
          const isWide = index % 8 === 4;

          return (
            <div
              key={item.id}
              className={`group relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900 transition-all duration-300 hover:border-pink-500/60 hover:shadow-xl hover:shadow-pink-950/30 flex flex-col justify-end cursor-pointer ${
                isWide
                  ? 'col-span-2 aspect-[16/9] sm:aspect-[16/10]'
                  : 'col-span-1 aspect-[2/3]'
              }`}
              onClick={() => handleOpenDetail(item)}
            >
              {/* Poster Image / Background Art */}
              {hasImage ? (
                <img
                  src={posterInfo.posterUrl}
                  alt={item.title}
                  loading="lazy"
                  onError={() => handleImageError(item.id)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                /* Cinematic styled backdrop fallback for titles without dedicated poster art */
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${posterInfo.themeColor} flex flex-col items-center justify-center p-4 text-center`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-2 shadow-inner border border-white/10"
                    style={{ backgroundColor: `${posterInfo.accentColor}33` }}
                  >
                    {item.type === 'series' ? (
                      <Tv className="w-7 h-7" style={{ color: posterInfo.accentColor }} />
                    ) : (
                      <Film className="w-7 h-7" style={{ color: posterInfo.accentColor }} />
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {item.heroCharacter}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5">{item.phase}</span>
                </div>
              )}

              {/* Vignette Gradients for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

              {/* Red Ribbon Bookmark in Top Right Corner (matching user's screenshot!) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBookmark(item.id);
                }}
                className={`absolute top-0 right-2.5 z-20 transition-all active:scale-90 cursor-pointer ${
                  isBookmarked ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title={isBookmarked ? 'Remove from watchlist' : 'Bookmark to watchlist'}
              >
                <div
                  className={`w-6 h-8 flex items-center justify-center transition-colors shadow-md ${
                    isBookmarked
                      ? 'bg-red-600'
                      : 'bg-red-950/90 hover:bg-red-600 border-x border-b border-red-500/50'
                  }`}
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
                  }}
                >
                  <Bookmark className="w-3 h-3 text-white fill-white mt-[-3px]" />
                </div>
              </button>

              {/* Watched status checkmark badge in top left if watched */}
              {isWatched && (
                <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                  <Check className="w-2.5 h-2.5" />
                  <span>Watched</span>
                </div>
              )}

              {/* Card Bottom: Overlaid Stylized Typography (exactly as in user's screenshot) */}
              <div className="relative z-10 p-3 sm:p-4 space-y-1">
                {/* Meta Tags: Year & Type */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium drop-shadow">
                  <span>{item.year}</span>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase tracking-wider">
                    {item.type === 'series'
                      ? `${item.episodesCount || 1} eps`
                      : `${item.runtimeMinutes || 120}m`}
                  </span>
                  {item.imdbRating > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-bold">★ {item.imdbRating}</span>
                    </>
                  )}
                </div>

                {/* Overlaid Title Typography */}
                <h3
                  className={`font-black text-white leading-tight drop-shadow-lg line-clamp-2 transition-colors group-hover:text-pink-300 ${
                    isWide ? 'text-base sm:text-xl' : 'text-xs sm:text-sm'
                  }`}
                >
                  {item.title}
                </h3>

                {/* Subtitle / Hero */}
                <p className="text-[10px] text-slate-400 truncate">
                  {item.heroCharacter}
                </p>

                {/* Hover Quick Action Buttons */}
                <div
                  className="pt-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleToggleWatched(item.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer backdrop-blur-md ${
                      isWatched
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black/70 hover:bg-emerald-600 border border-slate-700 text-slate-200'
                    }`}
                    title={isWatched ? 'Mark unwatched' : 'Mark watched'}
                  >
                    <Check className="w-3 h-3" />
                    <span>{isWatched ? 'Watched' : 'Watch'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenDetail(item)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Info className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Title Detail Modal */}
      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle.item}
          watchData={selectedTitle.watchData}
          onClose={() => setSelectedTitle(null)}
        />
      )}
    </div>
  );
};
