import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  Search,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Film,
  Tv,
  ListOrdered,
  FolderTree,
  Heart,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MarvelTitle, WatchStatus, GroupingMode } from '../types';
import { TitleDetailModal } from './TitleDetailModal';

interface OrderTabProps {
  onOpenWizard: () => void;
}

const PHASE_METADATA: Record<string, { label: string; badge: string; color: string }> = {
  'Phase 1': {
    label: 'Phase 1: Avengers Assembled',
    badge: 'MCU Phase 1',
    color: 'from-amber-600/30 to-orange-950/40 border-amber-800/40 text-amber-300',
  },
  'Phase 2': {
    label: 'Phase 2: Age of Heroes',
    badge: 'MCU Phase 2',
    color: 'from-blue-600/30 to-cyan-950/40 border-blue-800/40 text-blue-300',
  },
  'Phase 3': {
    label: 'Phase 3: The Infinity War',
    badge: 'MCU Phase 3',
    color: 'from-purple-600/30 to-indigo-950/40 border-purple-800/40 text-purple-300',
  },
  'Phase 4': {
    label: 'Phase 4: Multiverse & New Beginnings',
    badge: 'MCU Phase 4',
    color: 'from-rose-600/30 to-pink-950/40 border-rose-800/40 text-rose-300',
  },
  'Phase 5': {
    label: 'Phase 5: The Multiverse Saga',
    badge: 'MCU Phase 5',
    color: 'from-emerald-600/30 to-teal-950/40 border-emerald-800/40 text-emerald-300',
  },
  'Phase 6': {
    label: 'Phase 6: Road to Doomsday & Secret Wars',
    badge: 'MCU Phase 6',
    color: 'from-pink-600/30 to-fuchsia-950/40 border-pink-800/40 text-pink-300',
  },
  'Upcoming': {
    label: 'Upcoming Releases & In Development',
    badge: 'Future Slate',
    color: 'from-violet-600/30 to-purple-950/40 border-violet-800/40 text-violet-300',
  },
  'Fox / Sony Multiverse': {
    label: 'Fox / Sony Multiverse Marvel',
    badge: 'Multiverse Canon',
    color: 'from-cyan-600/30 to-sky-950/40 border-cyan-800/40 text-cyan-300',
  },
  'Legacy Marvel': {
    label: 'Classic & Legacy Marvel Era',
    badge: '1944–2000s Legacy',
    color: 'from-slate-700/30 to-zinc-950/40 border-slate-700/40 text-slate-300',
  },
};

