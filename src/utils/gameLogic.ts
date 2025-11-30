// Centralized game logic utilities for Gin Score Tracker
// This file contains reusable functions for core game operations such as winner calculation, paywall enforcement, and score tallying.

import type { Game } from "./mmkvStorage";

/**
 * Calculates the winner of a game based on the score history and the target score.
 *
 * @param scoreHistory - Array of round objects with user and opponent scores.
 * @param targetScore - The score required to win the game. If not set or <= 0, no winner is determined.
 * @returns 'user', 'opponent', or null if no winner yet.
 */
export function calculateWinner(
  scoreHistory: { user: number; opponent: number }[],
  targetScore?: number
): "user" | "opponent" | null {
  if (!targetScore || targetScore <= 0) return null;
  const userTotal = scoreHistory.reduce((sum, r) => sum + (r.user || 0), 0);
  const opponentTotal = scoreHistory.reduce(
    (sum, r) => sum + (r.opponent || 0),
    0
  );
  if (userTotal >= targetScore) return "user";
  if (opponentTotal >= targetScore) return "opponent";
  return null;
}

/**
 * Checks if a new score can be added, enforcing the free version's score limit (paywall logic).
 *
 * @param scoreHistory - Array of round objects with user and opponent scores.
 * @param user - The score to be added for the user.
 * @param opp - The score to be added for the opponent.
 * @param hasPaid - Whether the user has paid for the app (unlocks unlimited scoring).
 * @param maxFreeScore - The maximum total score allowed for free users (default: 100).
 * @returns true if the score can be added, false if it would exceed the free limit.
 */
export function canAddScore(
  scoreHistory: { user: number; opponent: number }[],
  user: number,
  opp: number,
  hasPaid: boolean,
  maxFreeScore = 100
): boolean {
  if (hasPaid) return true;
  // Calculate total user score by summing all previous rounds plus the new score, using 0 as fallback for undefined values
  const userTotal =
    scoreHistory.reduce((sum, r) => sum + (r.user || 0), 0) + (user || 0);
  const opponentTotal =
    scoreHistory.reduce((sum, r) => sum + (r.opponent || 0), 0) + (opp || 0);
  return userTotal <= maxFreeScore && opponentTotal <= maxFreeScore;
}

/**
 * Computes the total score for a given player across all rounds.
 *
 * @param scoreHistory - Array of round objects with user and opponent scores.
 * @param player - 'user' or 'opponent' to specify which player's total to compute.
 * @returns The total score for the specified player.
 */
export function getTotalScore(
  scoreHistory: { user: number; opponent: number }[],
  player: "user" | "opponent"
): number {
  return scoreHistory.reduce((sum, r) => sum + (r[player] || 0), 0);
}
