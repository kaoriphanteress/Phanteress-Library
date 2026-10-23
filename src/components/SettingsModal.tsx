import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MessageSquarePlus,
  Send,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  Trash2,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { GroupingMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSuggestion {
  id: string;
  category: string;
  name: string;
  message: string;
  date: string;
}

const STORAGE_SUGGESTIONS_KEY = 'phanteress_user_suggestions';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    profile,
    updateProfile,
    orderConfig,
    applyOrderConfiguration,
    resetAllData,
  } = useWatchlist();

  // Suggestion form state
  const [userName, setUserName] = useState('');
  const [category, setCategory] = useState<'title' | 'order' | 'date' | 'feature'>('title');
  const [suggestionText, setSuggestionText] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load existing suggestions from localStorage
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUGGESTIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionText.trim()) return;

    const newSuggestion: UserSuggestion = {
      id: `sug-${Date.now()}`,
      category,
      name: userName.trim() || 'Anonymous True Believer',
      message: suggestionText.trim(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updated = [newSuggestion, ...suggestions];
    setSuggestions(updated);
    try {
      localStorage.setItem(STORAGE_SUGGESTIONS_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }

    setSuggestionText('');
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
    }, 4000);
  };

  const handleDeleteSuggestion = (id: string) => {
    const updated = suggestions.filter((s) => s.id !== id);
    setSuggestions(updated);
    try {
      localStorage.setItem(STORAGE_SUGGESTIONS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handlePaceChange = (pace: number) => {
    updateProfile({ paceDaysPerItem: pace });
    applyOrderConfiguration(orderConfig, pace, profile.startDate);
  };

  const handleGroupingChange = (mode: GroupingMode) => {
    applyOrderConfiguration({
      ...orderConfig,
      groupingMode: mode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Settings &amp; Suggestions</h3>
              <p className="text-xs text-slate-400">Preferences, suggestions, and watchlist options</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* SECTION 1: SUGGESTION BOX (USER REQUESTED FEATURE) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-950/30 via-slate-900 to-slate-950 border border-pink-900/50 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pink-400 tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Community Feedback
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Suggest a Title, Date, or Feature
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Notice an upcoming title, release date tweak, or want to suggest a new custom feature? Submit it directly below!
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-pink-900/30 border border-pink-700/40 flex items-center justify-center text-pink-400 shrink-0">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
            </div>

            <form onSubmit={handleSubmitSuggestion} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Your Name or Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Peter P."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
                  >
                    <option value="title">Missing / New Marvel Title</option>
                    <option value="order">Watch Order Suggestion</option>
                    <option value="date">Upcoming Release Date Update</option>
                    <option value="feature">App Feature Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Your Suggestion <span className="text-pink-400">*</span>
                </label>
                <textarea
                  value={suggestionText}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Describe your suggestion in detail (e.g., 'Add the new Daredevil season 2 filming date' or 'Include Marvel Spotlight animated short')..."
                  rows={3}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <AnimatePresence>
                  {submittedMessage ? (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Suggestion saved! Thank you for the contribution.</span>
                    </motion.div>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Saved locally in your device records.
                    </span>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={!suggestionText.trim()}
                  className="py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-pink-950/40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Suggestion</span>
                </button>
              </div>
            </form>

            {/* Existing Submitted Suggestions List */}
            {suggestions.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Your Suggestions ({suggestions.length})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                  {suggestions.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-pink-400 uppercase">
                            {s.category}
                          </span>
                          <span className="text-[10px] text-slate-500">{s.date}</span>
                          <span className="text-[10px] text-slate-400 font-medium">by {s.name}</span>
                        </div>
                        <p className="text-slate-300 break-words">{s.message}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteSuggestion(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer shrink-0"
                        title="Remove suggestion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: VIEW & GROUPING PREFERENCES */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              Watchlist Display &amp; Grouping
            </h4>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">List Grouping Style</p>
                  <p className="text-[11px] text-slate-400">Choose between phase sections or a single continuous stream.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                  <button
                    onClick={() => handleGroupingChange('phase')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      orderConfig.groupingMode !== 'list'
                        ? 'bg-pink-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    By Phase
                  </button>
                  <button
                    onClick={() => handleGroupingChange('list')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      orderConfig.groupingMode === 'list'
                        ? 'bg-pink-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    One Long List
                  </button>
                </div>
              </div>
            </div>

            {/* Watch Pace Preference */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Calendar Pace</p>
                  <p className="text-[11px] text-slate-400">How frequently you plan to watch an item.</p>
                </div>
                <span className="text-xs font-mono font-bold text-pink-400">
                  {profile.paceDaysPerItem} {profile.paceDaysPerItem === 1 ? 'day / title' : 'days / title'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                {[1, 2, 3, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => handlePaceChange(days)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                      profile.paceDaysPerItem === days
                        ? 'bg-pink-950/60 border-pink-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {days === 1 ? 'Daily' : days === 7 ? 'Weekly' : `Every ${days}d`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: DANGER ZONE (RESET DATA) */}
          <div className="pt-2 border-t border-slate-800">
            {showResetConfirm ? (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2.5 animate-fade-in">
                <p className="text-xs font-bold text-rose-300">
                  Are you sure you want to reset all watchlist progress?
                </p>
                <p className="text-[11px] text-slate-400">
                  This will reset all watched statuses, ratings, and notes back to the beginning.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      resetAllData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Reset Watchlist</p>
                  <p className="text-[11px] text-slate-500">Restart from scratch with a brand new order</p>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Data</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
