/**
 * In-app purchase helpers for the auto-renewable subscription.
 *
 * Migration note (one-time purchase -> $4.99/year subscription):
 * - Hearts originally shipped a ONE-TIME non-consumable unlock
 *   (`hearts_premium_ios` / `hearts_premium_android`). Those buyers must KEEP
 *   lifetime access. They are honored via `LEGACY_PRODUCT_IDS`.
 * - New buyers purchase the auto-renewable subscription `hearts_premium_yearly`.
 *
 * Entitlement model:
 * - A user is entitled if the store reports an ACTIVE subscription for
 *   `hearts_premium_yearly` OR ownership of any `LEGACY_PRODUCT_IDS`
 *   (the old one-time purchase) OR a redeemed promo unlock.
 * - Store entitlement is re-derived on launch and on games-list focus via
 *   `getAvailablePurchases()`. With StoreKit 2 (enabled in app.json) this returns
 *   only currently-active entitlements, so a lapsed subscriber loses access —
 *   while a legacy non-consumable stays owned forever.
 * - The promo unlock is a separate permanent grant so it is never revoked by a
 *   refresh.
 */

import { Platform } from "react-native";
import {
  initConnection,
  getAvailablePurchases,
  type Purchase,
} from "react-native-iap";
import { setHasPaid, getHasPaid, getPromoUnlocked } from "./mmkvStorage";

export const IAP_CONFIG = {
  // Auto-renewable subscription product IDs (must match App Store Connect /
  // Google Play Console). $4.99 / year. Same id used on both platforms.
  products: {
    ios: "hearts_premium_yearly",
    android: "hearts_premium_yearly",
  },
  // Old one-time (non-consumable) product IDs to keep honoring forever, so
  // existing one-time buyers never lose access after the subscription migration.
  legacyProductIds: [
    "hearts_premium_ios",
    "hearts_premium_android",
  ] as readonly string[],
} as const;

export const SUBSCRIPTION_SKU = (Platform.select({
  ios: IAP_CONFIG.products.ios,
  android: IAP_CONFIG.products.android,
}) ?? IAP_CONFIG.products.ios) as string;

export const LEGACY_PRODUCT_IDS: readonly string[] = IAP_CONFIG.legacyProductIds;

// Any of these product ids in getAvailablePurchases() means the user is entitled.
const ENTITLED_IDS = new Set<string>([SUBSCRIPTION_SKU, ...LEGACY_PRODUCT_IDS]);

let connected = false;

/** Establish the store connection once (idempotent). */
export async function ensureIapConnection(): Promise<boolean> {
  if (connected) return true;
  try {
    await initConnection();
    connected = true;
  } catch (e) {
    console.warn("IAP initConnection failed", e);
  }
  return connected;
}

/**
 * Does the store report an active subscription OR a legacy one-time purchase?
 *
 * Returns null when the store could not be reached (e.g. offline) — callers
 * must treat that as "unknown", NOT as "not entitled", so a paying user is
 * never locked out by a failed network call.
 */
export async function isEntitledFromStore(): Promise<boolean | null> {
  try {
    if (!(await ensureIapConnection())) return null;
    const purchases: Purchase[] = await getAvailablePurchases();
    return purchases.some((p) => ENTITLED_IDS.has(p.productId));
  } catch (e) {
    console.warn("getAvailablePurchases failed", e);
    return null;
  }
}

/**
 * Re-derive entitlement from the store + permanent promo grant, persist it, and
 * return it. Safe to call on launch and when the games screen regains focus.
 *
 * Honors existing one-time buyers (legacy product ownership) and promo unlocks,
 * while letting lapsed subscriptions drop access.
 */
export async function refreshEntitlement(): Promise<boolean> {
  const store = await isEntitledFromStore();
  if (store === null) {
    // Store unreachable (offline, App Store hiccup): keep the cached
    // entitlement. Never revoke access on a failed check — only on a
    // successful check that reports no active purchases.
    return getHasPaid() || getPromoUnlocked();
  }
  const entitled = store || getPromoUnlocked();
  setHasPaid(entitled);
  return entitled;
}
