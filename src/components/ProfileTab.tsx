import React, { useState } from 'react';
import {
  Film,
  Tv,
  Clock,
  Sparkles,
  Flame,
  Award,
  RotateCcw,
  Sliders,
  Check,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { HERO_AVATARS, HeroAvatarItem } from '../data/avatars';
import { HeroAvatar } from './HeroAvatar';

export const ProfileTab: React.FC = () => {
  const { profile, updateProfile, stats, resetAllData, orderConfig } = useWatchlist();

  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [paceDays, setPaceDays] = useState(profile.paceDaysPerItem);

  const activeAvatar =
    HERO_AVATARS.find((a) => a.id === profile.avatarId) || HERO_AVATARS[0];

  const handleSaveProfile = () => {
    updateProfile({
      username,
      displayName,
      paceDaysPerItem: paceDays,
    });
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2200);
  };

  const handleSelectAvatar = (option: HeroAvatarItem) => {
    updateProfile({
      avatarId: option.id,
    });
  };

  // Convert minutes into hours & minutes
  const hours = Math.floor(stats.totalScreenTimeMinutes / 60);
  const minutes = stats.totalScreenTimeMinutes % 60;
  const formattedScreenTime = `${hours}h ${minutes}m`;

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-pink-900/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Active Avatar Display */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500 shadow-2xl flex items-center justify-center p-1 bg-white/95 transition-transform hover:scale-105">
              <img
                src={activeAvatar.src}
                alt={activeAvatar.name}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
              ✓
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {profile.displayName || 'Pantheress'}
              </h2>
              <span className="text-[11px] font-mono text-pink-400 bg-pink-950/60 border border-pink-900/60 px-2 py-0.5 rounded-md">
                @{profile.username || 'phanteress'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Active Roadmap:{' '}
              <span className="text-pink-300 font-semibold uppercase">
                {orderConfig.properties.replace('-', ' ')}
              </span>{' '}
              ·{' '}
              <span className="text-zinc-200 capitalize">
                {orderConfig.orderType} Order
              </span>
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-300">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-pink-400" />
                <span>Rank: {activeAvatar.name}</span>
              </span>
              <span aria-hidden="true" className="text-zinc-700">
                ·
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-pink-500" />
                <span>
                  Pace: 1 title /{' '}
                  {profile.paceDaysPerItem === 1
                    ? 'day'
                    : `${profile.paceDaysPerItem} days`}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Marvel Insignias Provided (From Image) */}
        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider">
              Superhero Profile Icons (Tap to Select)
            </h4>
            <span className="text-[11px] text-zinc-400 font-mono">
              {HERO_AVATARS.length} Icons Available
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5 max-h-72 overflow-y-auto p-1 scrollbar-thin">
            {HERO_AVATARS.map((option) => {
              const isSelected = profile.avatarId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectAvatar(option)}
                  className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center relative ${
                    isSelected
                      ? 'border-pink-500 bg-pink-950/40 shadow-lg ring-2 ring-pink-500/50 scale-105'
                      : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                  title={option.name}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/95 p-0.5 border border-pink-500/30 flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={option.src}
                      alt={option.name}
                      className="w-full h-full object-contain rounded-full"
                      loading="lazy"
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-pink-500 text-black flex items-center justify-center text-[9px] font-extrabold shadow">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Edit Profile Details Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/80">
          <div className="space-y-1.5">
            <label
              htmlFor="display-name-input"
              className="text-xs font-semibold text-zinc-400"
            >
              Display Name
            </label>
            <input
              id="display-name-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="username-input"
              className="text-xs font-semibold text-zinc-400"
            >
              Username (@)
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
            />
          </div>
        </div>

        {/* Viewing Pace Setting */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-pink-400" /> Viewing Schedule Pace
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1, label: '1 Day / Title', desc: 'Binge Pace' },
              { val: 2, label: '2 Days / Title', desc: 'Standard Pace' },
              { val: 3, label: '3 Days / Title', desc: 'Relaxed Pace' },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setPaceDays(p.val)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paceDays === p.val
                    ? 'border-pink-500 bg-pink-950/40 text-white shadow-md'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[10px] text-zinc-500">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isSavedToast ? (
            <span className="text-xs text-pink-400 flex items-center gap-1 font-semibold animate-fade-in">
              <Check className="w-4 h-4" /> Profile details saved!
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500">
              Auto-saved to device storage.
            </span>
          )}

          <button
            onClick={handleSaveProfile}
            className="py-2.5 px-6 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-950/50 transition-all cursor-pointer"
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            Your Watching Stats
          </h3>
          <span className="text-xs font-mono text-zinc-400">
            {stats.completedTitlesCount} of {stats.totalTitlesInOrder} titles done
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Stat 1: Episodes */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
                Episodes
              </span>
              <Tv className="w-4 h-4 text-pink-400" />
            </div>
            <div className="pt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.episodesWatched}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Watched across series</p>
            </div>
          </div>

          {/* Stat 2: Shows */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
                Shows
              </span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <div className="pt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.showsWatched}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Completed series</p>
            </div>
          </div>

          {/* Stat 3: Movies */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
                Movies
              </span>
              <Film className="w-4 h-4 text-pink-400" />
            </div>
            <div className="pt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats.moviesWatched}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Feature films watched</p>
            </div>
          </div>

          {/* Stat 4: Screen Time */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-pink-400">
                Screen Time
              </span>
              <Clock className="w-4 h-4 text-pink-400" />
            </div>
            <div className="pt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {formattedScreenTime}
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{stats.totalScreenTimeMinutes} total minutes</p>
            </div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Current Watchlist Progress</span>
            <span className="font-mono font-bold text-pink-400">{stats.completionPercentage}%</span>
          </div>

          <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <span>{stats.completedTitlesCount} titles completed</span>
            <span>{stats.totalTitlesInOrder - stats.completedTitlesCount} remaining to watch</span>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset */}
      <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800 flex items-center justify-between gap-3">
        <div>
          <h5 className="text-xs font-bold text-zinc-300">Reset All Data</h5>
          <p className="text-[11px] text-zinc-500">Restart the setup wizard and clear watch progress.</p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all watch data and restart setup?')) {
              resetAllData();
            }
          }}
          className="py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-pink-950/60 hover:text-pink-300 hover:border-pink-800 border border-zinc-800 text-zinc-400 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
