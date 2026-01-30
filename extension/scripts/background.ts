/**
 * Service worker for MoneyGuard extension.
 * Kept minimal; auth state is managed in popup via chrome.storage.local.
 */

chrome.runtime.onInstalled.addListener(() => {
  // Optional: set default options or open options page
});
