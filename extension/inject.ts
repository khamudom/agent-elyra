// Agent injection utilities for Chrome Extension
// Note: With React Three Fiber, the 3D scene is managed by React components
// This file is kept for compatibility but the actual 3D rendering is handled
// by the React components in the extension UI.

export function startAgent(canvasId: string): void {
  // With React Three Fiber, the agent is started automatically when the component mounts
  console.log(
    `Agent canvas ${canvasId} is ready for React Three Fiber rendering`
  );
}

export function cleanupAgent(): void {
  // With React Three Fiber, cleanup is handled automatically by React
  console.log("Agent cleanup handled by React Three Fiber");
}

// Auto-cleanup when page unloads
window.addEventListener("beforeunload", () => {
  cleanupAgent();
});
