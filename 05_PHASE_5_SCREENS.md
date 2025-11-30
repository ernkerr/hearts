# Phase 5: Screen Updates

**Goal**: Fix game screen, settings, and new game screens to work with Hearts rules.

**Time**: 1.5 hours

---

## Part A: Game Screen Updates

### File: `app/game/[id].tsx`

This is the main screen where you play a game. We need to:
1. Fix the crown display (show on LOWER score)
2. Fix confetti trigger (celebrate when lowest score wins)
3. Update round history display
4. Remove Gin-specific text

---

## Step 5.1: Fix Crown Display (Current Leader)

### FIND (around line 156-168):
```typescript
// Crown icon shows on whoever is winning
const userLeading = userTotal > opponentTotal;
```

### CHANGE TO:
```typescript
// In Hearts, LOWER score is better (winning)
const userLeading = userTotal < opponentTotal;
```

**That's it!** Now the crown shows on the player with fewer penalty points.

### ✅ Checkpoint
The crown should now appear on the player with the LOWER score.

---

## Step 5.2: Fix Confetti Celebration

### FIND (around line 200-215, confetti trigger):
```typescript
useEffect(() => {
  if (game.winner && !hasShownConfetti.current) {
    setShowConfetti(true);
    hasShownConfetti.current = true;
    // Hide after 3 seconds
    setTimeout(() => setShowConfetti(false), 3000);
  }
}, [game.winner]);
```

### ✅ KEEP THIS UNCHANGED

The confetti triggers when `game.winner` is set, which already works correctly thanks to our Phase 3 changes (calculateWinner returns the lowest score).

---

## Step 5.3: Update Round History Display

### FIND (around line 320-360, the score history rendering):
```typescript
{round.bonusType && (
  <Box>
    {round.bonusType === "gin" && <Icon as={Martini} />}
    {round.bonusType === "bigGin" && <Icon as={GlassWater} />}
    {round.bonusType === "undercut" && <Icon as={Scissors} />}
  </Box>
)}
```

### CHANGE TO:
```typescript
{round.bonusType && (
  <Box className="ml-2">
    {round.bonusType === "queenOfSpades" && (
      <HStack space="xs" alignItems="center">
        <Icon as={Spade} size="xs" />
        <Text className="text-xs">♠Q (+13)</Text>
      </HStack>
    )}
    {round.bonusType === "shootMoon" && (
      <HStack space="xs" alignItems="center">
        <Icon as={Moon} size="xs" />
        <Text className="text-xs">🌙 Moon!</Text>
      </HStack>
    )}
  </Box>
)}
```

### Update Icon Imports (top of file):
```typescript
// FIND:
import { Crown, Martini, GlassWater, Scissors } from "lucide-react-native";

// CHANGE TO:
import { Crown, Heart, Spade, Moon } from "lucide-react-native";
```

---

## Step 5.4: Update Score Display Text

### FIND (around line 180-200, the current totals display):
```typescript
<Text className="text-4xl font-bold">{userTotal}</Text>
<Text className="text-sm text-gray-500">Total</Text>
```

### CHANGE TO (optional, adds clarity):
```typescript
<Text className="text-4xl font-bold">{userTotal}</Text>
<Text className="text-sm text-gray-500">Penalty Points</Text>
```

Same for opponent's score display.

---

## Step 5.5: Update Target Score Display

### FIND (around line 85-90):
```typescript
<Text>Target: {targetScore}</Text>
```

### CHANGE TO:
```typescript
<Text>Game Ends At: {targetScore}</Text>
```

Or:
```typescript
<Text>First to {targetScore} Loses</Text>
```

---

## Step 5.6: Update Winner Announcement

### FIND (around line 250-260):
```typescript
{game.winner && (
  <Box className="...">
    <Text className="text-2xl font-bold">
      {game.winner === "user" ? "You Won!" : `${opponentName} Won!`}
    </Text>
  </Box>
)}
```

