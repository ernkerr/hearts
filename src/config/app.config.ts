/**
 * App-level configuration.
 *
 * APP_URLS are the legal links shown in the paywall (App Store guideline 3.1.2
 * requires functional Privacy Policy + Terms of Use links next to an
 * auto-renewable subscription).
 */

export const APP_URLS = {
  // TODO: replace with the Hearts Score Tracker privacy policy URL before
  // submitting. This MUST be the policy for THIS app (do not reuse another
  // app's link) or Apple will reject the build. Generate one (e.g. at
  // freeprivacypolicy.com) and paste the live URL here.
  privacyPolicy: "https://www.freeprivacypolicy.com/live/REPLACE-WITH-HEARTS-PRIVACY-POLICY",
  // Apple's standard EULA — fine to reuse unless you ship a custom Terms page.
  termsOfUse: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
} as const;
