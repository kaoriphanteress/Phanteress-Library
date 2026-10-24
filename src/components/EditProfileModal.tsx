import React, { useState } from 'react';
import {
  X,
  Check,
  User,
  Sparkles,
  Heart,
  Calendar,
  Image,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { HERO_AVATARS, HeroAvatarItem } from '../data/avatars';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useWatchlist();

  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [username, setUsername] = useState(profile.username || '');
  const [avatarId, setAvatarId] = useState(profile.avatarId || 'avatar-1');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [favoriteCharacter, setFavoriteCharacter] = useState(profile.favoriteCharacter || '');
  const [targetGoalDate, setTargetGoalDate] = useState(profile.targetGoalDate || '2026-12-18');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      avatarId,
      avatarUrl: avatarUrl.trim() || undefined,
      bio: bio.trim(),
      favoriteCharacter: favoriteCharacter.trim(),
      targetGoalDate,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const selectedAvatar = HERO_AVATARS.find((a) => a.id === avatarId) || HERO_AVATARS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Edit Profile</h3>
              <p className="text-xs text-slate-400">Customize your superhero profile and watch pace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Avatar Preview & Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 shadow-xl bg-white p-1 shrink-0">
                <img
                  src={avatarUrl.trim() || selectedAvatar.src}
                  alt={selectedAvatar.name}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = selectedAvatar.src;
                  }}
                />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-bold text-white">Profile Avatar Icon</h4>
                <p className="text-[11px] text-slate-400">
                  Selected: <span className="text-pink-400 font-semibold">{selectedAvatar.name}</span>
                </p>
              </div>
            </div>

            {/* Superhero Insignias Palette */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Choose Superhero Insignia ({HERO_AVATARS.length} Available)
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-2xl border border-slate-800/80">
                {HERO_AVATARS.map((av) => {
                  const isCur = avatarId === av.id && !avatarUrl.trim();
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setAvatarId(av.id);
                        setAvatarUrl('');
                      }}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isCur
                          ? 'border-pink-500 bg-pink-950/60 ring-2 ring-pink-500/50'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                      title={av.name}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5">
                        <img src={av.src} alt={av.name} className="w-full h-full object-contain rounded-full" />
                      </div>
                      {isCur && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-pink-500 text-black flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Custom Image URL */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Image className="w-3.5 h-3.5 text-pink-400" />
                Or Custom Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-avatar.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Pantheress"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Username (@)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Bio / Superhero Motto */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Bio / Motto
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. I can do this all day · Wakanda Forever"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Favorite Character Input (Free-text typed, user spells it) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-pink-400" />
              Favorite Character / Hero
            </label>
            <input
              type="text"
              value={favoriteCharacter}
              onChange={(e) => setFavoriteCharacter(e.target.value)}
              placeholder="Type your favorite hero (e.g. Spider-Man, Moon Knight, Wolverine...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
            />
            <p className="text-[10px] text-slate-500">Spell any superhero, mutant, or villain you like</p>
          </div>

          {/* Target Goal Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              Target Marathon Goal Date (e.g. Doomsday Release)
            </label>
            <input
              type="date"
              value={targetGoalDate}
              onChange={(e) => setTargetGoalDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {isSaved ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Profile Updated!
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Auto-saved to device &amp; cloud</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-950/40 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
