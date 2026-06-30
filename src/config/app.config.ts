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
} as const;
