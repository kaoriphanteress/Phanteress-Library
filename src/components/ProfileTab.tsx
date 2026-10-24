import React, { useState } from 'react';
import {
  Film,
  Tv,
  Clock,
  Sparkles,
  Award,
  RotateCcw,
  Check,
  Edit3,
  Heart,
  Calendar,
  LogOut,
  User,
  Mail,
  Lock,
  Quote,
  Star,
  Info,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { HERO_AVATARS } from '../data/avatars';
import { EditProfileModal } from './EditProfileModal';
import { TitleDetailModal } from './TitleDetailModal';
import { MarvelTitle } from '../types';
import { getPosterInfo } from '../data/marvelPosters';

export const ProfileTab: React.FC = () => {
  const {
    profile,
    stats,
    resetAllData,
    orderConfig,
    account,
    signIn,
    createAccount,
    signOut,
    favoriteTitles,
    toggleFavorite,
    isFavorite,
    getWatchlistItem,
  } = useWatchlist();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFavoriteTitle, setSelectedFavoriteTitle] = useState<MarvelTitle | null>(null);

  // Gated Auth Form State (shown when user is not logged in)
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [displayNameInput, setDisplayNameInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [quoteInput, setQuoteInput] = useState('');
  const [favoriteHeroInput, setFavoriteHeroInput] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('avatar-1');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // If user is NOT logged in: Show the Account Creation / Login Gate ONLY
  // Nothing else will show to them until they create an account or log in!
  if (!account || !account.isLoggedIn) {
    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');
      setAuthLoading(true);

      try {
        if (authMode === 'signup') {
          if (!displayNameInput.trim()) {
            setAuthError('Please enter your Display Name.');
            setAuthLoading(false);
            return;
          }
          if (!usernameInput.trim()) {
            setAuthError('Please enter a Username.');
            setAuthLoading(false);
            return;
          }
          if (!favoriteHeroInput.trim()) {
            setAuthError('Please spell your favorite hero (e.g. Spider-Man, Moon Knight, Wolverine).');
            setAuthLoading(false);
            return;
          }

          const res = await createAccount({
            email: emailInput.trim(),
            pass: passwordInput,
            displayName: displayNameInput.trim(),
            username: usernameInput.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
            quote: quoteInput.trim(),
            favoriteHero: favoriteHeroInput.trim(),
            avatarId: selectedAvatarId,
          });

          if (!res.success) {
            setAuthError(res.error || 'Failed to create account.');
          }
        } else {
          const res = await signIn(emailInput.trim(), passwordInput);
          if (!res.success) {
            setAuthError(res.error || 'Failed to log in.');
          }
        }
      } catch (err: any) {
        setAuthError(err.message || 'An error occurred.');
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-24 pt-2">
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950/90 border border-pink-900/40 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xl shadow-pink-950/60">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {authMode === 'signup' ? 'Create Your Superhero Account' : 'Welcome Back, Hero'}
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {authMode === 'signup'
                ? 'Set up your hero identity, spelled favorites, and cloud-synced Marvel watchlist.'
                : 'Log in to access your saved watchlist, history, and stats across devices.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-950/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-950/50'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
              {authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <>
                {/* Avatar Icon Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-zinc-300">
                    Choose Your Hero Insignia
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {HERO_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(av.id)}
                        className={`w-11 h-11 rounded-full p-1 bg-white border-2 transition-transform cursor-pointer shrink-0 ${
                          selectedAvatarId === av.id
                            ? 'border-pink-500 scale-110 shadow-lg shadow-pink-950 ring-2 ring-pink-400/50'
                            : 'border-zinc-700 opacity-60 hover:opacity-100'
                        }`}
                        title={av.name}
                      >
                        <img src={av.src} alt={av.name} className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Display Name <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="e.g. Peter Parker, Tony Stark, Carol Danvers..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Username <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="text-zinc-500 text-xs font-mono absolute left-3 top-1/2 -translate-y-1/2">@</span>
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="username"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>

                {/* Favorite Hero - Typed Text Input (User spells it themselves!) */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    Favorite Character / Hero <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={favoriteHeroInput}
                    onChange={(e) => setFavoriteHeroInput(e.target.value)}
                    placeholder="Type your favorite hero (e.g. Spider-Man, Moon Knight, Wolverine, Doctor Doom...)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Spell any superhero, mutant, or villain you like</p>
                </div>

                {/* Quote / Motto */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                    <Quote className="w-3.5 h-3.5 text-pink-400" />
                    Quote / Motto
                  </label>
                  <input
                    type="text"
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    placeholder="e.g. With great power comes great responsibility · Wakanda Forever"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Email Address <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="hero@avengers.org"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Password <span className="text-pink-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-950/50 transition-all cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
            >
              {authLoading
                ? 'Saving...'
                : authMode === 'signup'
                ? 'Create Superhero Account'
                : 'Sign In to My Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- LOGGED IN VIEW ---
  const activeAvatar = HERO_AVATARS.find((a) => a.id === profile.avatarId) || HERO_AVATARS[0];
  const avatarImageSrc = profile.avatarUrl || activeAvatar.src;

  const hours = Math.floor(stats.totalScreenTimeMinutes / 60);
  const minutes = stats.totalScreenTimeMinutes % 60;
  const formattedScreenTime = `${hours}h ${minutes}m`;

  const targetDate = new Date(profile.targetGoalDate || '2026-12-18');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* --- HERO IDENTITY CARD --- */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-pink-900/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
          {/* Avatar & Badges */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-pink-500 shadow-2xl flex items-center justify-center p-1 bg-white/95 transition-transform hover:scale-105">
                <img
                  src={avatarImageSrc}
                  alt={profile.displayName}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = activeAvatar.src;
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-pink-500 text-black flex items-center justify-center font-bold text-xs shadow-md">
                ✓
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {profile.displayName || 'Hero'}
                </h2>
                {profile.username && (
                  <span className="text-[11px] font-mono text-pink-400 bg-pink-950/60 border border-pink-900/60 px-2.5 py-0.5 rounded-md">
                    @{profile.username}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-xs text-zinc-300 italic max-w-md">
                  "{profile.bio}"
                </p>
              )}

              {profile.favoriteCharacter && (
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-zinc-400">
                  <span className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-3.5 h-3.5 fill-pink-500/20" />
                    <span>Favorite: <strong className="text-white">{profile.favoriteCharacter}</strong></span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: EDIT PROFILE & SIGN OUT */}
          <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-lg shadow-pink-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={signOut}
              className="w-full sm:w-auto py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Sign Out of account"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- FAVORITES SECTION (Requested by user) --- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>Favorites</span>
            <span className="text-xs font-mono text-pink-400 bg-pink-950/80 border border-pink-900/60 px-2 py-0.5 rounded-full">
              {favoriteTitles.length}
            </span>
          </h3>
          <span className="text-xs text-zinc-400">
            Titles you marked with ❤️
          </span>
        </div>

        {favoriteTitles.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center space-y-2">
            <Heart className="w-8 h-8 text-zinc-700 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Favorites Added Yet</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Tap the heart icon on any title in Discover or Order to pin your all-time favorite Marvel movies and series right here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {favoriteTitles.map((title) => {
              const posterInfo = getPosterInfo(title.id, title.heroCharacter, title.title, title.phase);
              const watchData = getWatchlistItem(title.id);
              const isWatched = watchData.status === 'watched';

              return (
                <div
                  key={title.id}
                  onClick={() => setSelectedFavoriteTitle(title)}
                  className="group relative rounded-2xl overflow-hidden border border-zinc-800 hover:border-pink-500/60 bg-zinc-900 aspect-[2/3] flex flex-col justify-end p-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                >
                  {posterInfo.posterUrl ? (
                    <img
                      src={posterInfo.posterUrl}
                      alt={title.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${posterInfo.themeColor} flex items-center justify-center p-4`}
                    >
                      <Film className="w-8 h-8 text-white/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                  {/* Favorite Heart Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(title.id);
                    }}
                    className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-md active:scale-90 cursor-pointer"
                    title="Remove from favorites"
                  >
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </button>

                  {/* Watched Badge */}
                  {isWatched && (
                    <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Check className="w-2.5 h-2.5" />
                      <span>Watched</span>
                    </div>
                  )}

                  <div className="relative z-10 space-y-0.5">
                    <span className="text-[10px] text-zinc-300 font-medium">
                      {title.year} · {title.type === 'series' ? 'Series' : 'Movie'}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                      {title.parentTitle || title.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- STATS SECTION --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-400" />
            Watching Stats &amp; Marathon Progress
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

        {/* Progress Bar towards Road to Doomsday */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>Current Watchlist Progress</span>
              <span className="text-pink-400 font-mono">({orderConfig.properties.toUpperCase()})</span>
            </span>
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
            <span>{daysRemaining} days until Doomsday Target (Dec 18, 2026)</span>
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

      {/* Modals */}
      {isEditModalOpen && (
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      )}

      {selectedFavoriteTitle && (
        <TitleDetailModal
          title={selectedFavoriteTitle}
          onClose={() => setSelectedFavoriteTitle(null)}
        />
      )}
    </div>
  );
};
