# Phase 2: Data Model Changes

**Goal**: Update TypeScript types and storage to remove Gin concepts and add Hearts concepts.

**Time**: 1 hour

**File**: `src/utils/mmkvStorage.ts`

---

## Step 2.1: Update Game Type - Remove Gin Fields

### FIND (around line 14-24):
```typescript
type Game = {
  id: string;
  date: string;
  scoreHistory: Array<{
    user: number;
    opponent: number;
    date: string;
    bonusType?: "gin" | "bigGin" | "undercut" | null;
  }>;
  winner: "user" | "opponent" | null;
  notes?: string;
  targetScore?: number;
  knockValue?: number;
  ginBonus?: number;
  bigGinBonus?: number;
  undercutBonus?: number;
};
```

### CHANGE TO:
```typescript
type Game = {
  id: string;
  date: string;
  scoreHistory: Array<{
    user: number;
    opponent: number;
    date: string;
    bonusType?: "queenOfSpades" | "shootMoon" | null;
  }>;
  winner: "user" | "opponent" | null;
  notes?: string;
  targetScore?: number;
  // Removed: knockValue, ginBonus, bigGinBonus, undercutBonus
};
```

### What Changed:
- ❌ Removed `knockValue` (Gin-specific)
- ❌ Removed `ginBonus`, `bigGinBonus`, `undercutBonus` (Gin-specific)
- ✅ Changed `bonusType` from `"gin" | "bigGin" | "undercut"` to `"queenOfSpades" | "shootMoon"`

### ✅ Checkpoint
Save the file. You'll see TypeScript errors - that's expected. We'll fix them next.

---

## Step 2.2: Remove Gin Bonus Storage Functions

### DELETE these functions entirely:

**FIND and DELETE (around line 95-105):**
```typescript
export const getGinValue = (): number => {
  return mmkv.getNumber("ginValue") ?? 25;
};

export const setGinValue = (value: number) => {
  mmkv.set("ginValue", value);
};
```

**FIND and DELETE (around line 107-117):**
```typescript
export const getBigGinValue = (): number => {
  return mmkv.getNumber("bigGinValue") ?? 31;
};

export const setBigGinValue = (value: number) => {
  mmkv.set("bigGinValue", value);
};
```

**FIND and DELETE (around line 119-129):**
```typescript
export const getUndercutValue = (): number => {
  return mmkv.getNumber("undercutValue") ?? 25;
};

export const setUndercutValue = (value: number) => {
  mmkv.set("undercutValue", value);
};
```

### ✅ Checkpoint
Save the file. Now these Gin-specific functions are gone.

---

## Step 2.3: Add Hearts Constants (Optional)

You don't need storage functions for Hearts values since they're always constant:
- Queen of Spades = 13 points (never changes)
- Shooting the Moon = 26 points (never changes)

But you can add them as constants for easy reference:

### ADD at the top of the file (around line 50, after imports):
```typescript
// Hearts scoring constants
export const QUEEN_OF_SPADES_PENALTY = 13;
export const SHOOT_MOON_VALUE = 26;
export const POINTS_PER_HEART = 1;
export const MAX_POINTS_PER_ROUND = 26; // 13 hearts + 13 for queen
```

---

## Step 2.4: Keep Target Score Functions

### FIND (around line 85-93):
```typescript
export const getTargetScore = (): number => {
  return mmkv.getNumber("targetScore") ?? 100;
};

export const setTargetScore = (value: number) => {
  mmkv.set("targetScore", value);
};
```

