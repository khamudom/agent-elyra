// Content script for Agentic Assistant extension

// This script runs on every webpage
// It can inject the agent into web pages if needed

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  // Handle any content script processing here
  sendResponse({ status: 'received' });
}); 