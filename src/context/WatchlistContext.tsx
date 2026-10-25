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
  UserAccount,
} from '../types';
import { MARVEL_CATALOG } from '../data/marvelCatalog';

interface WatchlistContextType {
  orderConfig: OrderConfiguration;
  watchlist: WatchlistItem[];
  profile: UserProfile;
  account: UserAccount | null;
  favorites: string[];
  hasCompletedWizard: boolean;
  showWizard: boolean;
  stats: UserStats;
  historyList: { item: MarvelTitle; watchData: WatchlistItem }[];
  activeOrderTitles: { item: MarvelTitle; watchData: WatchlistItem }[];
  favoriteTitles: MarvelTitle[];
  
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
  getWatchlistItem: (id: string) => WatchlistItem;
  addItemToWatchlist: (itemId: string) => void;
  removeItemFromWatchlist: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;

  // Account Actions
  createAccount: (data: {
    email: string;
    pass: string;
    displayName: string;
    username: string;
    quote?: string;
    favoriteHero?: string;
    avatarId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  syncWithCloud: () => Promise<boolean>;
  exportSyncCode: () => string;
  importSyncCode: (code: string) => boolean;
}

const STORAGE_KEYS = {
  CONFIG: 'phanteress_order_config_v3',
  WATCHLIST: 'phanteress_watchlist_v3',
  PROFILE: 'phanteress_profile_v3',
  WIZARD_DONE: 'phanteress_wizard_done_v3',
  ACCOUNT: 'phanteress_account_v3',
  FAVORITES: 'phanteress_favorites_v3',
  CLOUD_ACCOUNTS: 'phanteress_cloud_accounts_db_v3',
};

const DEFAULT_CONFIG: OrderConfiguration = {
  franchise: 'marvel',
  properties: 'doomsday',
  orderType: 'release',
  groupingMode: 'phase',
};

// Clean initial profile: No given fake name! The user sets their own identity!
const DEFAULT_PROFILE: UserProfile = {
  username: '',
  displayName: '',
  avatarId: 'avatar-1',
  bio: '',
  favoriteCharacter: '',
  paceDaysPerItem: 1,
  startDate: new Date().toISOString().split('T')[0],
};

const WatchlistContext = createContext<WatchlistContextType | null>(null);

const DOOMSDAY_ORDER_IDS = [
  'x-men-2000',
  'x2-x-men-united-2003',
  'captain-america-first-avenger-2011',
  'the-avengers-2012',
  'avengers-infinity-war-2018',
  'avengers-endgame-2019',
  'loki-season-1-2021',
  'loki-season-2-2023',
  'shang-chi-2021',
  'spiderman-no-way-home-2021',
  'black-panther-wakanda-forever-2022',
  'doctor-strange-multiverse-2022',
  'deadpool-and-wolverine-2024',
  'captain-america-brave-new-world-2025',
  'thunderbolts-2025',
  'fantastic-four-first-steps-2025',
];

function getFilteredAndSortedTitles(properties: PropertyGroup, orderType: WatchOrderType): MarvelTitle[] {
  if (properties === 'doomsday') {
    return DOOMSDAY_ORDER_IDS.map((id) => MARVEL_CATALOG.find((t) => t.id === id)).filter(
      (t): t is MarvelTitle => Boolean(t)
    );
  }

  const filtered = MARVEL_CATALOG.filter((t) => {
    if (properties === 'mcu') return t.inFocusMcu;
    if (properties === 'all-marvel') return t.inAllMarvel;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (orderType === 'story' || orderType === 'chronological') {
      return (a.storyRank ?? a.chronologicalRank ?? a.releaseRank) - (b.storyRank ?? b.chronologicalRank ?? b.releaseRank);
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

  const [account, setAccount] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
      return DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (account) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT, JSON.stringify(account));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCOUNT);
    }
  }, [account]);

