import { SlidersHorizontal, Sparkles, Settings } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MainTab } from './BottomNav';
import { HeroAvatar } from './HeroAvatar';

interface TopHeaderProps {
  onOpenWizard: () => void;
  onNavigate: (tab: MainTab) => void;
  onOpenSettings?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenWizard, onNavigate, onOpenSettings }) => {
  const { profile } = useWatchlist();

  return (
    <header className="sticky top-0 z-30 bg-[#07070a]/90 backdrop-blur-xl border-b border-pink-950/40 px-4 sm:px-6 py-3.5 shadow-lg shadow-black/50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Icon brand mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-pink-950/50">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Actions: Adjust Order & Profile avatar trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenWizard}
            className="py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-slate-200 hover:text-pink-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Adjust your watch order setup"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
            <span>Adjust Order</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-pink-900/40 text-slate-200 hover:text-pink-300 transition-colors cursor-pointer"
              title="Settings & Community Suggestions"
            >
              <Settings className="w-4 h-4 text-pink-400" />
            </button>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="cursor-pointer transition-transform hover:scale-110"
            title={`Profile: ${profile.displayName}`}
          >
            <HeroAvatar avatarId={profile.avatarId} sizeClassName="w-8 h-8" />
          </button>
        </div>
      </div>
    </header>
  );
};

