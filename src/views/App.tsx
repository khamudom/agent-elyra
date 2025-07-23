import React, { useEffect, useRef, useState } from 'react';
import { startAgent, cleanupAgent } from '../agent';
import ChatInterface from '../components/ChatInterface';

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if user is on desktop
    setIsDesktop(window.innerWidth > 768);
  }, []);

  useEffect(() => {
    // Start the agent when component mounts
    if (canvasRef.current) {
      startAgent('agent-canvas');
    }

    // Cleanup when component unmounts
    return () => {
      cleanupAgent();
    };
  }, []);

  const handleInstallPWA = () => {
    // PWA installation is handled by the browser's install prompt
    // This will trigger the browser's native PWA install dialog
    console.log('PWA install requested');
  };

  const handleDownloadExtension = () => {
    // For now, show instructions for manual installation
    alert('Extension download coming soon! For now, you can build it manually:\n\n1. Run: npm run build:extension\n2. Load the extension-dist folder in Chrome\n3. Enable Developer Mode in chrome://extensions/');
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
                Meet your personal 3D AI assistant with advanced voice capabilities. 
                Interact naturally through text or voice, and watch your assistant respond with lifelike animations.
              </p>
              <p>
                🚀 <strong>Install Agentic Assistant!</strong> Get instant access to your AI assistant on any device. 
                Available as a Progressive Web App (PWA) for mobile and desktop, plus a Chrome extension for desktop users.
              </p>
              
              <div className="install-options">
                <div className="install-option">
                  <h4>📱 Mobile & Desktop PWA</h4>
                  <p>Install as a native app on your device for the best experience.</p>
                  <button 
                    className="btn pwa-btn"
                    onClick={handleInstallPWA}
                  >
                    📲 Install PWA
                  </button>
                </div>
                
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
                  <p>Interactive 3D character with smooth animations and realistic movements</p>
                </div>
                <div className="feature">
                  <h4>🗣️ Voice Interaction</h4>
                  <p>Natural speech-to-text and text-to-speech capabilities</p>
                </div>
                <div className="feature">
                  <h4>🤖 AI Powered</h4>
                  <p>Advanced AI conversations powered by OpenAI's latest models</p>
                </div>
                <div className="feature">
                  <h4>📱 Cross-Platform</h4>
                  <p>Works on mobile, desktop, and as a browser extension</p>
                </div>
              </div>
            </div>
          </div>

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