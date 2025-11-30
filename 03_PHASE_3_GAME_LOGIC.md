# Phase 3: Game Logic Changes

**Goal**: Fix the winner calculation so lowest score wins (Hearts rules) instead of highest score (Gin rules).

**Time**: 30 minutes

**File**: `src/utils/gameLogic.ts`

**⚠️ CRITICAL**: This is the most important change. Get this wrong and the whole game is backwards!

---

## Step 3.1: Understand Current Logic

### READ the current file (don't change yet):

The file has 3 main functions:
1. `calculateWinner()` - Determines who won the game
2. `canAddScore()` - Paywall check (can we add more points?)
3. `getTotalScore()` - Sums up all round scores

**Current Gin logic:**
- First player to reach targetScore (e.g., 100) WINS
- Higher score = better

**Hearts logic we need:**
- First player to reach targetScore (e.g., 100) LOSES
- Lower score = better
- Game ends when someone hits 100, then lowest score wins

---

## Step 3.2: Fix calculateWinner Function

### FIND (around line 5-20):
```typescript
export const calculateWinner = (
  game: Game,
  targetScore: number
): "user" | "opponent" | null => {
  const userTotal = getTotalScore(game.scoreHistory, "user");
  const opponentTotal = getTotalScore(game.scoreHistory, "opponent");

  if (userTotal >= targetScore) {
    return "user";
  }

  if (opponentTotal >= targetScore) {
    return "opponent";
  }

  return null;
};
```

### CHANGE TO:
```typescript
export const calculateWinner = (
  game: Game,
  targetScore: number
): "user" | "opponent" | null => {
  const userTotal = getTotalScore(game.scoreHistory, "user");
  const opponentTotal = getTotalScore(game.scoreHistory, "opponent");

  // In Hearts, game ends when someone reaches target score (they LOSE)
  // Winner is whoever has the LOWEST score at that point
  const gameOver = userTotal >= targetScore || opponentTotal >= targetScore;

  if (!gameOver) {
    return null; // Game still in progress
  }

  // Game is over - lowest score wins
  if (userTotal < opponentTotal) {
    return "user";
  }

  if (opponentTotal < userTotal) {
    return "opponent";
  }

  // Tie game (rare but possible)
  return null;
};
```

### What Changed:
1. ✅ Game ends when EITHER player hits target (not just the first one)
2. ✅ Winner is LOWEST score (not highest)
3. ✅ Handles ties (return null if equal scores)
4. ✅ Added comments explaining Hearts logic

### ✅ Checkpoint
Save the file. This is the core logic change!

---

## Step 3.3: Verify getTotalScore Function

### FIND (around line 40-55):
```typescript
export const getTotalScore = (
  scoreHistory: Game["scoreHistory"],
  player: "user" | "opponent"
): number => {
  return scoreHistory.reduce((total, round) => {
    return total + round[player];
  }, 0);
};
```

### ✅ KEEP THIS UNCHANGED
This function just sums scores - it works the same for Hearts and Gin.

In Hearts, each round you add penalty points (hearts + queen of spades), so summing them still makes sense.

---

## Step 3.4: Update canAddScore Function (Paywall)

### FIND (around line 25-38):
```typescript
export const canAddScore = (
  game: Game,
  player: "user" | "opponent",
  hasPaid: boolean
): boolean => {
  if (hasPaid) {
    return true;
  }

  const total = getTotalScore(game.scoreHistory, player);
  return total < 100;
};
```

### CONSIDER: Should This Change?

**Current behavior**: Free users can't add scores if player has 100+ points

**For Hearts**: This makes sense! 100 points means game over, so blocking at 100 is correct.

### ✅ KEEP THIS UNCHANGED

The paywall limit of 100 points works fine for Hearts. Free users can play complete games.

**Optional**: If you want free users to have a lower limit (e.g., 50 points), change it:
```typescript
return total < 50; // Free users limited to 50-point games
```

---

## Step 3.5: Test the Logic Manually

### Create a Test Scenario:

