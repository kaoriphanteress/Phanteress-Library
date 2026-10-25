import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Sparkles,
  Search,
  Trash2,
  Send,
  CheckCircle2,
  Heart,
  ArrowLeft,
  Flame,
  Clock,
  Plus,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export interface SuggestionItem {
  id: string;
  category: 'title' | 'order' | 'date' | 'feature';
  name: string;
  message: string;
  date: string;
  status: 'Reviewed' | 'Pending' | 'Added to Roadmap';
  hearts: number;
  userHearted?: boolean;
}

const STORAGE_KEY = 'phanteress_public_suggestions_v5';

// Real community suggestions only - no AI-generated placeholders
const INITIAL_SUGGESTIONS: SuggestionItem[] = [];

interface FeedbackInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackInboxModal: React.FC<FeedbackInboxModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useWatchlist();

  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out any legacy dummy AI items if present
        const realItems = parsed.filter(
          (item: SuggestionItem) => !['sug-1', 'sug-2', 'sug-3', 'sug-4', 'sug-5'].includes(item.id)
        );
        return realItems;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'hearts' | 'newest'>('hearts'); // Default sort by hearts
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  // New suggestion inputs
  const [nameInput, setNameInput] = useState(profile.displayName || profile.username || '');
  const [categoryInput, setCategoryInput] = useState<'title' | 'order' | 'date' | 'feature'>('title');
  const [messageInput, setMessageInput] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suggestions));
  }, [suggestions]);

  if (!isOpen) return null;

  const handleToggleHeart = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const willHeart = !s.userHearted;
        return {
          ...s,
          userHearted: willHeart,
          hearts: willHeart ? s.hearts + 1 : Math.max(0, s.hearts - 1),
        };
      })
    );
  };

  const handleCreateSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newItem: SuggestionItem = {
      id: `sug-${Date.now()}`,
      category: categoryInput,
      name: nameInput.trim() || profile.displayName || 'Marvel Fan',
      message: messageInput.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      hearts: 1, // Start with author's heart
      userHearted: true,
    };

    setSuggestions([newItem, ...suggestions]);
    setMessageInput('');
    setShowSubmitForm(false);
    setToastMessage('Suggestion posted to public board with your heart!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDelete = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const filtered = suggestions
    .filter((s) => {
      if (activeCategory !== 'all' && s.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.message.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sorting by hearts (Default) or newest
      if (sortBy === 'hearts') {
        if (b.hearts !== a.hearts) {
          return b.hearts - a.hearts;
        }
      }
      return b.id.localeCompare(a.id);
    });

  return (
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

          <div className="min-w-0 flex items-center gap-2">
            <h1 className="text-xs sm:text-base font-bold text-white tracking-tight truncate">
              Suggestions &amp; Feedback
            </h1>
            <span className="text-[10px] sm:text-[11px] font-mono bg-pink-950 text-pink-300 border border-pink-800/80 px-1.5 py-0.2 rounded-full font-bold shrink-0">
              {suggestions.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="py-1.5 px-3 sm:px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-pink-950/50 cursor-pointer"
          >
            {showSubmitForm ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Close Form</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Post Idea</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Full Page Scrollable Content */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* Post Suggestion Form */}
        {showSubmitForm && (
          <form
            onSubmit={handleCreateSuggestion}
            className="p-5 rounded-3xl bg-zinc-900/90 border border-pink-700/60 shadow-2xl space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <h2 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Submit Idea to Public Board
              </h2>
              <span className="text-[11px] text-zinc-500">Publicly visible to all Marvel fans</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Your Name or Handle
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Peter Parker"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-pink-500 cursor-pointer"
                >
                  <option value="title">Missing / New Marvel Title</option>
                  <option value="order">Watch Order Suggestion</option>
                  <option value="date">Release Date Update</option>
                  <option value="feature">App Feature Request</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Suggestion Details <span className="text-pink-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Share your suggestion, title request, episode fix, or watch order idea..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="py-2 px-4 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-950/50 cursor-pointer flex items-center gap-1.5"
              >
                <span>Post &amp; Vote</span>
                <Heart className="w-3.5 h-3.5 fill-white" />
              </button>
            </div>
          </form>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Search & Sort Controls Bar */}
        <div className="p-4 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 shadow-md space-y-3.5">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community ideas, titles, order suggestions..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 shadow-inner"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Ideas' },
                { id: 'title', label: 'Titles' },
                { id: 'order', label: 'Watch Orders' },
                { id: 'date', label: 'Dates' },
                { id: 'feature', label: 'Features' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveCategory(f.id)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === f.id
                      ? 'bg-pink-600 text-white shadow-sm shadow-pink-950/60'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Switcher: Hearts (Default) vs Newest */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 p-1 rounded-xl shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setSortBy('hearts')}
                className={`py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortBy === 'hearts'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Sorted by Most Hearts"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Most Hearted</span>
              </button>

              <button
                onClick={() => setSortBy('newest')}
                className={`py-1 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  sortBy === 'newest'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Sorted by Newest First"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Newest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Suggestion Cards Feed */}
        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800/60 space-y-3">
              <MessageSquare className="w-9 h-9 text-pink-500/60 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">No community suggestions yet</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Have an idea for a missing Marvel title, watch order improvement, or new feature? Be the first to post!
                </p>
              </div>
              <button
                onClick={() => setShowSubmitForm(true)}
                className="mt-2 py-2 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-md shadow-pink-950/50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post First Suggestion</span>
              </button>
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-zinc-900/70 hover:bg-zinc-900/95 flex items-start gap-4 ${
                  item.userHearted
                    ? 'border-pink-900/70 shadow-lg shadow-pink-950/20'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Heart Upvote Button Column */}
                <button
                  onClick={() => handleToggleHeart(item.id)}
                  className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[54px] py-2 px-2 rounded-2xl border transition-all cursor-pointer active:scale-95 shrink-0 ${
                    item.userHearted
                      ? 'bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-950/60'
                      : 'bg-zinc-950/90 border-zinc-800 text-zinc-400 hover:text-pink-400 hover:border-pink-800/60 hover:bg-zinc-900'
                  }`}
                  title={item.userHearted ? 'Hearted! Click to unheart' : 'Heart this suggestion'}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      item.userHearted ? 'fill-white text-white scale-110' : ''
                    }`}
                  />
                  <span className="text-xs font-extrabold mt-1 font-mono">{item.hearts}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">
                    {item.hearts === 1 ? 'vote' : 'votes'}
                  </span>
                </button>

                {/* Content Column */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">· {item.date}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === 'Added to Roadmap'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                            : item.status === 'Reviewed'
                            ? 'bg-blue-950 text-blue-400 border-blue-800/60'
                            : 'bg-amber-950 text-amber-400 border-amber-800/60'
                        }`}
                      >
                        {item.status}
                      </span>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-zinc-600 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete suggestion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed break-words font-normal">
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="sticky bottom-0 z-20 bg-[#07070a]/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 sm:px-8 py-3 flex items-center justify-center shrink-0">
        <span className="text-xs text-zinc-400">
          Showing <strong>{filtered.length}</strong> public community suggestions · Heart your favorites!
        </span>
      </footer>
    </div>
  );
};
