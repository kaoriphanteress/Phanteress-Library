import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  MarvelTitle,
  WatchlistItem,
  OrderConfiguration,
  UserProfile,
  UserStats,
  WatchStatus,
  PropertyGroup,
  WatchOrderType,
} from '../types';
import { MARVEL_CATALOG } from '../data/marvelCatalog';

interface WatchlistContextType {
  orderConfig: OrderConfiguration;
  watchlist: WatchlistItem[];
  profile: UserProfile;
  hasCompletedWizard: boolean;
  showWizard: boolean;
  stats: UserStats;
  historyList: { item: MarvelTitle; watchData: WatchlistItem }[];
  activeOrderTitles: { item: MarvelTitle; watchData: WatchlistItem }[];
  
  // Actions
  setShowWizard: (show: boolean) => void;
  setHasCompletedWizard: (done: boolean) => void;
  applyOrderConfiguration: (config: OrderConfiguration, paceDays?: number, startDate?: string) => void;
  reorderItems: (startIndex: number, endIndex: number) => void;
  updateItemStatus: (itemId: string, status: WatchStatus, rating?: number, notes?: string) => void;
  updateEpisodesWatched: (itemId: string, count: number) => void;
  rescheduleDate: (itemId: string, newDate: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  resetAllData: () => void;
  getTitleById: (id: string) => MarvelTitle | undefined;
  addItemToWatchlist: (itemId: string) => void;
  removeItemFromWatchlist: (itemId: string) => void;
}

const STORAGE_KEYS = {
  CONFIG: 'phanteress_order_config',
  WATCHLIST: 'phanteress_watchlist',
  PROFILE: 'phanteress_profile',
  WIZARD_DONE: 'phanteress_wizard_done',
};

const DEFAULT_CONFIG: OrderConfiguration = {
  franchise: 'marvel',
  properties: 'doomsday',
  orderType: 'phanteress',
  groupingMode: 'phase',
};

const DEFAULT_PROFILE: UserProfile = {
  username: 'phanteress_cadet',
  displayName: 'Pantheress',
  avatarId: 'avatar-1',
  paceDaysPerItem: 1,
  startDate: new Date().toISOString().split('T')[0],
};

const WatchlistContext = createContext<WatchlistContextType | null>(null);

function getFilteredAndSortedTitles(properties: PropertyGroup, orderType: WatchOrderType): MarvelTitle[] {
  const filtered = MARVEL_CATALOG.filter((t) => {
    if (properties === 'doomsday') return t.inDoomsdayList;
    if (properties === 'mcu') return t.inFocusMcu;
    if (properties === 'all-marvel') return t.inAllMarvel;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (orderType === 'release' || orderType === 'phanteress') {
      return a.releaseRank - b.releaseRank;
    }
    if (orderType === 'chronological') {
      return a.chronologicalRank - b.chronologicalRank;
    }
    return a.releaseRank - b.releaseRank;
  });
}

function calculateScheduleDates(titles: MarvelTitle[], startDateStr: string, paceDays: number): Record<string, string> {
  const dates: Record<string, string> = {};
  const baseDate = new Date(startDateStr);
  let dayOffset = 0;

  titles.forEach((title) => {
    if (title.isUpcoming) {
      dates[title.id] = title.releaseDate;
    } else {
      const scheduled = new Date(baseDate);
      scheduled.setDate(baseDate.getDate() + dayOffset);
      dates[title.id] = scheduled.toISOString().split('T')[0];
      dayOffset += Math.max(1, paceDays);
    }
  });

  return dates;
}

export const WatchlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orderConfig, setOrderConfig] = useState<OrderConfiguration>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [hasCompletedWizard, setHasCompletedWizardState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WIZARD_DONE) === 'true';
    } catch {
      return false;
    }
  });

  const [showWizard, setShowWizard] = useState<boolean>(false);

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

    // Initialize initial default watchlist completely unwatched (clean slate for new users)
    const titles = getFilteredAndSortedTitles(DEFAULT_CONFIG.properties, DEFAULT_CONFIG.orderType);
    const schedule = calculateScheduleDates(titles, DEFAULT_PROFILE.startDate, DEFAULT_PROFILE.paceDaysPerItem);
    
    return titles.map((t, idx) => ({
      itemId: t.id,
      customOrderIndex: idx,
      status: 'unwatched' as WatchStatus,
      episodesWatched: 0,
      scheduledDate: schedule[t.id] || new Date().toISOString().split('T')[0],
      watchedDate: undefined,
      userRating: undefined,
    }));
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(orderConfig));
  }, [orderConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  const setHasCompletedWizard = (done: boolean) => {
    setHasCompletedWizardState(done);
    localStorage.setItem(STORAGE_KEYS.WIZARD_DONE, done ? 'true' : 'false');
  };

  const applyOrderConfiguration = (newConfig: OrderConfiguration, paceDays = profile.paceDaysPerItem, startDate = profile.startDate) => {
    setOrderConfig(newConfig);
    const sortedTitles = getFilteredAndSortedTitles(newConfig.properties, newConfig.orderType);
    const schedule = calculateScheduleDates(sortedTitles, startDate, paceDays);

    // Keep existing item progress if item exists in old watchlist
    const existingMap = new Map(watchlist.map((w) => [w.itemId, w]));

    const newWatchlist: WatchlistItem[] = sortedTitles.map((title, idx) => {
      const existing = existingMap.get(title.id);
      if (existing) {
        return {
          ...existing,
          customOrderIndex: idx,
          scheduledDate: schedule[title.id] || existing.scheduledDate,
        };
      }
      return {
        itemId: title.id,
        customOrderIndex: idx,
        status: 'unwatched',
        episodesWatched: 0,
        scheduledDate: schedule[title.id] || startDate,
      };
    });

    setWatchlist(newWatchlist);
    setHasCompletedWizard(true);
  };

  const reorderItems = (startIndex: number, endIndex: number) => {
    setWatchlist((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((item, index) => ({
        ...item,
        customOrderIndex: index,
      }));
    });
  };

  const updateItemStatus = (itemId: string, status: WatchStatus, rating?: number, notes?: string) => {
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.itemId !== itemId) return item;

        const title = MARVEL_CATALOG.find((t) => t.id === itemId);
        const isWatched = status === 'watched';
        const fullEpisodes = title?.type === 'series' ? (title.episodesCount || 6) : 1;

        return {
          ...item,
          status,
          episodesWatched: isWatched ? fullEpisodes : item.episodesWatched,
          watchedDate: isWatched ? (item.watchedDate || new Date().toISOString()) : undefined,
          userRating: rating !== undefined ? rating : item.userRating,
          userNotes: notes !== undefined ? notes : item.userNotes,
        };
      })
    );
  };

  const updateEpisodesWatched = (itemId: string, count: number) => {
    const title = MARVEL_CATALOG.find((t) => t.id === itemId);
    const maxEps = title?.episodesCount || 1;
    const clampedCount = Math.max(0, Math.min(count, maxEps));

    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.itemId !== itemId) return item;

        let status: WatchStatus = item.status;
        if (clampedCount >= maxEps) {
          status = 'watched';
        } else if (clampedCount > 0) {
          status = 'watching';
        } else {
          status = 'unwatched';
        }

        return {
          ...item,
          episodesWatched: clampedCount,
          status,
          watchedDate: status === 'watched' ? (item.watchedDate || new Date().toISOString()) : undefined,
        };
      })
    );
  };

  const rescheduleDate = (itemId: string, newDate: string) => {
    setWatchlist((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, scheduledDate: newDate } : item))
    );
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const resetAllData = () => {
    localStorage.clear();
    setOrderConfig(DEFAULT_CONFIG);
    setProfile(DEFAULT_PROFILE);
    setHasCompletedWizard(false);
    setShowWizard(true);

    const titles = getFilteredAndSortedTitles(DEFAULT_CONFIG.properties, DEFAULT_CONFIG.orderType);
    const schedule = calculateScheduleDates(titles, DEFAULT_PROFILE.startDate, DEFAULT_PROFILE.paceDaysPerItem);
    const freshList: WatchlistItem[] = titles.map((t, idx) => ({
      itemId: t.id,
      customOrderIndex: idx,
      status: 'unwatched',
      episodesWatched: 0,
      scheduledDate: schedule[t.id] || DEFAULT_PROFILE.startDate,
    }));
    setWatchlist(freshList);
  };

  const getTitleById = (id: string): MarvelTitle | undefined => {
    return MARVEL_CATALOG.find((t) => t.id === id);
  };

  const addItemToWatchlist = (itemId: string) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.itemId === itemId)) return prev;
      const title = MARVEL_CATALOG.find((t) => t.id === itemId);
      const nextIndex = prev.length;
      const today = new Date().toISOString().split('T')[0];
      const newItem: WatchlistItem = {
        itemId,
        customOrderIndex: nextIndex,
        status: 'unwatched',
        episodesWatched: 0,
        scheduledDate: title?.isUpcoming ? title.releaseDate : today,
      };
      return [...prev, newItem];
    });
  };

  const removeItemFromWatchlist = (itemId: string) => {
    setWatchlist((prev) => {
      const filtered = prev.filter((w) => w.itemId !== itemId);
      return filtered.map((item, index) => ({
        ...item,
        customOrderIndex: index,
      }));
    });
  };

  // Map and sort active order titles
  const activeOrderTitles = useMemo(() => {
    const sortedWatchlist = [...watchlist].sort((a, b) => a.customOrderIndex - b.customOrderIndex);
    return sortedWatchlist
      .map((w) => {
        const item = MARVEL_CATALOG.find((t) => t.id === w.itemId);
        return item ? { item, watchData: w } : null;
      })
      .filter((x): x is { item: MarvelTitle; watchData: WatchlistItem } => x !== null);
  }, [watchlist]);

  // History list (watched items sorted by watchedDate or order)
  const historyList = useMemo(() => {
    return activeOrderTitles
      .filter((entry) => entry.watchData.status === 'watched')
      .sort((a, b) => {
        const dateA = a.watchData.watchedDate ? new Date(a.watchData.watchedDate).getTime() : 0;
        const dateB = b.watchData.watchedDate ? new Date(b.watchData.watchedDate).getTime() : 0;
        return dateB - dateA;
      });
  }, [activeOrderTitles]);

  // Comprehensive user statistics
  const stats = useMemo<UserStats>(() => {
    let episodes = 0;
    let shows = 0;
    let movies = 0;
    let screenTime = 0;

    watchlist.forEach((w) => {
      const title = MARVEL_CATALOG.find((t) => t.id === w.itemId);
      if (!title) return;

      if (title.type === 'series') {
        const epsDone = w.episodesWatched || 0;
        episodes += epsDone;
        if (w.status === 'watched') {
          shows += 1;
        }
        const totalEps = title.episodesCount || 6;
        const fraction = Math.min(1, epsDone / totalEps);
        screenTime += Math.round(fraction * title.runtimeMinutes);
      } else {
        if (w.status === 'watched') {
          movies += 1;
          episodes += 1;
          screenTime += title.runtimeMinutes;
        } else if (w.status === 'watching') {
          screenTime += Math.round(title.runtimeMinutes * 0.5);
        }
      }
    });

    const completedTitlesCount = watchlist.filter((w) => w.status === 'watched').length;
    const totalTitlesInOrder = watchlist.length;
    const completionPercentage = totalTitlesInOrder > 0
      ? Math.round((completedTitlesCount / totalTitlesInOrder) * 100)
      : 0;

    return {
      episodesWatched: episodes,
      showsWatched: shows,
      moviesWatched: movies,
      totalScreenTimeMinutes: screenTime,
      completedTitlesCount,
      totalTitlesInOrder,
      completionPercentage,
    };
  }, [watchlist]);

  return (
    <WatchlistContext.Provider
      value={{
        orderConfig,
        watchlist,
        profile,
        hasCompletedWizard,
        showWizard,
        stats,
        historyList,
        activeOrderTitles,
        setShowWizard,
        setHasCompletedWizard,
        applyOrderConfiguration,
        reorderItems,
        updateItemStatus,
        updateEpisodesWatched,
        rescheduleDate,
        updateProfile,
        resetAllData,
        getTitleById,
        addItemToWatchlist,
        removeItemFromWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