export const OrderTab: React.FC<OrderTabProps> = ({ onOpenWizard }) => {
  const {
    orderConfig,
    activeOrderTitles,
    reorderItems,
    updateItemStatus,
    applyOrderConfiguration,
    getWatchlistItem,
    toggleFavorite,
    isFavorite,
  } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series' | 'unwatched' | 'watched' | 'skipped'>('all');
  const [selectedTitle, setSelectedTitle] = useState<{ item: MarvelTitle; season?: number } | null>(null);

  const effectiveGrouping: GroupingMode = orderConfig.groupingMode || 'phase';
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filtered titles
  const displayedTitles = activeOrderTitles.filter((entry) => {
    const liveWatch = getWatchlistItem(entry.item.id);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.item.title.toLowerCase().includes(q) || (entry.item.parentTitle && entry.item.parentTitle.toLowerCase().includes(q));
      const matchHero = entry.item.heroCharacter.toLowerCase().includes(q);
      const matchPhase = entry.item.phase.toLowerCase().includes(q);
      if (!matchTitle && !matchHero && !matchPhase) return false;
    }

    if (filterType === 'movie') return entry.item.type === 'movie';
    if (filterType === 'series') return entry.item.type === 'series';
    if (filterType === 'unwatched') return liveWatch.status === 'unwatched';
    if (filterType === 'watched') return liveWatch.status === 'watched';
    if (filterType === 'skipped') return liveWatch.status === 'skipped';

    return true;
  });

  // Group by Phase when in 'phase' mode
  const phaseGroupedList = useMemo(() => {
    if (effectiveGrouping !== 'phase') return [];

    const orderGroups: { phase: string; items: { entry: (typeof displayedTitles)[0]; originalIndex: number }[] }[] = [];
    const groupMap = new Map<string, { entry: (typeof displayedTitles)[0]; originalIndex: number }[]>();

    displayedTitles.forEach((entry, idx) => {
      const phaseName = entry.item.phase || 'Other';
      if (!groupMap.has(phaseName)) {
        groupMap.set(phaseName, []);
        orderGroups.push({ phase: phaseName, items: groupMap.get(phaseName)! });
      }
      groupMap.get(phaseName)!.push({ entry, originalIndex: idx });
    });

    return orderGroups;
  }, [displayedTitles, effectiveGrouping]);

  const handleMoveUp = (index: number) => {
    if (index > 0) reorderItems(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < activeOrderTitles.length - 1) reorderItems(index, index + 1);
  };

  const handleToggleWatched = (itemId: string, currentStatus: WatchStatus) => {
    const nextStatus: WatchStatus = currentStatus === 'watched' ? 'unwatched' : 'watched';
    updateItemStatus(itemId, nextStatus);
  };

  const handleToggleSkipped = (itemId: string, currentStatus: WatchStatus) => {
    const nextStatus: WatchStatus = currentStatus === 'skipped' ? 'unwatched' : 'skipped';
    updateItemStatus(itemId, nextStatus);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderItems(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const toggleGrouping = (mode: GroupingMode) => {
    applyOrderConfiguration({
      ...orderConfig,
      groupingMode: mode,
    });
  };

  // Render an individual title card (preserves specific season titles like Spider-Man Season 2 in order)
  const renderTitleCard = (entry: (typeof displayedTitles)[0], index: number) => {
    const liveWatch = getWatchlistItem(entry.item.id);
    const isSeries = entry.item.type === 'series';
    const isWatched = liveWatch.status === 'watched';
    const isSkipped = liveWatch.status === 'skipped';

    return (
      <div
        key={entry.item.id}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(index)}
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          draggedIndex === index
            ? 'opacity-40 border-pink-500 bg-pink-950/30'
            : isWatched
            ? 'bg-zinc-950/70 border-emerald-950/70'
            : isSkipped
            ? 'bg-zinc-950/50 border-zinc-900/60 opacity-60'
            : 'bg-zinc-900/90 border-zinc-800/90 hover:border-pink-950/60'
        }`}
      >
        {/* Left: Drag Handle, Number, Title & Sub-metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex flex-col items-center justify-center text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400">
            <GripVertical className="w-4 h-4" />
          </div>

          <span className="w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-800 text-pink-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {index + 1}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                onClick={() => setSelectedTitle({ item: entry.item, season: entry.item.seasonNumber })}
                className={`text-sm font-bold truncate cursor-pointer transition-colors ${
                  isWatched
                    ? 'text-emerald-300 line-through'
                    : isSkipped
                    ? 'text-slate-500 line-through'
                    : 'text-white hover:text-pink-400'
                }`}
              >
                {entry.item.title}
              </h4>

              {entry.item.isUpcoming && (
                <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded shrink-0">
                  {entry.item.upcomingDateText || 'Upcoming'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span>{entry.item.year}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                {isSeries ? <Tv className="w-3 h-3 text-purple-400" /> : <Film className="w-3 h-3 text-pink-400" />}
                {isSeries ? `${entry.item.episodesCount} eps` : `${entry.item.runtimeMinutes}m`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{entry.item.phase}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300">{entry.item.heroCharacter}</span>
            </div>
          </div>
        </div>

        {/* Right: Favorite + Quick [✓] (Watched) & [✕] (Skipped) Controls + IMDb + Reorder */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Favorite Toggle Button */}
          <button
            onClick={() => toggleFavorite(entry.item.id)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isFavorite(entry.item.id)
                ? 'bg-pink-950/80 border-pink-500 text-pink-400 shadow-sm shadow-pink-950/40'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-pink-400 hover:border-pink-900/60'
            }`}
            title={isFavorite(entry.item.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite(entry.item.id) ? 'fill-pink-400 text-pink-400' : ''}`} />
          </button>

          <a
            href={`https://www.imdb.com/title/${entry.item.imdbId}/`}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F5C518] text-black font-extrabold text-[10px] hover:bg-[#e0b414] transition-colors"
            title={`IMDb Rating: ${entry.item.imdbRating}`}
          >
            <span>IMDb {entry.item.imdbRating}</span>
            <ExternalLink className="w-2.5 h-2.5 text-black" />
          </a>

          {/* [✓] BUTTON FOR WATCHED */}
          <button
            onClick={() => handleToggleWatched(entry.item.id, liveWatch.status)}
            className={`min-h-[38px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
              isWatched
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-700/60'
            }`}
            title={isWatched ? 'Mark as Unwatched' : 'Mark as Watched [✓]'}
          >
            <span className="text-sm">✓</span>
            <span className="text-[11px] hidden sm:inline">{isWatched ? 'Watched' : 'Watch'}</span>
          </button>

          {/* [X] BUTTON FOR SKIPPED */}
          <button
            onClick={() => handleToggleSkipped(entry.item.id, liveWatch.status)}
            className={`min-h-[38px] px-2.5 sm:px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
              isSkipped
                ? 'bg-rose-950/90 border-rose-600 text-rose-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-700/60'
            }`}
            title={isSkipped ? 'Unskip Title' : 'Skip Title [✕]'}
          >
            <span className="text-sm">✕</span>
            <span className="text-[11px] hidden sm:inline">{isSkipped ? 'Skipped' : 'Skip'}</span>
          </button>

          {/* Up / Down Reorder */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
              title="Move up in watch order"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleMoveDown(index)}
              disabled={index === activeOrderTitles.length - 1}
              className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
              title="Move down in watch order"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Controls: Search, Adjust Order, and Quick Grouping Toggle */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in your order by title, hero, phase..."
              className="w-full bg-[#07070a] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick [BY PHASE] / [ONE LONG LIST] Switcher */}
            <div className="flex items-center bg-[#07070a] border border-zinc-800 p-0.5 rounded-xl">
              <button
                onClick={() => toggleGrouping('phase')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  effectiveGrouping === 'phase'
                    ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Group by Marvel Phases"
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">By Phase</span>
              </button>

              <button
                onClick={() => toggleGrouping('list')}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  effectiveGrouping === 'list'
                    ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/50'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Continuous list without phasing"
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">One Long List</span>
              </button>
            </div>

            <button
              onClick={onOpenWizard}
              className="py-2 px-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-pink-900/50 hover:border-pink-500/60 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
              <span>Adjust Order</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {(['all', 'movie', 'series', 'unwatched', 'watched', 'skipped'] as const).map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                filterType === ft
                  ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/50'
                  : 'bg-zinc-950 border border-zinc-800 text-slate-400 hover:text-slate-200 hover:border-pink-950/60'
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Info indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <GripVertical className="w-4 h-4 text-slate-500" />
          <span>Active Timeline: Tap [✓] for Watched, [✕] for Skipped, or click for all seasons.</span>
        </span>
        <span className="font-mono text-slate-500">
          {displayedTitles.length} of {activeOrderTitles.length} Titles
        </span>
      </div>

      {/* Empty State */}
      {displayedTitles.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <Film className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-white">No titles match your filter</h4>
          <p className="text-xs text-slate-400">Try clearing the search query or selecting a different filter.</p>
        </div>
      ) : effectiveGrouping === 'phase' ? (
        /* --- VIEW 1: [BY PHASE] --- */
        <div className="space-y-6">
          {phaseGroupedList.map((group) => {
            const meta = PHASE_METADATA[group.phase] || {
              label: group.phase,
              badge: 'Marvel',
              color: 'from-pink-900/30 to-slate-900/40 border-pink-900/40 text-pink-300',
            };

            const phaseWatchedCount = group.items.filter((i) => getWatchlistItem(i.entry.item.id).status === 'watched').length;
            const phaseTotal = group.items.length;
            const phasePct = Math.round((phaseWatchedCount / phaseTotal) * 100);

            return (
              <div key={group.phase} className="space-y-3">
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${meta.color} border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md`}>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded border border-white/10">
                        {meta.badge}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {phaseWatchedCount} of {phaseTotal} Completed ({phasePct}%)
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white tracking-tight">
                      {meta.label}
                    </h3>
                  </div>

                  <div className="w-full sm:w-36 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-pink-500 rounded-full transition-all duration-300"
                      style={{ width: `${phasePct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {group.items.map(({ entry, originalIndex }) =>
                    renderTitleCard(entry, originalIndex)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* --- VIEW 2: [ONE LONG LIST] --- */
        <div className="space-y-2.5">
          {displayedTitles.map((entry, index) =>
            renderTitleCard(entry, index)
          )}
        </div>
      )}

      {/* Selected Title Detail Modal */}
      {selectedTitle && (
        <TitleDetailModal
          title={selectedTitle.item}
          initialSeason={selectedTitle.season}
          onClose={() => setSelectedTitle(null)}
        />
      )}
    </div>
  );
};
