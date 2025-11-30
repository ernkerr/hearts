# Start Here: Gin → Hearts Conversion

## Quick Overview
This is a React Native (Expo) app. You're converting it from a Gin Rummy score tracker to a Hearts score tracker. Follow these numbered guides in order.

## Before You Start

### Decision Point: 2-Player or 4-Player Hearts?

**RECOMMENDED: Start with 2-Player** (easier, faster)
- Keep the existing 1v1 architecture
- Adapt Hearts scoring rules for 2 players
- You can upgrade to 4-player later

**Advanced: 4-Player Hearts** (authentic but complex)
- Major architecture changes needed
- Requires restructuring data models and UI
- 3x more work

**👉 This guide assumes 2-player Hearts. We'll note where 4-player differs.**

## Initial Setup Steps

### Step 1: Create Your New Project
```bash
# Option A: Copy the entire directory
cp -r gin-score-tracker hearts-score-tracker
cd hearts-score-tracker

# Option B: Create a new git branch
cd gin-score-tracker
git checkout -b hearts-conversion
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Test That It Runs
```bash
npx expo start
```
Make sure the Gin app works before you start changing things.

### Step 4: Read the Codebase Overview
This app has a simple structure:
- **Data**: Stored locally in MMKV (key-value store, not SQL)
- **Navigation**: File-based routing (Expo Router)
- **Players**: Always 1v1 (you vs opponent)
- **Games**: Each opponent can have multiple games
- **Rounds**: Each game has multiple scoring rounds

## Key Files You'll Modify

### Core Logic (Start Here)
1. ✅ `src/utils/mmkvStorage.ts` - Data types and storage
2. ✅ `src/utils/gameLogic.ts` - Winner calculation and scoring rules

### UI Components
3. ✅ `src/components/ScoreModal.tsx` - Where you enter round scores
4. ❌ `src/components/KnockModal.tsx` - DELETE (Gin-specific)

### Screens
5. ✅ `app/game/[id].tsx` - Main game screen
6. ✅ `app/game/new.tsx` - Create new game
7. ✅ `app/settings.tsx` - App settings
8. ✅ `app.json` - App configuration

### Assets
9. ✅ `assets/icon.png` - App icon
10. ✅ `assets/splash-icon.png` - Splash screen

## Hearts Scoring Quick Reference

You'll need to know this for the conversion:

### Basic Rules
- **Goal**: Have the LOWEST score (opposite of Gin!)
- **Game ends**: When someone reaches 100 points (they LOSE)
- **Winner**: Player with lowest score when game ends

### Points Per Round
- Each Heart card = 1 point (13 hearts total)
- Queen of Spades = 13 points
- **Total per round = 26 points** (13 + 13)

### Special: Shooting the Moon
- If you take ALL 26 points (all hearts + queen):
  - You score 0
  - Opponent scores +26
- This is a risky strategy to catch up

## Conversion Strategy

### Phase 1: Setup & Branding (30 minutes)
- Change app name and IDs
- Replace icon/splash
- Update colors

### Phase 2: Data Model (1 hour)
- Remove Gin-specific fields (knockValue, ginBonus, etc.)
- Update bonus types (gin/bigGin/undercut → queenOfSpades/shootMoon)
- Update default values

### Phase 3: Game Logic (1 hour)
- **CRITICAL**: Invert winner logic (lowest wins, not highest)
- Update score calculations
- Remove bonus calculations

### Phase 4: UI Components (2 hours)
- Update ScoreModal (remove Gin bonuses, add Hearts events)
- Delete KnockModal
- Update icons (Martini → Heart, etc.)

### Phase 5: Screens (2 hours)
- Fix crown display (show on LOWER score)
- Fix confetti trigger (celebrate LOW score)
- Remove Gin bonus inputs from settings/new game

### Phase 6: Polish (1 hour)
- Search/replace "Gin" → "Hearts"
- Test all scenarios
- Update paywall product ID

## Next Steps

1. ✅ Read this file (you're here!)
2. 📖 Open `01_PHASE_1_SETUP.md`
3. 🛠️ Start making changes

## Testing Checkpoints

After each phase, test these scenarios:
- ✅ Create new opponent
- ✅ Start new game
- ✅ Add a round score
- ✅ Complete a game (someone reaches 100)
- ✅ Verify winner is LOWEST score

## Need Help?

### Common Issues
- **App won't start**: Run `npx expo start --clear`
- **TypeScript errors**: Fix data types in `mmkvStorage.ts` first
- **Scores backwards**: Check `calculateWinner()` in `gameLogic.ts`

### File Structure
```
gin-score-tracker/
├── app/                    # Screens (Expo Router)
│   ├── game/              # Game-related screens
│   ├── opponent/          # Opponent management
│   └── settings.tsx       # Settings screen
├── src/
│   ├── components/        # Reusable components
│   └── utils/            # Core logic & storage
├── assets/               # Images, icons
└── app.json             # App configuration
```

## Ready?

**👉 Go to `01_PHASE_1_SETUP.md` to begin!**
