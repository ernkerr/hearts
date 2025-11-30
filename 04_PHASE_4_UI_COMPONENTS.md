# Phase 4: UI Components Update

**Goal**: Update ScoreModal to show Hearts scoring options instead of Gin bonuses. Delete KnockModal.

**Time**: 1.5-2 hours

---

## Step 4.1: Delete KnockModal (Gin-Specific)

### File: `src/components/KnockModal.tsx`

### ❌ DELETE THIS ENTIRE FILE

It's only used for setting a "knock value" which is a Gin Rummy concept. Hearts doesn't need it.

```bash
rm src/components/KnockModal.tsx
```

### ✅ Checkpoint
File deleted. Now remove all references to it.

---

## Step 4.2: Remove KnockModal Imports

### File: `app/game/[id].tsx`

**FIND (around line 10-20):**
```typescript
import KnockModal from "@/src/components/KnockModal";
```

### DELETE that import line

**FIND (around line 50-60):**
```typescript
const [knockModalVisible, setKnockModalVisible] = useState(false);
```

### DELETE that state line

**FIND (around line 89-95, the knock value display):**
```typescript
{game.knockValue !== undefined && (
  <Box className="...">
    <Text>Knock Value: {game.knockValue}</Text>
  </Box>
)}
```

### DELETE that entire JSX block

**FIND (around line 180-190, the "Set Knock" button):**
```typescript
<Button
  onPress={() => setKnockModalVisible(true)}
  ...
>
  <ButtonText>Set Knock</ButtonText>
</Button>
```

### DELETE that entire Button

**FIND (around line 250-260, the KnockModal component):**
```typescript
<KnockModal
  visible={knockModalVisible}
  onClose={() => setKnockModalVisible(false)}
  game={game}
  opponentId={opponentId}
/>
```

### DELETE that entire component usage

### ✅ Checkpoint
Save the file. No more knock modal references!

---

## Step 4.3: Update ScoreModal - Remove Winner Selection

### File: `src/components/ScoreModal.tsx`

**Current flow for Gin:**
1. Select winner (user or opponent)
2. Enter base score
3. Select bonus type
4. Total = base + bonus
5. Only the winner gets points

**New flow for Hearts:**
1. Each player gets their own penalty points
2. Select who took Queen of Spades (optional)
3. Select if someone shot the moon (optional)
4. Both players get points each round

This is a BIG change. Let's rewrite the modal.

---

## Step 4.4: Rewrite ScoreModal State

### FIND (around line 30-45):
```typescript
const [selectedWinner, setSelectedWinner] = useState<"user" | "opponent" | null>(null);
const [baseScore, setBaseScore] = useState("");
const [bonusType, setBonusType] = useState<"queenOfSpades" | "shootMoon" | null>(null);
```

### CHANGE TO:
```typescript
const [userScore, setUserScore] = useState("");
const [opponentScore, setOpponentScore] = useState("");
const [bonusType, setBonusType] = useState<"queenOfSpades" | "shootMoon" | null>(null);
const [bonusPlayer, setBonusPlayer] = useState<"user" | "opponent" | null>(null); // Who gets the bonus/penalty
```

---

## Step 4.5: Rewrite Score Calculation Logic

### FIND (around line 80-100, the old getBonusValue function):
```typescript
const getBonusValue = () => {
  if (bonusType === "queenOfSpades") return 13;
  if (bonusType === "shootMoon") return 26;
  return 0;
};

const totalScore = baseScore ? parseInt(baseScore) + getBonusValue() : 0;
```

### CHANGE TO:
```typescript
const handleSubmit = () => {
  let finalUserScore = parseInt(userScore) || 0;
  let finalOpponentScore = parseInt(opponentScore) || 0;

  // Handle Queen of Spades (adds 13 to the player who took it)
  if (bonusType === "queenOfSpades" && bonusPlayer) {
    if (bonusPlayer === "user") {
      finalUserScore += 13;
    } else {
      finalOpponentScore += 13;
    }
  }

  // Handle Shooting the Moon (player who shot gets 0, opponent gets +26)
  if (bonusType === "shootMoon" && bonusPlayer) {
    if (bonusPlayer === "user") {
      // User shot the moon: user gets 0, opponent gets +26
      finalUserScore = 0;
      finalOpponentScore += 26;
    } else {
      // Opponent shot the moon: opponent gets 0, user gets +26
      finalOpponentScore = 0;
      finalUserScore += 26;
    }
  }

  // Validate scores
  if (finalUserScore < 0 || finalOpponentScore < 0) {
    Alert.alert("Invalid Score", "Scores cannot be negative");
    return;
  }

  // Check paywall
  const userTotal = getTotalScore(game.scoreHistory, "user") + finalUserScore;
  const opponentTotal = getTotalScore(game.scoreHistory, "opponent") + finalOpponentScore;

  if (!hasPaid && (userTotal > 100 || opponentTotal > 100)) {
    onPaywallBlock();
    return;
  }

  // Add score
  addScore(finalUserScore, finalOpponentScore, bonusType);
  resetAndClose();
};

const resetAndClose = () => {
  setUserScore("");
  setOpponentScore("");
  setBonusType(null);
  setBonusPlayer(null);
  onClose();
};
```

