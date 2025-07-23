// Background script for Agentic Assistant extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Extension was just installed
  }
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  // Handle any background processing here
  sendResponse({ status: 'received' });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Inject content script if needed
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).catch(() => {
      // Ignore errors for restricted pages
    });
  }
}); 