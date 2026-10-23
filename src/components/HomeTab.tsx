import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Play,
  Pause,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ChevronLeft,
  Tv,
  Film,
  Plus,
  Minus,
  Star,
  Flame,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MarvelTitle, WatchlistItem } from '../types';
import { TitleDetailModal } from './TitleDetailModal';

type HomeSubTab = 'progress' | 'calendar' | 'history';

export const HomeTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<HomeSubTab>('progress');
  const [selectedTitle, setSelectedTitle] = useState<{ item: MarvelTitle; watchData: WatchlistItem } | null>(null);

  const {
    activeOrderTitles,
    historyList,
    stats,
    updateItemStatus,
    updateEpisodesWatched,
    rescheduleDate,
    orderConfig,
  } = useWatchlist();

  // Find next up to watch
  const nextUp = activeOrderTitles.find(
    (entry) => !entry.item.isUpcoming && (entry.watchData.status === 'watching' || entry.watchData.status === 'unwatched')
  );

  // In-progress items (watching status or series with >0 and < total episodes)
  const inProgressTitles = activeOrderTitles.filter((entry) => {
    if (entry.watchData.status === 'watching') return true;
    if (entry.item.type === 'series') {
      const epsWatched = entry.watchData.episodesWatched;
      const totalEps = entry.item.episodesCount || 1;
      return epsWatched > 0 && epsWatched < totalEps;
    }
    return false;
  });

  // On Hold items
  const onHoldTitles = activeOrderTitles.filter(
    (entry) => entry.watchData.status === 'on-hold'
  );

  // Upcoming items (not released yet)
  const upcomingTitles = activeOrderTitles.filter((entry) => entry.item.isUpcoming);

  // Calendar view helper state
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => new Date());

  const year = currentCalendarMonth.getFullYear();
  const month = currentCalendarMonth.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map dates in YYYY-MM-DD to titles scheduled
  const scheduleMap = React.useMemo(() => {
    const map = new Map<string, { item: MarvelTitle; watchData: WatchlistItem }[]>();
    activeOrderTitles.forEach((entry) => {
      const dateStr = entry.watchData.scheduledDate;
      if (dateStr) {
        const existing = map.get(dateStr) || [];
        existing.push(entry);
        map.set(dateStr, existing);
      }
    });
    return map;
  }, [activeOrderTitles]);

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Home Sub-Navigation Segmented Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-pink-950/40 rounded-xl">
          <button
            onClick={() => setActiveSubTab('progress')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'progress'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Progress
          </button>

          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'calendar'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Calendar
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            History ({historyList.length})
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{stats.completionPercentage}% of order completed</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* --- SUBTAB 1: PROGRESS --- */}
      {/* ======================================================== */}
      {activeSubTab === 'progress' && (
        <div className="space-y-6">


          {/* SECTION: Continue Watching (Series with unfinished episodes) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                Continue Watching ({inProgressTitles.length})
              </h4>
              <span className="text-xs text-slate-400">Series in progress</span>
            </div>

            {inProgressTitles.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 text-center">
                No series currently midway. Start one from your Order tab to track episodes!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inProgressTitles.map((entry) => {
                  const totalEps = entry.item.episodesCount || 1;
                  const watchedEps = entry.watchData.episodesWatched || 0;
                  const pct = Math.round((watchedEps / totalEps) * 100);

                  return (
                    <div
                      key={entry.item.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="space-y-1 cursor-pointer"
                          onClick={() => setSelectedTitle(entry)}
                        >
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Tv className="w-3.5 h-3.5 text-purple-400" />
                            <span>{entry.item.phase}</span>
                            <span aria-hidden="true">·</span>
                            <span>{entry.item.year}</span>
                          </div>
                          <h5 className="text-sm font-bold text-white hover:text-pink-400 transition-colors">
                            {entry.item.title}
                          </h5>
                          <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                            {watchedEps} of {totalEps} episodes completed ({pct}%)
                          </p>
                        </div>

                        {/* Quick Episode Stepper */}
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                          <button
                            onClick={() => updateEpisodesWatched(entry.item.id, watchedEps - 1)}
                            disabled={watchedEps <= 0}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                            title="Decrement episode"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-white">
                            {watchedEps}
                          </span>
                          <button
                            onClick={() => updateEpisodesWatched(entry.item.id, watchedEps + 1)}
                            disabled={watchedEps >= totalEps}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                            title="Next episode watched"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION: On Hold Movies and Series */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Pause className="w-4 h-4 text-blue-400" />
                On Hold ({onHoldTitles.length})
              </h4>
              <span className="text-xs text-slate-400">Paused for later</span>
            </div>

            {onHoldTitles.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 text-center">
                No titles on hold right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {onHoldTitles.map((entry) => (
                  <div
                    key={entry.item.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{entry.item.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {entry.item.type === 'series' ? `${entry.item.episodesCount} eps` : `${entry.item.runtimeMinutes}m`} · {entry.item.year}
                      </p>
                    </div>

                    <button
                      onClick={() => updateItemStatus(entry.item.id, 'watching')}
                      className="py-1 px-3 rounded-lg bg-blue-900/40 border border-blue-700/60 text-blue-300 text-xs font-medium hover:bg-blue-800/60 transition-colors shrink-0 cursor-pointer"
                    >
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION: Upcoming / Not Released Yet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Upcoming / Not Released Yet ({upcomingTitles.length})
              </h4>
              <span className="text-xs text-slate-400">Road to Secret Wars</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingTitles.map((entry) => (
                <div
                  key={entry.item.id}
                  onClick={() => setSelectedTitle(entry)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded">
                        {entry.item.upcomingDateText || 'Upcoming'}
                      </span>
                      <h5 className="text-sm font-bold text-white mt-1.5">{entry.item.title}</h5>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 shrink-0">
                      IMDb Anticipated
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {entry.item.synopsis}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                    <span>Directed by {entry.item.directorOrCreator}</span>
                    <span className="text-slate-300 font-medium">Phase 6 Anchor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* --- SUBTAB 2: CALENDAR --- */}
      {/* ======================================================== */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          {/* Daily Scheduled Watch Card in Calendar */}
          {nextUp ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-pink-950/40 via-zinc-900 to-[#0c0c12] border border-pink-900/50 shadow-xl shadow-pink-950/20 relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-pink-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Daily Scheduled Watch
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {nextUp.item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{nextUp.item.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{nextUp.item.phase}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400 font-mono">IMDb {nextUp.item.imdbRating}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-pink-300 font-medium">Scheduled {nextUp.watchData.scheduledDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => updateItemStatus(nextUp.item.id, 'watched')}
                    className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mark Watched
                  </button>

                  <button
                    onClick={() => setSelectedTitle(nextUp)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">All Scheduled Titles Caught Up!</h4>
              <p className="text-xs text-slate-400">
                You’ve finished every released title currently scheduled in your {orderConfig.orderType} order.
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-pink-500" />
                Personalized Watching Calendar
              </h3>
              <p className="text-xs text-slate-400">
                Automatically calculated from your {orderConfig.orderType} order sequence.
              </p>
            </div>

            {/* Month Switcher */}
            <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-bold text-slate-200 font-mono">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-hidden">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-2">
              {/* Empty leading padding days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-16 rounded-xl bg-slate-950/20" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedMonth = String(month + 1).padStart(2, '0');
                const formattedDay = String(dayNum).padStart(2, '0');
                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

                const scheduledItems = scheduleMap.get(dateKey) || [];
                const isToday =
                  new Date().toISOString().split('T')[0] === dateKey;

                return (
                  <div
                    key={dateKey}
                    className={`min-h-20 sm:min-h-24 p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                      isToday
                        ? 'bg-pink-950/40 border-pink-500/80 shadow-sm shadow-pink-950/40'
                        : scheduledItems.length > 0
                        ? 'bg-zinc-950/90 border-zinc-800 hover:border-pink-900/60'
                        : 'bg-zinc-950/30 border-zinc-900/60 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-mono font-bold ${
                        isToday ? 'text-pink-400' : 'text-slate-300'
                      }`}>
                        {dayNum}
                      </span>
                      {scheduledItems.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500" />
                      )}
                    </div>

                    <div className="space-y-1 mt-1 overflow-hidden">
                      {scheduledItems.slice(0, 2).map((entry) => (
                        <div
                          key={entry.item.id}
                          onClick={() => setSelectedTitle(entry)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer transition-colors ${
                            entry.watchData.status === 'watched'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 line-through'
                              : 'bg-pink-950/40 text-pink-200 border border-pink-800/40 hover:bg-pink-900/50'
                          }`}
                          title={entry.item.title}
                        >
                          {entry.item.title}
                        </div>
                      ))}
                      {scheduledItems.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-mono block text-center">
                          +{scheduledItems.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of upcoming schedule items */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Upcoming Schedule Breakdown
            </h4>
            <div className="space-y-2">
              {activeOrderTitles.slice(0, 8).map((entry) => (
                <div
                  key={entry.item.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-slate-400 text-[11px] shrink-0">
                      {entry.watchData.scheduledDate}
                    </span>
                    <span className="font-semibold text-slate-200 truncate cursor-pointer hover:text-pink-400 transition-colors" onClick={() => setSelectedTitle(entry)}>
                      {entry.item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {entry.watchData.status === 'watched' ? (
                      <span className="text-[10px] text-emerald-400 font-medium">Watched</span>
                    ) : (
                      <button
                        onClick={() => updateItemStatus(entry.item.id, 'watched')}
                        className="py-1 px-2.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-600/30 text-[10px] font-medium cursor-pointer"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* --- SUBTAB 3: HISTORY --- */}
      {/* ======================================================== */}
      {activeSubTab === 'history' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Watch History &amp; Completed Records
              </h3>
              <p className="text-xs text-slate-400">
                All movies and series you've completed, stamped with dates.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {historyList.length} Titles Finished
            </span>
          </div>

          {historyList.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Film className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Completed Titles Yet</h4>
              <p className="text-xs text-slate-400">
                When you mark titles as watched, they will automatically be logged here with completion dates and your personal ratings!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((entry) => {
                const completedDateStr = entry.watchData.watchedDate
                  ? new Date(entry.watchData.watchedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recorded';

                return (
                  <div
                    key={entry.item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-emerald-400 font-medium">Completed: {completedDateStr}</span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.item.phase}</span>
                      </div>

                      <h5
                        className="text-sm font-bold text-white hover:text-pink-400 cursor-pointer transition-colors"
                        onClick={() => setSelectedTitle(entry)}
                      >
                        {entry.item.title}
                      </h5>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{entry.item.year}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {entry.item.type === 'series'
                            ? `${entry.item.episodesCount} episodes`
                            : `${entry.item.runtimeMinutes} min`}
                        </span>
                        {entry.watchData.userRating && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-400 flex items-center gap-0.5 font-mono">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {entry.watchData.userRating}/10
                            </span>
                          </>
                        )}
                      </div>

                      {entry.watchData.userNotes && (
                        <p className="text-xs text-slate-300 italic pt-1">
                          "{entry.watchData.userNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://www.imdb.com/title/${entry.item.imdbId}/`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-2 py-1 rounded bg-[#F5C518] text-black font-extrabold text-[11px] hover:bg-[#e0b414] transition-colors flex items-center gap-1"
                      >
                        <span>IMDb</span>
                        <ExternalLink className="w-2.5 h-2.5 text-black" />
                      </a>

                      <button
                        onClick={() => setSelectedTitle(entry)}
                        className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
