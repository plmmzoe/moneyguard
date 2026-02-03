/**
 * Service worker for MoneyGuard extension.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('MoneyGuard Extension Installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'OPEN_ANALYSIS') {
    const { item, price } = message.data;
    const baseUrl = 'http://localhost:3000/analyze';
    const queryParams = new URLSearchParams({
      item: item || '',
      price: price || '',
      auto: 'true' // Flag to possibly auto-trigger or just signal source
    });

    const url = `${baseUrl}?${queryParams.toString()}`;

    // Open in a new popup window
    chrome.windows.create({
      url: url,
      type: 'popup',
      width: 500,
      height: 800
    });
  }
});