### ✅ KEEP THESE
Target score of 100 works perfectly for Hearts! In Hearts, first to 100 LOSES (we'll change the winner logic in Phase 3).

---

## Step 2.5: Update Default Values in Settings

### File: `app/settings.tsx`

**FIND (around line 80-90):**
```typescript
const [ginValue, setGinValueState] = useState(getGinValue());
const [bigGinValue, setBigGinValueState] = useState(getBigGinValue());
const [undercutValue, setUndercutValueState] = useState(getUndercutValue());
```

### DELETE these lines
We'll remove the UI for these in Phase 5, but for now just comment them out:
```typescript
// const [ginValue, setGinValueState] = useState(getGinValue());
// const [bigGinValue, setBigGinValueState] = useState(getBigGinValue());
// const [undercutValue, setUndercutValueState] = useState(getUndercutValue());
```

### ✅ Checkpoint
The settings screen will have TypeScript errors now. That's OK - we'll fix it in Phase 5.

---

## Step 2.6: Fix TypeScript Errors in Game Creation

### File: `app/game/new.tsx`

This file creates new games with Gin bonus values. We need to remove those.

**FIND (around line 40-60):**
```typescript
const [knockValue, setKnockValue] = useState<number | undefined>(undefined);
const ginBonus = getGinValue();
const bigGinBonus = getBigGinValue();
const undercutBonus = getUndercutValue();
```

### CHANGE TO:
```typescript
// const [knockValue, setKnockValue] = useState<number | undefined>(undefined);
// Removed Gin bonuses - Hearts uses constant values
```

**FIND (around line 120-140, in the createGame function):**
```typescript
const newGame: Game = {
  id: Date.now().toString(),
  date: new Date().toISOString(),
  scoreHistory: [],
  winner: null,
  targetScore,
  knockValue,
  ginBonus,
  bigGinBonus,
  undercutBonus,
};
```

### CHANGE TO:
```typescript
const newGame: Game = {
  id: Date.now().toString(),
  date: new Date().toISOString(),
  scoreHistory: [],
  winner: null,
  targetScore,
  // Removed: knockValue, ginBonus, bigGinBonus, undercutBonus
};
```

### ✅ Checkpoint
Save and check for TypeScript errors. There should be none related to Game type now.

---

## Step 2.7: Fix ScoreModal TypeScript Errors

### File: `src/components/ScoreModal.tsx`

This file references the old bonus types. We'll do a full rewrite in Phase 4, but for now let's fix the types.

**FIND (around line 30-40):**
```typescript
const [bonusType, setBonusType] = useState<"gin" | "bigGin" | "undercut" | null>(null);
```

### CHANGE TO:
```typescript
const [bonusType, setBonusType] = useState<"queenOfSpades" | "shootMoon" | null>(null);
```

**FIND (around line 80-100, the bonus value calculation):**
```typescript
const getBonusValue = () => {
  if (bonusType === "gin") return game.ginBonus ?? 25;
  if (bonusType === "bigGin") return game.bigGinBonus ?? 31;
  if (bonusType === "undercut") return game.undercutBonus ?? 25;
  return 0;
};
```

### CHANGE TO:
```typescript
const getBonusValue = () => {
  if (bonusType === "queenOfSpades") return 13;
  if (bonusType === "shootMoon") return 26;
  return 0;
};
```

### ✅ Checkpoint
TypeScript errors should be gone now. The UI still shows Gin buttons, but the types are correct.

---

## Step 2.8: Test Data Migration

### Important Note:
If you have existing Gin game data in the app, it will break because the data structure changed.

### Option A: Reset App Data (Recommended for Development)
In Settings screen, there should be a "Reset All Data" button. Use it.

Or manually:
```typescript
// In src/utils/mmkvStorage.ts, temporarily add:
export const clearAllData = () => {
  mmkv.clearAll();
};

// Call it once, then remove
```

### Option B: Write a Migration Function
If you want to preserve old data, you'd need to:
1. Read old games with Gin bonus fields
2. Convert to new format (remove those fields)
3. Save back

**For this tutorial, just reset the data.**

---

## Step 2.9: Verify Types Are Correct

### Run TypeScript Check:
```bash
npx tsc --noEmit
```

### Expected Errors:
You might still have errors in:
- ❌ `app/settings.tsx` - We commented out Gin bonus code
- ❌ `src/components/ScoreModal.tsx` - UI still references old bonuses
- ❌ `app/game/[id].tsx` - Displays knock value

**These are OK! We'll fix them in later phases.**

### Should NOT Have Errors in:
- ✅ `src/utils/mmkvStorage.ts` - Types should be clean
- ✅ `src/utils/gameLogic.ts` - Doesn't reference bonus fields
- ✅ `app/game/new.tsx` - Should be fixed now

---

## Phase 2 Complete! ✅

### What You've Done:
- ✅ Updated Game type to remove Gin fields
- ✅ Changed bonusType to Hearts events
- ✅ Removed Gin bonus storage functions
- ✅ Added Hearts constants
- ✅ Fixed game creation code
- ✅ Fixed ScoreModal types (UI still wrong, that's Phase 4)

### What's Next:
The data model is now Hearts-compatible, but the game logic still calculates winners wrong (highest score wins instead of lowest).

**👉 Go to `03_PHASE_3_GAME_LOGIC.md`**

---

## Troubleshooting

### "Can't find getGinValue function"
If you get errors about missing functions:
1. Find where they're imported
2. Remove those imports
3. Remove any code that calls them

### "Existing games show weird data"
Reset the app data in Settings → Reset All Data

### "TypeScript errors won't go away"
Try:
```bash
# Restart TypeScript server
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or restart your editor
```
