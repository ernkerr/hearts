import { MMKV } from "react-native-mmkv";

// Create a single MMKV storage instance
export const storage = new MMKV();

// Hearts scoring constants
export const QUEEN_OF_SPADES_PENALTY = 13;
export const SHOOT_MOON_VALUE = 26;
export const POINTS_PER_HEART = 1;
export const MAX_POINTS_PER_ROUND = 26; // 13 hearts + 13 for queen

// --- Type Definitions ---
export type Player = {
  id: string;
  name: string;
  color: string; // hex string for avatar background
  isUser: boolean; // true for the current user
};

export type Round = {
  date: string;
  scores: { [playerId: string]: number }; // Map player ID to their score for this round
  bonusType?: "queenOfSpades" | "shootMoon" | null;
  bonusPlayerId?: string; // For shootMoon - who shot the moon
};

export type Game = {
  id: string;
  date: string;
  players: Player[]; // 3-5+ players
  rounds: Round[]; // Each round contains scores for all players
  winner: string | null; // player ID of winner
  targetScore: number;
  status: "in_progress" | "completed";
};

export type LocalData = {
  games: Game[];
  hasPaid: boolean;
  userName?: string;
};

// --- Games ---
/**
 * Retrieves the list of games from MMKV storage.
 * Returns an empty array if not set.
 */
export function getGames(): Game[] {
  const data = storage.getString("games");
  return data ? JSON.parse(data) : [];
}

/**
 * Saves the list of games to MMKV storage.
 */
export function saveGames(games: Game[]) {
  storage.set("games", JSON.stringify(games));
}

/**
 * Retrieves a specific game by ID from MMKV storage.
 * Returns null if not found.
 */
export function getGameById(id: string): Game | null {
  const games = getGames();
  return games.find(game => game.id === id) || null;
}

/**
 * Updates a specific game in MMKV storage.
 */
export function updateGame(id: string, updates: Partial<Game>): void {
  const games = getGames();
  const index = games.findIndex(game => game.id === id);
  if (index !== -1) {
    games[index] = { ...games[index], ...updates };
    saveGames(games);
  }
}

/**
 * Deletes a specific game from MMKV storage.
 */
export function deleteGame(id: string): void {
  const games = getGames();
  const filtered = games.filter(game => game.id !== id);
  saveGames(filtered);
}

// --- Payment ---
/**
 * Retrieves the payment status (hasPaid) from MMKV storage.
 *
 * NOTE: With the subscription model this is a *cached* entitlement value that is
 * re-derived from the store by `refreshEntitlement()` (see `src/utils/iap.ts`)
 * on launch and on games-list focus. It can flip back to `false` if a
 * subscription lapses. Promo unlocks are tracked separately via
 * `getPromoUnlocked()` so they survive an entitlement refresh.
 */
export function getHasPaid(): boolean {
  return storage.getBoolean("hasPaid") ?? false;
}

/**
 * Sets the payment status (hasPaid) in MMKV storage.
 */
export function setHasPaid(val: boolean) {
  storage.set("hasPaid", val);
}

// --- Promo unlock (permanent) ---
/**
 * Retrieves the promo-unlock flag from MMKV storage.
 *
 * This is a permanent, local grant (e.g. a redeemed promo code). It is kept
 * separate from `hasPaid` so that `refreshEntitlement()` re-deriving store
 * entitlement can never revoke a promo unlock.
 */
export function getPromoUnlocked(): boolean {
  return storage.getBoolean("promoUnlocked") ?? false;
}

/**
 * Sets the permanent promo-unlock flag in MMKV storage.
 */
export function setPromoUnlocked(val: boolean) {
  storage.set("promoUnlocked", val);
}

// --- User Name ---
/**
 * Retrieves the user's name from MMKV storage.
 * Defaults to 'You' if not set.
 */
export function getUserName(): string {
  return storage.getString("userName") || "You";
}

/**
 * Sets the user's name in MMKV storage.
 */
export function setUserName(name: string) {
  storage.set("userName", name);
}

// --- Helper: Generate ID ---
/**
 * Generates a unique ID string.
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Retrieves the default Target Score value from MMKV storage. Defaults to 100 if not set.
 */
export function getTargetScore(): number {
  const value = storage.getString("targetScore");
  return value !== undefined && value !== null ? parseInt(value, 10) : 100;
}

/**
 * Sets the default Target Score value in MMKV storage.
 */
export function setTargetScore(val: number) {
  storage.set("targetScore", val.toString());
}