---

## Step 4.6: Update the Modal UI - Remove Winner Selection

### FIND (around line 120-160, the winner radio buttons):
```typescript
<RadioGroup value={selectedWinner} onChange={setSelectedWinner}>
  <Radio value="user">
    <RadioIndicator>...</RadioIndicator>
    <RadioLabel>You</RadioLabel>
  </Radio>
  <Radio value="opponent">
    <RadioIndicator>...</RadioIndicator>
    <RadioLabel>{opponentName}</RadioLabel>
  </Radio>
</RadioGroup>
```

### DELETE the entire RadioGroup

Instead, we'll have inputs for both players.

---

## Step 4.7: Add Dual Score Inputs

### REPLACE the winner selection section with:
```typescript
{/* User Score Input */}
<Box className="mb-4">
  <Text className="mb-2 font-semibold">Your Hearts:</Text>
  <Input>
    <InputField
      placeholder="0-13"
      keyboardType="numeric"
      value={userScore}
      onChangeText={setUserScore}
    />
  </Input>
  <Text className="text-xs text-gray-500 mt-1">
    Number of heart cards you took (0-13)
  </Text>
</Box>

{/* Opponent Score Input */}
<Box className="mb-4">
  <Text className="mb-2 font-semibold">{opponentName}'s Hearts:</Text>
  <Input>
    <InputField
      placeholder="0-13"
      keyboardType="numeric"
      value={opponentScore}
      onChangeText={setOpponentScore}
    />
  </Input>
  <Text className="text-xs text-gray-500 mt-1">
    Number of heart cards {opponentName} took (0-13)
  </Text>
</Box>
```

---

## Step 4.8: Update Bonus Buttons

### FIND (around line 180-220, the bonus button section):
```typescript
<HStack space="md" className="mb-4">
  <Button
    variant={bonusType === "gin" ? "solid" : "outline"}
    onPress={() => setBonusType(bonusType === "gin" ? null : "gin")}
  >
    <Icon as={Martini} />
    <ButtonText>Gin ({game.ginBonus ?? 25})</ButtonText>
  </Button>

  {/* More buttons... */}
</HStack>
```

### CHANGE TO:
```typescript
{/* Queen of Spades Section */}
<Box className="mb-4">
  <Text className="mb-2 font-semibold">Special Events:</Text>

  <Button
    variant={bonusType === "queenOfSpades" ? "solid" : "outline"}
    onPress={() => {
      if (bonusType === "queenOfSpades") {
        setBonusType(null);
        setBonusPlayer(null);
      } else {
        setBonusType("queenOfSpades");
      }
    }}
    className="mb-2"
  >
    <Icon as={Spade} size="sm" className="mr-2" />
    <ButtonText>Queen of Spades (+13)</ButtonText>
  </Button>

  {bonusType === "queenOfSpades" && (
    <HStack space="md" className="mt-2">
      <Button
        size="sm"
        variant={bonusPlayer === "user" ? "solid" : "outline"}
        onPress={() => setBonusPlayer("user")}
        className="flex-1"
      >
        <ButtonText>You</ButtonText>
      </Button>
      <Button
        size="sm"
        variant={bonusPlayer === "opponent" ? "solid" : "outline"}
        onPress={() => setBonusPlayer("opponent")}
        className="flex-1"
      >
        <ButtonText>{opponentName}</ButtonText>
      </Button>
    </HStack>
  )}
</Box>

{/* Shoot the Moon Section */}
<Box className="mb-4">
  <Button
    variant={bonusType === "shootMoon" ? "solid" : "outline"}
    onPress={() => {
      if (bonusType === "shootMoon") {
        setBonusType(null);
        setBonusPlayer(null);
      } else {
        setBonusType("shootMoon");
      }
    }}
    className="mb-2"
  >
    <Icon as={Moon} size="sm" className="mr-2" />
    <ButtonText>Shot the Moon!</ButtonText>
  </Button>

  {bonusType === "shootMoon" && (
    <HStack space="md" className="mt-2">
      <Button
        size="sm"
        variant={bonusPlayer === "user" ? "solid" : "outline"}
        onPress={() => setBonusPlayer("user")}
        className="flex-1"
      >
        <ButtonText>You</ButtonText>
      </Button>
      <Button
        size="sm"
        variant={bonusPlayer === "opponent" ? "solid" : "outline"}
        onPress={() => setBonusPlayer("opponent")}
        className="flex-1"
      >
        <ButtonText>{opponentName}</ButtonText>
      </Button>
    </HStack>
  )}

  <Text className="text-xs text-gray-500 mt-2">
    Took all hearts + Queen of Spades? You get 0, opponent gets +26!
  </Text>
</Box>
```

---

## Step 4.9: Update Icon Imports

