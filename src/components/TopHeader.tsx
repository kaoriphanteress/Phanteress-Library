import React from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MainTab } from './BottomNav';
import { HeroAvatar } from './HeroAvatar';
import { PWAInstallButton } from './PWAInstallButton';

interface TopHeaderProps {
  onOpenWizard: () => void;
  onNavigate: (tab: MainTab) => void;
  onOpenSettings?: () => void;
  onOpenFeedback?: () => void;
  onOpenAuth?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenWizard,
  onNavigate,
  onOpenSettings,
  onOpenFeedback,
  onOpenAuth,
}) => {
  const { profile, account } = useWatchlist();

  return (
    <header className="sticky top-0 z-30 bg-[#07070a]/90 backdrop-blur-xl border-b border-pink-950/40 px-3 sm:px-6 py-2.5 shadow-lg shadow-black/50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand mark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-pink-950/50">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white hidden sm:inline">
            Phanteress
          </span>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Community Feedback & Suggestions Inbox */}
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-slate-200 hover:text-pink-300 transition-colors cursor-pointer relative"
              title="Community Suggestions & Feedback Inbox"
            >
              <MessageSquare className="w-4 h-4 text-pink-400" />
            </button>
          )}



          {/* Adjust Order Button */}
          <button
            onClick={onOpenWizard}
            className="py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-slate-200 hover:text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Adjust your watch order setup"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Adjust Order</span>
          </button>

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-slate-200 hover:text-pink-300 transition-colors cursor-pointer"
              title="Settings & Watchlist Options"
            >
              <Settings className="w-4 h-4 text-pink-400" />
            </button>
          )}

          {/* Profile Trigger */}
          <button
            onClick={() => onNavigate('profile')}
            className="cursor-pointer transition-transform hover:scale-105 ml-0.5"
            title={`Profile: ${profile.displayName}`}
          >
            <HeroAvatar avatarId={profile.avatarId} sizeClassName="w-8 h-8" />
          </button>
        </div>
      </div>
    </header>
  );
};
