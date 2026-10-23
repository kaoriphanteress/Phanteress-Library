export type MediaType = 'movie' | 'series';

export type MarvelPhase =
  | 'Phase 1'
  | 'Phase 2'
  | 'Phase 3'
  | 'Phase 4'
  | 'Phase 5'
  | 'Phase 6'
  | 'Legacy Marvel'
  | 'Fox / Sony Multiverse'
  | 'Upcoming';

export type PropertyGroup = 'doomsday' | 'mcu' | 'all-marvel';

export type WatchOrderType = 'release' | 'chronological' | 'phanteress';

export type WatchStatus = 'unwatched' | 'watching' | 'watched' | 'on-hold' | 'skipped';

export interface MarvelTitle {
  id: string;
  title: string;
  year: number;
  type: MediaType;
  episodesCount?: number;
  runtimeMinutes: number;
  phase: MarvelPhase;
  imdbId: string;
  imdbRating: number;
  synopsis: string;
  directorOrCreator: string;
  releaseDate: string; // YYYY-MM-DD
  chronologicalRank: number;
  releaseRank: number;
  phanteressRank: number;
  isUpcoming?: boolean;
  upcomingDateText?: string;
  inDoomsdayList: boolean;
  inFocusMcu: boolean;
  inAllMarvel: boolean;
  heroCharacter: string;
  bannerColor: string;
}

export interface WatchlistItem {
  itemId: string;
  customOrderIndex: number;
  status: WatchStatus;
  episodesWatched: number;
  scheduledDate: string; // YYYY-MM-DD
  watchedDate?: string; // ISO string
  userRating?: number; // 1-10
  userNotes?: string;
}

export type GroupingMode = 'phase' | 'list';

export interface OrderConfiguration {
  franchise: 'marvel' | 'dc';
  properties: PropertyGroup;
  orderType: WatchOrderType;
  groupingMode?: GroupingMode;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatarId: string;
  avatarUrl?: string;
  paceDaysPerItem: number; // e.g. 1 item per day, 1 per 2 days
  startDate: string; // YYYY-MM-DD
}

export interface UserStats {
  episodesWatched: number;
  showsWatched: number;
  moviesWatched: number;
  totalScreenTimeMinutes: number;
  completedTitlesCount: number;
  totalTitlesInOrder: number;
  completionPercentage: number;
}
