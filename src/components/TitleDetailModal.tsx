import React, { useState, useMemo } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Film,
  Tv,
  Layers,
  Heart,
} from 'lucide-react';
import { MarvelTitle, WatchStatus } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
import { MARVEL_CATALOG } from '../data/marvelCatalog';
import { getPosterInfo } from '../data/marvelPosters';

interface TitleDetailModalProps {
  title: MarvelTitle;
  watchData?: any;
  initialSeason?: number;
  onClose: () => void;
}

export const TitleDetailModal: React.FC<TitleDetailModalProps> = ({
  title,
  initialSeason,
  onClose,
}) => {
  const {
    updateItemStatus,
    updateEpisodesWatched,
    rescheduleDate,
    getWatchlistItem,
    toggleFavorite,
    isFavorite,
  } = useWatchlist();

  // Find all seasons belonging to this series (if seriesId exists)
  const seriesSeasons = useMemo(() => {
    if (!title.seriesId) return [title];
    const seasons = MARVEL_CATALOG.filter((t) => t.seriesId === title.seriesId);
    return seasons.sort((a, b) => (a.seasonNumber || 1) - (b.seasonNumber || 1));
  }, [title]);

  // Total episodes across all seasons of this series (e.g. S1 (5 eps) + S2 (5 eps) = 10 total episodes)
  const allSeasonsTotalEpisodes = useMemo(() => {
    if (!seriesSeasons.length) return title.episodesCount || 1;
    return seriesSeasons.reduce((acc, s) => acc + (s.episodesCount || 0), 0);
  }, [seriesSeasons, title]);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(() => {
    if (initialSeason) return initialSeason;
    return title.seasonNumber || 1;
  });

  const activeTitle = useMemo(() => {
    return seriesSeasons.find((s) => s.seasonNumber === selectedSeasonNumber) || title;
  }, [seriesSeasons, selectedSeasonNumber, title]);

  // LIVE reactive watchData from context
  const watchData = getWatchlistItem(activeTitle.id);

  const [notes, setNotes] = useState(watchData.userNotes || '');
  const [rating, setRating] = useState<number | undefined>(watchData.userRating);
  const [selectedDate, setSelectedDate] = useState(watchData.scheduledDate);
  const [localStatus, setLocalStatus] = useState<WatchStatus>(watchData.status);

  // Sync local status when switching seasons
  React.useEffect(() => {
    const fresh = getWatchlistItem(activeTitle.id);
    setLocalStatus(fresh.status);
    setSelectedDate(fresh.scheduledDate);
    setRating(fresh.userRating);
    setNotes(fresh.userNotes || '');
  }, [activeTitle.id]);

  const isSeries = activeTitle.type === 'series';
  const totalEpisodes = activeTitle.episodesCount || 1;
  const posterInfo = getPosterInfo(activeTitle.id, activeTitle.heroCharacter, activeTitle.title, activeTitle.phase);
  const favorited = isFavorite(activeTitle.id) || (title.seriesId ? isFavorite(title.id) : false);

  const handleStatusChange = (newStatus: WatchStatus) => {
    setLocalStatus(newStatus);
    updateItemStatus(activeTitle.id, newStatus, rating, notes);
  };

  const handleEpisodeClick = (epNum: number) => {
    const newCount = watchData.episodesWatched === epNum ? epNum - 1 : epNum;
    updateEpisodesWatched(activeTitle.id, newCount);
  };

  const handleSaveNotesAndDate = () => {
    if (selectedDate !== watchData.scheduledDate) {
      rescheduleDate(activeTitle.id, selectedDate);
    }
    updateItemStatus(activeTitle.id, localStatus, rating, notes);
    onClose();
  };

  const displayName = title.parentTitle || title.title.replace(/ Season \d+/i, '');

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col sm:items-center sm:justify-center sm:p-4 overflow-y-auto">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-zinc-950 border-0 sm:border sm:border-zinc-800 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        
        {/* --- CINEMATIC WIDESCREEN BANNER HEADER --- */}
        <div className="relative w-full h-56 sm:h-64 shrink-0 overflow-hidden bg-zinc-900">
          {posterInfo.backdropUrl || posterInfo.posterUrl ? (
            <img
              src={posterInfo.backdropUrl || posterInfo.posterUrl}
              alt={displayName}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="absolute inset-0 w-full h-full object-cover object-center filter brightness-65 transition-transform duration-700 scale-105"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-700 scale-105"
              style={{
                background: `radial-gradient(ellipse at top right, ${activeTitle.bannerColor}ee 0%, #18181b 60%, #09090b 100%)`,
              }}
            />
          )}

          {/* Cinematic Scrim Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] opacity-20 [background-size:16px_16px]" />

          {/* Top Right Controls: Favorite & Close Buttons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {/* FAVORITE BUTTON (Requested by user) */}
            <button
              onClick={() => toggleFavorite(activeTitle.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border cursor-pointer shadow-lg active:scale-95 ${
                favorited
                  ? 'bg-pink-600 text-white border-pink-500 shadow-pink-900/50'
                  : 'bg-black/70 hover:bg-black text-slate-300 border-white/20'
              }`}
              title={favorited ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer shadow-lg active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-pink-400">
              <span className="bg-pink-950/80 border border-pink-800/80 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                {activeTitle.phase}
              </span>
              <span aria-hidden="true" className="text-zinc-500">·</span>
              <span className="text-zinc-300">{activeTitle.year}</span>
              <span aria-hidden="true" className="text-zinc-500">·</span>
              <span className="flex items-center gap-1 text-zinc-300">
                {isSeries ? <Tv className="w-3.5 h-3.5 text-purple-400" /> : <Film className="w-3.5 h-3.5 text-pink-400" />}
                {isSeries
                  ? seriesSeasons.length > 1
                    ? `${seriesSeasons.length} Seasons · ${allSeasonsTotalEpisodes} eps total`
                    : `${totalEpisodes} eps`
                  : `${activeTitle.runtimeMinutes} min`}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              {displayName}
            </h2>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <a
                href={`https://www.imdb.com/title/${activeTitle.imdbId}/`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5C518] text-black font-extrabold text-xs hover:bg-[#e0b414] transition-colors shadow-md"
              >
                <span>IMDb {activeTitle.imdbRating}</span>
                <ExternalLink className="w-3 h-3 text-black ml-0.5" />
              </a>

              <span className="text-xs text-zinc-300">
                Director / Creator: <strong className="text-white font-medium">{activeTitle.directorOrCreator}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* --- MULTI-SEASON SELECTOR TABS --- */}
        {seriesSeasons.length > 1 && (
          <div className="px-5 pt-3 pb-2 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Seasons:
            </span>
            <div className="flex items-center gap-1.5">
              {seriesSeasons.map((s) => {
                const sNum = s.seasonNumber || 1;
                const isSelected = sNum === selectedSeasonNumber;
                const sWatch = getWatchlistItem(s.id);
                const isSeasonDone = sWatch.status === 'watched';

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSeasonNumber(sNum)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60'
                    }`}
                  >
                    <span>Season {sNum}</span>
                    {isSeasonDone && <span className="text-[10px] text-emerald-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- SCROLLABLE BODY --- */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Active Season Info */}
          {seriesSeasons.length > 1 && (
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1 border-b border-zinc-900">
              <span className="font-bold text-white">Viewing {activeTitle.title} ({activeTitle.year})</span>
              <span>{activeTitle.episodesCount} Episodes</span>
            </div>
          )}

          {/* Clean Synopsis & Details (ARCHIVE INFO REMOVED AS REQUESTED!) */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              Synopsis &amp; Details
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {activeTitle.synopsis}
            </p>
          </div>

          {/* Watch Status Selector with [✓] and [✕] */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Watch Status
              </h4>
              <span className="text-[11px] font-mono text-zinc-400 capitalize">
                Current: <strong className="text-white">{watchData.status}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => handleStatusChange('unwatched')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'unwatched'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-sm ring-1 ring-white/20'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Unwatched
              </button>

              <button
                onClick={() => handleStatusChange('watching')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'watching'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm ring-1 ring-amber-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" /> Watching
              </button>

              <button
                onClick={() => handleStatusChange('watched')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'watched'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md ring-1 ring-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-400'
                }`}
              >
                <span className="font-bold text-sm">✓</span> Watched
              </button>

              <button
                onClick={() => handleStatusChange('skipped')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'skipped'
                    ? 'bg-rose-950 border-rose-600 text-rose-300 shadow-sm ring-1 ring-rose-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400'
                }`}
              >
                <span className="font-bold text-sm">✕</span> Skipped
              </button>

              <button
                onClick={() => handleStatusChange('on-hold')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'on-hold'
                    ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Pause className="w-3.5 h-3.5" /> On Hold
              </button>
            </div>
          </div>

          {/* Episode Tracker for Series */}
          {isSeries && (
            <div className="space-y-2 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                  <Tv className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>Episode Tracker</span>
                  {seriesSeasons.length > 1 && (
                    <span className="text-pink-300 font-bold bg-pink-950/80 border border-pink-700/60 px-2 py-0.5 rounded text-[11px]">
                      Season {selectedSeasonNumber}
                    </span>
                  )}
                </span>
                <span className="font-mono text-zinc-300 tabular-nums text-xs">
                  {watchData.episodesWatched} of {totalEpisodes} episodes ({totalEpisodes > 0 ? Math.round((watchData.episodesWatched / totalEpisodes) * 100) : 0}%)
                </span>
              </div>

              {/* Episode clickable pill grid */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {Array.from({ length: totalEpisodes }).map((_, i) => {
                  const epNumber = i + 1;
                  const isDone = epNumber <= watchData.episodesWatched;
                  return (
                    <button
                      key={epNumber}
                      onClick={() => handleEpisodeClick(epNumber)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isDone
                          ? 'bg-pink-600 text-white shadow-sm ring-1 ring-pink-400 scale-105'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/60'
                      }`}
                      title={`Episode ${epNumber}: ${isDone ? 'Watched' : 'Mark watched'}`}
                    >
                      {epNumber}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-zinc-500 pt-1">
                Click any episode number to set your progress. Reaches {totalEpisodes} to auto-complete this season.
              </p>
            </div>
          )}

          {/* Schedule Viewing Date & User Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="scheduled-date-input" className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Scheduled Date
              </label>
              <input
                id="scheduled-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400" /> Your Rating (1-10)
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starVal) => (
                  <button
                    key={starVal}
                    onClick={() => setRating(starVal === rating ? undefined : starVal)}
                    className={`w-6 h-7 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      rating && starVal <= rating
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-800 hover:text-zinc-400'
                    }`}
                  >
                    {starVal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Watch Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes-textarea" className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              Personal Watch Notes
            </label>
            <textarea
              id="notes-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Loved the post-credits scene, set up Avengers: Doomsday..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-pink-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>
              {watchData.watchedDate
                ? `Finished on ${new Date(watchData.watchedDate).toLocaleDateString()}`
                : `Target: ${selectedDate}`}
            </span>
          </div>

          <button
            onClick={handleSaveNotesAndDate}
            className="py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-950/50 transition-all cursor-pointer active:scale-95"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
