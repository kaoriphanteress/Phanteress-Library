import React, { useState } from 'react';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  Trash2,
  MessageSquare,
  Cloud,
  ArrowLeft,
  Tv,
  Film,
  Compass,
  Check,
  Heart,
  Coffee,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { GroupingMode } from '../types';
import { FeedbackInboxModal } from './FeedbackInboxModal';
import { AuthModal } from './AuthModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    orderConfig,
    applyOrderConfiguration,
    resetAllData,
    account,
    watchlist,
  } = useWatchlist();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const paypalEmail = 'ianlenard1219@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(paypalEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  if (!isOpen) return null;

  const watchedCount = watchlist.filter((w) => w.status === 'watched').length;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#07070a] text-slate-100 flex flex-col overflow-y-auto animate-fade-in">
        {/* Sticky Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#07070a]/95 backdrop-blur-xl border-b border-zinc-800/80 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 transition-all cursor-pointer shadow-sm shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400 shrink-0">
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h1 className="text-xs sm:text-base font-bold text-white tracking-tight truncate">
                Settings &amp; Options
              </h1>
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
          {/* MULTI-DEVICE ACCOUNT & CLOUD SYNC */}
          <section className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-pink-400" />
                  <h2 className="text-sm font-bold text-white">Multi-Device Cloud Sync</h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {account
                    ? `Currently signed in as ${account.email}. Watch progress is synced in real time across all devices.`
                    : 'Access your watchlist and watch progress on your phone, tablet, and PC.'}
                </p>
              </div>

              <button
                onClick={() => setIsAuthOpen(true)}
                className="py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-950/40 cursor-pointer shrink-0"
              >
                {account ? 'Manage Account' : 'Sign In / Sync'}
              </button>
            </div>
          </section>

          {/* COMMUNITY SUGGESTIONS BOARD SHORTCUT */}
          <section className="p-5 rounded-3xl bg-gradient-to-br from-pink-950/30 via-zinc-900/70 to-zinc-950 border border-pink-900/50 shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-pink-400" />
                  <h2 className="text-sm font-bold text-white">Public Feedback &amp; Suggestions Board</h2>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Browse community requests, suggest new titles or watch order refinements, and heart others' ideas to vote them to the roadmap.
                </p>
              </div>

              <button
                onClick={() => setIsInboxOpen(true)}
                className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-pink-300 hover:text-white border border-pink-800/50 text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Board</span>
              </button>
            </div>
          </section>

          {/* WATCH ORDER & DISPLAY PREFERENCES */}
          <section className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <Compass className="w-4 h-4 text-pink-400" />
              <h2 className="text-sm font-bold text-white">Order &amp; Display Layout</h2>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-white block">Grouping Style</span>
                  <span className="text-[11px] text-zinc-400">
                    Organize titles by Phase chapters or in a single continuous timeline
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applyOrderConfiguration({ ...orderConfig, groupingMode: 'phase' })}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      orderConfig.groupingMode === 'phase'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    By Phase
                  </button>
                  <button
                    onClick={() => applyOrderConfiguration({ ...orderConfig, groupingMode: 'list' })}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      orderConfig.groupingMode === 'list'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    One List
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-white block">Current Watch Stats</span>
                  <span className="text-[11px] text-zinc-400">
                    {watchedCount} of {watchlist.length} titles completed
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-pink-400 font-bold bg-pink-950/60 border border-pink-800/60 px-3 py-1.5 rounded-xl">
                  <span>{Math.round((watchedCount / (watchlist.length || 1)) * 100)}% Complete</span>
                </div>
              </div>
            </div>
          </section>

          {/* DANGER ZONE / RESET */}
          <section className="p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Reset &amp; Data Management</h2>
            </div>

            {showResetConfirm ? (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-3">
                <p className="text-xs text-rose-200 font-medium">
                  Are you sure? This will reset all your watch progress, custom orders, and favorited titles.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetAllData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="py-1.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-zinc-300">Reset Watchlist</p>
                  <p className="text-[11px] text-zinc-500">Restart from scratch with clean progress</p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="py-2 px-4 rounded-xl bg-zinc-950 hover:bg-rose-950/50 border border-zinc-800 hover:border-rose-800/60 text-zinc-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data</span>
                </button>
              </div>
            )}
          </section>

          {/* DONATE / SUPPORT CREATOR */}
          <section className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-900/80 to-pink-950/40 border border-amber-600/40 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Support &amp; Donate</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PayPal
                      </span>
                    </h2>
                    <p className="text-[11px] text-amber-200/80">Support Marvel Timeline updates &amp; development</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Love tracking your Marvel journey? Donations help support future features, database updates, high-res posters, and server hosting!
            </p>

            {/* Email Copy Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  PayPal Recipient Email
                </span>
                <p className="text-xs font-mono font-bold text-amber-300 truncate select-all">
                  {paypalEmail}
                </p>
              </div>

              <button
                onClick={handleCopyEmail}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                  copiedEmail
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white hover:border-amber-500/60'
                }`}
                title="Copy PayPal Email Address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Email</span>
                  </>
                )}
              </button>
            </div>

            {/* PayPal Direct Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
              <a
                href={`https://www.paypal.com/donate/?business=${encodeURIComponent(
                  paypalEmail
                )}&no_recurring=0&item_name=Support+Marvel+Timeline+Tracker&currency_code=USD`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex-1 py-3 px-5 rounded-2xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-950/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {/* Clean PayPal SVG Icon */}
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.968 1.614 1.532 1.18 2.228 2.898 2.07 5.105-.333 4.653-3.17 7.158-7.79 7.158H9.72a.64.64 0 0 0-.633.541l-1.026 6.52c-.04.254-.256.399-.985.399z" />
                </svg>
                <span>Donate via PayPal</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="https://www.paypal.com/myaccount/transfer/homepage/buy/"
                target="_blank"
                rel="noreferrer noopener"
                className="py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Send Money</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-zinc-500 text-center">
              You can also send any support directly in the PayPal app by searching <strong>{paypalEmail}</strong>. Thank you!
            </p>
          </section>

          {/* APP & MARVEL DATABASE FOOTER INFO */}
          <div className="text-center py-4 space-y-1 text-[11px] text-zinc-500">
            <p className="font-semibold text-zinc-400">Marvel Cinematic Universe &amp; Multiverse Companion</p>
            <p>Phase 1 through Phase 6 (Secret Wars) · Fox X-Men · Sony Spider-Verse · Classic Legacy</p>
          </div>
        </main>
      </div>

      {isInboxOpen && (
        <FeedbackInboxModal isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} />
      )}

      {isAuthOpen && (
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      )}
    </>
  );
};
