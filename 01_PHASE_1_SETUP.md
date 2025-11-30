# Phase 1: Setup & Branding

**Goal**: Change app identity from Gin to Hearts. Update names, IDs, and visual assets.

**Time**: 30-45 minutes

## Step 1.1: Update App Configuration

### File: `app.json`

**Open the file and make these changes:**

#### Change App Name
```json
// FIND (around line 3):
"name": "GinScoreTracker",

// CHANGE TO:
"name": "HeartsScoreTracker",
```

```json
// FIND (around line 4):
"slug": "GinScoreTracker",

// CHANGE TO:
"slug": "HeartsScoreTracker",
```

#### Update Display Name
```json
// FIND (around line 16):
"name": "Gin Score Tracker",

// CHANGE TO:
"name": "Hearts Score Tracker",
```

#### Update Bundle Identifiers (iOS)
```json
// FIND (around line 33):
"bundleIdentifier": "com.ernestoMunozTorres.GinScoreTracker",

// CHANGE TO:
"bundleIdentifier": "com.ernestoMunozTorres.HeartsScoreTracker",
```

#### Update Package Name (Android)
```json
// FIND (around line 46):
"package": "com.ernestoMunozTorres.GinScoreTracker",

// CHANGE TO:
"package": "com.ernestoMunozTorres.HeartsScoreTracker",
```

#### Update Project ID (EAS)
```json
// FIND (around line 60):
"projectId": "...",  // Keep your existing projectId

// You may want to create a NEW EAS project for Hearts
// Or keep using the same one if testing
```

### ✅ Checkpoint
Save the file. Run `npx expo start --clear` to make sure it still works.

---

## Step 1.2: Update EAS Configuration

### File: `eas.json`

**No changes needed** unless you want different build settings.

Optional: You could change the app version:
```json
// FIND (around line 6):
"appVersionSource": "remote"

// Consider resetting to 1.0.0 for new app
```

---

## Step 1.3: Replace App Icon

### Files: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png`

**You need to create or download Hearts-themed icons.**

#### Option A: Use a Placeholder
For now, you can:
1. Find a free hearts icon (search "hearts card icon png")
2. Resize to 1024x1024 pixels
3. Replace `assets/icon.png`
4. Copy to `assets/adaptive-icon.png`
5. Copy to `assets/splash-icon.png`

#### Option B: Design Your Own
Use Figma, Canva, or similar:
- Icon size: 1024x1024 px
- Should be square
- Hearts theme (red heart symbol, playing cards, etc.)

#### Icon Requirements
- `icon.png`: 1024x1024, full square icon
- `adaptive-icon.png`: 1024x1024, important content in center circle
- `splash-icon.png`: Can be same as icon.png

### ✅ Checkpoint
After replacing icons, restart the dev server and check the app icon.

---

## Step 1.4: Update Splash Screen (Optional)

### File: `app.json`

The splash screen color is currently white (`#FFFFFF`). You might want to change it to match Hearts theme:

```json
// FIND (around line 11):
"backgroundColor": "#FFFFFF"

// CHANGE TO (example - red theme):
"backgroundColor": "#DC2626"

// Or keep white if your icon looks good on white
```

---

## Step 1.5: Update Color Scheme (Optional)

### File: `app/_layout.tsx`

The app uses a teal/green theme. Consider changing to red for Hearts:

**FIND (around line 50-60):**
```typescript
<GluestackUIProvider mode="light">
```

The colors are defined in the Gluestack config. For now, skip this - you can update colors later in Phase 6 (Polish).

---

## Step 1.6: Update Product ID (In-App Purchase)

### File: `src/components/PaywallModal.tsx`

**FIND (around line 50):**
```typescript
const productIds = ["gin_premium_ios"];
```

**CHANGE TO:**
```typescript
const productIds = ["hearts_premium_ios"];
```

**⚠️ IMPORTANT**: You'll need to create this new product in App Store Connect before the IAP will work. For now, this change just updates the code.

---

## Step 1.7: Global Search and Replace

### Terminal Command:
```bash
# Search for all instances of "Gin" in the codebase
grep -r "Gin" --exclude-dir=node_modules --exclude-dir=.git .
```

**DO NOT replace everything automatically!** Some instances are:
- Comments explaining Gin rules → Replace with Hearts
- User-facing strings → Replace with Hearts
- Variable names like `ginBonus` → We'll rename these in Phase 2

### Manual Replacements to Make Now:

#### File: `app/(tabs)/index.tsx`
If there's any "Welcome to Gin Tracker" text, change it to "Welcome to Hearts Tracker"

#### File: `app/settings.tsx`
Look for any title text like "Gin Settings" and change to "Hearts Settings"

---

## Step 1.8: Test Everything Still Works

### Run the App:
```bash
npx expo start --clear
```

### Test These Features:
- ✅ App launches
- ✅ Can navigate between screens
- ✅ Icons look correct
- ✅ App name shows "Hearts Score Tracker" (in title bars)

### Expected Behavior:
The app should work EXACTLY like the Gin tracker still. We haven't changed any functionality yet, just branding.

---

## Phase 1 Complete! ✅

### What You've Done:
- ✅ Changed app name and IDs
- ✅ Updated bundle identifiers
- ✅ Replaced icons (or noted to do so)
- ✅ Updated IAP product ID
- ✅ Tested that app still runs

### What's Next:
The app still plays Gin rules. Now we need to change the actual game logic.

**👉 Go to `02_PHASE_2_DATA_MODEL.md`**

---

## Troubleshooting

### "App won't start after changes"
```bash
# Clear cache and restart
npx expo start --clear

# If still broken, reinstall dependencies
rm -rf node_modules
npm install
```

### "TypeScript errors about types"
Don't worry, we'll fix these in Phase 2 when we update the data model.

### "Build fails with bundleIdentifier error"
Make sure you changed ALL instances in `app.json`:
- iOS bundleIdentifier
- Android package
- Name and slug fields