### FIND (around line 1-15, import section):
```typescript
import { Martini, GlassWater, Scissors } from "lucide-react-native";
```

### CHANGE TO:
```typescript
import { Heart, Spade, Moon } from "lucide-react-native";
```

Or if these icons don't exist in lucide:
```typescript
// Use alternatives:
import { Heart, Diamond, Moon } from "lucide-react-native";
// Or create custom text icons
```

---

## Step 4.10: Update the Add Score Function Call

### FIND (around line 60-70, the addScore function):
```typescript
const addScore = (score: number, bonusType: "queenOfSpades" | "shootMoon" | null) => {
  const newScoreEntry = {
    [selectedWinner!]: score,
    [selectedWinner === "user" ? "opponent" : "user"]: 0,
    date: new Date().toISOString(),
    bonusType,
  };
  // ...update game
};
```

### CHANGE TO:
```typescript
const addScore = (
  userScoreValue: number,
  opponentScoreValue: number,
  bonusTypeValue: "queenOfSpades" | "shootMoon" | null
) => {
  const newScoreEntry = {
    user: userScoreValue,
    opponent: opponentScoreValue,
    date: new Date().toISOString(),
    bonusType: bonusTypeValue,
  };

  const updatedGame = {
    ...game,
    scoreHistory: [...game.scoreHistory, newScoreEntry],
  };

  updateOpponentGame(opponentId, updatedGame);
};
```

---

## Step 4.11: Update Score Preview Display

### FIND (around line 240-260, the score preview):
```typescript
<Text className="text-2xl font-bold">
  Total: {totalScore}
</Text>
```

### CHANGE TO:
```typescript
<Box className="bg-gray-100 p-4 rounded-lg mb-4">
  <Text className="font-semibold mb-2">Round Preview:</Text>
  <HStack space="lg" justifyContent="space-between">
    <Box>
      <Text className="text-sm text-gray-600">You</Text>
      <Text className="text-xl font-bold">
        {parseInt(userScore) || 0}
        {bonusType === "queenOfSpades" && bonusPlayer === "user" ? " +13" : ""}
        {bonusType === "shootMoon" && bonusPlayer === "user" ? " → 0" : ""}
      </Text>
    </Box>
    <Box>
      <Text className="text-sm text-gray-600">{opponentName}</Text>
      <Text className="text-xl font-bold">
        {parseInt(opponentScore) || 0}
        {bonusType === "queenOfSpades" && bonusPlayer === "opponent" ? " +13" : ""}
        {bonusType === "shootMoon" && bonusPlayer === "opponent" ? " → 0" : ""}
      </Text>
    </Box>
  </HStack>
</Box>
```

---

## Step 4.12: Fix Submit Button Validation

### FIND (around line 280-290):
```typescript
<Button
  onPress={handleSubmit}
  disabled={!selectedWinner || !baseScore}
  ...
>
  <ButtonText>Add Score</ButtonText>
</Button>
```

### CHANGE TO:
```typescript
<Button
  onPress={handleSubmit}
  disabled={
    (!userScore && !opponentScore) ||
    (bonusType && !bonusPlayer)
  }
  ...
>
  <ButtonText>Add Round</ButtonText>
</Button>
```

**Validation logic:**
- At least one player must have a score
- If a bonus is selected, must select who got it

---

## Phase 4 Complete! ✅

### What You've Done:
- ✅ Deleted KnockModal component
- ✅ Removed all knock modal references
- ✅ Rewrote ScoreModal for Hearts scoring
- ✅ Added dual score inputs (both players score each round)
- ✅ Added Queen of Spades button (+13 penalty)
- ✅ Added Shoot the Moon button (special scoring)
- ✅ Updated icons (Heart, Spade, Moon)
- ✅ Added score preview display
- ✅ Fixed validation logic

### What's Next:
The scoring UI is now Hearts-compatible! But screens still show the wrong player winning (crown on highest score). Time to fix the game screen.

**👉 Go to `05_PHASE_5_SCREENS.md`**

---

## Troubleshooting

### "Can't find Heart/Spade/Moon icons"
Check lucide-react-native documentation. Alternative icons:
- Heart → Already exists
- Spade → Use "Diamond" or create text icon "♠"
- Moon → Use "Circle" or "Sun" or create text icon "🌙"

Or use text instead of icons:
```typescript
<ButtonText>♠ Queen of Spades (+13)</ButtonText>
<ButtonText>🌙 Shot the Moon!</ButtonText>
```

### "Shoot the Moon scoring is confusing"
The logic is:
- If you shoot: Your score = 0, opponent gets +26
- If opponent shoots: Opponent score = 0, you get +26

This is because shooting the moon means you took ALL 26 points, so you get 0 and everyone else gets penalized.

### "Scores don't add up right"
Check the `handleSubmit` function - make sure:
1. Base scores (hearts) are parsed correctly
2. Queen of Spades adds to the right player
3. Moon shot zeros out shooter and adds 26 to other
