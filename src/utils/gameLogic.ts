// Centralized game logic utilities for Hearts Score Tracker
// This file contains reusable functions for core game operations such as winner calculation, paywall enforcement, and score tallying.

import type { Player, Round } from "./mmkvStorage";

/**
 * Calculates the winner of a Hearts game.
 * Winner = player with LOWEST score when ANY player reaches targetScore
 *
 * @param rounds - Array of round objects with scores for all players
 * @param players - Array of players in the game
 * @param targetScore - The score threshold that ends the game
 * @returns playerId of winner, or null if no winner yet
 */
export function calculateWinner(
  rounds: Round[],
  players: Player[],
  targetScore: number
): string | null {
  if (!targetScore || targetScore <= 0) return null;

  // Calculate totals for each player
  const totals = getAllPlayerTotals(rounds, players);

  // Check if any player reached target
  const hasReachedTarget = Object.values(totals).some(
    (score) => score >= targetScore
  );
  if (!hasReachedTarget) return null;

  // Find player with LOWEST score (Hearts rule)
  let lowestScore = Infinity;
  let winnerId: string | null = null;
  Object.entries(totals).forEach(([playerId, score]) => {
    if (score < lowestScore) {
      lowestScore = score;
      winnerId = playerId;
    }
  });

  return winnerId;
}

/**
 * Calculates total score for a specific player across all rounds.
 *
 * @param rounds - Array of round objects
 * @param playerId - ID of the player to calculate total for
 * @returns Total score for the specified player
 */
export function getTotalScore(rounds: Round[], playerId: string): number {
  return rounds.reduce((sum, round) => {
    return sum + (round.scores[playerId] || 0);
  }, 0);
}

/**
 * Gets all player totals as a map of playerId to total score.
 *
 * @param rounds - Array of round objects
 * @param players - Array of players in the game
 * @returns Object mapping playerId to total score
 */
export function getAllPlayerTotals(
  rounds: Round[],
  players: Player[]
): { [playerId: string]: number } {
  const totals: { [playerId: string]: number } = {};

  // Initialize all players with 0
  players.forEach((p) => (totals[p.id] = 0));

  // Sum up scores from all rounds
  rounds.forEach((round) => {
    Object.entries(round.scores).forEach(([playerId, score]) => {
      totals[playerId] = (totals[playerId] || 0) + score;
    });
  });

  return totals;
}

/**
 * Apply "Shoot the Moon" bonus scoring.
 * The shooter gets 0 points for the round, all other players get 26 points.
 *
 * @param baseScores - Base scores for all players (before bonus)
 * @param shooterId - ID of the player who shot the moon
 * @returns Updated scores with shoot the moon applied
 */
export function applyShootMoonBonus(
  baseScores: { [playerId: string]: number },
  shooterId: string
): { [playerId: string]: number } {
  const result: { [playerId: string]: number } = {};

  Object.keys(baseScores).forEach((playerId) => {
    if (playerId === shooterId) {
      result[playerId] = 0;
    } else {
      result[playerId] = 26;
    }
  });

  return result;
}