### CHANGE TO (add explanation):
```typescript
{game.winner && (
  <Box className="bg-green-100 p-4 rounded-lg mb-4 border-2 border-green-500">
    <Text className="text-2xl font-bold text-center">
      {game.winner === "user" ? "You Won!" : `${opponentName} Won!`}
    </Text>
    <Text className="text-sm text-center text-gray-600 mt-2">
      {game.winner === "user"
        ? `Final Score: You ${userTotal}, ${opponentName} ${opponentTotal}`
        : `Final Score: ${opponentName} ${opponentTotal}, You ${userTotal}`
      }
    </Text>
    <Text className="text-xs text-center text-gray-500 mt-1">
      (Lowest score wins in Hearts)
    </Text>
  </Box>
)}
```

---

## Part B: Settings Screen Updates

### File: `app/settings.tsx`

Remove Gin bonus settings, keep target score.

---

## Step 5.7: Remove Gin Bonus Inputs

### FIND (around line 80-200, all the bonus sliders):
```typescript
{/* Gin Bonus Setting */}
<Box className="mb-6">
  <Text>Gin Bonus: {ginValue}</Text>
  <Slider ... />
</Box>

{/* Big Gin Bonus Setting */}
<Box className="mb-6">
  <Text>Big Gin Bonus: {bigGinValue}</Text>
  <Slider ... />
</Box>

{/* Undercut Bonus Setting */}
<Box className="mb-6">
  <Text>Undercut Bonus: {undercutValue}</Text>
  <Slider ... />
</Box>
```

### DELETE all three bonus sections

### DELETE the state variables (around line 40-50):
```typescript
const [ginValue, setGinValueState] = useState(getGinValue());
const [bigGinValue, setBigGinValueState] = useState(getBigGinValue());
const [undercutValue, setUndercutValueState] = useState(getUndercutValue());
```

### DELETE the save handlers:
```typescript
const handleSaveGinValue = () => { ... };
const handleSaveBigGinValue = () => { ... };
const handleSaveUndercutValue = () => { ... };
```

---

## Step 5.8: Update Target Score Description

### FIND (around line 60-80):
```typescript
<Text className="text-lg font-semibold mb-2">Game Settings</Text>
<Text className="text-sm text-gray-600 mb-4">
  Customize default game rules
</Text>

{/* Target Score Slider */}
<Box className="mb-6">
  <Text>Target Score: {targetScore}</Text>
  <Slider ... />
</Box>
```

### CHANGE TO:
```typescript
<Text className="text-lg font-semibold mb-2">Game Settings</Text>
<Text className="text-sm text-gray-600 mb-4">
  In Hearts, the game ends when someone reaches the target score. The player with the LOWEST score wins!
</Text>

{/* Target Score Slider */}
<Box className="mb-6">
  <Text className="font-semibold">Target Score: {targetScore}</Text>
  <Text className="text-xs text-gray-500 mb-2">
    First player to reach this score loses the game
  </Text>
  <Slider ... />
</Box>
```

---

## Step 5.9: Add Hearts Rules Reference (Optional)

### ADD below the target score setting:
```typescript
{/* Hearts Scoring Reference */}
<Box className="bg-blue-50 p-4 rounded-lg mb-6">
  <Text className="font-semibold mb-2">Hearts Scoring</Text>
  <Text className="text-sm mb-1">• Each Heart = 1 point</Text>
  <Text className="text-sm mb-1">• Queen of Spades = 13 points</Text>
  <Text className="text-sm mb-1">• Shooting the Moon = 0 for you, +26 for opponent</Text>
  <Text className="text-xs text-gray-600 mt-2">
    Goal: Have the lowest score when someone reaches {targetScore}
  </Text>
</Box>
```

---

## Part C: New Game Screen Updates

### File: `app/game/new.tsx`

Remove Gin bonus inputs, keep target score selector.

---

## Step 5.10: Remove Bonus Value Inputs

### FIND (around line 50-150, all the bonus value state and UI):
```typescript
const [knockValue, setKnockValue] = useState<number | undefined>(undefined);
const ginBonus = getGinValue();
const bigGinBonus = getBigGinValue();
const undercutBonus = getUndercutValue();
```

### DELETE those lines

### FIND the bonus display UI (around line 100-180):
```typescript
{/* Gin Bonus Display */}
<Box>
  <Text>Gin: {ginBonus}</Text>
  <Text>Big Gin: {bigGinBonus}</Text>
  <Text>Undercut: {undercutBonus}</Text>
</Box>
```

