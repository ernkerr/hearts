import { MMKV } from "react-native-mmkv";

// Create a single MMKV storage instance
export const storage = new MMKV();

// Hearts scoring constants
export const QUEEN_OF_SPADES_PENALTY = 13;
export const SHOOT_MOON_VALUE = 26;
export const POINTS_PER_HEART = 1;
export const MAX_POINTS_PER_ROUND = 26; // 13 hearts + 13 for queen

// --- Type Definitions ---
// These types match the structure used in asyncStorage.ts for full compatibility
export type Game = {
  id: string;
  date: string;
  scoreHistory: Array<{
    user: number; // user's score for a round
    opponent: number; // opponent's score for a round
    date: string; // date of the round
    bonusType?: "queenOfSpades" | "shootMoon" | null;
  }>;
  winner: "user" | "opponent" | null; // who won the game
  notes?: string;
  targetScore?: number;
  // knockValue?: number;
  // ginBonus?: number;
  // bigGinBonus?: number;
  // undercutBonus?: number;
};

export type Opponent = {
  id: string;
  name: string;
  games: Game[];
  color: string; // hex string for avatar background
};

export type LocalData = {
  opponents: Opponent[];
  hasPaid: boolean;
  userName?: string;
};

// --- Opponents ---
/**
 * Retrieves the list of opponents from MMKV storage.
 * Returns an empty array if not set.
 */
export function getOpponents(): Opponent[] {
  const data = storage.getString("opponents");
  return data ? JSON.parse(data) : [];
}

/**
 * Saves the list of opponents to MMKV storage.
 */
export function saveOpponents(opponents: Opponent[]) {
  storage.set("opponents", JSON.stringify(opponents));
}

// --- Payment ---
/**
 * Retrieves the payment status (hasPaid) from MMKV storage.
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
