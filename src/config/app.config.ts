/**
 * App-level configuration.
 *
 * APP_URLS are the legal links shown in the paywall (App Store guideline 3.1.2
 * requires functional Privacy Policy + Terms of Use links next to an
 * auto-renewable subscription).
 */

export const APP_URLS = {
  // Hearts Score Tracker privacy policy.
  privacyPolicy:
    "https://www.freeprivacypolicy.com/live/4ab3456d-8f9d-4b97-8ae2-a6811aecd065",
  // Apple's standard EULA — fine to reuse unless you ship a custom Terms page.
  termsOfUse: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  // App Store "write a review" deep link, used as a fallback when the native
  // StoreReview prompt is unavailable. The numeric id is the App Store app id
  // (ascAppId in eas.json).
  writeReview: "itms-apps://apps.apple.com/app/id6755978632?action=write-review",
} as const;

/**
 * Canonical subscription display values. SINGLE SOURCE OF TRUTH for price/title.
 * BuyButton prefers the store's localizedPrice and falls back to `price` here;
 * the paywall disclosure always uses these so on-screen copy can never drift.
 */
export const SUBSCRIPTION = {
  title: "Premium",
  period: "year",
  price: "$4.99",
  priceWithPeriod: "$4.99/year",
} as const;