Add this temporary code at the bottom of `gameLogic.ts` (we'll delete it later):

```typescript
// TEST CODE - DELETE BEFORE PRODUCTION
if (typeof window !== "undefined") {
  // Test 1: User reaches 100 first but has higher score (loses)
  const testGame1: Game = {
    id: "test1",
    date: new Date().toISOString(),
    scoreHistory: [
      { user: 26, opponent: 0, date: new Date().toISOString(), bonusType: "shootMoon" },
      { user: 26, opponent: 20, date: new Date().toISOString(), bonusType: null },
      { user: 26, opponent: 20, date: new Date().toISOString(), bonusType: null },
      { user: 26, opponent: 20, date: new Date().toISOString(), bonusType: null },
    ],
    winner: null,
    targetScore: 100,
  };

  const userTotal1 = getTotalScore(testGame1.scoreHistory, "user"); // 104
  const oppTotal1 = getTotalScore(testGame1.scoreHistory, "opponent"); // 60
  const winner1 = calculateWinner(testGame1, 100);

  console.log("Test 1: User has 104, Opponent has 60");
  console.log("Winner should be: opponent (lower score)");
  console.log("Winner is:", winner1);
  console.log("PASS:", winner1 === "opponent" ? "✅" : "❌");

  // Test 2: Opponent reaches 100 first but has higher score (loses)
  const testGame2: Game = {
    id: "test2",
    date: new Date().toISOString(),
    scoreHistory: [
      { user: 10, opponent: 26, date: new Date().toISOString(), bonusType: null },
      { user: 10, opponent: 26, date: new Date().toISOString(), bonusType: null },
      { user: 10, opponent: 26, date: new Date().toISOString(), bonusType: null },
      { user: 10, opponent: 26, date: new Date().toISOString(), bonusType: null },
    ],
    winner: null,
    targetScore: 100,
  };

  const winner2 = calculateWinner(testGame2, 100);
  console.log("\nTest 2: User has 40, Opponent has 104");
  console.log("Winner should be: user (lower score)");
  console.log("Winner is:", winner2);
  console.log("PASS:", winner2 === "user" ? "✅" : "❌");

  // Test 3: No one at 100 yet
  const testGame3: Game = {
    id: "test3",
    date: new Date().toISOString(),
    scoreHistory: [
      { user: 20, opponent: 25, date: new Date().toISOString(), bonusType: null },
    ],
    winner: null,
    targetScore: 100,
  };

  const winner3 = calculateWinner(testGame3, 100);
  console.log("\nTest 3: User has 20, Opponent has 25");
  console.log("Winner should be: null (game not over)");
  console.log("Winner is:", winner3);
  console.log("PASS:", winner3 === null ? "✅" : "❌");
}
```

### Run the App:
```bash
npx expo start
```

### Check Console:
Open the browser console (if web) or React Native debugger and look for:
```
Test 1: ✅
Test 2: ✅
Test 3: ✅
```

If all pass, your logic is correct!

### ✅ Checkpoint
**DELETE the test code** after verifying it works.

---

## Step 3.6: Add Helper Functions (Optional)

You might want to add helper functions for Hearts-specific calculations:

### ADD at the bottom of gameLogic.ts:
```typescript
/**
 * Calculate points for a Hearts round
 * @param hearts - Number of hearts taken (0-13)
 * @param hasQueen - Whether Queen of Spades was taken
 * @returns Total penalty points
 */
export const calculateRoundScore = (hearts: number, hasQueen: boolean): number => {
  const heartPoints = hearts * 1; // 1 point per heart
  const queenPoints = hasQueen ? 13 : 0;
  return heartPoints + queenPoints;
};

/**
 * Check if a shoot-the-moon scenario occurred
 * A player shoots the moon if they took all 26 points
 */
export const isMoonShot = (score: number): boolean => {
  return score === 26;
};

/**
 * Get the current leader (lowest score in Hearts)
 * Returns "user" if user is winning, "opponent" if opponent is winning
 */
export const getCurrentLeader = (
  game: Game
): "user" | "opponent" | null => {
  const userTotal = getTotalScore(game.scoreHistory, "user");
  const opponentTotal = getTotalScore(game.scoreHistory, "opponent");

  if (userTotal < opponentTotal) return "user";
  if (opponentTotal < userTotal) return "opponent";
  return null; // Tied
};
```

### ✅ Checkpoint
These helpers aren't required but make the UI code cleaner in Phase 4.

---

## Step 3.7: Update Exports

### FIND (top of file):
```typescript
import { Game } from "./mmkvStorage";

export const calculateWinner = ...
export const canAddScore = ...
export const getTotalScore = ...
```

### ADD (if you added helper functions):
```typescript
export const calculateRoundScore = ...
export const isMoonShot = ...
export const getCurrentLeader = ...
```

---

## Phase 3 Complete! ✅

### What You've Done:
- ✅ Inverted winner logic (lowest score wins)
- ✅ Fixed game-over detection (when anyone hits target)
- ✅ Handled ties
- ✅ Kept paywall logic working
- ✅ Added helpful Hearts calculation functions
- ✅ Tested the logic with console tests

### Critical Change:
The game now correctly identifies the LOWEST score as the winner when someone reaches 100 points!

### What's Next:
The logic is correct, but the UI still shows Gin bonuses and celebrates the wrong player. Time to fix the components.

**👉 Go to `04_PHASE_4_UI_COMPONENTS.md`**

---

## Troubleshooting

### "Game declares wrong winner"
Double-check the calculateWinner function:
- Should return "user" if `userTotal < opponentTotal` (not >)
- Should only return a winner if someone >= targetScore

### "Console tests fail"
Make sure you:
1. Copied the test code exactly
2. Saved the file
3. Restarted the dev server
4. Checked the right console (browser or React Native debugger)

### "TypeScript error on Game type"
Make sure you completed Phase 2 first - the Game type needs to be updated.
