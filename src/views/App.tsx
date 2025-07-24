import React, { useEffect, useRef, useState } from "react";
import { startAgent, cleanupAgent } from "../agent";
import ChatInterface from "../components/ChatInterface";
import VoiceSelector from "../components/VoiceSelector";

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Check if user is on desktop
    setIsDesktop(window.innerWidth > 768);

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired");
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
    };

    // Handle successful installation
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Check if PWA is already installed
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      console.log("App is running in standalone mode (already installed)");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    // Start the agent when component mounts
    if (canvasRef.current) {
      startAgent("agent-canvas");
    }

    // Cleanup when component unmounts
    return () => {
      cleanupAgent();
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      alert(
        "To install this app, look for the 'Add to Home Screen' option in your browser's menu."
      );
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDownloadExtension = () => {
    // For now, show instructions for manual installation
    alert(
      "Extension download coming soon! For now, you can build it manually:\n\n1. Run: npm run build:extension\n2. Load the extension-dist folder in Chrome\n3. Enable Developer Mode in chrome://extensions/"
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Agentic Assistant</h1>
          <p>Your intelligent 3D AI companion with voice interaction</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="welcome-section">
            <div className="card">
              <h2>Experience the Future of AI Interaction</h2>
              <p>
                Meet your personal 3D AI assistant with advanced voice
                capabilities. Interact naturally through text or voice, and
                watch your assistant respond with lifelike animations.
              </p>
              <p>
                🚀 <strong>Install Agentic Assistant!</strong> Get instant
                access to your AI assistant on any device. Available as a
                Progressive Web App (PWA) for mobile and desktop, plus a Chrome
                extension for desktop users.
              </p>

              <div className="install-options">
                {showInstallButton ? (
                  <div className="install-option">
                    <h4>📱 Mobile & Desktop PWA</h4>
                    <p>
                      Install as a native app on your device for the best
                      experience.
                    </p>
                    <button className="btn pwa-btn" onClick={handleInstallPWA}>
                      📲 Install PWA
                    </button>
                  </div>
                ) : (
                  <div className="install-option">
                    <h4>📱 Mobile & Desktop PWA</h4>
                    <p>
                      This app can be installed as a PWA. Look for the "Add to
                      Home Screen" option in your browser's menu, or the install
                      button will appear here when the app is ready to install.
                    </p>
                  </div>
                )}

                {isDesktop && (
                  <div className="install-option">
                    <h4>🔌 Chrome Extension</h4>
                    <p>Get instant access on any website while browsing.</p>
                    <button
                      className="btn extension-btn"
                      onClick={handleDownloadExtension}
                    >
                      🔌 Download Extension
                    </button>
                    <small className="extension-note">
                      Manual installation required for now
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="features-section">
            <div className="card">
              <h3>✨ Key Features</h3>
              <div className="features-grid">
                <div className="feature">
                  <h4>🎭 3D Avatar</h4>
                  <p>
                    Interactive 3D character with smooth animations and
                    realistic movements
                  </p>
                </div>
                <div className="feature">
                  <h4>🗣️ Voice Interaction</h4>
                  <p>Natural speech-to-text and text-to-speech capabilities</p>
                </div>
                <div className="feature">
                  <h4>🤖 AI Powered</h4>
                  <p>
                    Advanced AI conversations powered by OpenAI's latest models
                  </p>
                </div>
                <div className="feature">
                  <h4>📱 Cross-Platform</h4>
                  <p>Works on mobile, desktop, and as a browser extension</p>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Selection Section - Development Only */}
          {import.meta.env.DEV && (
            <div className="voice-section">
              <div className="card">
                <VoiceSelector />
              </div>
            </div>
          )}

          {/* Main Interactive Section - Avatar and Chat Side by Side */}
          <div className="main-interactive-section">
            <div className="interactive-layout">
              {/* Avatar Section - Takes up more space */}
              <div className="avatar-section">
                <div className="card avatar-card">
                  <h3>🎮 Your AI Assistant</h3>
                  <p>Interact with your 3D companion:</p>
                  <div className="avatar-container">
                    <canvas
                      ref={canvasRef}
                      id="agent-canvas"
                      className="agent-canvas"
                      width="800"
                      height="600"
                    />
                  </div>
                </div>
              </div>

              {/* Chat Section - Compact but functional */}
              <div className="chat-section">
                <div className="card chat-card">
                  <h3>💬 Chat with AI</h3>
                  <p>Start a conversation:</p>
                  <ChatInterface />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