  // Auto-sync active user data to CLOUD_ACCOUNTS database whenever state changes
  useEffect(() => {
    if (!account) return;
    try {
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.CLOUD_ACCOUNTS);
      const accountsDb = rawAccounts ? JSON.parse(rawAccounts) : {};
      const key = account.email.trim().toLowerCase();
      if (accountsDb[key]) {
        accountsDb[key].watchlist = watchlist;
        accountsDb[key].profile = profile;
        accountsDb[key].orderConfig = orderConfig;
        accountsDb[key].favorites = favorites;
        accountsDb[key].account.lastSyncedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.CLOUD_ACCOUNTS, JSON.stringify(accountsDb));
      }
    } catch {
      // storage unavailable
    }
  }, [watchlist, profile, orderConfig, favorites, account]);

  const setHasCompletedWizard = (done: boolean) => {
    setHasCompletedWizardState(done);
    localStorage.setItem(STORAGE_KEYS.WIZARD_DONE, done ? 'true' : 'false');
  };

  const applyOrderConfiguration = (newConfig: OrderConfiguration, paceDays = profile.paceDaysPerItem, startDate = profile.startDate) => {
    setOrderConfig(newConfig);
    const sortedTitles = getFilteredAndSortedTitles(newConfig.properties, newConfig.orderType);
    const schedule = calculateScheduleDates(sortedTitles, startDate, paceDays);

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

  const getWatchlistItem = (itemId: string): WatchlistItem => {
    const found = watchlist.find((w) => w.itemId === itemId);
    if (found) return found;

    const title = MARVEL_CATALOG.find((t) => t.id === itemId);
    return {
      itemId,
      customOrderIndex: -1,
      status: 'unwatched',
      episodesWatched: 0,
      scheduledDate: title?.isUpcoming ? title.releaseDate : new Date().toISOString().split('T')[0],
    };
  };

  // Immediate reactive status update with guaranteed watchedDate
  const updateItemStatus = (itemId: string, status: WatchStatus, rating?: number, notes?: string) => {
    setWatchlist((prev) => {
      const existingIndex = prev.findIndex((w) => w.itemId === itemId);
      const title = MARVEL_CATALOG.find((t) => t.id === itemId);
      const isWatched = status === 'watched';
      const fullEpisodes = title?.type === 'series' ? (title.episodesCount || 6) : 1;
      const stampDate = isWatched ? new Date().toISOString() : undefined;

      if (existingIndex >= 0) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          return {
            ...item,
            status,
            episodesWatched: isWatched ? fullEpisodes : item.episodesWatched,
            watchedDate: isWatched ? (item.watchedDate || stampDate) : undefined,
            userRating: rating !== undefined ? rating : item.userRating,
            userNotes: notes !== undefined ? notes : item.userNotes,
          };
        });
      } else {
        const newItem: WatchlistItem = {
          itemId,
          customOrderIndex: prev.length,
          status,
          episodesWatched: isWatched ? fullEpisodes : 0,
          scheduledDate: title?.isUpcoming ? title.releaseDate : new Date().toISOString().split('T')[0],
          watchedDate: stampDate,
          userRating: rating,
          userNotes: notes,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateEpisodesWatched = (itemId: string, count: number) => {
    const title = MARVEL_CATALOG.find((t) => t.id === itemId);
    const maxEps = title?.episodesCount || 1;
    const clampedCount = Math.max(0, Math.min(count, maxEps));

    setWatchlist((prev) => {
      const existingIndex = prev.findIndex((w) => w.itemId === itemId);
      let status: WatchStatus = 'unwatched';
      if (clampedCount >= maxEps) {
        status = 'watched';
      } else if (clampedCount > 0) {
        status = 'watching';
      }

      if (existingIndex >= 0) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          return {
            ...item,
            episodesWatched: clampedCount,
            status,
            watchedDate: status === 'watched' ? (item.watchedDate || new Date().toISOString()) : undefined,
          };
        });
      } else {
        const newItem: WatchlistItem = {
          itemId,
          customOrderIndex: prev.length,
          status,
          episodesWatched: clampedCount,
          scheduledDate: title?.isUpcoming ? title.releaseDate : new Date().toISOString().split('T')[0],
          watchedDate: status === 'watched' ? new Date().toISOString() : undefined,
        };
        return [...prev, newItem];
      }
    });
  };

  const rescheduleDate = (itemId: string, newDate: string) => {
    setWatchlist((prev) => {
      const existing = prev.some((w) => w.itemId === itemId);
      if (existing) {
        return prev.map((item) => (item.itemId === itemId ? { ...item, scheduledDate: newDate } : item));
      } else {
        return [
          ...prev,
          {
            itemId,
            customOrderIndex: prev.length,
            status: 'unwatched',
            episodesWatched: 0,
            scheduledDate: newDate,
          },
        ];
      }
    });
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // FAVORITES MANAGEMENT
  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

  const favoriteTitles = useMemo(() => {
    return favorites
      .map((id) => MARVEL_CATALOG.find((t) => t.id === id))
      .filter((t): t is MarvelTitle => Boolean(t));
  }, [favorites]);

  const resetAllData = () => {
    localStorage.clear();
    setOrderConfig(DEFAULT_CONFIG);
    setProfile(DEFAULT_PROFILE);
    setAccount(null);
    setFavorites([]);
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

  // MULTI-DEVICE ACCOUNT METHODS
  const createAccount = async (data: {
    email: string;
    pass: string;
    displayName: string;
    username: string;
    quote?: string;
    favoriteHero?: string;
    avatarId?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!data.email.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
      if (data.pass.length < 4) return { success: false, error: 'Password must be at least 4 characters.' };
      if (!data.displayName.trim()) return { success: false, error: 'Please enter a display name.' };
      if (!data.username.trim()) return { success: false, error: 'Please enter a username.' };

      const syncKey = 'MARVEL-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const newAcc: UserAccount = {
        id: 'user-' + Date.now(),
        email: data.email.trim().toLowerCase(),
        displayName: data.displayName.trim(),
        username: data.username.trim().toLowerCase(),
        quote: data.quote?.trim(),
        favoriteHero: data.favoriteHero?.trim(),
        avatarId: data.avatarId || 'avatar-1',
        lastSyncedAt: new Date().toISOString(),
        syncKey,
        isLoggedIn: true,
      };

      const newProfile: UserProfile = {
        ...profile,
        displayName: newAcc.displayName,
        username: newAcc.username,
        bio: newAcc.quote || '',
        favoriteCharacter: newAcc.favoriteHero || '',
        avatarId: newAcc.avatarId,
      };

      // Store in cloud DB simulator
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.CLOUD_ACCOUNTS);
      const accountsDb = rawAccounts ? JSON.parse(rawAccounts) : {};
      accountsDb[newAcc.email] = {
        account: newAcc,
        password: data.pass,
        watchlist,
        profile: newProfile,
        orderConfig,
        favorites,
      };
      localStorage.setItem(STORAGE_KEYS.CLOUD_ACCOUNTS, JSON.stringify(accountsDb));

      setAccount(newAcc);
      setProfile(newProfile);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create account.' };
    }
  };

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.CLOUD_ACCOUNTS);
      const accountsDb = rawAccounts ? JSON.parse(rawAccounts) : {};
      const normalizedEmail = email.trim().toLowerCase();

      const record = accountsDb[normalizedEmail];
      if (!record) {
        return { success: false, error: 'Account not found. Please click "Create Account" first.' };
      }

      if (record.password !== pass) {
        return { success: false, error: 'Incorrect password for this account.' };
      }

      if (record.watchlist && Array.isArray(record.watchlist)) {
        setWatchlist(record.watchlist);
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(record.watchlist));
      }
      if (record.profile) {
        setProfile(record.profile);
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(record.profile));
      }
      if (record.orderConfig) {
        setOrderConfig(record.orderConfig);
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(record.orderConfig));
      }
      if (record.favorites && Array.isArray(record.favorites)) {
        setFavorites(record.favorites);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(record.favorites));
      }

      const updatedAcc = {
        ...record.account,
        lastSyncedAt: new Date().toISOString(),
        isLoggedIn: true,
      };
      setAccount(updatedAcc);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to sign in.' };
    }
  };

  const signOut = () => {
    if (account) {
      try {
        const rawAccounts = localStorage.getItem(STORAGE_KEYS.CLOUD_ACCOUNTS);
        const accountsDb = rawAccounts ? JSON.parse(rawAccounts) : {};
        const key = account.email.trim().toLowerCase();
        if (accountsDb[key]) {
          accountsDb[key].watchlist = watchlist;
          accountsDb[key].profile = profile;
          accountsDb[key].orderConfig = orderConfig;
          accountsDb[key].favorites = favorites;
          accountsDb[key].account.lastSyncedAt = new Date().toISOString();
          localStorage.setItem(STORAGE_KEYS.CLOUD_ACCOUNTS, JSON.stringify(accountsDb));
        }
      } catch {
        // ignore
      }
    }
    setAccount(null);
  };

  const syncWithCloud = async (): Promise<boolean> => {
    if (!account) return false;
    try {
      const rawAccounts = localStorage.getItem(STORAGE_KEYS.CLOUD_ACCOUNTS);
      const accountsDb = rawAccounts ? JSON.parse(rawAccounts) : {};
      const key = account.email.trim().toLowerCase();
      if (accountsDb[key]) {
        accountsDb[key].watchlist = watchlist;
        accountsDb[key].profile = profile;
        accountsDb[key].orderConfig = orderConfig;
        accountsDb[key].favorites = favorites;
        accountsDb[key].account.lastSyncedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.CLOUD_ACCOUNTS, JSON.stringify(accountsDb));
      }
      setAccount((prev) => (prev ? { ...prev, lastSyncedAt: new Date().toISOString() } : null));
      return true;
    } catch {
      return false;
    }
  };

  const exportSyncCode = (): string => {
    const payload = {
      v: 3,
      profile,
      orderConfig,
      watchlist,
      favorites,
      exportedAt: new Date().toISOString(),
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  };

  const importSyncCode = (code: string): boolean => {
    try {
      const decoded = decodeURIComponent(escape(atob(code.trim())));
      const payload = JSON.parse(decoded);
      if (payload.watchlist && Array.isArray(payload.watchlist)) {
        setWatchlist(payload.watchlist);
      }
      if (payload.profile) {
        setProfile(payload.profile);
      }
      if (payload.orderConfig) {
        setOrderConfig(payload.orderConfig);
      }
      if (payload.favorites && Array.isArray(payload.favorites)) {
        setFavorites(payload.favorites);
      }
      return true;
    } catch {
      return false;
    }
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

  // COMPLETE FIX FOR HISTORY: Derived directly from ALL watched items in watchlist!
  // Any title marked watched (whether in the active order, from discover, or spider-man) immediately shows up!
  const historyList = useMemo(() => {
    return watchlist
      .filter((w) => w.status === 'watched')
      .map((w) => {
        const item = MARVEL_CATALOG.find((t) => t.id === w.itemId);
        return item ? { item, watchData: w } : null;
      })
      .filter((x): x is { item: MarvelTitle; watchData: WatchlistItem } => x !== null)
      .sort((a, b) => {
        const dateA = a.watchData.watchedDate ? new Date(a.watchData.watchedDate).getTime() : 0;
        const dateB = b.watchData.watchedDate ? new Date(b.watchData.watchedDate).getTime() : 0;
        return dateB - dateA;
      });
  }, [watchlist]);

  // Statistics calculation
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
        account,
        favorites,
        hasCompletedWizard,
        showWizard,
        stats,
        historyList,
        activeOrderTitles,
        favoriteTitles,
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
        getWatchlistItem,
        addItemToWatchlist,
        removeItemFromWatchlist,
        toggleFavorite,
        isFavorite,
        createAccount,
        signIn,
        signOut,
        syncWithCloud,
        exportSyncCode,
        importSyncCode,
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
