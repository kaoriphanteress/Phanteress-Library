import React, { useState, useMemo } from 'react';
import {
  Search,
  Film,
  Tv,
  Check,
  X,
  Sparkles,
  Info,
  Layers,
  Flame,
  Heart,
} from 'lucide-react';
import { MARVEL_CATALOG } from '../data/marvelCatalog';
import { MarvelTitle } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { TitleDetailModal } from './TitleDetailModal';
import { getPosterInfo } from '../data/marvelPosters';
import { MARVEL_COLLECTIONS } from '../data/marvelCollections';

type DiscoverCategory = 'all' | 'collections' | 'mcu' | 'upcoming' | 'movies' | 'series' | 'multiverse';

export const DiscoverTab: React.FC = () => {
  const {
    watchlist,
    updateItemStatus,
    getWatchlistItem,
    toggleFavorite,
    isFavorite,
  } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<DiscoverCategory>('all');
  const [selectedTitle, setSelectedTitle] = useState<MarvelTitle | null>(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number | undefined>(undefined);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Map watchlist items by title id for instant lookup
  const watchlistMap = useMemo(() => {
    return new Map(watchlist.map((w) => [w.itemId, w]));
  }, [watchlist]);

  // UNIFIED SERIES CATALOG FOR DISCOVER:
  // Deduplicate multi-season titles so all seasons of the same show become a single title
  const unifiedCatalog = useMemo(() => {
    const seenSeries = new Set<string>();
    const unified: MarvelTitle[] = [];

    MARVEL_CATALOG.forEach((item) => {
      const key = item.seriesId || (item.type === 'series' ? (item.parentTitle || item.title).replace(/\s+Season\s+\d+.*$/i, '').trim() : null);
      if (key) {
        if (!seenSeries.has(key)) {
          seenSeries.add(key);
          // Represent with season 1 or parent entry
          unified.push(item);
        }
      } else {
        unified.push(item);
      }
    });

    return unified;
  }, []);

  // Map seriesId to total combined episodes across all seasons (e.g. I Am Groot S1 (5) + S2 (5) = 10 eps)
  const seriesTotalEpisodesMap = useMemo(() => {
    const map = new Map<string, number>();
    MARVEL_CATALOG.forEach((item) => {
      if (item.seriesId) {
        map.set(item.seriesId, (map.get(item.seriesId) || 0) + (item.episodesCount || 0));
      }
    });
    return map;
  }, []);

  // Filter catalog based on search & category
  const filteredTitles = useMemo(() => {
    // If a collection is selected from the Collections tab
    if (selectedCollectionId) {
      const col = MARVEL_COLLECTIONS.find((c) => c.id === selectedCollectionId);
      if (col) {
        return MARVEL_CATALOG.filter((t) => col.itemIds.includes(t.id));
      }
    }

    return unifiedCatalog.filter((title) => {
      const displayName = title.parentTitle || title.title;

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = displayName.toLowerCase().includes(q) || title.title.toLowerCase().includes(q);
        const matchHero = title.heroCharacter.toLowerCase().includes(q);
        const matchDirector = title.directorOrCreator.toLowerCase().includes(q);
        const matchPhase = title.phase.toLowerCase().includes(q);
        const matchYear = String(title.year).includes(q);
        const matchSynopsis = title.synopsis.toLowerCase().includes(q);
        if (!matchTitle && !matchHero && !matchDirector && !matchPhase && !matchYear && !matchSynopsis) {
          return false;
        }
      }

      // Category filter (Note: Road to Doomsday removed as requested)
      if (activeCategory === 'mcu') return title.inFocusMcu;
      if (activeCategory === 'upcoming') return Boolean(title.isUpcoming);
      if (activeCategory === 'movies') return title.type === 'movie';
      if (activeCategory === 'series') return title.type === 'series';
      if (activeCategory === 'multiverse') {
        return title.phase === 'Fox / Sony Multiverse' || title.phase === 'Legacy Marvel' || title.title.includes('Spider-Verse');
      }

      return true;
    });
  }, [unifiedCatalog, searchQuery, activeCategory, selectedCollectionId]);

  // SORTING LOGIC:
  // If searching: SORT BY RELEVANCE ACCURACY!
  // E.g. "deadpool" -> Deadpool 1, Deadpool 2, Deadpool and Wolverine
  // If not searching: RANDOMIZED ORDER
  const displayCatalog = useMemo(() => {
    const list = [...filteredTitles];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return list.sort((a, b) => {
        const titleA = (a.parentTitle || a.title).toLowerCase();
        const titleB = (b.parentTitle || b.title).toLowerCase();

        // Exact match first
        const exactA = titleA === q;
        const exactB = titleB === q;
        if (exactA && !exactB) return -1;
        if (!exactA && exactB) return 1;

        // Starts with query
        const startsA = titleA.startsWith(q);
        const startsB = titleB.startsWith(q);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;

        // If both match similarly, sort by chronological release year so Deadpool 1 comes before Deadpool 2, then Deadpool & Wolverine
        return a.year - b.year;
      });
    }

    // Default when no search: stable pseudo-randomized display order (without ugly shuffle button)
    let seed = 42;
    for (let i = list.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [filteredTitles, searchQuery]);

  // VisionQuest featured item reference (catalog ID is vision-quest-2026)
  const visionQuestItem = useMemo(() => {
    return MARVEL_CATALOG.find((t) => t.id === 'vision-quest-2026' || t.id === 'visionquest-2026') || null;
  }, []);

  const handleToggleWatched = (titleId: string) => {
    const existing = watchlistMap.get(titleId);
    if (!existing) {
      updateItemStatus(titleId, 'watched');
    } else {
      const next = existing.status === 'watched' ? 'unwatched' : 'watched';
      updateItemStatus(titleId, next);
    }
  };

  const handleOpenDetail = (title: MarvelTitle, season?: number) => {
    setSelectedTitle(title);
    setSelectedSeasonNumber(season || title.seasonNumber || 1);
  };

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto">
      {/* Top Search Bar (Shuffle button removed as requested) */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (selectedCollectionId) setSelectedCollectionId(null);
            }}
            placeholder="Search Deadpool, Spider-Man, Avengers, Iron Man, Wolverine..."
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

        {/* Scrollable Category Filter Pills:
            [All Titles] -> [Collections] -> [Focus MCU] -> [Upcoming] -> [Movies] -> [Series] -> [Multiverse]
            (Road to Doomsday removed, Collections inserted right between All Titles and Focus MCU as requested!)
        */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
          {[
            { id: 'all' as DiscoverCategory, label: 'All Titles' },
            { id: 'collections' as DiscoverCategory, label: 'Collections' },
            { id: 'mcu' as DiscoverCategory, label: 'Focus MCU' },
            { id: 'upcoming' as DiscoverCategory, label: 'Upcoming Releases' },
            { id: 'movies' as DiscoverCategory, label: 'Movies' },
            { id: 'series' as DiscoverCategory, label: 'Series & Specials' },
            { id: 'multiverse' as DiscoverCategory, label: 'Multiverse & Legacy' },
          ].map((cat) => {
            const isActive = activeCategory === cat.id && !selectedCollectionId;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSelectedCollectionId(null);
                }}
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

      {/* COLLECTIONS VIEW: When 'Collections' category is clicked */}
      {activeCategory === 'collections' && !selectedCollectionId && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-pink-400" />
              Curated Marvel Collections
            </h3>
            <span className="text-xs text-slate-400">{MARVEL_COLLECTIONS.length} Collections</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MARVEL_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-pink-500/60 bg-slate-900 aspect-[16/10] flex flex-col justify-end p-4 cursor-pointer transition-all hover:scale-[1.01] shadow-lg"
              >
                {col.coverImage && (
                  <img
                    src={col.coverImage}
                    alt={col.title}
                    className="absolute inset-0 w-full h-full object-cover filter brightness-50 group-hover:brightness-60 group-hover:scale-105 transition-all duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider bg-pink-950/80 px-2 py-0.5 rounded border border-pink-800/80 inline-block">
                    {col.badge}
                  </span>
                  <h4 className="text-base font-extrabold text-white group-hover:text-pink-300 transition-colors">
                    {col.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono inline-block pt-0.5">
                    {col.itemIds.length} Titles in Collection
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Collection Banner */}
      {selectedCollectionId && (
        <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-800/60 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-pink-400 uppercase">Filtered Collection</span>
            <h4 className="text-sm font-extrabold text-white">
              {MARVEL_COLLECTIONS.find((c) => c.id === selectedCollectionId)?.title}
            </h4>
          </div>
          <button
            onClick={() => setSelectedCollectionId(null)}
            className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Collection
          </button>
        </div>
      )}

      {/* FEATURED HERO BANNER (VisionQuest) */}
      {!searchQuery && activeCategory === 'all' && !selectedCollectionId && (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-900/40 bg-zinc-950 group">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
            <img
              src="/assets/visionquest_featured.jpg"
              alt="VisionQuest"
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/30" />

            {visionQuestItem && (
              <button
                onClick={() => toggleFavorite(visionQuestItem.id)}
                className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all border cursor-pointer shadow-lg active:scale-95 ${
                  isFavorite(visionQuestItem.id)
                    ? 'bg-pink-600 text-white border-pink-500 shadow-pink-900/50'
                    : 'bg-black/60 hover:bg-black/80 text-white border-white/20'
                }`}
                title={isFavorite(visionQuestItem.id) ? 'Favorited' : 'Add to Favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite(visionQuestItem.id) ? 'fill-white' : ''}`} />
              </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/90 text-black">
                  Premiere
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
                  Phase 6
                </span>
                <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                  Disney+ Marvel Series
                </span>
              </div>

              <h2
                className="text-2xl sm:text-4xl font-serif tracking-tight text-white drop-shadow-md cursor-pointer hover:text-amber-300 transition-colors"
                onClick={() => visionQuestItem && handleOpenDetail(visionQuestItem)}
              >
                VisionQuest
              </h2>

              <p className="text-xs text-slate-300 max-w-lg mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                White Vision journeys through existential memory reconstruction and encounters Ultron. Starring Paul Bettany and James Spader.
              </p>

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
                    visionQuestItem && watchlistMap.get(visionQuestItem.id)?.status === 'watched'
                      ? 'bg-emerald-600/90 border-emerald-500 text-white'
                      : 'bg-black/60 border-slate-700 text-slate-200 hover:bg-black/80'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {visionQuestItem && watchlistMap.get(visionQuestItem.id)?.status === 'watched' ? 'Watched' : 'Mark Watched'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Count Header */}
      {!(activeCategory === 'collections' && !selectedCollectionId && !searchQuery) && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>
              <strong className="text-white font-mono">{displayCatalog.length}</strong> Titles
              {searchQuery ? ` matching "${searchQuery}" (Ordered by Accuracy)` : ' in Discovery'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any title to view details &amp; seasons
          </span>
        </div>
      )}

      {/* UNIFIED EDITORIAL POSTER GRID */}
      {!(activeCategory === 'collections' && !selectedCollectionId && !searchQuery) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {displayCatalog.map((item, index) => {
            const watchData = getWatchlistItem(item.id);
            const isBookmarked = watchlistMap.has(item.id);
            const isWatched = watchData.status === 'watched';
            const posterInfo = getPosterInfo(item.id, item.heroCharacter, item.title, item.phase);
            const hasImage = Boolean(posterInfo.posterUrl) && !imgErrors[item.id];

            // Parent display title (e.g. "Spider-Man", "Loki", "Daredevil", "Silver Surfer")
            const displayTitle = (item.parentTitle || item.title).replace(/\s+Season\s+\d+.*$/i, '').trim();
            const totalSeasons = item.totalSeasons || (item.type === 'series' ? 1 : 0);

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900 transition-all duration-300 hover:border-pink-500/60 hover:shadow-xl hover:shadow-pink-950/30 flex flex-col justify-end cursor-pointer col-span-1 aspect-[2/3]"
                onClick={() => handleOpenDetail(item)}
              >
                {/* Poster Image / Background */}
                {hasImage ? (
                  <img
                    src={posterInfo.posterUrl}
                    alt={displayTitle}
                    loading="lazy"
                    onError={() => handleImageError(item.id)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
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

                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none" />

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md active:scale-90 ${
                    isFavorite(item.id)
                      ? 'bg-pink-600 text-white shadow-pink-950/60 ring-1 ring-pink-400'
                      : 'bg-black/50 hover:bg-black/80 text-white/70 hover:text-white border border-white/10'
                  }`}
                  title={isFavorite(item.id) ? 'Favorited' : 'Add to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite(item.id) ? 'fill-white text-white' : ''}`} />
                </button>

                {/* Watched Badge */}
                {isWatched && (
                  <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <Check className="w-2.5 h-2.5" />
                    <span>Watched</span>
                  </div>
                )}

                {/* Season Count Badge for Multi-Season series */}
                {item.type === 'series' && totalSeasons > 1 && (
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-[10px] font-bold shadow-md">
                    {totalSeasons} Seasons · {item.seriesId ? seriesTotalEpisodesMap.get(item.seriesId) : totalSeasons} eps
                  </div>
                )}

                {/* Card Bottom: Overlaid Typography */}
                <div className="relative z-10 p-3 sm:p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium drop-shadow">
                    <span>{item.year}</span>
                    <span aria-hidden="true">·</span>
                    <span className="uppercase tracking-wider">
                      {item.type === 'series'
                        ? totalSeasons > 1
                          ? `${totalSeasons} Seasons · ${item.seriesId ? seriesTotalEpisodesMap.get(item.seriesId) : item.episodesCount} eps`
                          : `${item.episodesCount || 1} eps`
                        : `${item.runtimeMinutes || 120}m`}
                    </span>
                    {item.imdbRating > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-400 font-bold">★ {item.imdbRating}</span>
                      </>
                    )}
                  </div>

                  <h3 className="font-black text-white text-xs sm:text-sm leading-tight drop-shadow-lg line-clamp-2 transition-colors group-hover:text-pink-300">
                    {displayTitle}
                  </h3>

                  <p className="text-[10px] text-slate-400 truncate">
                    {item.heroCharacter}
                  </p>

                  {/* Quick Action Buttons */}
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
      )}

      {/* Selected Title Detail Modal */}
      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle}
          initialSeason={selectedSeasonNumber}
          onClose={() => {
            setSelectedTitle(null);
            setSelectedSeasonNumber(undefined);
          }}
        />
      )}
    </div>
  );
};
