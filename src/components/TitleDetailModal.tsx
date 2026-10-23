import React, { useState } from 'react';
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
  Sparkles,
} from 'lucide-react';
import { MarvelTitle, WatchlistItem, WatchStatus } from '../types';
import { useWatchlist } from '../context/WatchlistContext';
interface TitleDetailModalProps {
  title: MarvelTitle;
  watchData: WatchlistItem;
  onClose: () => void;
}

export const TitleDetailModal: React.FC<TitleDetailModalProps> = ({ title, watchData, onClose }) => {
  const { updateItemStatus, updateEpisodesWatched, rescheduleDate } = useWatchlist();

  const [notes, setNotes] = useState(watchData.userNotes || '');
  const [rating, setRating] = useState<number | undefined>(watchData.userRating);
  const [selectedDate, setSelectedDate] = useState(watchData.scheduledDate);

  const isSeries = title.type === 'series';
  const totalEpisodes = title.episodesCount || 1;

  const handleStatusChange = (newStatus: WatchStatus) => {
    updateItemStatus(title.id, newStatus, rating, notes);
  };

  const handleEpisodeClick = (epNum: number) => {
    const newCount = watchData.episodesWatched === epNum ? epNum - 1 : epNum;
    updateEpisodesWatched(title.id, newCount);
  };

  const handleSaveNotesAndDate = () => {
    if (selectedDate !== watchData.scheduledDate) {
      rescheduleDate(title.id, selectedDate);
    }
    updateItemStatus(title.id, watchData.status, rating, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col sm:items-center sm:justify-center sm:p-4 overflow-y-auto">
      {/* Full screen on mobile (w-full h-full), card modal on desktop (sm:max-w-2xl sm:h-auto sm:rounded-3xl) */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-zinc-950 border-0 sm:border sm:border-zinc-800 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        
        {/* --- CINEMATIC WIDESCREEN BANNER HEADER --- */}
        <div className="relative w-full h-52 sm:h-60 shrink-0 overflow-hidden bg-zinc-900">
          {/* Visual cinematic backdrop gradient & texture */}
          <div
            className="absolute inset-0 transition-transform duration-700 scale-105"
            style={{
              background: `radial-gradient(ellipse at top right, ${title.bannerColor}ee 0%, #18181b 60%, #09090b 100%)`,
            }}
          />

          {/* Film Grain & Multiverse Starburst overlay */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Ambient Multiverse Glow Motif */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

          {/* Dark Cinematic Gradient Scrim (for WCAG readability) */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-black/40" />

          {/* Close Button Pinned to Top-Right */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all border border-white/20 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Hero Content Layer */}
          <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-pink-400">
              <span className="bg-pink-950/80 border border-pink-800/80 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                {title.phase}
              </span>
              <span aria-hidden="true" className="text-zinc-500">·</span>
              <span className="text-zinc-300">{title.year}</span>
              <span aria-hidden="true" className="text-zinc-500">·</span>
              <span className="flex items-center gap-1 text-zinc-300">
                {isSeries ? <Tv className="w-3.5 h-3.5 text-purple-400" /> : <Film className="w-3.5 h-3.5 text-pink-400" />}
                {isSeries ? `${title.episodesCount} Episodes` : `${title.runtimeMinutes} min`}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
              {title.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {/* Official IMDb yellow button */}
              <a
                href={`https://www.imdb.com/title/${title.imdbId}/`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5C518] text-black font-extrabold text-xs hover:bg-[#e0b414] transition-colors shadow-md"
                title="View full film metadata on IMDb"
              >
                <span>IMDb {title.imdbRating}</span>
                <ExternalLink className="w-3 h-3 text-black ml-0.5" />
              </a>

              <span className="text-xs text-zinc-300">
                Directed by <strong className="text-white font-medium">{title.directorOrCreator}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Synopsis */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              Synopsis
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {title.synopsis}
            </p>
          </div>

          {/* Watch Status Selector with [✓] and [✕] */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              Watch Status
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => handleStatusChange('unwatched')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'unwatched'
                    ? 'bg-zinc-800 border-zinc-600 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Unwatched
              </button>

              <button
                onClick={() => handleStatusChange('watching')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'watching'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" /> Watching
              </button>

              <button
                onClick={() => handleStatusChange('watched')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'watched'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-400'
                }`}
              >
                <span className="font-bold text-sm">✓</span> Watched
              </button>

              <button
                onClick={() => handleStatusChange('skipped')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  watchData.status === 'skipped'
                    ? 'bg-rose-950 border-rose-600 text-rose-300 shadow-sm'
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
            <div className="space-y-2 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-pink-400" /> Episode Tracker
                </span>
                <span className="font-mono text-zinc-400 tabular-nums">
                  {watchData.episodesWatched} of {totalEpisodes} episodes ({Math.round((watchData.episodesWatched / totalEpisodes) * 100)}%)
                </span>
              </div>

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
                          ? 'bg-pink-600 text-white shadow-sm'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700/60'
                      }`}
                      title={`Episode ${epNumber}: ${isDone ? 'Watched' : 'Mark watched'}`}
                    >
                      {epNumber}
                    </button>
                  );
                })}
              </div>
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
              placeholder="e.g. Watched with friends, great post-credits scene for Doomsday..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-pink-500"
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
            className="py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-950/50 transition-all cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
