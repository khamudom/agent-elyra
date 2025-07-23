// Agent injection utilities for Chrome Extension

export function startAgent(canvasId: string): void {
  // Import and start the agent in the injected context
  import('../src/agent').then(({ startAgent }) => {
    startAgent(canvasId);
  });
}

export function cleanupAgent(): void {
  // Import and cleanup the agent
  import('../src/agent').then(({ cleanupAgent }) => {
    cleanupAgent();
  });
}

// Auto-cleanup when page unloads
window.addEventListener('beforeunload', () => {
  cleanupAgent();
}); 