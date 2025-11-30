import { MMKV } from "react-native-mmkv";

// Create a single MMKV storage instance
export const storage = new MMKV();

// --- Type Definitions ---
// These types match the structure used in asyncStorage.ts for full compatibility
export type Game = {
  id: string;
  date: string;
  scoreHistory: Array<{
    user: number; // user's score for a round
    opponent: number; // opponent's score for a round
    date: string; // date of the round
    bonusType?: "gin" | "bigGin" | "undercut" | null; // optional bonus type
  }>;
  winner: "user" | "opponent" | null; // who won the game
  notes?: string;
  targetScore?: number;
  knockValue?: number;
  ginBonus?: number;
  bigGinBonus?: number;
  undercutBonus?: number;
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

// --- Bonus Values ---
/**
 * Retrieves the Gin bonus value from MMKV storage. Defaults to 25 if not set.
 */
export function getGinValue(): number {
  const value = storage.getString("ginValue");
  return value !== undefined && value !== null ? parseInt(value, 10) : 25;
}

/**
 * Sets the Gin bonus value in MMKV storage.
 */
export function setGinValue(val: number) {
  storage.set("ginValue", val.toString());
}

/**
 * Retrieves the Big Gin bonus value from MMKV storage. Defaults to 31 if not set.
 */
export function getBigGinValue(): number {
  const value = storage.getString("bigGinValue");
  return value !== undefined && value !== null ? parseInt(value, 10) : 31;
}

/**
 * Sets the Big Gin bonus value in MMKV storage.
 */
export function setBigGinValue(val: number) {
  storage.set("bigGinValue", val.toString());
}

/**
 * Retrieves the Undercut bonus value from MMKV storage. Defaults to 25 if not set.
 */
export function getUndercutValue(): number {
  const value = storage.getString("undercutValue");
  return value !== undefined && value !== null ? parseInt(value, 10) : 25;
}

/**
 * Sets the Undercut bonus value in MMKV storage.
 */
export function setUndercutValue(val: number) {
  storage.set("undercutValue", val.toString());
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
