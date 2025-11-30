# Phase 6: Polish & Testing

**Goal**: Final cleanup, search/replace, testing, and preparation for release.

**Time**: 1-2 hours

---

## Step 6.1: Global Search and Replace

### Terminal Commands:

```bash
# Search for all "Gin" references (excluding node_modules)
grep -r "Gin" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" .
```

### Manual Replacements:

Go through each result and replace as appropriate:

#### Comments
```typescript
// FIND:
// Calculate Gin bonus

// REPLACE:
// Calculate Hearts penalty
```

#### User-Facing Strings
```typescript
// FIND:
"Welcome to Gin Tracker"

// REPLACE:
"Welcome to Hearts Tracker"
```

#### Variable Names (careful!)
```typescript
// FIND:
ginScoreTracker

// REPLACE:
heartsScoreTracker
```

---

## Step 6.2: Update README (if exists)

### File: `README.md`

**FIND and update:**
```markdown
# Gin Score Tracker

A React Native app for tracking Gin Rummy scores.
```

**CHANGE TO:**
```markdown
# Hearts Score Tracker

A React Native app for tracking Hearts card game scores.

## About Hearts

Hearts is a trick-taking card game where the goal is to have the LOWEST score. Each heart is worth 1 point, and the Queen of Spades is worth 13 points. The game ends when a player reaches 100 points, and the player with the lowest score wins.

## Features

- Track multiple opponents
- Record games with custom target scores
- Special scoring for Queen of Spades and Shooting the Moon
- Clean, intuitive interface
- Free version with premium upgrade available

## Rules

- Each heart card = 1 penalty point
- Queen of Spades = 13 penalty points
- Shooting the Moon: If you take all 26 points, you score 0 and opponent gets +26
- First to reach target score (default 100) triggers game end
- Lowest score wins!
```

---

## Step 6.3: Update Package.json

### File: `package.json`

**FIND (around line 2-5):**
```json
{
  "name": "gin-score-tracker",
  "version": "1.0.2",
  "description": "Gin Rummy score tracker"
}
```

**CHANGE TO:**
```json
{
  "name": "hearts-score-tracker",
  "version": "1.0.0",
  "description": "Hearts card game score tracker"
}
```

---

## Step 6.4: Comprehensive Testing Checklist

### Test Scenario 1: Create Opponent
- ✅ Open app
- ✅ Tap "Add Opponent"
- ✅ Enter name "Alice"
- ✅ Select a color
- ✅ Save
- ✅ Verify Alice appears in opponent list

---

### Test Scenario 2: Start New Game
- ✅ Tap on Alice
- ✅ Tap "New Game"
- ✅ See default target score of 100
- ✅ Optionally change to 50
- ✅ Tap "Start Game"
- ✅ Verify game screen opens
- ✅ Both players show 0 points

---

### Test Scenario 3: Add Basic Round
- ✅ Tap "Add Score"
- ✅ Enter "5" for Your Hearts
- ✅ Enter "8" for opponent's hearts
- ✅ Don't select any special events
- ✅ Tap "Add Round"
- ✅ Verify scores: You 5, Alice 8
- ✅ Verify crown appears on YOUR score (lower = winning)

---

### Test Scenario 4: Add Queen of Spades
- ✅ Tap "Add Score"
- ✅ Enter "3" for your hearts
- ✅ Enter "10" for opponent's hearts
- ✅ Tap "Queen of Spades" button
- ✅ Select "Opponent" (Alice took it)
- ✅ Verify preview shows: You 3, Alice 10 +13
- ✅ Tap "Add Round"
- ✅ Verify scores update: You 8 total (5+3), Alice 31 total (8+10+13)
- ✅ Crown still on you (lower score)

---

### Test Scenario 5: Shoot the Moon
- ✅ Tap "Add Score"
- ✅ Enter "0" for your hearts
- ✅ Enter "0" for opponent's hearts
- ✅ Tap "Shot the Moon" button
- ✅ Select "You"
- ✅ Verify preview shows: You → 0, Alice +26
- ✅ Tap "Add Round"
- ✅ Verify scores update: You 8 total (unchanged), Alice 57 total (31+26)

---

### Test Scenario 6: Complete Game
- ✅ Continue adding rounds until someone reaches 100
- ✅ When threshold hit, verify confetti appears
- ✅ Verify winner banner shows correct player (LOWEST score)
- ✅ Verify "You Won!" if you have lower score
- ✅ Can no longer add scores (game is over)
- ✅ Go back to opponent screen
- ✅ Verify game appears in history with correct winner

---

### Test Scenario 7: Settings
- ✅ Go to Settings
- ✅ Change target score to 75
- ✅ Save
- ✅ Create new game
- ✅ Verify target score defaults to 75
- ✅ No Gin bonus sliders should appear

---

### Test Scenario 8: Paywall (Free User)
- ✅ Play a game
- ✅ Try to add score that would exceed 100 points
- ✅ Verify paywall modal appears
- ✅ Can still play games under 100 points
- ✅ (Skip IAP testing for now unless you set up App Store)

---

### Test Scenario 9: Edge Cases

#### Both players reach 100 same round:
- ✅ Add scores where both hit 100+
- ✅ Verify lower score still wins
- ✅ Confetti shows

#### Exact tie:
- ✅ Manually create scenario where both have same score at 100
- ✅ Verify game ends with no winner (or tie message)

#### Negative scores (should be prevented):
- ✅ Try to enter negative number
- ✅ Should be prevented by keyboard type or validation

---

## Step 6.5: Visual Polish

### Update Colors (Optional)

If you want a red Hearts theme instead of teal:

#### File: `app/_layout.tsx`

This is complex with Gluestack. For now, **skip** unless you're comfortable with theming.