### DELETE that UI section

---

## Step 5.11: Update New Game Form

### FIND (around line 80-120, the form):
```typescript
<Text className="text-lg font-semibold mb-2">New Game</Text>

{/* Target Score Input */}
<Box className="mb-4">
  <Text>Target Score</Text>
  <Input>
    <InputField ... />
  </Input>
</Box>
```

### CHANGE TO:
```typescript
<Text className="text-lg font-semibold mb-4">New Game with {opponentName}</Text>

<Text className="text-sm text-gray-600 mb-4">
  Hearts is played to 100 points. First player to reach the target score LOSES. Player with lowest score wins!
</Text>

{/* Target Score Input */}
<Box className="mb-4">
  <Text className="font-semibold mb-1">Target Score</Text>
  <Text className="text-xs text-gray-500 mb-2">
    Game ends when someone reaches this score (default: 100)
  </Text>
  <Input>
    <InputField
      placeholder="100"
      keyboardType="numeric"
      value={targetScore}
      onChangeText={setTargetScore}
    />
  </Input>
</Box>

{/* Optional: Quick Start Buttons */}
<Box className="mb-4">
  <Text className="font-semibold mb-2">Quick Start</Text>
  <HStack space="md">
    <Button
      variant="outline"
      onPress={() => setTargetScore("50")}
      className="flex-1"
    >
      <ButtonText>Short Game (50)</ButtonText>
    </Button>
    <Button
      variant="outline"
      onPress={() => setTargetScore("100")}
      className="flex-1"
    >
      <ButtonText>Standard (100)</ButtonText>
    </Button>
  </HStack>
</Box>
```

---

## Step 5.12: Update Create Game Handler

### FIND (around line 120-140):
```typescript
const newGame: Game = {
  id: Date.now().toString(),
  date: new Date().toISOString(),
  scoreHistory: [],
  winner: null,
  targetScore: parseInt(targetScore) || 100,
  knockValue,
  ginBonus,
  bigGinBonus,
  undercutBonus,
};
```

### CHANGE TO (already done in Phase 2, verify):
```typescript
const newGame: Game = {
  id: Date.now().toString(),
  date: new Date().toISOString(),
  scoreHistory: [],
  winner: null,
  targetScore: parseInt(targetScore) || 100,
};
```

---

## Part D: Opponent Stats Screen (Optional Updates)

### File: `app/opponent/[id].tsx`

This screen shows overall stats. Minor updates needed.

---

## Step 5.13: Update Stats Display Text

### FIND (around line 120-140, total points display):
```typescript
<Text className="text-2xl font-bold">{totalPoints}</Text>
<Text className="text-sm text-gray-500">Total Points</Text>
```

### OPTIONAL CHANGE TO:
```typescript
<Text className="text-2xl font-bold">{totalPoints}</Text>
<Text className="text-sm text-gray-500">Total Penalty Points</Text>
```

This is optional - "Total Points" works fine, but "Penalty Points" is more accurate for Hearts.

---

## Phase 5 Complete! ✅

### What You've Done:
- ✅ Fixed crown display (shows on LOWER score)
- ✅ Updated round history icons (Queen, Moon)
- ✅ Removed all Gin bonus inputs from settings
- ✅ Removed all Gin bonus inputs from new game
- ✅ Updated target score descriptions to explain Hearts rules
- ✅ Added Hearts scoring reference
- ✅ Updated winner announcement text
- ✅ Added quick start buttons for game creation

### What's Next:
The app is now fully functional as a Hearts tracker! Final phase is polish and testing.

**👉 Go to `06_PHASE_6_POLISH.md`**

---

## Troubleshooting

### "Crown still shows on wrong player"
Double-check the comparison in game/[id].tsx:
```typescript
const userLeading = userTotal < opponentTotal; // Lower is better!
```

### "Settings page crashes"
Make sure you removed ALL references to:
- `getGinValue()`, `getBigGinValue()`, `getUndercutValue()`
- State variables for those values
- UI sliders for those values

### "Can't create new game"
Check that the Game object creation doesn't include:
- knockValue
- ginBonus
- bigGinBonus
- undercutBonus

These fields no longer exist in the type.
