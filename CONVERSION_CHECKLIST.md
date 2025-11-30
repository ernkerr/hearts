# Hearts Conversion Checklist

Quick reference checklist for converting Gin Score Tracker to Hearts.

## Pre-Conversion
- [ ] Copy project or create new branch
- [ ] Run `npm install` and verify app works
- [ ] Decide: 2-player or 4-player Hearts
- [ ] Have Hearts-themed app icon ready

---

## Phase 1: Setup & Branding (30 min)

### app.json
- [ ] Change `name` to "HeartsScoreTracker"
- [ ] Change `slug` to "HeartsScoreTracker"
- [ ] Change display name to "Hearts Score Tracker"
- [ ] Update iOS `bundleIdentifier`
- [ ] Update Android `package` name

### Assets
- [ ] Replace `assets/icon.png`
- [ ] Replace `assets/adaptive-icon.png`
- [ ] Replace `assets/splash-icon.png`

### PaywallModal.tsx
- [ ] Change product ID to "hearts_premium_ios"

### Test
- [ ] App starts successfully
- [ ] App name shows "Hearts Score Tracker"

---

## Phase 2: Data Model (1 hour)

### src/utils/mmkvStorage.ts
- [ ] Update `Game` type: change `bonusType` to `"queenOfSpades" | "shootMoon"`
- [ ] Remove `knockValue`, `ginBonus`, `bigGinBonus`, `undercutBonus` from `Game` type
- [ ] Delete `getGinValue()` and `setGinValue()` functions
- [ ] Delete `getBigGinValue()` and `setBigGinValue()` functions
- [ ] Delete `getUndercutValue()` and `setUndercutValue()` functions
- [ ] Add Hearts constants (optional)

### app/game/new.tsx
- [ ] Remove knockValue state
- [ ] Remove ginBonus, bigGinBonus, undercutBonus from game creation
- [ ] Remove from newGame object

### src/components/ScoreModal.tsx
- [ ] Change bonusType type to `"queenOfSpades" | "shootMoon"`
- [ ] Update getBonusValue() function

### Test
- [ ] Run `npx tsc --noEmit` (should have minimal errors)
- [ ] Reset app data in Settings

---

## Phase 3: Game Logic (30 min)

### src/utils/gameLogic.ts
- [ ] Update `calculateWinner()`: invert logic (lowest wins)
- [ ] Check game ends when EITHER player hits target
- [ ] Winner is player with LOWER score
- [ ] Handle ties (return null if equal)
- [ ] Keep `getTotalScore()` unchanged
- [ ] Keep `canAddScore()` unchanged (or adjust limit)
- [ ] Add helper functions (optional)

### Test
- [ ] Add test code and verify winner logic
- [ ] Test: User 104, Opponent 60 → Opponent wins ✅
- [ ] Test: User 40, Opponent 104 → User wins ✅
- [ ] Test: User 20, Opponent 25 → null (game not over) ✅
- [ ] Delete test code

---

## Phase 4: UI Components (1.5 hours)

### Delete
- [ ] Delete `src/components/KnockModal.tsx` file

### app/game/[id].tsx
- [ ] Remove KnockModal import
- [ ] Remove knockModalVisible state
- [ ] Remove knock value display UI
- [ ] Remove "Set Knock" button
- [ ] Remove KnockModal component usage

### src/components/ScoreModal.tsx
- [ ] Change state: remove `selectedWinner`, `baseScore`
- [ ] Add state: `userScore`, `opponentScore`, `bonusPlayer`
- [ ] Remove winner radio buttons
- [ ] Add dual score inputs (Your Hearts, Opponent's Hearts)
- [ ] Update bonus buttons to Queen of Spades and Shoot the Moon
- [ ] Add player selection for bonuses
- [ ] Update icon imports (Heart, Spade, Moon)
- [ ] Rewrite handleSubmit function
- [ ] Update score preview display
- [ ] Update submit button validation

### Test
- [ ] Can add basic round (hearts only)
- [ ] Can add Queen of Spades
- [ ] Can shoot the moon
- [ ] Scores calculate correctly

---

## Phase 5: Screens (1.5 hours)

### app/game/[id].tsx
- [ ] Fix crown display: `userLeading = userTotal < opponentTotal`
- [ ] Update round history icons (Spade, Moon)
- [ ] Update icon imports
- [ ] Change "Total" to "Penalty Points" (optional)
- [ ] Update target score display text
- [ ] Update winner announcement

### app/settings.tsx
- [ ] Delete ginValue, bigGinValue, undercutValue state
- [ ] Delete Gin bonus sliders
- [ ] Delete save handlers
- [ ] Update target score description
- [ ] Add Hearts rules reference (optional)

### app/game/new.tsx
- [ ] Remove knockValue, ginBonus variables
- [ ] Delete bonus display UI
- [ ] Update form description
- [ ] Add quick start buttons (optional)
- [ ] Verify newGame object has no Gin fields

### Test
- [ ] Crown shows on LOWER score ✅
- [ ] Confetti triggers for winner ✅
- [ ] Settings has no Gin bonuses ✅
- [ ] New game works ✅

---

## Phase 6: Polish (1 hour)

### Global Search/Replace
- [ ] Search for "Gin" and replace with "Hearts"
- [ ] Update comments
- [ ] Update user-facing strings

### README.md
- [ ] Update title and description
- [ ] Add Hearts rules explanation

### package.json
- [ ] Change name to "hearts-score-tracker"
- [ ] Reset version to "1.0.0"
- [ ] Update description

### Code Cleanup
- [ ] Remove console.log statements
- [ ] Remove test code
- [ ] Run `npx prettier --write` (optional)
- [ ] Run `npx tsc --noEmit` → 0 errors ✅

### Comprehensive Testing
- [ ] Create opponent ✅
- [ ] Start new game ✅
- [ ] Add basic round ✅
- [ ] Add Queen of Spades ✅
- [ ] Shoot the moon ✅
- [ ] Complete game (someone reaches 100) ✅
- [ ] Verify lowest score wins ✅
- [ ] Test settings ✅
- [ ] Test paywall ✅
- [ ] Test edge cases (ties, both hit 100, etc.) ✅

### Final Checks
- [ ] No TypeScript errors
- [ ] No runtime errors
- [ ] All "Gin" references removed from UI
- [ ] App icon is Hearts-themed
- [ ] App name is "Hearts Score Tracker"
- [ ] Bundle IDs updated

---

## Pre-Release (when ready)

### App Store Setup
- [ ] Create new App Store Connect entry
- [ ] Update app name and description
- [ ] Add Hearts-themed screenshots
- [ ] Create new IAP product: "hearts_premium_ios"
- [ ] Update keywords

### Build
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Run production build
- [ ] Submit for review

---

## Done! 🎉

Your Hearts Score Tracker is ready!

---

## Quick Time Estimates

- Phase 1 (Setup): 30 min
- Phase 2 (Data): 1 hour
- Phase 3 (Logic): 30 min
- Phase 4 (Components): 1.5 hours
- Phase 5 (Screens): 1.5 hours
- Phase 6 (Polish): 1 hour

**Total: ~6 hours** for a complete conversion