Alternative: Keep the existing colors - they work fine for Hearts!

---

### Update Splash Screen Background

#### File: `app.json` (line ~11)

**Current:**
```json
"backgroundColor": "#FFFFFF"
```

**Optional Change (red theme):**
```json
"backgroundColor": "#DC2626"
```

Or keep white if your icon looks good.

---

## Step 6.6: Code Cleanup

### Remove Console Logs

Search for any `console.log()` statements you added during development:

```bash
grep -r "console.log" --exclude-dir=node_modules .
```

Remove or comment out any debug logs.

---

### Remove Test Code

If you added the test code in Phase 3 (`gameLogic.ts`), make sure it's deleted:

```typescript
// DELETE THIS:
if (typeof window !== "undefined") {
  // Test code...
}
```

---

### Format Code

```bash
# If you have Prettier installed:
npx prettier --write "app/**/*.{ts,tsx}" "src/**/*.{ts,tsx}"

# Or use your editor's format command
```

---

## Step 6.7: TypeScript Final Check

```bash
# Run TypeScript compiler check
npx tsc --noEmit
```

**Should have 0 errors.** Fix any remaining issues.

---

## Step 6.8: Build Test (Optional)

### Development Build:
```bash
npx expo start --clear
```

Test on:
- ✅ iOS simulator
- ✅ Android emulator
- ✅ Physical device (Expo Go)

### Production Build (if ready):
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

**Note:** You'll need to update App Store Connect with new Hearts app info before releasing.

---

## Step 6.9: Update App Store Metadata (Before Release)

When you're ready to publish:

### iOS App Store Connect:
1. Create new app (don't update existing Gin app)
2. Name: "Hearts Score Tracker"
3. Subtitle: "Track Your Hearts Card Game Scores"
4. Description:
   ```
   Hearts Score Tracker makes it easy to track scores for the classic card game Hearts.

   Features:
   • Track multiple opponents
   • Automatic winner calculation
   • Special scoring for Queen of Spades and Shooting the Moon
   • Clean, intuitive interface
   • Quick game setup

   In Hearts, the goal is to have the LOWEST score. Each heart is worth 1 point,
   and the Queen of Spades is worth 13 points. First player to reach 100 (or your
   custom target) ends the game, and the player with the lowest score wins!
   ```
5. Keywords: hearts, card game, score tracker, score keeper, hearts game, card games
6. Screenshots: Take new ones showing Hearts gameplay
7. Category: Games > Card
8. Create new IAP product: "hearts_premium_ios"

### Google Play Store:
Similar process for Android.

---

## Step 6.10: Final Checklist

Before considering it done:

### Functionality:
- ✅ Can create opponents
- ✅ Can start games
- ✅ Can add basic scores (hearts only)
- ✅ Can add Queen of Spades
- ✅ Can shoot the moon
- ✅ Game ends at target score
- ✅ LOWEST score wins
- ✅ Crown shows on leader (lower score)
- ✅ Confetti on game win
- ✅ Settings work
- ✅ Can edit/delete opponents
- ✅ Can view game history
- ✅ Paywall works

### Code Quality:
- ✅ No TypeScript errors
- ✅ No console errors in runtime
- ✅ No "Gin" references in user-facing text
- ✅ Icons updated (no Martini glass)
- ✅ App name is "Hearts Score Tracker"
- ✅ Bundle IDs updated

### Visual:
- ✅ App icon is Hearts-themed
- ✅ Splash screen works
- ✅ All screens look good
- ✅ Text is readable
- ✅ Buttons work

---

## Step 6.11: Git Commit (Optional)

If using Git:

```bash
git add .
git commit -m "Convert Gin Score Tracker to Hearts Score Tracker

- Updated data models to remove Gin bonuses
- Implemented Hearts scoring (hearts, Queen of Spades, shoot the moon)
- Inverted winner logic (lowest score wins)
- Updated all UI components for Hearts
- Removed knock value feature
- Updated app branding and metadata"
```

---

## Phase 6 Complete! ✅

### Congratulations!

You've successfully converted a Gin Rummy score tracker into a Hearts score tracker!

### What You've Accomplished:
- ✅ Changed all branding and metadata
- ✅ Updated data models
- ✅ Rewrote game logic (lowest wins)
- ✅ Rebuilt ScoreModal for Hearts scoring
- ✅ Updated all screens
- ✅ Removed Gin-specific features
- ✅ Added Hearts-specific features (Queen, Moon)
- ✅ Tested thoroughly
- ✅ Polished and cleaned up
- ✅ Ready for release!

### Next Steps:
1. **Test extensively** on real devices
2. **Get feedback** from Hearts players
3. **Consider additions:**
   - 4-player support (major feature)
   - Game statistics
   - Dark mode
   - Sound effects
   - Undo last round
   - Export game history
4. **Publish to App Store** when ready

---

## Troubleshooting

### "App crashes on launch"
- Clear cache: `npx expo start --clear`
- Delete app from device and reinstall
- Check console for errors

### "TypeScript errors won't clear"
- Restart TS server in VS Code
- Delete `node_modules` and reinstall
- Check all imports are correct

### "Scores calculate wrong"
- Re-verify `gameLogic.ts` calculateWinner function
- Check ScoreModal handleSubmit function
- Add console logs to debug

### "IAP doesn't work"
- Need to create new product in App Store Connect
- Product ID: "hearts_premium_ios"
- Test with sandbox account

---

## You're Done! 🎉

You now have a fully functional Hearts Score Tracker app built from a Gin Rummy tracker. Great work!

If you want to tackle 4-player Hearts, that's a whole new project - would require significant data model restructuring. But for 2-player Hearts, you're all set!
